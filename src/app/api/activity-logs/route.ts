import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema de validación para crear/publicar una actividad
const createActivityLogSchema = z.object({
  client_id: z.string().uuid(),

  task_type_id: z.string().uuid(),

  // La categoría puede venir null o no enviarse
  category_id: z.string().uuid().nullable().optional(),

  // Fecha obligatoria al publicar
  log_date: z.string(),

  // Las horas deben ser mayores a 0
  hours: z.number().positive(),

  // La cantidad de piezas no puede ser negativa
  pieces_count: z.number().int().min(0),

  // Estados válidos
  status: z.enum(["in_progress", "delivered", "published"]),

  // Notas opcionales
  notes: z.string().max(500).nullable().optional(),

  // Campo opcional
  is_draft: z.boolean().optional(),
});

// GET /api/activity-logs
// Planilla de tiempos para admin con filtros, paginación y exportación CSV
export async function GET(request: Request) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener query params
  const { searchParams } = new URL(request.url);

  const clientId = searchParams.get("client_id");

  const memberId = searchParams.get("member_id");

  const status = searchParams.get("status");

  const fromDate = searchParams.get("from");

  const toDate = searchParams.get("to");

  const page = Number(searchParams.get("page") ?? 1);

  const exportFormat = searchParams.get("export");

  // Paginación de 50 registros por página
  const limit = 50;

  const from = (page - 1) * limit;

  const to = from + limit - 1;

  // Query base con joins
  let query = supabase
    .from("activity_logs")
    .select(
      `
      *,
      users(*),
      clients(*),
      task_types(*),
      piece_categories(*)
    `
    )
    .eq("is_draft", false)
    .order("log_date", { ascending: false });

  // Filtro por cliente
  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  // Filtro por integrante
  if (memberId) {
    query = query.eq("user_id", memberId);
  }

  // Filtro por estado
  if (status) {
    query = query.eq(
      "status",
      status as "in_progress" | "delivered" | "published"
    );
  }

  // Filtro fecha desde
  if (fromDate) {
    query = query.gte("log_date", fromDate);
  }

  // Filtro fecha hasta
  if (toDate) {
    query = query.lte("log_date", toDate);
  }

  // Si no se exporta CSV, aplicar paginación normal
  if (exportFormat !== "csv") {
    query = query.range(from, to);
  }

  // Ejecutar query
  const { data: activityLogs, error } = await query;

  // Manejar error
  if (error) {
    return NextResponse.json(
      {
        error: "Error al obtener planilla de tiempos",
      },
      { status: 500 }
    );
  }

  // Exportación CSV
  if (exportFormat === "csv") {
    const headers = [
      "fecha",
      "cliente",
      "integrante",
      "tipo_tarea",
      "categoria",
      "horas",
      "piezas",
      "estado",
      "notas",
    ];

    const rows = activityLogs.map((log) => [
      log.log_date,
      log.clients?.name ?? "",
      log.users?.full_name ?? "",
      log.task_types?.name ?? "",
      log.piece_categories?.name ?? "",
      log.hours,
      log.pieces_count,
      log.status,
      log.notes ?? "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=activity-logs.csv",
      },
    });
  }

  // Respuesta JSON normal
  return NextResponse.json(
    {
      data: activityLogs,
      pagination: {
        page,
        limit,
        hasMore: activityLogs.length === limit,
      },
    },
    { status: 200 }
  );
}

export async function POST(request: Request) {
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
      {
        error: "El cliente no está asignado al usuario",
      },
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

  // Buscar si existe un borrador pendiente del usuario
  const { data: existingDraft } = await supabase
    .from("activity_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("client_id", parsed.data.client_id)
    .eq("is_draft", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Payload final de la actividad
  const activityPayload = {
    user_id: user.id,
    client_id: parsed.data.client_id,
    task_type_id: parsed.data.task_type_id,
    category_id: parsed.data.category_id ?? null,
    log_date: parsed.data.log_date,
    hours: parsed.data.hours,
    pieces_count: parsed.data.pieces_count,
    status: parsed.data.status,
    notes: parsed.data.notes ?? null,

    // Al publicar deja de ser borrador
    is_draft: false,

    // Actualizar fecha de modificación
    updated_at: new Date().toISOString(),
  };

  // Variables para guardar el resultado final
  let activityLog;

  let activityError;

  let responseStatus: 200 | 201;

  // Si existe un draft pendiente lo convertimos en actividad real
  if (existingDraft) {
    const { data, error } = await supabase
      .from("activity_logs")
      .update(activityPayload)
      .eq("id", existingDraft.id)
      .select()
      .single();

    activityLog = data;

    activityError = error;

    responseStatus = 200;
  } else {
    // Si no existe draft crear actividad nueva
    const { data, error } = await supabase
      .from("activity_logs")
      .insert(activityPayload)
      .select()
      .single();

    activityLog = data;

    activityError = error;

    responseStatus = 201;
  }

  // Manejo de error al guardar/publicar actividad
  if (activityError) {
    return NextResponse.json(
      {
        error: "Error al crear el registro de actividad",
      },
      { status: 500 }
    );
  }

  // Devolver actividad publicada al frontend
  return NextResponse.json(
    {
      message:
        responseStatus === 200
          ? "Borrador publicado correctamente"
          : "Actividad creada correctamente",
      data: activityLog,
    },
    { status: responseStatus }
  );
}
