# API Reference — Kurve

Todos los endpoints son **API Routes de Next.js** ubicados en `src/app/api/`.

## Convenciones generales

- Todas las respuestas son JSON.
- Las respuestas exitosas tienen la forma `{ data: ... }` o `{ message: ..., data: ... }`.
- Los errores tienen la forma `{ error: string }` y opcionalmente `{ details: ZodFlattenedErrors }`.
- La autenticación se maneja via cookies de sesión (Supabase Auth + `@supabase/ssr`). El cliente debe estar autenticado salvo que se indique lo contrario.
- Los guards disponibles son:
  - `requireAdmin()` — valida sesión y que el rol sea `admin`
  - `requireRole([roles])` — valida sesión y que el rol esté en la lista
  - Sin guard explícito pero con `supabase.auth.getUser()` — valida solo sesión

---

## Actividades

### `GET /api/activity-logs`

Planilla de tiempos. Devuelve todas las actividades publicadas (no borradores), paginadas por cursor. Soporta exportación CSV.

**Guard:** sin guard explícito — la query se ejecuta con la sesión del usuario (RLS aplica).

**Query params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `client_id` | uuid | Filtrar por cliente |
| `member_id` | uuid | Filtrar por integrante |
| `status` | `in_progress` \| `delivered` \| `published` | Filtrar por estado |
| `from` | `YYYY-MM-DD` | Fecha de inicio del rango |
| `to` | `YYYY-MM-DD` | Fecha de fin del rango |
| `cursor` | `YYYY-MM-DD` | Cursor de paginación (fecha de la última actividad recibida) |
| `export` | `csv` | Si se envía, devuelve el archivo CSV en lugar de JSON |

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "log_date": "2026-06-23",
      "hours": 2.5,
      "pieces_count": 3,
      "status": "delivered",
      "is_draft": false,
      "users": { "full_name": "..." },
      "clients": { "name": "..." },
      "task_types": { "name": "..." },
      "piece_categories": { "name": "..." }
    }
  ],
  "pagination": {
    "limit": 50,
    "nextCursor": "2026-06-20",
    "hasMore": true
  }
}
```

**Errores:**
- `500` — error en la query a Supabase

---

### `POST /api/activity-logs`

Publica una actividad. Si existe un borrador pendiente del mismo usuario y cliente, lo convierte en actividad publicada en lugar de crear una nueva.

**Guard:** sesión requerida. Además valida que el cliente esté asignado al usuario autenticado.

**Rate limit:** 30 requests por minuto por usuario (en memoria).

**Body:**
```json
{
  "client_id": "uuid",
  "task_type_id": "uuid",
  "category_id": "uuid | null",
  "log_date": "YYYY-MM-DD",
  "hours": 2.5,
  "pieces_count": 3,
  "status": "in_progress | delivered | published",
  "notes": "string (max 500) | null",
  "is_draft": false
}
```

**Validaciones adicionales:**
- Si `pieces_count > 0`, `category_id` es obligatorio.
- La fecha no puede ser mayor a 7 días en el pasado.
- Si el paquete activo tiene `block_on_limit = true` y el consumo ya superó el 100%, se bloquea la carga.

**Respuesta exitosa:**
- `201` — actividad creada desde cero
- `200` — borrador convertido en actividad

```json
{
  "message": "Actividad creada correctamente",
  "data": { ... },
  "warning": true,
  "hours_percent": 75.3
}
```

> `warning` y `hours_percent` solo aparecen cuando el consumo supera el 70%.

**Errores:**
- `400` — datos inválidos (Zod) o fecha fuera del rango de 7 días o piezas sin categoría
- `401` — no autenticado
- `403` — cliente no asignado al usuario
- `409` — paquete sin horas disponibles (`block_on_limit = true` y `hours_percent >= 100`)
- `429` — rate limit excedido
- `500` — error de escritura en Supabase

---

### `GET /api/activity-logs/me`

Actividades del usuario autenticado (planilla personal). Excluye borradores. Paginación por cursor, limit 20.

**Guard:** sesión requerida.

**Query params:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `status` | `in_progress` \| `delivered` \| `published` | Filtrar por estado |
| `client_id` | uuid | Filtrar por cliente |
| `date` | `YYYY-MM-DD` | Filtrar por fecha exacta |
| `cursor` | `YYYY-MM-DD` | Cursor de paginación |

**Respuesta exitosa (200):**
```json
{
  "data": [ { "id": "uuid", "clients": {...}, "task_types": {...}, "piece_categories": {...}, ... } ],
  "nextCursor": "2026-06-15"
}
```

**Errores:**
- `401` — no autenticado
- `500` — error en Supabase

---

### `GET /api/activity-logs/draft`

Devuelve el borrador más reciente del usuario autenticado. Si no hay borrador devuelve `null`.

**Guard:** sesión requerida.

**Respuesta exitosa (200):**
```json
{ "data": { ... } }
```
```json
{ "data": null }
```

---

### `POST /api/activity-logs/draft`

Guarda o actualiza el borrador del usuario autenticado. Si ya existe un borrador para el mismo usuario y cliente, lo actualiza; si no, crea uno nuevo.

**Guard:** sesión requerida. Valida que el cliente esté asignado al usuario.

**Body:**
```json
{
  "client_id": "uuid",
  "task_type_id": "uuid",
  "category_id": "uuid | null",
  "log_date": "YYYY-MM-DD",
  "hours": 0,
  "pieces_count": 0,
  "status": "in_progress | delivered | published",
  "notes": "string | null"
}
```

> Todos los campos excepto `client_id` y `task_type_id` son opcionales para permitir auto-guardado incremental.

**Respuesta exitosa:**
- `200` — borrador actualizado
- `201` — borrador creado

**Errores:**
- `400` — datos inválidos
- `401` — no autenticado
- `403` — cliente no asignado

---

## Clientes

> **Nota:** los route handlers de clientes están en `src/app/api/activity-logs/clients/`. La URL efectiva es `/api/activity-logs/clients`.

### `GET /api/activity-logs/clients`

Lista todos los clientes ordenados por fecha de creación descendente.

**Guard:** sesión requerida (RLS filtra según rol).

**Respuesta exitosa (200):**
```json
{ "data": [ { "id": "uuid", "name": "...", "status": "active", ... } ] }
```

---

### `POST /api/activity-logs/clients`

Crea un nuevo cliente. Valida que no exista otro cliente con el mismo nombre (case insensitive).

**Guard:** sesión requerida.

**Body:**
```json
{
  "name": "string (min 2, max 100)",
  "status": "active | paused | ended",
  "start_date": "YYYY-MM-DD | null",
  "end_date": "YYYY-MM-DD | null"
}
```

**Respuesta exitosa (201):**
```json
{ "message": "Cliente creado correctamente", "data": { ... } }
```

**Errores:**
- `400` — datos inválidos
- `401` — no autenticado
- `409` — ya existe un cliente con ese nombre
- `500` — error en Supabase

---

### `GET /api/activity-logs/clients/:id`

Obtiene un cliente por ID.

**Guard:** sin guard explícito (RLS aplica).

**Respuesta exitosa (200):**
```json
{ "data": { "id": "uuid", "name": "...", ... } }
```

**Errores:**
- `404` — cliente no encontrado

---

### `PATCH /api/activity-logs/clients/:id`

Actualiza un cliente. Todos los campos son opcionales.

**Guard:** sin guard explícito (RLS aplica).

**Body:**
```json
{
  "name": "string (min 2, max 100)",
  "status": "active | paused | ended",
  "start_date": "YYYY-MM-DD | null",
  "end_date": "YYYY-MM-DD | null"
}
```

**Errores:**
- `400` — datos inválidos
- `409` — ya existe otro cliente con ese nombre
- `500` — error en Supabase

---

### `DELETE /api/activity-logs/clients/:id`

Soft delete: marca el cliente como `ended` y registra `end_date = hoy`. No elimina físicamente.

**Guard:** sin guard explícito (RLS aplica).

**Respuesta exitosa (200):**
```json
{ "message": "Cliente desactivado correctamente", "data": { ... } }
```

---

### `GET /api/clients/:id/package-status`

Devuelve el estado detallado del paquete activo del cliente: horas totales, horas consumidas, porcentaje y si está excedido.

**Guard:** `requireAdmin()`

**Respuesta exitosa (200):**
```json
{
  "package_id": "uuid",
  "package_name": "Paquete Mensual",
  "total_hours": 80,
  "consumed_hours": 65.5,
  "hours_percent": 81.9,
  "exceeded_hours": 0,
  "is_exceeded": false,
  "package_end_date": "2026-07-31",
  "status": "active"
}
```

**Errores:**
- `401` — no autenticado
- `403` — no es admin
- `404` — no hay paquete activo para el cliente
- `500` — error en Supabase

---

## Paquetes

> **Nota:** los route handlers están en `src/app/api/activity-logs/packages/`. La URL efectiva es `/api/activity-logs/packages`.

### `GET /api/activity-logs/packages`

Lista todos los paquetes con sus clientes y piezas asociadas.

**Guard:** sin guard explícito (RLS aplica).

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "...",
      "status": "active",
      "total_hours": 80,
      "clients": { ... },
      "package_pieces": [ { "category_id": "uuid", "quantity": 10, "piece_categories": { ... } } ]
    }
  ]
}
```

