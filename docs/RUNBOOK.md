# Runbook de operaciones — Kurve

Manual de referencia para tareas operativas habituales. Todos los comandos SQL se ejecutan desde **Supabase Dashboard → SQL Editor** salvo que se indique lo contrario.

---

## Agregar un nuevo integrante en producción

### Opción A — Via la aplicación (recomendado)

1. Iniciar sesión en [app.kurve.ar](https://app.kurve.ar) con una cuenta admin.
2. Ir a la sección de Integrantes → Nuevo integrante.
3. Completar nombre, email y contraseña temporal.
4. El sistema crea el usuario en Supabase Auth y en `public.users` con `role = member`.
5. Asignar los clientes al integrante desde la misma sección.

### Opción B — Directo en Supabase (para el primer admin o casos de emergencia)

1. Ir a Supabase Dashboard → Authentication → Users → **Add user**.
2. Completar email y contraseña. Activar "Auto Confirm User".
3. Copiar el UUID del usuario.
4. Ejecutar en SQL Editor:

```sql
INSERT INTO public.users (id, email, full_name, role, active)
VALUES (
  '<UUID-del-paso-3>',
  'integrante@ejemplo.com',
  'Nombre Apellido',
  'member',  -- o 'admin' o 'client' según el rol
  true
);
```

5. Para asignar clientes al integrante:

```sql
INSERT INTO public.client_users (user_id, client_id)
VALUES
  ('<UUID-del-usuario>', '<UUID-del-cliente-1>'),
  ('<UUID-del-usuario>', '<UUID-del-cliente-2>');
```

---

## Agregar un usuario cliente (acceso al panel de cliente)

1. Crear el usuario en Auth igual que el paso anterior.
2. Insertar en `public.users` con `role = 'client'`.
3. Asociar al cliente en `client_users`:

```sql
INSERT INTO public.client_users (user_id, client_id)
VALUES ('<UUID-usuario>', '<UUID-cliente>');
```

---

## Backup de la base de datos

### Opción A — Backups automáticos de Supabase

Supabase realiza backups diarios automáticos en todos los planes. Para acceder:

1. Supabase Dashboard → Settings → Backups.
2. Seleccionar el backup deseado y hacer click en **Restore** o **Download**.

En el plan gratuito los backups se conservan 7 días. En planes Pro se conservan hasta 30 días con PITR (Point-in-Time Recovery).

### Opción B — Export manual con pg_dump

```bash
pg_dump "postgresql://postgres:<SERVICE-ROLE-KEY>@db.hjkuvupzqenotesrmlae.supabase.co:5432/postgres" \
  -Fc \
  -f backup-$(date +%Y%m%d).dump
```

La cadena de conexión se obtiene de: Supabase Dashboard → Settings → Database → Connection string → URI.

### Opción C — Export de tabla específica desde Dashboard

Supabase Dashboard → Table Editor → seleccionar tabla → Export CSV.

---

## Regenerar los tipos TypeScript después de un cambio de schema

Cada vez que se agrega una migration que modifica el schema (nuevas tablas, columnas, enums), hay que regenerar `src/lib/supabase/database.types.ts`:

```bash
npx supabase gen types typescript \
  --project-id hjkuvupzqenotesrmlae \
  --schema public \
  > src/lib/supabase/database.types.ts
```

> Requiere tener la CLI de Supabase instalada (`npm install -g supabase`) y estar autenticado (`supabase login`).

Después de regenerar, verificar que no haya errores de TypeScript:

```bash
npm run build
```

---

## Qué hacer si el consumo queda inconsistente

Si los números de consumo en el panel del cliente no coinciden con las actividades cargadas (puede pasar por ejemplo si se ejecutó SQL directo en la tabla `activity_logs` sin pasar por el trigger), se puede forzar un recálculo manual desde el SQL Editor de Supabase.

### Recalcular un cliente específico

```sql
SELECT public.recalculate_client_consumption('<UUID-del-cliente>');
```

### Recalcular todos los clientes con paquete activo

```sql
SELECT public.recalculate_client_consumption(id)
FROM public.clients
WHERE status = 'active';
```

### Verificar el resultado

```sql
SELECT
  c.name  AS cliente,
  v.package_name,
  v.total_hours,
  v.consumed_hours,
  v.hours_percent,
  v.traffic_light
FROM public.v_client_consumption v
JOIN public.clients c ON c.id = v.client_id
ORDER BY v.hours_percent DESC;
```

---

## Variables de entorno en producción

Las variables de entorno de producción se configuran en Vercel:

1. Ir a [vercel.com](https://vercel.com) → el proyecto kurve-app → **Settings → Environment Variables**.
2. Agregar cada variable con su valor y seleccionar los entornos donde aplica (Production, Preview, Development).
3. Las variables marcadas como **secretas** (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`, `TWILIO_*`) deben configurarse solo para Production.
4. Después de agregar o modificar variables, hacer un **Redeploy** del proyecto para que los cambios tomen efecto.

**Variables requeridas en producción:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
CRON_SECRET
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
ADMIN_EMAIL
```

---

## Cómo agregar una nueva migration

1. Crear el archivo SQL en `supabase/migrations/` con el nombre en formato `YYYYMMDDHHMMSS_descripcion.sql`. Usar el timestamp actual para garantizar el orden correcto.

Ejemplo:
```bash
# En la raíz del proyecto
touch supabase/migrations/20260701000001_add_notes_to_clients.sql
```

2. Escribir el SQL de la migration. Usar `IF NOT EXISTS` / `IF EXISTS` para que sea idempotente cuando sea posible.

3. Aplicar en producción ejecutando el contenido del archivo en Supabase Dashboard → SQL Editor.

4. Si se modifica el schema (nuevas columnas, tablas o enums), regenerar los tipos TypeScript (ver sección anterior).

5. Commitear el archivo de migration junto con los tipos regenerados:

```bash
git add supabase/migrations/20260701000001_add_notes_to_clients.sql
git add src/lib/supabase/database.types.ts
git commit -m "feat: agregar campo notes a clients"
```

---

## Cómo activar/desactivar el bloqueo de horas en un paquete

Para que el sistema bloquee la carga de actividades cuando un paquete se queda sin horas:

```sql
UPDATE public.packages
SET block_on_limit = true
WHERE id = '<UUID-del-paquete>';
```

Para desactivar el bloqueo (solo warning, permite seguir cargando):

```sql
UPDATE public.packages
SET block_on_limit = false
WHERE id = '<UUID-del-paquete>';
```

---

## Cómo cerrar un paquete manualmente

```sql
UPDATE public.packages
SET
  status = 'ended',
  end_date = CURRENT_DATE
WHERE id = '<UUID-del-paquete>';
```

---

## Cómo forzar la creación de un paquete si el cliente ya tiene uno activo

La API valida que un cliente solo tenga un paquete activo. Para forzarlo desde SQL (por ejemplo al hacer una migración de datos):

```sql
-- 1. Cerrar el paquete anterior
UPDATE public.packages
SET status = 'ended', end_date = CURRENT_DATE
WHERE client_id = '<UUID-del-cliente>' AND status = 'active';

-- 2. Crear el nuevo paquete
INSERT INTO public.packages (client_id, name, status, start_date, total_hours)
VALUES ('<UUID-del-cliente>', 'Nuevo paquete', 'active', CURRENT_DATE, 80);
```

---

## Monitoreo de errores

Los errores del servidor se loguean en Vercel Dashboard → el proyecto → **Deployments → seleccionar deploy → Logs**. Para errores en tiempo real usar **Functions → Logs**.

Las notificaciones fallidas (email o WhatsApp) se loguean con `console.error` pero no rompen el endpoint — revisar los logs de Vercel para detectarlos.
