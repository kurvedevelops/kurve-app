-- ============================================================
-- SISTEMA KURVE — Migration 003
-- Trigger de recálculo de consumo
-- Archivo: 20260512000003_consumption_trigger.sql
-- ============================================================
-- Lógica:
--   - consumption_summary guarda el consumo real por paquete y categoría
--   - Solo cuentan actividades con is_draft=false y status != 'in_progress'
--   - El trigger se dispara AFTER INSERT/UPDATE/DELETE en activity_logs
--   - Recalcula desde cero el paquete activo del cliente afectado
-- ============================================================


-- ============================================================
-- 1. TABLA consumption_summary
-- ============================================================

create table public.consumption_summary (
  id           uuid         primary key default gen_random_uuid(),
  package_id   uuid         not null references public.packages(id) on delete cascade,
  category_id  uuid         references public.piece_categories(id) on delete cascade,
  consumed     numeric(8,2) not null default 0 check (consumed >= 0),
  updated_at   timestamptz  not null default now()
);

comment on table public.consumption_summary is
  'Consumo real por paquete y categoría. category_id NULL = horas totales. Actualizada por trigger.';

-- Índice para consultas del panel del cliente
create index idx_consumption_summary_package_id
  on public.consumption_summary(package_id);

-- Índices únicos que manejan NULL correctamente
-- (PostgreSQL trata NULL != NULL en constraints unique, por eso usamos índices parciales)
create unique index uq_consumption_summary_pkg_cat
  on public.consumption_summary (package_id, (category_id::text))
  where category_id is not null;

create unique index uq_consumption_summary_pkg_hours
  on public.consumption_summary (package_id)
  where category_id is null;

-- RLS
alter table public.consumption_summary enable row level security;

create policy "consumption_summary: admin ve todo"
  on public.consumption_summary for select
  to authenticated
  using (public.current_user_role() = 'admin');

create policy "consumption_summary: member ve sus clientes"
  on public.consumption_summary for select
  to authenticated
  using (
    public.current_user_role() = 'member'
    and package_id in (
      select p.id from public.packages p
      inner join public.activity_logs al on al.client_id = p.client_id
      where al.user_id = auth.uid()
    )
  );

create policy "consumption_summary: client ve el suyo"
  on public.consumption_summary for select
  to authenticated
  using (
    public.current_user_role() = 'client'
    and package_id in (
      select p.id from public.packages p
      inner join public.client_users cu on cu.client_id = p.client_id
      where cu.user_id = auth.uid()
    )
  );

create policy "consumption_summary: solo sistema escribe"
  on public.consumption_summary for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');


-- ============================================================
-- 2. FUNCIÓN HELPER: obtener paquete activo de un cliente
-- ============================================================

create or replace function public.get_active_package_id(p_client_id uuid)
returns uuid as $$
  select id
  from public.packages
  where client_id = p_client_id
    and status = 'active'
    and (start_date is null or start_date <= current_date)
    and (end_date   is null or end_date   >= current_date)
  order by start_date desc nulls last
  limit 1;
$$ language sql stable security definer;

comment on function public.get_active_package_id is
  'Devuelve el UUID del paquete activo de un cliente en la fecha actual.';


-- ============================================================
-- 3. FUNCIÓN PRINCIPAL: recalcular consumo
-- ============================================================
-- Usa DELETE + INSERT en vez de upsert para evitar problemas
-- con la constraint unique y valores NULL en category_id.
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

  -- Horas totales (category_id = NULL)
  insert into public.consumption_summary (package_id, category_id, consumed, updated_at)
  select
    v_package_id,
    null,
    coalesce(sum(al.hours), 0),
    now()
  from public.activity_logs al
  where al.client_id  = p_client_id
    and al.is_draft   = false
    and al.status     != 'in_progress';

  -- Piezas por categoría
  insert into public.consumption_summary (package_id, category_id, consumed, updated_at)
  select
    v_package_id,
    pp.category_id,
    coalesce(sum(
      case when al.category_id = pp.category_id then al.pieces_count else 0 end
    ), 0),
    now()
  from public.package_pieces pp
  left join public.activity_logs al
    on  al.client_id   = p_client_id
    and al.category_id = pp.category_id
    and al.is_draft    = false
    and al.status      != 'in_progress'
  where pp.package_id = v_package_id
  group by pp.category_id;

end;
$$ language plpgsql security definer;

comment on function public.recalculate_client_consumption is
  'Recalcula desde cero el consumption_summary del paquete activo del cliente.
   Solo cuenta actividades con is_draft=false y status != in_progress.
   Usa DELETE + INSERT para manejar correctamente NULL en category_id.';


-- ============================================================
-- 4. FUNCIÓN DEL TRIGGER
-- ============================================================

create or replace function public.handle_activity_log_change()
returns trigger as $$
declare
  v_client_id uuid;
begin
  if tg_op = 'DELETE' then
    v_client_id := old.client_id;
  else
    v_client_id := new.client_id;
  end if;

  -- Si en un UPDATE el cliente cambió, recalculamos los dos clientes
  if tg_op = 'UPDATE' and old.client_id != new.client_id then
    perform public.recalculate_client_consumption(old.client_id);
  end if;

  perform public.recalculate_client_consumption(v_client_id);

  return coalesce(new, old);
end;
$$ language plpgsql security definer;


-- ============================================================
-- 5. TRIGGER en activity_logs
-- ============================================================

create trigger trg_activity_logs_consumption
  after insert or update or delete
  on public.activity_logs
  for each row
  execute function public.handle_activity_log_change();

comment on trigger trg_activity_logs_consumption on public.activity_logs is
  'Recalcula consumption_summary del cliente afectado en cada cambio de activity_logs.';


-- ============================================================
-- 6. VISTA: consumo del cliente con semáforo
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
  on  cs_hours.package_id  = p.id
  and cs_hours.category_id is null
where p.status = 'active';

comment on view public.v_client_consumption is
  'Vista de consumo actual con semáforo (green/yellow/red). Usada en el panel del cliente.';


-- ============================================================
-- 7. GRANTS
-- ============================================================

grant select on public.consumption_summary to authenticated;
grant select on public.v_client_consumption to authenticated;
grant execute on function public.get_active_package_id(uuid) to authenticated;


-- ============================================================
-- TESTS REALIZADOS Y RESULTADOS
-- ============================================================
-- Test 1: is_draft=true        → consumed=0.00  ✅
-- Test 2: status=in_progress   → consumed=0.00  ✅
-- Test 3: status=delivered     → consumed=2.50  ✅
-- Test 4: semáforo green       → 5%    green    ✅
-- Test 5: semáforo yellow      → 71%   yellow   ✅
-- Test 6: semáforo red         → 111%  red      ✅
-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 003 · Consumption Trigger
-- ============================================================