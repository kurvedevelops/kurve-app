import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

  // Obtener query params de la URL
  const { searchParams } = new URL(request.url);

  // Filtros opcionales
  const status = searchParams.get("status");

  const clientId = searchParams.get("client_id");

  const date = searchParams.get("date");

  // Cursor para paginación
  const cursor = searchParams.get("cursor");

  // Query base
  let query = supabase
    .from("activity_logs")
    .select(
      `
      *,
      clients(*),
      task_types(*),
      piece_categories(*)
    `
    )
    .eq("user_id", user.id)
    .eq("is_draft", false)
    .order("log_date", { ascending: false })
    .limit(20);

  // Filtrar por estado
  if (status) {
    query = query.eq(
      "status",
      status as "in_progress" | "delivered" | "published"
    );
  }

  // Filtrar por cliente
  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  // Filtrar por fecha
  if (date) {
    query = query.eq("log_date", date);
  }

  // Cursor pagination
  if (cursor) {
    query = query.lt("log_date", cursor);
  }

  // Ejecutar query
  const { data: activityLogs, error } = await query;

  // Manejo de errores
  if (error) {
    return NextResponse.json(
      {
        error: "Error al obtener actividades",
      },
      { status: 500 }
    );
  }

  // Obtener siguiente cursor
  const nextCursor =
    activityLogs.length > 0
      ? activityLogs[activityLogs.length - 1].log_date
      : null;

  // Respuesta exitosa
  return NextResponse.json(
    {
      data: activityLogs,
      nextCursor,
    },
    { status: 200 }
  );
}
