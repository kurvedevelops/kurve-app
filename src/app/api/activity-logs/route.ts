import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema de validación para crear un registro de actividad
const createActivityLogSchema = z.object({
  client_id: z.string().uuid(),
  task_type_id: z.string().uuid(),

  // La categoría puede venir null o no enviarse
  category_id: z.string().uuid().nullable().optional(),

  log_date: z.string(),

  // Las horas deben ser mayores a 0
  hours: z.number().positive(),

  // La cantidad de piezas no puede ser negativa
  pieces_count: z.number().int().min(0),

  status: z.enum(["in_progress", "delivered", "published"]),

  // Notas opcionales
  notes: z.string().max(500).nullable().optional(),

  // Draft opcional
  is_draft: z.boolean().optional(),
});

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

  // Obtener body del request
  const body = await request.json();

  // Validar datos usando Zod
  const parsed = createActivityLogSchema.safeParse(body);

  // Si falla la validación devolver errores claros
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Validar que el cliente esté asignado al usuario logueado
  const { data: assignedClient, error: assignedClientError } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .eq("client_id", parsed.data.client_id)
    .single();

  // Si el cliente no pertenece al usuario devolver error
  if (assignedClientError || !assignedClient) {
    return NextResponse.json(
      { error: "El cliente no está asignado al usuario" },
      { status: 403 }
    );
  }

  // Validar coherencia entre piezas y categoría
  if (parsed.data.pieces_count > 0 && !parsed.data.category_id) {
    return NextResponse.json(
      {
        error: "Si hay piezas cargadas, debe enviarse una categoría",
      },
      { status: 400 }
    );
  }

  // Validar que la fecha no supere 7 días hacia atrás
  const logDate = new Date(parsed.data.log_date);

  const sevenDaysAgo = new Date();

  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  if (logDate < sevenDaysAgo) {
    return NextResponse.json(
      {
        error: "No se pueden cargar actividades de más de 7 días",
      },
      { status: 400 }
    );
  }

  // Crear registro de actividad en la base de datos
  const { data: activityLog, error: insertError } = await supabase
    .from("activity_logs")
    .insert({
      user_id: user.id,
      client_id: parsed.data.client_id,
      task_type_id: parsed.data.task_type_id,
      category_id: parsed.data.category_id ?? null,
      log_date: parsed.data.log_date,
      hours: parsed.data.hours,
      pieces_count: parsed.data.pieces_count,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
      is_draft: parsed.data.is_draft ?? false,
    })
    .select()
    .single();

  // Manejo de error de inserción
  if (insertError) {
    return NextResponse.json(
      {
        error: "Error al crear el registro de actividad",
      },
      { status: 500 }
    );
  }

  // Devolver actividad creada al frontend
  return NextResponse.json(
    {
      message: "Actividad creada correctamente",
      data: activityLog,
    },
    { status: 201 }
  );
}
