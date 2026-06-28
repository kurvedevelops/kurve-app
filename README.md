# Kurve — Sistema de gestión para agencias de marketing

Kurve es una plataforma web para agencias de marketing que necesitan registrar y auditar el tiempo dedicado a cada cliente. Los integrantes del equipo cargan sus actividades diarias (horas trabajadas, tipo de tarea, piezas producidas), y el sistema muestra en tiempo real cuánto del paquete contratado ya fue consumido.

El cliente tiene acceso a su propio panel con un semáforo visual (verde / amarillo / rojo) que refleja el porcentaje de horas consumidas sobre el total del paquete. El admin gestiona usuarios, clientes, paquetes y puede aprobar o rechazar solicitudes de corrección que los integrantes envían cuando cometen un error en un registro ya publicado.

La aplicación está en producción en [app.kurve.ar](https://app.kurve.ar) (CNAME apuntando a Vercel). Los emails transaccionales se envían desde el dominio `notificaciones.kurve.ar` verificado en Resend.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Base de datos | Supabase (PostgreSQL 14.5) |
| Autenticación | Supabase Auth (sesiones por cookie via `@supabase/ssr`) |
| ORM / cliente DB | `@supabase/supabase-js` v2 |
| Emails | Resend v6 |
| WhatsApp (recordatorios) | Twilio (REST API, sin SDK) |
| UI | Tailwind CSS v4, shadcn/ui, Radix UI |
| Tablas | TanStack Table v8 |
| Gráficos | Recharts v3 |
| PDF | jsPDF + jspdf-autotable |
| Formularios | React Hook Form + Zod |
| Notificaciones toast | Sonner |
| Deploy | Vercel |

---

## Requisitos previos

- **Node.js** 20.x o superior (`node -v` para verificar)
- Cuenta en [Supabase](https://supabase.com) con un proyecto creado
- Cuenta en [Resend](https://resend.com) con un dominio verificado
- Cuenta en [Twilio](https://www.twilio.com) con un número de WhatsApp Business habilitado (solo necesario para el cron de recordatorios)
- Cuenta en [Vercel](https://vercel.com) para el deploy

---

## Setup desde cero

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd kurve-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Completar todos los valores en `.env.local` (ver tabla de variables más abajo).

### 4. Aplicar las migrations en Supabase

Las migrations están en `supabase/migrations/`. Ejecutarlas en orden desde el SQL Editor de Supabase Dashboard o con la CLI de Supabase:

```bash
# Con Supabase CLI (requiere tener supabase instalado y vinculado al proyecto)
npx supabase db push

# O manualmente: copiar cada archivo .sql en orden de nombre
# y ejecutarlo en Supabase Dashboard → SQL Editor
```

El orden correcto es:
1. `20260512000003_consumption_trigger.sql` — tablas de consumo, trigger, vistas
2. `20260609000004_add_phone_to_users.sql` — columna phone en users
3. `20260610000008_fix_consumption_hours_index.sql` — índice de rendimiento
4. `20260610000009_add_block_on_limit_to_packages.sql` — campo block_on_limit en packages
5. `20260618000009_fix_v_client_consumption_view.sql` — fix de la vista de consumo
6. `20260623000010_add_activity_logs_index.sql` — índice de rendimiento
7. `20260623000011_add_rls_policies.sql` — todas las políticas RLS
8. `20260623000012_fix_views_security_invoker.sql` — vistas con SECURITY INVOKER

### 5. (Opcional) Cargar datos iniciales

```bash
# Ejecutar en Supabase Dashboard → SQL Editor
# Copiar el contenido de supabase/seed.sql
```

### 6. Levantar el servidor de desarrollo

```bash
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

| Variable | Descripción | Dónde se obtiene | Pública/Secreta |
|----------|-------------|-----------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Dashboard → Settings → API → Project URL | Pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima del proyecto | Dashboard → Settings → API → Project API keys → anon | Pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave con privilegios de servicio (bypasea RLS) | Dashboard → Settings → API → Project API keys → service_role | **Secreta** |
| `RESEND_API_KEY` | API key de Resend para envío de emails | Resend Dashboard → API Keys → Create API Key | **Secreta** |
| `RESEND_FROM_EMAIL` | Dirección remitente de los emails | Dominio verificado en Resend (ej: `noreply@notificaciones.kurve.ar`) | Pública |
| `CRON_SECRET` | Token secreto para proteger el endpoint `/api/reminders/send` | Generado manualmente (string aleatorio seguro) | **Secreta** |
| `TWILIO_ACCOUNT_SID` | Account SID de Twilio | Twilio Console → Account Info | **Secreta** |
| `TWILIO_AUTH_TOKEN` | Auth Token de Twilio | Twilio Console → Account Info | **Secreta** |
| `TWILIO_WHATSAPP_FROM` | Número de WhatsApp de Twilio (ej: `+14155238886`) | Twilio Console → Messaging → Senders | **Secreta** |
| `ADMIN_EMAIL` | Email del admin al que se notifican solicitudes de corrección | Configurado manualmente | Pública |

> **Importante:** `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET` y las variables de Twilio nunca deben exponerse al browser ni commitearse al repositorio.

---

## Estructura de carpetas

```
kurve-app/
├── src/
│   ├── app/
│   │   ├── api/                    # API Routes (Next.js Route Handlers)
│   │   │   ├── activity-logs/      # Registro de actividades
│   │   │   │   ├── route.ts        # GET (planilla admin) / POST (publicar actividad)
│   │   │   │   ├── draft/          # GET / POST borradores
│   │   │   │   ├── me/             # GET actividades del usuario autenticado
│   │   │   │   ├── clients/        # CRUD de clientes
│   │   │   │   ├── members/        # CRUD de integrantes + asignaciones
│   │   │   │   └── packages/       # CRUD de paquetes
│   │   │   ├── clients/
│   │   │   │   └── [id]/package-status/  # Estado del paquete activo
│   │   │   ├── edit-requests/      # Solicitudes de corrección
│   │   │   ├── members/create/     # Alta rápida de integrantes (legacy)
│   │   │   ├── piece-categories/   # CRUD de categorías de piezas
│   │   │   ├── reminders/send/     # Endpoint de cron para recordatorios WhatsApp
│   │   │   ├── task-subtypes/      # CRUD de subtareas
│   │   │   └── task-types/         # CRUD de tipos de tarea
│   │   └── (resto de páginas Next.js)
│   ├── components/                 # Componentes React reutilizables
│   └── lib/
│       ├── supabase/
│       │   ├── server.ts           # Cliente de Supabase para servidor (SSR con cookies)
│       │   ├── client.ts           # Cliente de Supabase para browser
│       │   ├── admin.ts            # Cliente con SUPABASE_SERVICE_ROLE_KEY
│       │   ├── service.ts          # Alias de admin con persistSession=false
│       │   ├── guard.ts            # Helpers requireAdmin() y requireRole()
│       │   ├── database.types.ts   # Tipos generados desde el schema de Supabase
│       │   └── queries.ts          # Queries reutilizables
│       ├── resend.ts               # Cliente lazy de Resend
│       ├── whatsapp.ts             # Función sendWhatsAppMessage() vía Twilio REST
│       ├── rate-limit.ts           # Rate limiter en memoria (30 req/min por usuario)
│       └── utils.ts                # Utilidades generales
├── supabase/
│   └── migrations/                 # Migrations SQL en orden cronológico
├── .env.example                    # Plantilla de variables de entorno
└── package.json
```

---

## Cómo crear un usuario admin

Los usuarios admin **no se crean desde la aplicación** — se crean directamente en Supabase:

1. Ir a Supabase Dashboard → Authentication → Users → **Add user**
2. Completar email y contraseña. Marcar "Auto Confirm User".
3. Copiar el UUID del usuario recién creado.
4. Ir a SQL Editor y ejecutar:

```sql
INSERT INTO public.users (id, email, full_name, role, active)
VALUES (
  '<UUID-copiado-del-paso-3>',
  'admin@ejemplo.com',
  'Nombre Admin',
  'admin',
  true
);
```

> Si el usuario ya existe en `public.users` con rol `member` y hay que elevarlo a `admin`:
> ```sql
> UPDATE public.users SET role = 'admin' WHERE id = '<UUID>';
> ```

---

## Deploy en Vercel

1. Conectar el repositorio en [vercel.com/new](https://vercel.com/new).
2. Vercel detecta Next.js automáticamente — no requiere configuración de framework.
3. Configurar todas las variables de entorno en Vercel Dashboard → Settings → Environment Variables (ver tabla arriba).
4. En Production, agregar también `CRON_SECRET`, `TWILIO_*` y `ADMIN_EMAIL`.
5. Para el cron de recordatorios diarios, configurar en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/reminders/send",
      "schedule": "0 17 * * 1-5"
    }
  ]
}
```

El endpoint `/api/reminders/send` valida el header `Authorization: Bearer <CRON_SECRET>` para rechazar llamadas externas.

---

## Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Levanta el servidor con hot reload en localhost:3000 |
| Build | `npm run build` | Compila la aplicación para producción |
| Start | `npm run start` | Inicia el servidor compilado (requiere `build` previo) |
| Lint | `npm run lint` | Corre ESLint sobre el proyecto |

---

## Dudas / a confirmar

1. **Variables de Twilio ausentes del `.env.example`**: el código de `src/lib/whatsapp.ts` usa `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` y `TWILIO_WHATSAPP_FROM`, pero estas variables no figuran en `.env.example`. Falta agregarlas.

2. **`ADMIN_EMAIL` no está en `.env.example`**: `src/app/api/edit-requests/route.ts` usa `process.env.ADMIN_EMAIL` con fallback a `kurvedevelops@gmail.com`. Debería documentarse en el `.env.example`.

3. **`CRON_SECRET` no está en `.env.example`**: el endpoint `/api/reminders/send` lo requiere para autenticar el cron de Vercel, pero no figura en el `.env.example`.

4. **Rutas de clientes en path incorrecto**: los route handlers de clientes (`/api/clients`) están dentro de `src/app/api/activity-logs/clients/`, lo que hace que la URL real sea `/api/activity-logs/clients`. Confirmar si esto es intencional o es un error de estructura.

5. **Idem para members y packages**: los handlers de `/api/members` y `/api/packages` también están bajo `src/app/api/activity-logs/`. La URL efectiva del browser sería `/api/activity-logs/members` y `/api/activity-logs/packages`. Confirmar si la estructura de carpetas refleja las URLs reales de producción.

6. **`src/app/api/members/create/route.ts` es un duplicado**: existe `/api/activity-logs/members/route.ts` (POST) y también `/api/members/create/route.ts` con la misma funcionalidad de crear un miembro. No queda claro cuál se usa en producción.

7. **Tabla `consumption_summary` tiene columna `task_type_id`** en el tipo TypeScript pero la migration 003 solo crea la tabla con `category_id`. La columna `task_type_id` aparece en el tipo generado y en la vista `v_consumption_by_task_type`, pero no se ve en el SQL original de creación de la tabla. Puede haberse agregado manualmente en el dashboard sin migration correspondiente.
