# Contrato de API — Sistema Kurve

## Objetivo

Este documento define cómo el frontend consume datos desde Supabase, cómo se manejan los roles y qué estructura se utiliza para mantener la aplicación tipada y segura utilizando Next.js + Supabase + TypeScript.

---

## Arquitectura general

El proyecto utiliza:

- Next.js 16
- TypeScript
- Supabase
- PostgreSQL
- Supabase Auth
- RLS (Row Level Security)

La arquitectura funciona de la siguiente manera:

```txt
Frontend (Next.js)
↓
Supabase Client
↓
Supabase Auth + API
↓
PostgreSQL
```

Supabase maneja:

- autenticación
- sesiones
- JWT
- cookies
- acceso a PostgreSQL
- RLS
- API

---

## Roles del sistema

### Admin

Tiene acceso completo al sistema.

Puede:

- ver todos los usuarios
- ver todos los clientes
- gestionar paquetes
- ver registros de actividad
- gestionar solicitudes de edición
- administrar links y notificaciones
- acceder a paneles administrativos

---

### Member

Es un integrante interno del equipo.

Puede:

- ver su perfil
- crear registros de actividad propios
- ver registros asignados
- consultar clientes asignados
- crear solicitudes de edición
- consultar categorías y tipos de tarea

---

### Client

Es un usuario externo asociado a una empresa/cliente.

Puede:

- ver únicamente su cliente asociado
- ver información de su paquete
- consultar links propios
- consultar notificaciones propias
- acceder a dashboard de su empresa

---

## Relación entre usuarios y clientes

El sistema utiliza:

### users

Personas que ingresan al sistema.

Roles:

- admin
- member
- client

---

### clients

Empresas/clientes de la agencia.

Ejemplo:

- Nike
- Adidas

---

### client_users

Tabla intermedia que relaciona usuarios con clientes.

Ejemplo:

```txt
Juan → Nike
```

Esto permite que un usuario con role `client`
solo pueda acceder a información de su empresa.

---

## Tablas principales

- `users`
- `clients`
- `client_users`
- `packages`
- `package_pieces`
- `activity_logs`
- `edit_requests`
- `client_links`
- `notifications`
- `piece_categories`
- `task_types`

---

## Tipos TypeScript

Los tipos fueron generados automáticamente desde Supabase utilizando Supabase CLI.

Comando utilizado:

```bash
npx supabase gen types typescript --project-id hjkuvupzqenotesrmlae --schema public > src/lib/supabase/database.types.ts
```

Archivo generado:

```txt
src/lib/supabase/database.types.ts
```

Estos tipos permiten que TypeScript conozca:

- tablas
- columnas
- enums
- relaciones
- inserts válidos
- updates válidos

Ejemplo:
TypeScript conoce automáticamente los roles válidos:

```txt
admin | member | client
```

---

## Cliente Supabase

### Browser Client

Archivo:

```txt
src/lib/supabase/client.ts
```

Se utiliza para consultas desde Client Components.

Utiliza:

```ts
createBrowserClient();
```

---

### Server Client

Archivo:

```txt
src/lib/supabase/server.ts
```

Se utiliza para:

- Server Components
- Server Actions
- SSR
- manejo de cookies
- autenticación server-side

Utiliza:

```ts
createServerClient();
```

---

## Middleware

Archivo:

```txt
src/lib/supabase/middleware.ts
```

El middleware funciona como un AuthGuard/RolesGuard.

Controla:

- autenticación
- sesión
- permisos por rol
- protección de rutas

Rutas protegidas:

- `/admin`
- `/member`
- `/client`

Funcionamiento:

1. Verifica si existe sesión.
2. Obtiene el usuario autenticado.
3. Consulta el rol en la tabla `users`.
4. Permite o bloquea acceso según rol.

---

## Seguridad

La seguridad se maneja en dos capas.

---

### Middleware

Protege acceso a páginas y rutas.

Ejemplo:

```txt
/admin
```

Solo accesible por usuarios con role `admin`.

---

### RLS

La seguridad principal vive en PostgreSQL mediante policies RLS.

RLS controla:

- qué filas puede leer un usuario
- qué filas puede modificar
- qué datos puede insertar

Ejemplo:

- admin → acceso completo
- member → acceso limitado/asignado
- client → solo información de su empresa

Esto evita accesos no autorizados incluso si alguien intenta hacer consultas manuales desde frontend o herramientas externas.

---

## Helpers de consultas

Archivo:

```txt
src/lib/supabase/queries.ts
```

Centraliza consultas reutilizables a la base de datos.

Funciones iniciales:

- `getTaskTypes()`
- `getPieceCategories()`
- `getClients()`
- `getCurrentUserProfile(userId)`

Objetivo:
evitar repetir queries directamente en componentes.

---

## Variables de entorno

Variables utilizadas:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

### Importante

`SUPABASE_SERVICE_ROLE_KEY`
NO debe utilizarse en frontend.

La única key pública permitida en frontend es:

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Sistema de borrador automático — Activity Logs

Se implementó un sistema de borradores automáticos para evitar pérdida de información mientras el usuario completa el formulario de actividades.

---

### POST `/api/activity-logs/draft`

Guarda o actualiza un borrador pendiente del usuario autenticado.

Funcionamiento:

- si no existe borrador → crea uno nuevo
- si ya existe → actualiza el mismo registro

Los borradores se almacenan en:

```txt
activity_logs
```

utilizando:

```ts
is_draft: true;
```

Por lo tanto:

- NO cuentan como consumo real
- NO representan actividades finales

---

### GET `/api/activity-logs/draft`

Devuelve el último borrador pendiente del usuario autenticado.

Respuesta:

```json
{
  "data": null
}
```

si no existe borrador pendiente.

---

### Publicación final de actividad

Cuando el usuario envía el formulario definitivo mediante:

```txt
POST /api/activity-logs
```

el sistema:

- busca un borrador pendiente
- si existe → actualiza ese mismo registro
- convierte el draft en actividad real mediante:

```ts
is_draft: false;
```

Esto evita duplicados y permite reutilizar el mismo registro generado por el autosave.

---

### Objetivo del sistema

El sistema permite:

- auto-guardado periódico desde frontend
- recuperación automática del formulario
- prevención de pérdida de datos
- reutilización del mismo registro draft
- separación entre drafts y actividades reales
