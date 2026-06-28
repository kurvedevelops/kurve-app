-- ============================================================
-- SISTEMA KURVE — Migration 004
-- Subtareas + ABM admin de tareas y subtareas
-- Archivo: 20260606000004_subtypes_and_admin_tasks.sql
-- ============================================================
-- Cambios pedidos por Laureano (weekly):
--   - Admin puede crear tipos de tarea
--   - Admin puede crear subtareas dentro de cada tipo de tarea
--   - El member elige tarea + subtarea opcional al registrar
-- ============================================================


-- ============================================================
-- 1. TABLA task_subtypes
-- ============================================================

create table if not exists public.task_subtypes (
  id            uuid         primary key default gen_random_uuid(),
  task_type_id  uuid         not null references public.task_types(id) on delete cascade,
  name          text         not null,
  active        boolean      not null default true,
  display_order integer      not null default 0,
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now(),
  constraint uq_task_subtypes_name_per_task unique (task_type_id, name)
);

create index if not exists idx_task_subtypes_task_type_id on public.task_subtypes(task_type_id);
create index if not exists idx_task_subtypes_active on public.task_subtypes(active);

comment on table public.task_subtypes is
  'Subtareas dentro de un tipo de tarea. Ej: Community Management > Respuesta de mensajes.';


-- ============================================================
-- 2. Agregar subtype_id a activity_logs
-- ============================================================

alter table public.activity_logs
  add column if not exists subtype_id uuid references public.task_subtypes(id) on delete set null;

create index if not exists idx_activity_logs_subtype_id on public.activity_logs(subtype_id);


-- ============================================================
-- 3. RLS para task_subtypes
-- ============================================================

alter table public.task_subtypes enable row level security;

-- Todos los autenticados pueden leer (para los selects del formulario)
drop policy if exists "task_subtypes_read" on public.task_subtypes;
create policy "task_subtypes_read" on public.task_subtypes
  for select to authenticated using (true);

-- Solo admin escribe
drop policy if exists "task_subtypes_admin_write" on public.task_subtypes;
create policy "task_subtypes_admin_write" on public.task_subtypes
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');


-- ============================================================
-- 4. SEED — Subtareas de ejemplo basadas en lista de Laureano
-- ============================================================
-- Solo agrega subtareas si la tarea existe. Si no existe, no hace nada.
-- ============================================================

-- Community Management: subtareas de interacción
insert into public.task_subtypes (task_type_id, name, display_order)
select t.id, sub.name, sub.ord
from public.task_types t
cross join (values
  ('Respuesta de mensajes', 1),
  ('Reacciones e interacciones', 2),
  ('Revisión de comentarios', 3),
  ('Moderación', 4)
) as sub(name, ord)
where t.name = 'Community management'
on conflict (task_type_id, name) do nothing;

-- Diseño gráfico: tipos de diseño
insert into public.task_subtypes (task_type_id, name, display_order)
select t.id, sub.name, sub.ord
from public.task_types t
cross join (values
  ('Diseño de pieza estática', 1),
  ('Diseño de pieza animada', 2),
  ('Diseño de pieza analógica', 3),
  ('Sesión de foto o video', 4),
  ('Edición de foto o video', 5)
) as sub(name, ord)
where t.name = 'Diseño gráfico'
on conflict (task_type_id, name) do nothing;

-- Reunión con cliente
insert into public.task_subtypes (task_type_id, name, display_order)
select t.id, sub.name, sub.ord
from public.task_types t
cross join (values
  ('Reunión con cliente', 1),
  ('Reunión de equipo', 2)
) as sub(name, ord)
where t.name = 'Reunión con cliente'
on conflict (task_type_id, name) do nothing;

-- Planificación
insert into public.task_subtypes (task_type_id, name, display_order)
select t.id, sub.name, sub.ord
from public.task_types t
cross join (values
  ('Estrategia', 1),
  ('Planificación', 2)
) as sub(name, ord)
where t.name = 'Planificación'
on conflict (task_type_id, name) do nothing;

-- Análisis y reportes
insert into public.task_subtypes (task_type_id, name, display_order)
select t.id, sub.name, sub.ord
from public.task_types t
cross join (values
  ('Informe (armado)', 1),
  ('Informe (revisión)', 2),
  ('Armado de pauta / Ads', 3),
  ('Edición de pauta / Ads', 4)
) as sub(name, ord)
where t.name = 'Análisis y reportes'
on conflict (task_type_id, name) do nothing;


-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 004 · Subtypes + Admin tasks
-- ============================================================