---

### `POST /api/activity-logs/packages`

Crea un nuevo paquete para un cliente. Valida que el cliente no tenga ya un paquete `active`.

**Guard:** sin guard explícito (RLS aplica).

**Body:**
```json
{
  "client_id": "uuid",
  "name": "string (min 2, max 100)",
  "status": "active | paused | ended",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD | null",
  "total_hours": 80,
  "total_pieces": 30,
  "package_pieces": [
    { "category_id": "uuid", "quantity": 10 }
  ]
}
```

**Errores:**
- `400` — datos inválidos
- `409` — el cliente ya tiene un paquete activo
- `500` — error en Supabase

---

### `GET /api/activity-logs/packages/:id`

Obtiene un paquete por ID con clientes y piezas.

**Guard:** sin guard explícito (RLS aplica).

**Errores:**
- `404` — paquete no encontrado

---

### `PATCH /api/activity-logs/packages/:id`

Actualiza un paquete. Si se envía `package_pieces`, reemplaza todas las piezas anteriores.

**Guard:** sin guard explícito (RLS aplica).

**Body:** igual al POST pero todos los campos son opcionales, más `package_pieces` opcional.

**Respuesta:** `200` con mensaje `"Paquete cerrado correctamente"` si `status = "ended"`, o `"Paquete actualizado correctamente"` en cualquier otro caso.

