-- ============================================================
-- SISTEMA KURVE — Migration 006
-- Simplificar estado de actividades (solo "confirmado")
-- Archivo: 20260606000006_simplify_activity_status.sql
-- ============================================================
-- Cambios pedidos por Laureano (weekly):
--   - Sacar la distinción entre in_progress / delivered / published
--   - Las actividades solo registran horas trabajadas
--   - El estado pasa a ser 'confirmed' (o se queda sin estado, lo que
--     importa es is_draft = false)
--
-- Estrategia:
--   - NO borramos el enum activity_status para no romper migrations
--     anteriores ni el código viejo del front
--   - Convertimos todas las actividades existentes a 'delivered' que ya
--     contaban para el consumo
--   - Cambiamos el DEFAULT del campo status a 'delivered'
--   - El trigger ya no filtra por status (Migration 005 lo arregló)
--   - El front debe sacar el selector de estado
-- ============================================================


-- ============================================================
-- 1. Actualizar actividades existentes: in_progress → delivered
-- ============================================================
-- Las que estaban en in_progress (que NO contaban) ahora cuentan
-- como entregadas. Es coherente con la nueva regla.
-- ============================================================

update public.activity_logs
set status = 'delivered'
where status = 'in_progress'
  and is_draft = false;


-- ============================================================
-- 2. Cambiar el default del campo status
-- ============================================================
-- Ahora cuando el member registra una actividad, por defecto queda
-- como 'delivered' (= confirmada) sin que el front tenga que setearlo.
-- ============================================================

alter table public.activity_logs
  alter column status set default 'delivered';


-- ============================================================
-- 3. Forzar recálculo de consumption_summary
-- ============================================================
-- Como cambiamos la regla (in_progress ahora cuenta), hay que
-- recalcular el consumo de todos los clientes con paquete activo.
-- ============================================================

do $$
declare
  r record;
begin
  for r in
    select distinct client_id
    from public.packages
    where status = 'active'
  loop
    perform public.recalculate_client_consumption(r.client_id);
  end loop;
end $$;


-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 006 · Simplificar status
-- ============================================================
