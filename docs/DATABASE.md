# Database Reference — Kurve

Base de datos PostgreSQL 14.5 gestionada por Supabase. Project ID: `hjkuvupzqenotesrmlae`.

---

## Tablas

### `public.users`

Perfil de usuario de la aplicación. Se sincroniza con `auth.users` de Supabase: el `id` de esta tabla es el mismo UUID de Auth.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria, igual al id de `auth.users` |
| `email` | text | NO | Email único del usuario |
| `full_name` | text | NO | Nombre completo (default `''`) |
| `role` | `user_role` | NO | Rol: `admin`, `member` o `client` |
| `active` | boolean | NO | Si el usuario puede acceder (default `true`) |
| `phone` | text | SÍ | Teléfono para recordatorios por WhatsApp |
| `created_at` | timestamptz | NO | Fecha de creación |

**Nota:** los usuarios admin se crean manualmente desde Supabase Auth + SQL. Los integrantes (`member`) se crean via `/api/activity-logs/members`. Los usuarios cliente (`client`) se crean via el mismo endpoint con el rol correcto.

---

### `public.clients`

Clientes de la agencia. Cada cliente puede tener uno o más paquetes y uno o más usuarios asociados.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `name` | text | NO | Nombre del cliente (único, validado en app) |
| `legal_name` | text | SÍ | Razón social |
| `email` | text | SÍ | Email de contacto |
| `phone` | text | SÍ | Teléfono de contacto |
| `status` | `client_status` | NO | Estado: `active`, `paused` o `ended` (default `active`) |
| `start_date` | date | SÍ | Fecha de inicio del contrato |
| `end_date` | date | SÍ | Fecha de fin del contrato |
| `created_at` | timestamptz | NO | Fecha de alta |

---

### `public.packages`

Paquetes contratados por cada cliente. Un cliente puede tener solo un paquete `active` a la vez. Los paquetes cerrados se conservan para historial.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `client_id` | uuid | NO | FK a `clients.id` |
| `name` | text | NO | Nombre descriptivo del paquete |
| `status` | `client_status` | NO | Estado: `active`, `paused` o `ended` (default `active`) |
| `total_hours` | numeric | NO | Horas totales contratadas |
| `total_pieces` | integer | SÍ | Total de piezas contratadas (suma de todas las categorías) |
| `price` | numeric | SÍ | Precio del paquete (informativo) |
| `start_date` | date | SÍ | Inicio de vigencia |
| `end_date` | date | SÍ | Fin de vigencia |
| `block_on_limit` | boolean | NO | Si `true`, bloquea la carga de actividades cuando el paquete supera el 100% de horas (default `false`) |
| `created_at` | timestamptz | NO | Fecha de creación |

---

### `public.package_pieces`

Detalle de piezas por categoría dentro de un paquete. Un paquete puede tener múltiples filas, una por categoría de piezas.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `package_id` | uuid | NO | FK a `packages.id` (cascade delete) |
| `category_id` | uuid | NO | FK a `piece_categories.id` |
| `quantity` | integer | NO | Cantidad de piezas contratadas para esta categoría (default `0`) |

---

### `public.activity_logs`

Registro de actividades de los integrantes. Es la tabla central del sistema.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `user_id` | uuid | NO | FK a `users.id` — quién registró la actividad |
| `client_id` | uuid | NO | FK a `clients.id` — para qué cliente |
| `task_type_id` | uuid | NO | FK a `task_types.id` — tipo de tarea |
| `subtype_id` | uuid | SÍ | FK a `task_subtypes.id` — subtipo opcional |
| `category_id` | uuid | SÍ | FK a `piece_categories.id` — categoría de piezas (obligatorio si `pieces_count > 0`) |
| `log_date` | date | NO | Fecha de la actividad (default `now()`) |
| `hours` | numeric | NO | Horas trabajadas |
| `pieces_count` | integer | NO | Cantidad de piezas producidas (default `0`) |
| `status` | `activity_status` | NO | Estado: `in_progress`, `delivered` o `published` (default `in_progress`) |
| `is_draft` | boolean | NO | Si es borrador no cuenta en el consumo (default `false`) |
| `notes` | text | SÍ | Notas opcionales (max 500 caracteres en la app) |
| `created_at` | timestamptz | NO | Fecha de creación |
| `updated_at` | timestamptz | NO | Última modificación |

