-- ============================================================
-- SISTEMA KURVE — Migration 018
-- Múltiples paquetes activos por cliente + consumo por paquete
-- Archivo: 20260716000018_activity_package_id_and_per_package_consumption.sql
-- ============================================================
-- Cambio de negocio (Laureano):
--   - Un cliente puede tener varios paquetes activos a la vez.
--   - Cada actividad se imputa a un paquete específico
--     (activity_logs.package_id).
--   - Cada paquete consume por separado (su propio semáforo).
--
-- El consumo pasa de calcularse "por cliente → único paquete activo"
-- a calcularse "por paquete", filtrando activity_logs.package_id.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Columna package_id en activity_logs (nullable + FK)
-- ------------------------------------------------------------
-- Nullable a propósito: una actividad puede quedar sin paquete si
-- su cliente no tiene ninguno (se documenta; el backfill cubre el
-- resto). No se fuerza NOT NULL para no fallar en esos casos.
-- ------------------------------------------------------------
alter table public.activity_logs
  add column if not exists package_id uuid references public.packages(id);

create index if not exists idx_activity_logs_package_id
  on public.activity_logs(package_id);

comment on column public.activity_logs.package_id is
  'Paquete al que se imputa la actividad. Base del cálculo de consumo por paquete.';


-- ------------------------------------------------------------
-- 1b. Quitar CHECK volátil chk_log_date_range
-- ------------------------------------------------------------
-- El constraint era:
--   CHECK (log_date >= CURRENT_DATE - '7 days' AND log_date <= CURRENT_DATE)
-- Usa CURRENT_DATE, un anti-patrón en una tabla editable: las filas
-- se vuelven inválidas con el paso del tiempo y Postgres re-valida el
-- CHECK en CUALQUIER update de la fila. Eso:
--   - rompe el flujo de correcciones (approve_edit_request hace UPDATE
--     sobre activity_logs; aprobar una corrección de una actividad de
--     +7 días fallaba con 23514), y
--   - bloquea este backfill de package_id.
-- La regla de "no cargar actividades de +7 días" ya se valida en el
-- endpoint de creación (POST /api/activity-logs), que es donde
-- corresponde. Se elimina el constraint de la base.
-- ------------------------------------------------------------
alter table public.activity_logs
  drop constraint if exists chk_log_date_range;


-- ------------------------------------------------------------
-- 2. Backfill por fecha (con fallback al paquete más reciente)
-- ------------------------------------------------------------
-- Cada log se asigna al paquete del cliente que cubre su log_date
-- (start <= log_date <= end, end NULL = abierto), tomando el de
-- start más reciente. Si ningún paquete cubre la fecha, cae al
-- paquete más reciente del cliente. Así se preserva el consumo
-- histórico y, para clientes con un solo paquete, todo va a ese.
-- ------------------------------------------------------------
update public.activity_logs al
set package_id = coalesce(
  (
    select p.id
    from public.packages p
    where p.client_id = al.client_id
      and (p.start_date is null or p.start_date <= al.log_date)
      and (p.end_date   is null or p.end_date   >= al.log_date)
    order by p.start_date desc nulls last
    limit 1
  ),
  (
    select p.id
    from public.packages p
    where p.client_id = al.client_id
    order by p.start_date desc nulls last
    limit 1
  )
)
where al.package_id is null;


-- ------------------------------------------------------------
-- 3. Barrera de "un paquete activo por cliente"
-- ------------------------------------------------------------
-- No existe constraint/índice único en la base que lo impida
-- (verificado: solo el 409 a nivel aplicación, que se quita en el
-- endpoint). No hay nada que dropear acá. Se documenta.
-- ------------------------------------------------------------


