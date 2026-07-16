-- ============================================================
-- SISTEMA KURVE — Migration 019
-- Fix: approve_edit_request castea new_value al tipo real de la columna
-- Archivo: 20260716000019_fix_approve_edit_request_cast.sql
-- ============================================================
-- Bug pre-existente (venía de la 015/016): la función aplicaba la
-- corrección con
--     update activity_logs set <campo> = $1
-- donde $1 es edit_requests.new_value (text). Para campos NO text
-- (hours numeric, pieces_count int, *_id uuid, log_date date) Postgres
-- tira 42804 "column is of type X but expression is of type text".
-- Resultado: aprobar una corrección de HORAS fallaba — y las horas son
-- justamente lo que impacta el consumo.
--
-- Fix: castear el valor al tipo real de la columna de forma dinámica.
-- Así funciona para text, numeric, int, uuid y date por igual.
-- El trigger trg_activity_logs_consumption recalcula el paquete del log.
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
  v_request  public.edit_requests%rowtype;
  v_coltype  text;
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

  -- Tipo real de la columna a corregir, para castear el valor de texto.
  -- field_name es un enum (editable_field): se castea a text para comparar.
  select a.atttypid::regtype::text
  into v_coltype
  from pg_attribute a
  where a.attrelid = 'public.activity_logs'::regclass
    and a.attname  = v_request.field_name::text
    and a.attnum   > 0
    and not a.attisdropped;

  if v_coltype is null then
    raise exception 'invalid_field_name'
      using hint = 'El campo a corregir no existe en activity_logs';
  end if;

  -- Aplicar corrección casteando new_value (text) al tipo de la columna.
  -- Dispara trg_activity_logs_consumption → recalcula el paquete del log.
  execute format(
    'update public.activity_logs set %I = $1::%s where id = $2',
    v_request.field_name::text,
    v_coltype
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

-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 019 · Fix cast en approve_edit_request
-- ============================================================
