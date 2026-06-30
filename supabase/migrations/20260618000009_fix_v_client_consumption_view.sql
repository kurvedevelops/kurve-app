-- Fix: v_client_consumption multiplicaba las filas del paquete porque el JOIN
-- con consumption_summary solo filtraba por category_id IS NULL, capturando
-- también las filas de horas por task_type. Se agrega task_type_id IS NULL
-- para traer únicamente la fila de horas totales.

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
