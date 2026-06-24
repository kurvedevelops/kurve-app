-- ============================================================
-- Recrea las vistas con SECURITY INVOKER para que respeten
-- el RLS de las tablas base.
--
-- Por defecto las vistas en Supabase son SECURITY DEFINER:
-- corren como el owner (postgres) y bypasean RLS, exponiendo
-- datos de paquetes/consumo a cualquier usuario autenticado.
--
-- Con SECURITY INVOKER la vista corre como el usuario que la
-- consulta, por lo que las políticas de packages, consumption_summary
-- y task_types se evalúan con auth.uid() del usuario real.
--
-- CREATE OR REPLACE preserva los GRANTs existentes; no se pierden.
-- ============================================================


-- ============================================================
-- v_client_consumption
-- Definición idéntica a migration 003, solo agrega security_invoker.
-- ============================================================
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
  on  cs_hours.package_id  = p.id
  and cs_hours.category_id is null
where p.status = 'active';

comment on view public.v_client_consumption is
  'Vista de consumo actual con semáforo (green/yellow/red). Usada en el panel del cliente.';


-- ============================================================
-- v_consumption_by_task_type
-- Fue creada en el dashboard sin migración. Esta migración la
-- versiona y agrega security_invoker + grant faltante.
-- ============================================================
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
where cs.task_type_id is not null;

comment on view public.v_consumption_by_task_type is
  'Consumo de horas por tipo de tarea para el paquete activo del cliente.';

-- El grant faltaba en la vista creada por dashboard
grant select on public.v_consumption_by_task_type to authenticated;