---

### `DELETE /api/activity-logs/packages/:id`

Soft delete: marca el paquete como `ended` con `end_date = hoy`.

**Respuesta exitosa (200):**
```json
{ "message": "Paquete cerrado correctamente", "data": { ... } }
```

---

## Integrantes

> **Nota:** los route handlers están en `src/app/api/activity-logs/members/`. La URL efectiva es `/api/activity-logs/members`.

### `GET /api/activity-logs/members`

Lista todos los usuarios con `role = member` ordenados por fecha de creación descendente.

**Guard:** ninguno explícito — usa service client (bypasea RLS).

**Respuesta exitosa (200):**
```json
{ "data": [ { "id": "uuid", "full_name": "...", "email": "...", "active": true, ... } ] }
```

---

### `POST /api/activity-logs/members`

Crea un nuevo integrante. Crea el usuario en Supabase Auth y luego inserta en `public.users` con `role = member`.

**Guard:** ninguno explícito — usa service client.

**Body:**
```json
{
  "full_name": "string (min 2, max 100)",
  "email": "email válido",
  "password": "string (min 6 caracteres)"
}
```

**Respuesta exitosa (201):**
```json
{ "message": "Integrante creado correctamente", "data": { ... } }
```

**Errores:**
- `400` — datos inválidos
- `409` — ya existe usuario con ese email
- `500` — error en Auth o en la inserción en DB

