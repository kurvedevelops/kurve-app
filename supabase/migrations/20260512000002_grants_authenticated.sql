-- ============================================================
-- SISTEMA KURVE — Migration 002
-- Grants para roles authenticated y anon
-- Archivo: 20260512000002_grants_authenticated.sql
-- ============================================================

-- ============================================================
-- 1. Grants en el schema public
-- ============================================================

grant usage on schema public to authenticated, anon;


-- ============================================================
-- 2. Grants en todas las tablas existentes
-- ============================================================

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;


-- ============================================================
-- 3. Grants en secuencias (para defaults con gen_random_uuid)
-- ============================================================

grant usage, select on all sequences in schema public to authenticated;


-- ============================================================
-- 4. Grants en funciones
-- ============================================================

grant execute on all functions in schema public to authenticated;


-- ============================================================
-- 5. Default privileges (para tablas/funciones futuras)
-- ============================================================

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;

alter default privileges in schema public
  grant execute on functions to authenticated;


-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 002 · Grants
-- ============================================================