**Regla de consumo:** solo las actividades con `is_draft = false` Y `status != 'in_progress'` cuentan para el cálculo de horas consumidas.

---

### `public.edit_requests`

Solicitudes de corrección que un integrante envía al admin para modificar un campo de una actividad ya publicada.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `activity_log_id` | uuid | NO | FK a `activity_logs.id` |
| `requested_by` | uuid | NO | FK a `users.id` — quién pide la corrección |
| `reviewed_by` | uuid | SÍ | FK a `users.id` — admin que revisó |
| `field_name` | `editable_field` | NO | Campo que se quiere cambiar |
| `old_value` | text | NO | Valor actual del campo |
| `new_value` | text | NO | Valor propuesto |
| `reason` | text | SÍ | Motivo de la corrección |
| `status` | `request_status` | NO | Estado: `pending`, `approved` o `rejected` (default `pending`) |
| `created_at` | timestamptz | NO | Fecha de solicitud |
| `reviewed_at` | timestamptz | SÍ | Fecha de revisión |

---

### `public.consumption_summary`

Resumen de consumo por paquete. Mantenida automáticamente por el trigger `trg_activity_logs_consumption`. No se modifica manualmente.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `package_id` | uuid | NO | FK a `packages.id` (cascade delete) |
| `category_id` | uuid | SÍ | FK a `piece_categories.id`. Si es NULL, la fila representa las **horas totales** del paquete. Si tiene valor, representa las **piezas de esa categoría** |
| `task_type_id` | uuid | SÍ | FK a `task_types.id`. Presente cuando el consumo se agrupa por tipo de tarea (usado por la vista `v_consumption_by_task_type`) |
| `consumed` | numeric(8,2) | NO | Cantidad consumida (horas u piezas según la fila) |
| `updated_at` | timestamptz | NO | Última actualización por el trigger |

**Índices únicos:**
- `uq_consumption_summary_pkg_cat` — unicidad por `(package_id, category_id)` cuando `category_id IS NOT NULL`
- `uq_consumption_summary_pkg_hours` — unicidad por `package_id` cuando `category_id IS NULL` (la fila de horas totales)

---

### `public.client_users`

Tabla de unión entre usuarios y clientes. Define qué integrante/cliente tiene acceso a cada cliente.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `user_id` | uuid | NO | FK a `users.id` |
| `client_id` | uuid | NO | FK a `clients.id` |
| `created_at` | timestamptz | NO | Fecha de asignación |

---

### `public.client_links`

Links de referencia asociados a un cliente (contratos, Drive, Analytics, etc.).

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `client_id` | uuid | NO | FK a `clients.id` |
| `label` | text | NO | Etiqueta descriptiva |
| `url` | text | NO | URL del recurso |
| `type` | `link_type` | NO | Tipo: `contract`, `drive`, `analytics` o `custom` (default `custom`) |
| `created_at` | timestamptz | NO | Fecha de creación |

---

### `public.task_types`

Tipos de tarea disponibles para los integrantes al registrar una actividad.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `name` | text | NO | Nombre del tipo (ej: "Diseño", "Redacción") |
| `counts_as_piece` | boolean | NO | Si las actividades de este tipo cuentan como piezas (default `false`) |
| `allowed_roles` | `user_role[]` | NO | Roles que pueden usar este tipo (default `{admin,member}`) |
| `active` | boolean | NO | Si está disponible para nuevas actividades (default `true`) |
| `created_at` | timestamptz | NO | Fecha de creación |

---

### `public.task_subtypes`

Subtipos opcionales de tarea, agrupados bajo un tipo de tarea.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `task_type_id` | uuid | NO | FK a `task_types.id` |
| `name` | text | NO | Nombre del subtipo |
| `active` | boolean | NO | Si está disponible (default `true`) |
| `display_order` | integer | NO | Orden de visualización (default `0`) |
| `created_at` | timestamptz | NO | Fecha de creación |
| `updated_at` | timestamptz | NO | Última modificación |

