-- ============================================================
-- RLS policies para todas las tablas públicas sin cobertura.
--
-- Usa DROP POLICY IF EXISTS antes de cada CREATE para que sea
-- idempotente: se puede correr aunque ya existan políticas en
-- el dashboard de Supabase (las reemplaza por la versión versionada).
--
-- Roles: admin | member | client
-- Helper: public.current_user_role() — ya existe en la DB.
-- Service role bypasa RLS automáticamente (no necesita políticas).
--
-- NOTA — tabla users:
--   La policy "users: ver el propio perfil" (id = auth.uid()) se agrega
--   ANTES que cualquier política que use current_user_role(). Esto evita
--   recursión infinita: la función necesita leer users para devolver el
--   rol, y esta policy le garantiza acceso a la propia fila sin necesidad
--   de evaluar current_user_role().
--
-- NOTA — vistas:
--   v_client_consumption y v_consumption_by_task_type son SECURITY DEFINER
--   por defecto en Supabase. Para que respeten RLS de las tablas base hay
--   que recrearlas con SECURITY INVOKER. Eso queda pendiente como tarea
--   separada de menor prioridad dado que las rutas que las consultan ya
--   usan service role o sesión de admin.
--
-- NOTA — notifications insert en edit-requests/route.ts:
--   Ese insert usa la sesión del member y no incluye user_id (bug previo).
--   Falla silenciosamente por el NOT NULL constraint antes de llegar a RLS.
--   Pendiente corregirlo para pasar por createServiceClient() con user_id.
-- ============================================================

-- ========================
-- users
-- ========================
alter table public.users enable row level security;

-- PRIMERO: policy sin current_user_role() para romper la recursión potencial
drop policy if exists "users: ver el propio perfil" on public.users;
create policy "users: ver el propio perfil"
  on public.users for select
  to authenticated
  using (id = auth.uid());

-- Admin ve y gestiona todos los usuarios
drop policy if exists "users: admin full access" on public.users;
create policy "users: admin full access"
  on public.users for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ========================
-- clients
-- ========================
alter table public.clients enable row level security;

drop policy if exists "clients: admin full access" on public.clients;
create policy "clients: admin full access"
  on public.clients for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "clients: member ve los asignados" on public.clients;
create policy "clients: member ve los asignados"
  on public.clients for select
  to authenticated
  using (
    public.current_user_role() = 'member'
    and id in (
      select client_id from public.client_users where user_id = auth.uid()
    )
  );

drop policy if exists "clients: client ve el suyo" on public.clients;
create policy "clients: client ve el suyo"
  on public.clients for select
  to authenticated
  using (
    public.current_user_role() = 'client'
    and id in (
      select client_id from public.client_users where user_id = auth.uid()
    )
  );

-- ========================
-- packages
-- ========================
alter table public.packages enable row level security;

drop policy if exists "packages: admin full access" on public.packages;
create policy "packages: admin full access"
  on public.packages for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "packages: member ve los de sus clientes" on public.packages;
create policy "packages: member ve los de sus clientes"
  on public.packages for select
  to authenticated
  using (
    public.current_user_role() = 'member'
    and client_id in (
      select client_id from public.client_users where user_id = auth.uid()
    )
  );

drop policy if exists "packages: client ve el suyo" on public.packages;
create policy "packages: client ve el suyo"
  on public.packages for select
  to authenticated
  using (
    public.current_user_role() = 'client'
    and client_id in (
      select client_id from public.client_users where user_id = auth.uid()
    )
  );

-- ========================
-- activity_logs
-- ========================
alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs: admin full access" on public.activity_logs;
create policy "activity_logs: admin full access"
  on public.activity_logs for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Member solo gestiona sus propios logs
drop policy if exists "activity_logs: member gestiona los suyos" on public.activity_logs;
create policy "activity_logs: member gestiona los suyos"
  on public.activity_logs for all
  to authenticated
  using (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  )
  with check (
    public.current_user_role() = 'member'
    and user_id = auth.uid()
  );

-- Client solo lee los logs de su cliente
drop policy if exists "activity_logs: client ve los de su cliente" on public.activity_logs;
create policy "activity_logs: client ve los de su cliente"
  on public.activity_logs for select
  to authenticated
  using (
    public.current_user_role() = 'client'
    and client_id in (
      select client_id from public.client_users where user_id = auth.uid()
    )
  );

-- ========================
-- edit_requests
-- ========================
alter table public.edit_requests enable row level security;

