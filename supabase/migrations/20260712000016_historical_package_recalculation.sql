-- ============================================================
-- 1. recalculate_package_consumption(p_package_id)
--
-- Recalcula consumption_summary para un paquete específico
-- sin importar si está activo o cerrado (status != 'active').
--
-- Usa la misma lógica sin filtro de fechas que
-- recalculate_client_consumption para mantener consistencia:
-- todos los logs del cliente cuentan, igual que cuando el
-- paquete estaba activo y el trigger lo recalculaba.
-- ============================================================

create or replace function public.recalculate_package_consumption(p_package_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
begin
  select client_id into v_client_id
  from public.packages
  where id = p_package_id;

  if not found then return; end if;

  delete from public.consumption_summary where package_id = p_package_id;

  -- Horas totales
  insert into public.consumption_summary (package_id, category_id, consumed, updated_at)
  select p_package_id, null, coalesce(sum(al.hours), 0), now()
  from public.activity_logs al
  where al.client_id = v_client_id
    and al.is_draft  = false
    and al.status    != 'in_progress';

  -- Piezas por categoría
  insert into public.consumption_summary (package_id, category_id, consumed, updated_at)
  select
    p_package_id,
    pp.category_id,
    coalesce(sum(case when al.category_id = pp.category_id then al.pieces_count else 0 end), 0),
    now()
  from public.package_pieces pp
  left join public.activity_logs al
    on  al.client_id   = v_client_id
    and al.category_id = pp.category_id
    and al.is_draft    = false
    and al.status      != 'in_progress'
  where pp.package_id = p_package_id
  group by pp.category_id;
end;
$$;

grant execute on function public.recalculate_package_consumption(uuid) to authenticated;

comment on function public.recalculate_package_consumption is
  'Recalcula consumption_summary de un paquete específico (activo o histórico). '
  'Llamada desde approve_edit_request cuando la corrección afecta un log '
  'cuya fecha pertenece a un paquete ya cerrado.';


-- ============================================================
-- 2. approve_edit_request — nueva versión con recálculo histórico
--
-- Flujo:
--   a) SELECT FOR UPDATE → lock anti-doble-aprobación
--   b) UPDATE activity_logs → trigger recalcula paquete ACTIVO
--   c) Obtener client_id + log_date del log afectado
--   d) Buscar el paquete que cubre esa log_date
--   e) Si ese paquete ≠ activo → recalculate_package_consumption()
--   f) UPDATE edit_requests → marcar aprobada
-- ============================================================

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
  v_request           public.edit_requests%rowtype;
  v_client_id         uuid;
  v_log_date          date;
  v_active_pkg_id     uuid;
  v_hist_pkg_id       uuid;
begin
  -- Lock para evitar aprobaciones dobles concurrentes
  select * into v_request
  from public.edit_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'edit_request_not_found'
      using hint = 'La solicitud no existe o ya fue procesada';
  end if;

  -- Aplicar corrección.
  -- trg_activity_logs_consumption se dispara aquí → recalcula el paquete activo.
  execute format(
    'update public.activity_logs set %I = $1 where id = $2',
    v_request.field_name
  )
  using v_request.new_value, v_request.activity_log_id;

  -- Obtener client_id y log_date del log afectado
  select client_id, log_date::date
  into v_client_id, v_log_date
  from public.activity_logs
  where id = v_request.activity_log_id;

  -- Paquete histórico que cubre la fecha del log corregido
  select id into v_hist_pkg_id
  from public.packages
  where client_id = v_client_id
    and (start_date is null or start_date <= v_log_date)
    and (end_date   is null or end_date   >= v_log_date)
  order by start_date desc nulls last
  limit 1;

  v_active_pkg_id := public.get_active_package_id(v_client_id);

  -- Si el log pertenece a un paquete distinto del activo, recalcular ese histórico.
  -- El paquete activo ya fue recalculado por el trigger en el paso anterior.
  if v_hist_pkg_id is not null
    and v_hist_pkg_id is distinct from v_active_pkg_id
  then
    perform public.recalculate_package_consumption(v_hist_pkg_id);
  end if;

  -- Marcar como aprobada en la misma transacción
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
