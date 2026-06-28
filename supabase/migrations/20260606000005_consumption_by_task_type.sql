-- ============================================================
-- SISTEMA KURVE — Migration 005
-- Consumo desglosado por tipo de tarea
-- Archivo: 20260606000005_consumption_by_task_type.sql
-- ============================================================
-- Cambios pedidos por Laureano (weekly):
--   - El consumo del cliente se desglosa por tipo de tarea (no por
--     categoría de pieza)
--   - El cliente ve: Community 12h, Diseño 18h, Reuniones 5h, etc.
--
-- IMPORTANTE: Esta migration NO borra consumption_summary
-- (mantiene las filas de horas totales y de piezas por categoría
-- que ya teníamos), solo AGREGA filas nuevas con consumo por tarea.
-- ============================================================


-- ============================================================
-- 1. Agregar columna task_type_id a consumption_summary
-- ============================================================
-- Estructura nueva de filas en consumption_summary:
--   - (package_id, NULL, NULL)        → horas totales del paquete
--   - (package_id, category_id, NULL) → piezas por categoría (Posts/Stories/Reels)
--   - (package_id, NULL, task_type_id)→ horas consumidas por tipo de tarea (NUEVO)
-- ============================================================

alter table public.consumption_summary
  add column if not exists task_type_id uuid references public.task_types(id) on delete cascade;

create index if not exists idx_consumption_summary_task_type_id
  on public.consumption_summary(task_type_id);

-- Índice único parcial para la fila nueva (horas por task_type)
-- Solo permite 1 fila por (package_id, task_type_id) cuando category_id es NULL
create unique index if not exists uq_consumption_summary_pkg_tasktype
  on public.consumption_summary (package_id, task_type_id)
  where task_type_id is not null and category_id is null;

comment on column public.consumption_summary.task_type_id is
  'Si está seteado, la fila representa el consumo de horas para ese tipo de tarea.';


-- ============================================================
-- 2. Reescribir la función recalculate_client_consumption
-- ============================================================
-- Cambios:
--   - Ya NO filtra por status (Laureano: "saquemos el estado")
--   - Sigue filtrando por is_draft = false (los borradores no cuentan)
--   - Agrega cálculo de horas por tipo de tarea
-- ============================================================

create or replace function public.recalculate_client_consumption(p_client_id uuid)
returns void as $$
declare
  v_package_id uuid;
begin
  v_package_id := public.get_active_package_id(p_client_id);

  if v_package_id is null then
    return;
  end if;

  -- Borrar el resumen anterior y recalcular desde cero
  delete from public.consumption_summary
  where package_id = v_package_id;

  -- ---------------------------------------------------------
  -- A. HORAS TOTALES (category_id = NULL, task_type_id = NULL)
  -- ---------------------------------------------------------
  insert into public.consumption_summary (package_id, category_id, task_type_id, consumed, updated_at)
  select
    v_package_id,
    null,
    null,
    coalesce(sum(al.hours), 0),
    now()
  from public.activity_logs al
  where al.client_id = p_client_id
    and al.is_draft  = false;

  -- ---------------------------------------------------------
  -- B. PIEZAS POR CATEGORÍA (category_id IS NOT NULL)
  -- ---------------------------------------------------------
  insert into public.consumption_summary (package_id, category_id, task_type_id, consumed, updated_at)
  select
    v_package_id,
    pp.category_id,
    null,
    coalesce(sum(
      case when al.category_id = pp.category_id then al.pieces_count else 0 end
    ), 0),
    now()
  from public.package_pieces pp
  left join public.activity_logs al
    on  al.client_id   = p_client_id
    and al.category_id = pp.category_id
    and al.is_draft    = false
  where pp.package_id = v_package_id
  group by pp.category_id;

  -- ---------------------------------------------------------
  -- C. HORAS POR TIPO DE TAREA (task_type_id IS NOT NULL) — NUEVO
  -- ---------------------------------------------------------
  insert into public.consumption_summary (package_id, category_id, task_type_id, consumed, updated_at)
  select
    v_package_id,
    null,
    al.task_type_id,
    coalesce(sum(al.hours), 0),
    now()
  from public.activity_logs al
  where al.client_id = p_client_id
    and al.is_draft  = false
    and al.task_type_id is not null
  group by al.task_type_id;

end;
$$ language plpgsql security definer;


-- ============================================================
-- 3. Actualizar la vista v_client_consumption (sin cambios estructurales)
-- ============================================================
-- La vista sigue devolviendo lo mismo, pero ahora la fila de "horas totales"
-- también incluye horas con status != in_progress que antes no contaban.
-- ============================================================

create or replace view public.v_client_consumption as
select
  p.client_id,
  p.id                                          as package_id,
  p.name                                        as package_name,
  p.total_hours,
  p.start_date,
  p.end_date,
  p.status                                      as package_status,
  coalesce(cs_hours.consumed, 0)                as consumed_hours,
  round(
    coalesce(cs_hours.consumed, 0) * 100.0
    / nullif(p.total_hours, 0),
    1
  )                                             as hours_percent,
  case
    when coalesce(cs_hours.consumed, 0) >= p.total_hours       then 'red'
    when coalesce(cs_hours.consumed, 0) >= p.total_hours * 0.7 then 'yellow'
    else                                                             'green'
  end                                           as traffic_light
from public.packages p
left join public.consumption_summary cs_hours
  on  cs_hours.package_id   = p.id
  and cs_hours.category_id  is null
  and cs_hours.task_type_id is null
where p.status = 'active';


-- ============================================================
-- 4. Vista nueva: consumo por tipo de tarea
-- ============================================================
-- Devuelve cuántas horas se consumieron por cada tipo de tarea
-- en el paquete activo de un cliente.
-- Útil para mostrar el desglose en el panel del cliente.
-- ============================================================

create or replace view public.v_consumption_by_task_type as
select
  p.client_id,
  p.id                  as package_id,
  cs.task_type_id,
  tt.name               as task_name,
  cs.consumed           as consumed_hours,
  round(
    cs.consumed * 100.0 / nullif(p.total_hours, 0),
    1
  )                     as percent_of_total
from public.consumption_summary cs
join public.packages p on p.id = cs.package_id
join public.task_types tt on tt.id = cs.task_type_id
where cs.task_type_id is not null
  and cs.category_id is null
  and p.status = 'active';

comment on view public.v_consumption_by_task_type is
  'Consumo de horas desglosado por tipo de tarea para cada cliente con paquete activo.';


-- ============================================================
-- 5. Grants
-- ============================================================

grant select on public.v_consumption_by_task_type to authenticated;


-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 005 · Consumo por tipo de tarea
-- ============================================================