-- ------------------------------------------------------------
-- 4. Dedup defensivo + índice único de horas-totales
-- ------------------------------------------------------------
-- El índice único uq_consumption_summary_pkg_hours puede haber sido
-- creado/modificado a mano en el dashboard. Antes de (re)crearlo,
-- eliminamos cualquier duplicado de la fila de horas-totales
-- (category_id NULL y task_type_id NULL), conservando una por
-- package_id, para que la creación del índice único no falle.
-- ------------------------------------------------------------
delete from public.consumption_summary cs
using public.consumption_summary keep
where cs.category_id  is null
  and cs.task_type_id is null
  and keep.category_id  is null
  and keep.task_type_id is null
  and cs.package_id = keep.package_id
  and cs.ctid < keep.ctid;

drop index if exists public.uq_consumption_summary_pkg_hours;
create unique index uq_consumption_summary_pkg_hours
  on public.consumption_summary (package_id)
  where category_id is null and task_type_id is null;


-- ------------------------------------------------------------
-- 5. recalculate_package_consumption(package_id)
-- ------------------------------------------------------------
-- Recalcula consumption_summary de UN paquete, filtrando las
-- actividades por activity_logs.package_id (ya no por client_id).
-- Regla de conteo: solo is_draft = false (decisión de la 005/006,
-- "sacamos el estado"). Cubre las 3 clases de fila:
--   (pkg, NULL, NULL)        → horas totales
--   (pkg, category_id, NULL) → piezas por categoría
--   (pkg, NULL, task_type_id)→ horas por tipo de tarea
-- ------------------------------------------------------------
create or replace function public.recalculate_package_consumption(p_package_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_package_id is null then
    return;
  end if;

  delete from public.consumption_summary where package_id = p_package_id;

  -- A. Horas totales
  insert into public.consumption_summary (package_id, category_id, task_type_id, consumed, updated_at)
  select p_package_id, null, null, coalesce(sum(al.hours), 0), now()
  from public.activity_logs al
  where al.package_id = p_package_id
    and al.is_draft   = false;

  -- B. Piezas por categoría del paquete
  insert into public.consumption_summary (package_id, category_id, task_type_id, consumed, updated_at)
  select
    p_package_id,
    pp.category_id,
    null,
    coalesce(sum(case when al.category_id = pp.category_id then al.pieces_count else 0 end), 0),
    now()
  from public.package_pieces pp
  left join public.activity_logs al
    on  al.package_id  = p_package_id
    and al.category_id = pp.category_id
    and al.is_draft    = false
  where pp.package_id = p_package_id
  group by pp.category_id;

  -- C. Horas por tipo de tarea
  insert into public.consumption_summary (package_id, category_id, task_type_id, consumed, updated_at)
  select p_package_id, null, al.task_type_id, coalesce(sum(al.hours), 0), now()
  from public.activity_logs al
  where al.package_id     = p_package_id
    and al.is_draft       = false
    and al.task_type_id is not null
  group by al.task_type_id;
end;
$$;

comment on function public.recalculate_package_consumption is
  'Recalcula consumption_summary de un paquete específico usando '
  'activity_logs.package_id. Solo cuenta is_draft = false.';


-- ------------------------------------------------------------
-- 6. recalculate_client_consumption(client_id) — wrapper
-- ------------------------------------------------------------
-- Se mantiene por compatibilidad con llamadas existentes.
-- Ahora recalcula TODOS los paquetes del cliente (cada uno por
-- su package_id), no "el único activo".
-- ------------------------------------------------------------
create or replace function public.recalculate_client_consumption(p_client_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select id from public.packages where client_id = p_client_id
  loop
    perform public.recalculate_package_consumption(r.id);
  end loop;
end;
$$;

comment on function public.recalculate_client_consumption is
  'Wrapper: recalcula todos los paquetes de un cliente por package_id.';


-- ------------------------------------------------------------
-- 7. Trigger de activity_logs: recalcula por package_id
-- ------------------------------------------------------------
create or replace function public.handle_activity_log_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_package_consumption(old.package_id);
    return old;
  end if;

  -- INSERT / UPDATE: recalcular el paquete de la actividad
  perform public.recalculate_package_consumption(new.package_id);

  -- Si en un UPDATE cambió el paquete, recalcular también el anterior
  if tg_op = 'UPDATE' and old.package_id is distinct from new.package_id then
    perform public.recalculate_package_consumption(old.package_id);
  end if;

  return new;
end;
$$;


-- ------------------------------------------------------------
-- 8. Trigger de packages (cambio de status): recalcula ese paquete
-- ------------------------------------------------------------
create or replace function public.handle_package_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    perform public.recalculate_package_consumption(new.id);
  end if;
  return new;
end;
$$;


-- ------------------------------------------------------------
-- 9. approve_edit_request: recalcula el paquete del log corregido
-- ------------------------------------------------------------
-- Simplificada: ya no adivina el paquete por fecha. Al aplicar la
-- corrección, el trigger trg_activity_logs_consumption recalcula el
-- paquete del log (activity_logs.package_id) automáticamente.
-- ------------------------------------------------------------
create or replace function public.approve_edit_request(
  p_request_id  uuid,
  p_reviewer_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.edit_requests%rowtype;
begin
  -- Lock anti doble-aprobación concurrente
  select * into v_request
  from public.edit_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'edit_request_not_found'
      using hint = 'La solicitud no existe o ya fue procesada';
  end if;

  -- Aplicar corrección. El trigger recalcula el paquete del log.
  execute format(
    'update public.activity_logs set %I = $1 where id = $2',
    v_request.field_name
  )
  using v_request.new_value, v_request.activity_log_id;

  -- Marcar aprobada en la misma transacción
  update public.edit_requests
  set
    status      = 'approved',
    reviewed_by = p_reviewer_id,
    reviewed_at = now()
  where id = p_request_id
  returning * into v_request;

  return row_to_json(v_request)::jsonb;
end;
$$;


-- ------------------------------------------------------------
-- 10. Vistas (security_invoker) — una fila por paquete activo
-- ------------------------------------------------------------
-- v_client_consumption: un cliente con N paquetes activos → N filas.
-- El JOIN filtra category_id IS NULL AND task_type_id IS NULL para
-- traer solo la fila de horas totales (evita la duplicación por las
-- filas de task_type).
-- ------------------------------------------------------------
create or replace view public.v_client_consumption
  with (security_invoker = true)
as
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

comment on view public.v_client_consumption is
  'Consumo con semáforo, una fila por paquete activo (soporta múltiples por cliente).';

-- v_consumption_by_task_type: agrupa por paquete + tipo de tarea.
create or replace view public.v_consumption_by_task_type
  with (security_invoker = true)
as
select
  p.client_id,
  p.id                                          as package_id,
  cs.task_type_id,
  tt.name                                       as task_name,
  cs.consumed                                   as consumed_hours,
  round(
    cs.consumed * 100.0 / nullif(p.total_hours, 0),
    1
  )                                             as percent_of_total
from public.consumption_summary cs
join public.packages p
  on p.id = cs.package_id
left join public.task_types tt
  on tt.id = cs.task_type_id
where cs.task_type_id is not null
  and cs.category_id  is null
  and p.status = 'active';

comment on view public.v_consumption_by_task_type is
  'Consumo de horas por tipo de tarea, por paquete activo.';


-- ------------------------------------------------------------
-- 11. Backfill de consumo: recalcular TODOS los paquetes
-- ------------------------------------------------------------
-- Deja consumption_summary consistente con los package_id recién
-- asignados. Incluye paquetes activos e históricos.
-- ------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in select id from public.packages loop
    perform public.recalculate_package_consumption(r.id);
  end loop;
end $$;


-- ------------------------------------------------------------
-- 12. Grants
-- ------------------------------------------------------------
grant execute on function public.recalculate_package_consumption(uuid) to authenticated;
grant execute on function public.recalculate_client_consumption(uuid) to authenticated;


-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 018 · Multi-paquete + consumo por paquete
-- ============================================================
