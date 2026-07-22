-- ============================================================
-- SISTEMA KURVE — Migration 020
-- Especialidades de integrantes (member → task_types)
-- Archivo: 20260722000020_member_task_types.sql
-- ============================================================
-- Permite asignar uno o más tipos de tarea a cada integrante
-- para definir su especialidad. is_primary marca la tarea
-- principal del integrante. El índice parcial uq_member_task_types_primary
-- garantiza a nivel DB que solo puede haber UNA fila con is_primary = true
-- por member. El admin gestiona las asignaciones; el member las consulta.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Tabla member_task_types
-- ------------------------------------------------------------

create table if not exists public.member_task_types (
  id            uuid         primary key default gen_random_uuid(),
  user_id       uuid         not null references public.users(id) on delete cascade,
  task_type_id  uuid         not null references public.task_types(id) on delete cascade,
  is_primary    boolean      not null default false,
  created_at    timestamptz  not null default now(),
  constraint uq_member_task_type unique (user_id, task_type_id)
);

create index if not exists idx_member_task_types_user_id
  on public.member_task_types(user_id);

create index if not exists idx_member_task_types_task_type_id
  on public.member_task_types(task_type_id);

-- Garantiza que cada member tenga como máximo UN task_type con is_primary = true.
-- Índice parcial: solo cubre las filas donde is_primary = true, por lo que
-- múltiples filas con is_primary = false coexisten sin conflicto.
create unique index uq_member_task_types_primary
  on public.member_task_types (user_id)
  where is_primary = true;

comment on table public.member_task_types is
  'Especialidades del integrante: qué tipos de tarea puede registrar y cuál es su principal.';

comment on column public.member_task_types.is_primary is
  'Especialidad principal del integrante. El índice uq_member_task_types_primary garantiza max 1 por member a nivel DB.';


-- ------------------------------------------------------------
-- 2. RLS
-- ------------------------------------------------------------

alter table public.member_task_types enable row level security;

-- Admin gestiona todo
create policy "member_task_types: admin gestiona"
  on public.member_task_types for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Member consulta sus propias especialidades
create policy "member_task_types: member lee el suyo"
  on public.member_task_types for select
  to authenticated
  using (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  );


-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 020 · Especialidades de members
-- ============================================================
