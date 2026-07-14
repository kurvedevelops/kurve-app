-- ============================================================
-- SISTEMA KURVE — Migration 017
-- Cargo / especialidad del integrante (texto libre)
-- Archivo: 20260712000017_add_position_to_users.sql
-- ============================================================
-- Agrega el campo cargo/especialidad (texto libre) a los usuarios.
-- Es descriptivo (Community Manager, Diseñador, etc.), NO es el rol
-- del sistema (columna role). No afecta permisos.
-- ============================================================

alter table public.users
  add column if not exists position text;

comment on column public.users.position is
  'Cargo o especialidad del integrante (texto libre). Descriptivo, no afecta permisos.';

-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 017 · Position en users
-- ============================================================
