import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/guard";
import { resend, FROM_EMAIL } from "@/lib/resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "kurvedevelops@gmail.com";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_STATUSES = ["in_progress", "delivered", "published"] as const;

// Schema para crear solicitud de corrección
const createEditRequestSchema = z
  .object({
    activity_log_id: z.string().uuid(),

    field_name: z.enum([
      "hours",
      "pieces_count",
      "task_type_id",
      "category_id",
      "log_date",
      "status",
      "notes",
    ]),

    new_value: z.string(),

    reason: z.string().max(500).nullable().optional(),
  })
  .superRefine(({ field_name, new_value }, ctx) => {
    const fail = (message: string) =>
      ctx.addIssue({ code: "custom", path: ["new_value"], message });

    switch (field_name) {
      case "hours": {
        const n = Number(new_value);
        if (isNaN(n) || n <= 0)
          fail("Debe ser un número positivo (ej. 1.5)");
        break;
      }
      case "pieces_count": {
        const n = Number(new_value);
        if (!Number.isInteger(n) || n < 0)
          fail("Debe ser un entero no negativo (ej. 3)");
        break;
      }
      case "log_date": {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(new_value) || isNaN(Date.parse(new_value)))
          fail("Debe ser una fecha válida en formato YYYY-MM-DD");
        break;
      }
      case "status": {
        if (!(VALID_STATUSES as readonly string[]).includes(new_value))
          fail(`Estado inválido. Valores permitidos: ${VALID_STATUSES.join(", ")}`);
        break;
      }
      case "task_type_id":
      case "category_id": {
        if (!UUID_RE.test(new_value))
          fail("Debe ser un UUID válido");
        break;
      }
      // "notes": cualquier string es válido
    }
  });

// POST /api/edit-requests
// Member crea solicitud de corrección
export async function POST(request: Request) {
  const supabase = await createClient();

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Validar sesión
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Obtener body
  const body = await request.json();

  // Validar con Zod
  const parsed = createEditRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Buscar actividad original (debe pertenecer al usuario)
  const { data: activityLog, error: activityError } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("id", parsed.data.activity_log_id)
    .eq("user_id", user.id)
    .single();

  if (activityError || !activityLog) {
    return NextResponse.json(
      {
        error: "Actividad no encontrada o no pertenece al usuario",
      },
      { status: 404 }
    );
  }

  // Obtener valor viejo del campo solicitado
  const oldValue = activityLog[parsed.data.field_name];

  // Crear solicitud de corrección
  const { data: editRequest, error: insertError } = await supabase
    .from("edit_requests")
    .insert({
      activity_log_id: parsed.data.activity_log_id,
      field_name: parsed.data.field_name,
      old_value: String(oldValue ?? ""),
      new_value: parsed.data.new_value,
      reason: parsed.data.reason ?? null,
      requested_by: user.id,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      {
        error: "Error al crear solicitud de corrección",
      },
      { status: 500 }
    );
  }

  // Intentar notificar al admin por email
  // Si falla NO rompe el endpoint
  try {
    const adminClient = createAdminClient();

    await resend.emails.send({
      from: `Kurve <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: "Nueva solicitud de corrección",
      html: `
        <h2>Nueva solicitud de corrección</h2>
        <p><strong>Usuario:</strong> ${user.email}</p>
        <p><strong>Campo:</strong> ${parsed.data.field_name}</p>
        <p><strong>Valor anterior:</strong> ${oldValue}</p>
        <p><strong>Nuevo valor:</strong> ${parsed.data.new_value}</p>
        <p><strong>Motivo:</strong> ${parsed.data.reason ?? "-"}</p>
      `,
    });

    // Buscar el user_id del admin para guardar la notificación
    const { data: adminUser } = await adminClient
      .from("users")
      .select("id")
      .eq("email", ADMIN_EMAIL)
      .maybeSingle();

    if (adminUser) {
      await adminClient.from("notifications").insert({
        user_id: adminUser.id,
        channel: "email" as const,
        type: "edit_request_created",
        payload: {
          edit_request_id: editRequest.id,
          activity_log_id: parsed.data.activity_log_id,
          requested_by: user.id,
        },
        sent_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error enviando email al admin:", error);
  }

  return NextResponse.json(
    {
      message: "Solicitud de corrección creada correctamente",
      data: editRequest,
    },
    { status: 201 }
  );
}

// GET /api/edit-requests
// Admin lista solicitudes pendientes
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const { data: editRequests, error } = await supabase
    .from("edit_requests")
    .select(
      `
      *,
      activity_logs(*),
      users!edit_requests_requested_by_fkey(*)
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      {
        error: "Error al obtener solicitudes de corrección",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      data: editRequests,
    },
    { status: 200 }
  );
}