---

### `GET /api/activity-logs/members/:id`

Obtiene un integrante por ID.

**Guard:** ninguno explícito — usa service client.

**Errores:**
- `404` — integrante no encontrado

---

### `PATCH /api/activity-logs/members/:id`

Actualiza `full_name`, `email` y/o `active` del integrante.

**Guard:** ninguno explícito — usa service client.

**Body:**
```json
{
  "full_name": "string (min 2, max 100)",
  "email": "email válido",
  "active": true
}
```

**Errores:**
- `400` — datos inválidos
- `409` — ya existe otro usuario con ese email

---

### `DELETE /api/activity-logs/members/:id`

Soft delete: marca `active = false`. No elimina el usuario de Auth ni de la tabla.

**Respuesta exitosa (200):**
```json
{ "message": "Integrante desactivado correctamente", "data": { ... } }
```

---

### `POST /api/activity-logs/members/:id/assign`

Asigna o desasigna clientes a un integrante.

**Guard:** sin guard explícito (RLS aplica).

**Body:**
```json
{
  "client_ids": ["uuid", "uuid"],
  "action": "assign | unassign"
}
```

**Respuesta exitosa (200):**
```json
{ "message": "Clientes asignados correctamente" }
```

**Errores:**
- `400` — datos inválidos
- `404` — integrante no encontrado o no tiene `role = member`
- `500` — error en Supabase

---

### `POST /api/members/create`

> ⚠️ **Posible duplicado — confirmar cuál está activo en producción.** Misma funcionalidad que `POST /api/activity-logs/members` pero sin validación Zod ni chequeo de duplicados. Endpoint legacy, candidato a deprecar.

Endpoint legacy de alta rápida de integrantes. Usa service client directamente.

**Body:**
```json
{ "full_name": "string", "email": "string", "password": "string" }
```

**Respuesta exitosa (200):**
```json
{ "success": true }
```

---

## Correcciones

### `POST /api/edit-requests`

El integrante solicita una corrección sobre una actividad que ya publicó. Crea una `edit_request` en estado `pending` y notifica al admin por email.

**Guard:** sesión requerida. La actividad debe pertenecer al usuario autenticado.

**Body:**
```json
{
  "activity_log_id": "uuid",
  "field_name": "hours | pieces_count | task_type_id | category_id | log_date | status | notes",
  "new_value": "string",
  "reason": "string (max 500) | null"
}
```

**Respuesta exitosa (201):**
```json
{ "message": "Solicitud de corrección creada correctamente", "data": { ... } }
```

**Errores:**
- `400` — datos inválidos
- `401` — no autenticado
- `404` — actividad no encontrada o no pertenece al usuario
- `500` — error en Supabase

---

### `GET /api/edit-requests`

Lista todas las solicitudes de corrección con estado `pending`, con las relaciones de actividad y usuario que la pidió.

