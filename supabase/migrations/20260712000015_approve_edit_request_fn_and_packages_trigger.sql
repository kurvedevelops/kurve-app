-- ============================================================
-- 1. Función transaccional: approve_edit_request
--
-- Reemplaza las dos queries separadas del endpoint /approve.
-- Al correr en una sola función PL/pgSQL ambas operaciones son
-- atómicas: si el UPDATE de edit_requests falla, el cambio en
-- activity_logs se revierte automáticamente.
--
-- El SELECT ... FOR UPDATE serializa aprobaciones concurrentes
-- del mismo request, evitando que se aplique dos veces.
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
  v_request public.edit_requests%rowtype;
begin
  -- Obtener y lockear la solicitud para evitar aprobaciones dobles concurrentes
  select * into v_request
  from public.edit_requests
  where id = p_request_id and status = 'pending'
  for update;

  if not found then
    raise exception 'edit_request_not_found'
      using hint = 'La solicitud no existe o ya fue procesada';
  end if;

  -- Aplicar corrección en activity_logs.
  -- Dispara trg_activity_logs_consumption → recalcula consumption_summary.
  execute format(
    'update public.activity_logs set %I = $1 where id = $2',
    v_request.field_name
  )
  using v_request.new_value, v_request.activity_log_id;

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

grant execute on function public.approve_edit_request(uuid, uuid) to authenticated;

comment on function public.approve_edit_request is
  'Aprueba un edit_request de forma atómica: actualiza activity_logs y '
  'marca el request como aprobado en la misma transacción. '
  'El SELECT FOR UPDATE previene aprobaciones dobles concurrentes.';


-- ============================================================
-- 2. Trigger en packages: recalcular consumo al cambiar status
--
-- Cubre el caso de paquetes activados retroactivamente:
-- si un paquete cambia inactive → active, consumption_summary
-- se recalcula inmediatamente con los activity_logs existentes.
-- ============================================================

create or replace function public.handle_package_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- IS DISTINCT FROM maneja NULLs correctamente
  if old.status is distinct from new.status then
    perform public.recalculate_client_consumption(new.client_id);
  end if;
  return new;
end;
$$;

create trigger trg_packages_status_change
  after update of status on public.packages
  for each row
  execute function public.handle_package_status_change();

comment on trigger trg_packages_status_change on public.packages is
  'Recalcula consumption_summary cuando un paquete cambia de status '
  '(ej. inactive → active con activity_logs ya existentes).';