---

### `public.piece_categories`

Categorías de piezas de contenido (ej: Posts, Stories, Reels).

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `name` | text | NO | Nombre de la categoría |
| `active` | boolean | NO | Si está disponible (default `true`) |
| `created_at` | timestamptz | NO | Fecha de creación |

---

### `public.notifications`

Registro de notificaciones enviadas (email o WhatsApp) a los usuarios.

| Columna | Tipo | Nullable | Descripción |
|---------|------|----------|-------------|
| `id` | uuid | NO | Clave primaria |
| `user_id` | uuid | NO | FK a `users.id` — destinatario |
| `channel` | `notification_channel` | NO | Canal: `email` o `whatsapp` (default `email`) |
| `type` | text | NO | Tipo de notificación (`edit_request_approved`, `edit_request_rejected`, `edit_request_created`, `daily_reminder`) |
| `payload` | jsonb | NO | Datos adicionales (IDs relacionados, etc.) |
| `read_at` | timestamptz | SÍ | Cuándo la leyó el usuario (si aplica) |
| `sent_at` | timestamptz | SÍ | Cuándo se envió efectivamente |
| `created_at` | timestamptz | NO | Fecha de creación del registro |

---

## Enums

| Nombre | Valores | Descripción |
|--------|---------|-------------|
| `user_role` | `admin`, `member`, `client` | Roles de usuario del sistema |
| `client_status` | `active`, `paused`, `ended` | Estado de clientes y paquetes |
| `activity_status` | `in_progress`, `delivered`, `published` | Estado de una actividad registrada |
| `request_status` | `pending`, `approved`, `rejected` | Estado de una solicitud de corrección |
| `editable_field` | `hours`, `pieces_count`, `task_type_id`, `category_id`, `log_date`, `status`, `notes` | Campos de `activity_logs` que se pueden corregir |
| `link_type` | `contract`, `drive`, `analytics`, `custom` | Tipo de link en `client_links` |
| `notification_channel` | `email`, `whatsapp` | Canal de notificación |

---

## Vistas

### `public.v_client_consumption`

Vista de consumo del paquete activo de cada cliente, con semáforo. Solo muestra paquetes con `status = 'active'`. Creada con `SECURITY INVOKER` para respetar RLS.

| Columna | Descripción |
|---------|-------------|
| `client_id` | UUID del cliente |
| `package_id` | UUID del paquete activo |
| `package_name` | Nombre del paquete |
| `total_hours` | Horas totales contratadas |
| `start_date` | Inicio del paquete |
| `end_date` | Vencimiento del paquete |
| `package_status` | Estado del paquete |
| `consumed_hours` | Horas consumidas (de `consumption_summary` donde `category_id IS NULL`) |
| `hours_percent` | Porcentaje consumido (redondeado a 1 decimal) |
| `traffic_light` | `green` (< 70%), `yellow` (70–99%), `red` (>= 100%) |

---

### `public.v_consumption_by_task_type`

Vista de consumo de horas desglosado por tipo de tarea. Creada con `SECURITY INVOKER`. Solo muestra filas donde `task_type_id IS NOT NULL`.

| Columna | Descripción |
|---------|-------------|
| `client_id` | UUID del cliente |
| `package_id` | UUID del paquete |
| `task_type_id` | UUID del tipo de tarea |
| `task_name` | Nombre del tipo de tarea |
| `consumed_hours` | Horas consumidas para ese tipo |
| `percent_of_total` | Porcentaje sobre el total de horas del paquete |

---

## Funciones

### `public.get_active_package_id(p_client_id uuid) → uuid`

Devuelve el UUID del paquete activo vigente de un cliente (el más reciente en caso de empate). Retorna `NULL` si no hay ninguno.

Condiciones de paquete activo: `status = 'active'` AND (`start_date IS NULL` OR `start_date <= today`) AND (`end_date IS NULL` OR `end_date >= today`).

---

### `public.recalculate_client_consumption(p_client_id uuid) → void`