**Guard:** `requireAdmin()`

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "field_name": "hours",
      "old_value": "2",
      "new_value": "3",
      "reason": "...",
      "activity_logs": { ... },
      "users": { "full_name": "...", "email": "..." }
    }
  ]
}
```

---

### `POST /api/edit-requests/:id/approve`

Admin aprueba una solicitud pendiente. Aplica el cambio en el `activity_log` correspondiente, actualiza la solicitud a `approved` y notifica al integrante por email.

**Guard:** `requireAdmin()`

> El envío de email es no-bloqueante: si falla, la aprobación se completa igual.

**Respuesta exitosa (200):**
```json
{ "message": "Solicitud aprobada correctamente", "data": { ... } }
```

**Errores:**
- `401/403` — no es admin
- `404` — solicitud no encontrada o no está en estado `pending`
- `500` — error al aplicar el cambio o al actualizar la solicitud

---

### `POST /api/edit-requests/:id/reject`

Admin rechaza una solicitud pendiente. No modifica el `activity_log`. Notifica al integrante por email.

**Guard:** `requireAdmin()`

**Respuesta exitosa (200):**
```json
{ "message": "Solicitud rechazada correctamente", "data": { ... } }
```

**Errores:** igual que approve.

---

## Configuración

### `GET /api/task-types`

Lista todos los tipos de tarea (activos e inactivos).

**Guard:** `requireAdmin()`

**Respuesta exitosa (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Diseño",
      "counts_as_piece": false,
      "allowed_roles": ["admin", "member"],
      "active": true
    }
  ]
}
```

---

### `POST /api/task-types`

Crea un tipo de tarea. Valida nombre único (case insensitive).

**Guard:** `requireAdmin()`

**Body:**
```json
{
  "name": "string (min 2, max 100)",
  "counts_as_piece": false,
  "allowed_roles": ["admin", "member", "client"],
  "active": true
}
```

---

### `GET /api/task-types/:id`

Devuelve el tipo de tarea con sus subtareas activas ordenadas por `display_order`.

**Guard:** `requireAdmin()`

---

### `PATCH /api/task-types/:id`

Actualiza nombre, `counts_as_piece`, `allowed_roles` y/o `active`.

**Guard:** `requireAdmin()`

---

### `DELETE /api/task-types/:id`

Soft delete (`active = false`). Bloqueado si el tipo tiene actividades registradas.

**Guard:** `requireAdmin()`

**Errores:**
- `409` — tiene actividades registradas, no se puede desactivar

---

### `GET /api/task-subtypes`

Lista subtareas. Acepta `?task_type_id=uuid` para filtrar por tipo.

**Guard:** `requireAdmin()`

---

### `POST /api/task-subtypes`

Crea una subtarea asociada a un tipo de tarea existente.

**Guard:** `requireAdmin()`

**Body:**
```json
{
  "task_type_id": "uuid",
  "name": "string (min 2, max 100)",
  "active": true,
  "display_order": 0
}
```

---

### `PATCH /api/task-subtypes/:id`

Actualiza `name`, `active` y/o `display_order`.

**Guard:** `requireAdmin()`

---

### `DELETE /api/task-subtypes/:id`

Soft delete (`active = false`).

**Guard:** `requireAdmin()`

---

### `GET /api/piece-categories`

Lista todas las categorías de piezas.

**Guard:** `requireAdmin()`

---

### `POST /api/piece-categories`

Crea una categoría. Valida nombre único (case insensitive).

**Guard:** `requireAdmin()`

**Body:**
```json
{
  "name": "string (min 2, max 100)",
  "active": true
}
```

---

### `PATCH /api/piece-categories/:id`

Actualiza `name` y/o `active`.

**Guard:** `requireAdmin()`

**Errores:**
- `409` — ya existe otra categoría con ese nombre

---

### `DELETE /api/piece-categories/:id`

Soft delete (`active = false`). Bloqueado si la categoría está en uso en paquetes activos.

**Guard:** `requireAdmin()`

**Errores:**
- `409` — la categoría está en uso en paquetes activos

---

## Recordatorios

### `POST /api/reminders/send`

Endpoint para cron de Vercel. Envía un recordatorio por WhatsApp a todos los usuarios activos que no hayan registrado actividad en el día.

**Autenticación:** header `Authorization: Bearer <CRON_SECRET>` (no usa Supabase Auth).

**Respuesta exitosa (200):**
```json
{
  "message": "Recordatorios procesados",
  "sent": 5,
  "errors": 0,
  "skipped": 3
}
```

**Errores:**
- `401` — header de autorización ausente o incorrecto
- `500` — error al consultar usuarios o actividades del día
