-- ============================================================
-- SISTEMA KURVE — Migration 001
-- Schema inicial
-- Archivo: 20260512000001_initial_schema.sql
-- ============================================================
-- Reconstruido desde el estado actual de Supabase
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ============================================================
-- 2. ENUMS
-- ============================================================
do $$ begin
  create type public.user_role as enum ('admin', 'member', 'client');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.client_status as enum ('active', 'paused', 'ended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.package_status as enum ('active', 'paused', 'ended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.activity_status as enum ('in_progress', 'delivered', 'published');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.edit_request_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.edit_request_field as enum ('hours', 'pieces_count', 'category_id', 'log_date', 'notes', 'status');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.link_type as enum ('contract', 'drive', 'analytics', 'custom');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_channel as enum ('email', 'whatsapp');
exception when duplicate_object then null;
end $$;


-- ============================================================
-- 3. HELPER FUNCTION: current_user_role
-- ============================================================
create or replace function public.current_user_role()
returns user_role as $$
  select role from public.users where id = auth.uid();
$$ language sql stable security definer;


-- ============================================================
-- 4. TABLA users (perfil)
-- ============================================================
create table if not exists public.users (
  id          uuid          primary key references auth.users(id) on delete cascade,
  email       text          not null unique,
  full_name   text          not null,
  role        user_role     not null default 'member',
  active      boolean       not null default true,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_active on public.users(active);


-- ============================================================
-- 5. TRIGGER: handle_new_user (sincroniza auth.users → public.users)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- 6. TABLA clients
-- ============================================================
create table if not exists public.clients (
  id          uuid          primary key default gen_random_uuid(),
  name        text          not null unique,
  status      client_status not null default 'active',
  start_date  date,
  end_date    date,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

create index if not exists idx_clients_status on public.clients(status);


-- ============================================================
-- 7. TABLA client_users (relación many-to-many)
-- ============================================================
create table if not exists public.client_users (
  id          uuid          primary key default gen_random_uuid(),
  client_id   uuid          not null references public.clients(id) on delete cascade,
  user_id     uuid          not null references public.users(id) on delete cascade,
  created_at  timestamptz   not null default now(),
  constraint uq_client_users unique (client_id, user_id)
);

create index if not exists idx_client_users_client_id on public.client_users(client_id);
create index if not exists idx_client_users_user_id on public.client_users(user_id);


-- ============================================================
-- 8. TABLA piece_categories (seed: Posts, Stories, Reels)
-- ============================================================
create table if not exists public.piece_categories (
  id          uuid          primary key default gen_random_uuid(),
  name        text          not null unique,
  active      boolean       not null default true,
  created_at  timestamptz   not null default now()
);


-- ============================================================
-- 9. TABLA task_types (seed)
-- ============================================================
create table if not exists public.task_types (
  id               uuid         primary key default gen_random_uuid(),
  name             text         not null unique,
  active           boolean      not null default true,
  counts_as_piece  boolean      not null default false,
  allowed_roles    user_role[]  not null default '{admin,member}',
  created_at       timestamptz  not null default now()
);


-- ============================================================
-- 10. TABLA packages
-- ============================================================
create table if not exists public.packages (
  id            uuid           primary key default gen_random_uuid(),
  client_id     uuid           not null references public.clients(id) on delete cascade,
  name          text           not null,
  total_hours   numeric(8,2)   not null check (total_hours > 0),
  total_pieces  integer        check (total_pieces is null or total_pieces > 0),
  price         numeric(12,2),
  status        package_status not null default 'active',
  start_date    date,
  end_date      date,
  created_at    timestamptz    not null default now(),
  updated_at    timestamptz    not null default now()
);

create index if not exists idx_packages_client_id on public.packages(client_id);
create index if not exists idx_packages_status on public.packages(status);


-- ============================================================
-- 11. TABLA package_pieces
-- ============================================================
create table if not exists public.package_pieces (
  id           uuid        primary key default gen_random_uuid(),
  package_id   uuid        not null references public.packages(id) on delete cascade,
  category_id  uuid        not null references public.piece_categories(id) on delete cascade,
  quantity     integer     not null check (quantity >= 0),
  created_at   timestamptz not null default now(),
  constraint uq_package_pieces unique (package_id, category_id)
);

create index if not exists idx_package_pieces_package_id on public.package_pieces(package_id);


-- ============================================================
-- 12. TABLA activity_logs (CORE)
-- ============================================================
create table if not exists public.activity_logs (
  id            uuid             primary key default gen_random_uuid(),
  user_id       uuid             not null references public.users(id) on delete cascade,
  client_id     uuid             not null references public.clients(id) on delete cascade,
  task_type_id  uuid             not null references public.task_types(id),
  category_id   uuid             references public.piece_categories(id),
  hours         numeric(8,2)     not null check (hours > 0),
  pieces_count  integer          not null default 0 check (pieces_count >= 0),
  log_date      date             not null,
  status        activity_status  not null default 'in_progress',
  notes         text,
  is_draft      boolean          not null default false,
  created_at    timestamptz      not null default now(),
  updated_at    timestamptz      not null default now()
);

create index if not exists idx_activity_logs_user_id on public.activity_logs(user_id);
create index if not exists idx_activity_logs_client_id on public.activity_logs(client_id);
create index if not exists idx_activity_logs_log_date on public.activity_logs(log_date);
create index if not exists idx_activity_logs_status on public.activity_logs(status);
create index if not exists idx_activity_logs_is_draft on public.activity_logs(is_draft);


-- ============================================================
-- 13. TABLA edit_requests
-- ============================================================
create table if not exists public.edit_requests (
  id               uuid                 primary key default gen_random_uuid(),
  activity_log_id  uuid                 not null references public.activity_logs(id) on delete cascade,
  requested_by     uuid                 not null references public.users(id) on delete cascade,
  field_name       edit_request_field   not null,
  old_value        text,
  new_value        text                 not null,
  reason           text                 not null,
  status           edit_request_status  not null default 'pending',
  reviewed_by      uuid                 references public.users(id),
  reviewed_at      timestamptz,
  created_at       timestamptz          not null default now()
);

create index if not exists idx_edit_requests_status on public.edit_requests(status);
create index if not exists idx_edit_requests_requested_by on public.edit_requests(requested_by);
create index if not exists idx_edit_requests_activity_log_id on public.edit_requests(activity_log_id);


-- ============================================================
-- 14. TABLA client_links
-- ============================================================
create table if not exists public.client_links (
  id          uuid         primary key default gen_random_uuid(),
  client_id   uuid         not null references public.clients(id) on delete cascade,
  type        link_type    not null default 'custom',
  label       text         not null,
  url         text         not null,
  created_at  timestamptz  not null default now()
);

create index if not exists idx_client_links_client_id on public.client_links(client_id);


-- ============================================================
-- 15. TABLA notifications
-- ============================================================
create table if not exists public.notifications (
  id          uuid                  primary key default gen_random_uuid(),
  user_id     uuid                  not null references public.users(id) on delete cascade,
  type        text                  not null,
  channel     notification_channel  not null default 'email',
  payload     jsonb                 not null default '{}'::jsonb,
  sent_at     timestamptz,
  read_at     timestamptz,
  created_at  timestamptz           not null default now()
);

create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_sent_at on public.notifications(sent_at);


-- ============================================================
-- 16. SEEDS — datos iniciales
-- ============================================================

-- Categorías de piezas
insert into public.piece_categories (name) values
  ('Posts'),
  ('Stories'),
  ('Reels')
on conflict (name) do nothing;

-- Tipos de tarea
insert into public.task_types (name, counts_as_piece, allowed_roles) values
  ('Community management',  true,  '{admin,member}'),
  ('Diseño gráfico',         false, '{admin,member}'),
  ('Redacción de copy',      false, '{admin,member}'),
  ('Edición de video',       false, '{admin,member}'),
  ('Análisis y reportes',    false, '{admin,member}'),
  ('Reunión con cliente',    false, '{admin,member}'),
  ('Planificación',          false, '{admin,member}'),
  ('Producción de contenido', true, '{admin,member}')
on conflict (name) do nothing;


-- ============================================================
-- 17. RLS — HABILITAR EN TODAS LAS TABLAS
-- ============================================================
alter table public.users            enable row level security;
alter table public.clients          enable row level security;
alter table public.client_users     enable row level security;
alter table public.piece_categories enable row level security;
alter table public.task_types       enable row level security;
alter table public.packages         enable row level security;
alter table public.package_pieces   enable row level security;
alter table public.activity_logs    enable row level security;
alter table public.edit_requests    enable row level security;
alter table public.client_links     enable row level security;
alter table public.notifications    enable row level security;


-- ============================================================
-- 18. POLÍTICAS RLS — USERS
-- ============================================================
drop policy if exists "users_admin_all" on public.users;
create policy "users_admin_all" on public.users
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "users_self_select" on public.users;
create policy "users_self_select" on public.users
  for select to authenticated
  using (id = auth.uid());


-- ============================================================
-- 19. POLÍTICAS RLS — CLIENTS
-- ============================================================
drop policy if exists "clients_admin_all" on public.clients;
create policy "clients_admin_all" on public.clients
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "clients_member_select" on public.clients;
create policy "clients_member_select" on public.clients
  for select to authenticated
  using (
    public.current_user_role() = 'member'
    and id in (select client_id from public.client_users where user_id = auth.uid())
  );

drop policy if exists "clients_client_select" on public.clients;
create policy "clients_client_select" on public.clients
  for select to authenticated
  using (
    public.current_user_role() = 'client'
    and id in (select client_id from public.client_users where user_id = auth.uid())
  );


-- ============================================================
-- 20. POLÍTICAS RLS — CLIENT_USERS
-- ============================================================
drop policy if exists "client_users_admin_all" on public.client_users;
create policy "client_users_admin_all" on public.client_users
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "client_users_self_select" on public.client_users;
create policy "client_users_self_select" on public.client_users
  for select to authenticated
  using (user_id = auth.uid());


-- ============================================================
-- 21. POLÍTICAS RLS — PIECE_CATEGORIES y TASK_TYPES (lectura para todos)
-- ============================================================
drop policy if exists "piece_categories_read" on public.piece_categories;
create policy "piece_categories_read" on public.piece_categories
  for select to authenticated using (true);

drop policy if exists "piece_categories_admin_write" on public.piece_categories;
create policy "piece_categories_admin_write" on public.piece_categories
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "task_types_read" on public.task_types;
create policy "task_types_read" on public.task_types
  for select to authenticated using (true);

drop policy if exists "task_types_admin_write" on public.task_types;
create policy "task_types_admin_write" on public.task_types
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');


-- ============================================================
-- 22. POLÍTICAS RLS — PACKAGES y PACKAGE_PIECES
-- ============================================================
drop policy if exists "packages_admin_all" on public.packages;
create policy "packages_admin_all" on public.packages
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "packages_member_select" on public.packages;
create policy "packages_member_select" on public.packages
  for select to authenticated
  using (
    public.current_user_role() = 'member'
    and client_id in (select client_id from public.client_users where user_id = auth.uid())
  );

drop policy if exists "packages_client_select" on public.packages;
create policy "packages_client_select" on public.packages
  for select to authenticated
  using (
    public.current_user_role() = 'client'
    and client_id in (select client_id from public.client_users where user_id = auth.uid())
  );

drop policy if exists "package_pieces_admin_all" on public.package_pieces;
create policy "package_pieces_admin_all" on public.package_pieces
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "package_pieces_select" on public.package_pieces;
create policy "package_pieces_select" on public.package_pieces
  for select to authenticated
  using (
    package_id in (
      select p.id from public.packages p
      where p.client_id in (
        select client_id from public.client_users where user_id = auth.uid()
      )
    )
  );


-- ============================================================
-- 23. POLÍTICAS RLS — ACTIVITY_LOGS
-- ============================================================
drop policy if exists "activity_logs_admin_all" on public.activity_logs;
create policy "activity_logs_admin_all" on public.activity_logs
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "activity_logs_member_select_own" on public.activity_logs;
create policy "activity_logs_member_select_own" on public.activity_logs
  for select to authenticated
  using (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  );

drop policy if exists "activity_logs_member_insert" on public.activity_logs;
create policy "activity_logs_member_insert" on public.activity_logs
  for insert to authenticated
  with check (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  );

drop policy if exists "activity_logs_member_update_own" on public.activity_logs;
create policy "activity_logs_member_update_own" on public.activity_logs
  for update to authenticated
  using (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  );

drop policy if exists "activity_logs_client_select" on public.activity_logs;
create policy "activity_logs_client_select" on public.activity_logs
  for select to authenticated
  using (
    public.current_user_role() = 'client'
    and client_id in (select client_id from public.client_users where user_id = auth.uid())
  );


-- ============================================================
-- 24. POLÍTICAS RLS — EDIT_REQUESTS
-- ============================================================
drop policy if exists "edit_requests_admin_all" on public.edit_requests;
create policy "edit_requests_admin_all" on public.edit_requests
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "edit_requests_member_own" on public.edit_requests;
create policy "edit_requests_member_own" on public.edit_requests
  for all to authenticated
  using (
    public.current_user_role() = 'member'
    and requested_by = auth.uid()
  )
  with check (
    public.current_user_role() = 'member'
    and requested_by = auth.uid()
  );


-- ============================================================
-- 25. POLÍTICAS RLS — CLIENT_LINKS
-- ============================================================
drop policy if exists "client_links_admin_all" on public.client_links;
create policy "client_links_admin_all" on public.client_links
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "client_links_select" on public.client_links;
create policy "client_links_select" on public.client_links
  for select to authenticated
  using (
    client_id in (select client_id from public.client_users where user_id = auth.uid())
  );


-- ============================================================
-- 26. POLÍTICAS RLS — NOTIFICATIONS
-- ============================================================
drop policy if exists "notifications_admin_all" on public.notifications;
create policy "notifications_admin_all" on public.notifications
  for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "notifications_self_select" on public.notifications;
create policy "notifications_self_select" on public.notifications
  for select to authenticated
  using (user_id = auth.uid());


-- ============================================================
-- FIN DE LA MIGRATION
-- Sistema Kurve · Migration 001 · Initial Schema
-- ============================================================