Recalcula desde cero el `consumption_summary` del paquete activo de un cliente. Es el "reset completo": borra todas las filas del paquete activo y las reconstruye.

---

### `public.current_user_role() → user_role`

Devuelve el rol del usuario autenticado leyendo `public.users`. Usada internamente en las políticas RLS para evitar repetir la consulta.

---

## Trigger de consumo automático

El trigger `trg_activity_logs_consumption` se dispara **AFTER INSERT / UPDATE / DELETE** en `activity_logs` para cada fila modificada.

**Cómo funciona paso a paso:**

1. Cuando se inserta, actualiza o elimina una fila en `activity_logs`, el trigger llama a `handle_activity_log_change()`.
2. La función determina el `client_id` afectado (en un UPDATE donde cambió el cliente, procesa ambos clientes).
3. Llama a `recalculate_client_consumption(client_id)`.
4. `recalculate_client_consumption` primero obtiene el paquete activo del cliente con `get_active_package_id()`. Si no hay paquete activo, no hace nada y retorna.
5. Borra todas las filas de `consumption_summary` para ese paquete.
6. Recalcula e inserta:
   - Una fila con `category_id = NULL` que representa las **horas totales** consumidas. Se suma `hours` de todas las actividades del cliente donde `is_draft = false` Y `status != 'in_progress'`.
   - Una fila por cada categoría definida en `package_pieces` del paquete, con la suma de `pieces_count` de las actividades que coincidan en `category_id` (con las mismas condiciones de is_draft/status).

**Casos importantes:**
- Un borrador (`is_draft = true`) no cuenta en el consumo aunque tenga `status = delivered`.
- Una actividad con `status = 'in_progress'` no cuenta aunque no sea borrador.
- Si el cliente no tiene paquete activo en la fecha actual, el trigger no produce ningún efecto.

---

## Lógica de paquetes

Cada cliente puede tener a lo sumo **un paquete activo** a la vez. La regla se valida en la API (no hay constraint de DB).

Un paquete tiene dos dimensiones de contratación:
- **Horas totales** (`total_hours`): límite de tiempo dedicado al cliente.
- **Piezas por categoría** (`package_pieces`): límite de unidades producidas por tipo de contenido.

El campo `block_on_limit` permite decidir si el sistema bloquea la carga de nuevas actividades cuando se superan las horas (`hours_percent >= 100`). Si está en `false` el sistema solo muestra una advertencia.

Cuando se cierra un paquete (`status = ended`), el `consumption_summary` queda como registro histórico ya que no se elimina automáticamente.

---

## Políticas RLS por tabla

RLS está habilitado en todas las tablas públicas. El service role bypasea todas las políticas automáticamente.

| Tabla | admin | member | client |
|-------|-------|--------|--------|
| `users` | Full access (+ todos ven su propio perfil) | Solo leer su propio perfil | Solo leer su propio perfil |
| `clients` | Full access | SELECT clientes asignados en `client_users` | SELECT cliente propio en `client_users` |
| `packages` | Full access | SELECT de clientes asignados | SELECT del suyo |
| `activity_logs` | Full access | Full access sobre sus propios logs | SELECT de los logs de su cliente |
| `edit_requests` | Full access | Full access sobre las suyas | Sin acceso |
| `notifications` | Full access | SELECT de las suyas | SELECT de las suyas |
| `client_users` | Full access | SELECT de las suyas | SELECT de las suyas |
| `client_links` | Full access | SELECT de clientes asignados | SELECT del suyo |
| `package_pieces` | Full access | SELECT de clientes asignados | SELECT del suyo |
| `task_types` | Full access | SELECT (todos) | SELECT (todos) |
| `task_subtypes` | Full access | SELECT (todos) | SELECT (todos) |
| `piece_categories` | Full access | SELECT (todos) | SELECT (todos) |
| `consumption_summary` | Full access | SELECT de sus clientes | SELECT del suyo |

**Vistas:** `v_client_consumption` y `v_consumption_by_task_type` son `SECURITY INVOKER`, por lo que respetan el RLS de las tablas base.
