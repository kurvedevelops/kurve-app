import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema para validar borradores
const draftActivityLogSchema = z.object({
  client_id: z.string().uuid(),

  task_type_id: z.string().uuid(),

  // Categoría opcional
  category_id: z.string().uuid().nullable().optional(),

  // Fecha opcional para permitir auto-guardado incompleto
  log_date: z.string().optional(),

  // Horas opcionales
  hours: z.number().min(0).optional(),

  // Cantidad de piezas opcional
  pieces_count: z.number().int().min(0).optional(),

  // Estado opcional
  status: z.enum(["in_progress", "delivered", "published"]).optional(),

  // Notas opcionales
  notes: z.string().max(500).nullable().optional(),
});

export async function POST(request: Request) {
  // Crear cliente de Supabase
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

  // Validar datos con Zod
  const parsed = draftActivityLogSchema.safeParse(body);

  // Manejar errores de validación
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Validar que el cliente pertenezca al usuario
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

  // Buscar si ya existe un borrador pendiente para este usuario y cliente
  const { data: existingDraft } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("client_id", parsed.data.client_id)
    .eq("is_draft", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Datos que se van a guardar como borrador
  const draftPayload = {
    user_id: user.id,
    client_id: parsed.data.client_id,
    task_type_id: parsed.data.task_type_id,
    category_id: parsed.data.category_id ?? null,
    log_date: parsed.data.log_date ?? new Date().toISOString().split("T")[0],
    hours: parsed.data.hours ?? 0,
    pieces_count: parsed.data.pieces_count ?? 0,
    status: parsed.data.status ?? "in_progress",
    notes: parsed.data.notes ?? null,

    // El borrador no cuenta como consumo
    is_draft: true,

    // Actualizar fecha de modificación
    updated_at: new Date().toISOString(),
  };

  // Si ya existe un borrador, actualizarlo
  if (existingDraft) {
    const { data: updatedDraft, error: updateError } = await supabase
      .from("activity_logs")
      .update(draftPayload)
      .eq("id", existingDraft.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Error al actualizar el borrador" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Borrador actualizado correctamente",
        data: updatedDraft,
      },
      { status: 200 }
    );
  }

  // Si no existe borrador, crear uno nuevo
  const { data: createdDraft, error: insertError } = await supabase
    .from("activity_logs")
    .insert(draftPayload)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Error al guardar el borrador" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Borrador guardado correctamente",
      data: createdDraft,
    },
    { status: 201 }
  );
}
// Obtener borrador pendiente del usuario
export async function GET() {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Validar sesión
  if (!user) {
    return NextResponse.json(
      {
        error: "No autenticado",
      },
      { status: 401 }
    );
  }

  // Buscar último borrador del usuario
  const { data: draft, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_draft", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Manejar error
  if (error) {
    return NextResponse.json(
      {
        error: "Error al obtener borrador",
      },
      { status: 500 }
    );
  }

  // Si no existe borrador devolver null
  if (!draft) {
    return NextResponse.json(
      {
        data: null,
      },
      { status: 200 }
    );
  }

  // Devolver borrador encontrado
  return NextResponse.json(
    {
      data: draft,
    },
    { status: 200 }
  );
}
