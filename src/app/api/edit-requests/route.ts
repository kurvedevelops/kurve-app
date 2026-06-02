import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema para crear solicitud de corrección
const createEditRequestSchema = z.object({
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

  // Buscar actividad original
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
  const supabase = await createClient();

  // Obtener solicitudes pendientes con relaciones
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
