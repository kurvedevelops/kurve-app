-- ============================================================
-- SISTEMA KURVE — Migration 007
-- Campos extra en clientes (email, legal_name, phone)
-- Archivo: 20260607000007_clients_extra_fields.sql
-- ============================================================
-- Agrega campos de contacto opcionales a la tabla clients.
-- Pedido del cliente en la reunión de wireframes: el modal de
-- "Nuevo cliente" necesita razón social, email y teléfono.
-- Todos nullable — solo name y status siguen siendo obligatorios.
-- ============================================================

alter table public.clients
  add column if not exists email      text,
  add column if not exists legal_name text,
  add column if not exists phone      text;

comment on column public.clients.email is
  'Email de contacto del cliente (no se usa para login). Opcional.';
comment on column public.clients.legal_name is
  'Razón social / nombre legal. Opcional.';
comment on column public.clients.phone is
  'Teléfono de contacto. Opcional.';

-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 007 · Clients extra fields
-- ============================================================