drop policy if exists "edit_requests: admin full access" on public.edit_requests;
create policy "edit_requests: admin full access"
  on public.edit_requests for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Member solo gestiona las solicitudes que él creó
drop policy if exists "edit_requests: member gestiona las suyas" on public.edit_requests;
create policy "edit_requests: member gestiona las suyas"
  on public.edit_requests for all
  to authenticated
  using (
    public.current_user_role() = 'member'
    and requested_by = auth.uid()
  )
  with check (
    public.current_user_role() = 'member'
    and requested_by = auth.uid()
  );

-- ========================
-- notifications
-- ========================
alter table public.notifications enable row level security;

drop policy if exists "notifications: admin full access" on public.notifications;
create policy "notifications: admin full access"
  on public.notifications for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Member y client solo leen sus propias notificaciones
drop policy if exists "notifications: usuario ve las suyas" on public.notifications;
create policy "notifications: usuario ve las suyas"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

-- ========================
-- client_users
-- ========================
alter table public.client_users enable row level security;

drop policy if exists "client_users: admin full access" on public.client_users;
create policy "client_users: admin full access"
  on public.client_users for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Member y client solo ven sus propias asignaciones (necesario para las
-- políticas de clients/packages/etc. que hacen subquery a client_users)
drop policy if exists "client_users: usuario ve las suyas" on public.client_users;
create policy "client_users: usuario ve las suyas"
  on public.client_users for select
  to authenticated
  using (user_id = auth.uid());

-- ========================
-- client_links
-- ========================
alter table public.client_links enable row level security;

drop policy if exists "client_links: admin full access" on public.client_links;
create policy "client_links: admin full access"
  on public.client_links for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "client_links: member ve sus clientes" on public.client_links;
create policy "client_links: member ve sus clientes"
  on public.client_links for select
  to authenticated
  using (
    public.current_user_role() = 'member'
    and client_id in (
      select client_id from public.client_users where user_id = auth.uid()
    )
  );

drop policy if exists "client_links: client ve el suyo" on public.client_links;
create policy "client_links: client ve el suyo"
  on public.client_links for select
  to authenticated
  using (
    public.current_user_role() = 'client'
    and client_id in (
      select client_id from public.client_users where user_id = auth.uid()
    )
  );

-- ========================
-- package_pieces
-- ========================
alter table public.package_pieces enable row level security;

drop policy if exists "package_pieces: admin full access" on public.package_pieces;
create policy "package_pieces: admin full access"
  on public.package_pieces for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

drop policy if exists "package_pieces: member ve sus clientes" on public.package_pieces;
create policy "package_pieces: member ve sus clientes"
  on public.package_pieces for select
  to authenticated
  using (
    public.current_user_role() = 'member'
    and package_id in (
      select id from public.packages
      where client_id in (
        select client_id from public.client_users where user_id = auth.uid()
      )
    )
  );

drop policy if exists "package_pieces: client ve el suyo" on public.package_pieces;
create policy "package_pieces: client ve el suyo"
  on public.package_pieces for select
  to authenticated
  using (
    public.current_user_role() = 'client'
    and package_id in (
      select id from public.packages
      where client_id in (
        select client_id from public.client_users where user_id = auth.uid()
      )
    )
  );

-- ========================
-- task_types (tabla de referencia — todos leen, solo admin escribe)
-- ========================
alter table public.task_types enable row level security;

drop policy if exists "task_types: todos pueden leer" on public.task_types;
create policy "task_types: todos pueden leer"
  on public.task_types for select
  to authenticated
  using (true);

drop policy if exists "task_types: admin escribe" on public.task_types;
create policy "task_types: admin escribe"
  on public.task_types for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ========================
-- task_subtypes (tabla de referencia)
-- ========================
alter table public.task_subtypes enable row level security;

drop policy if exists "task_subtypes: todos pueden leer" on public.task_subtypes;
create policy "task_subtypes: todos pueden leer"
  on public.task_subtypes for select
  to authenticated
  using (true);

drop policy if exists "task_subtypes: admin escribe" on public.task_subtypes;
create policy "task_subtypes: admin escribe"
  on public.task_subtypes for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ========================
-- piece_categories (tabla de referencia)
-- ========================
alter table public.piece_categories enable row level security;

drop policy if exists "piece_categories: todos pueden leer" on public.piece_categories;
create policy "piece_categories: todos pueden leer"
  on public.piece_categories for select
  to authenticated
  using (true);

drop policy if exists "piece_categories: admin escribe" on public.piece_categories;
create policy "piece_categories: admin escribe"
  on public.piece_categories for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');
