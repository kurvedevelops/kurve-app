import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/edit-requests/:id/reject
// Admin rechaza una solicitud de corrección
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  // Obtener ID de la solicitud
  const { id } = await params;

  // Buscar solicitud pendiente
  const { data: editRequest, error: requestError } = await supabase
    .from("edit_requests")
    .select("*")
    .eq("id", id)
    .eq("status", "pending")
    .single();

  // Validar existencia
  if (requestError || !editRequest) {
    return NextResponse.json(
      {
        error: "Solicitud no encontrada o no está pendiente",
      },
      { status: 404 }
    );
  }

  // Marcar solicitud como rechazada
  const { data: rejectedRequest, error: rejectError } = await supabase
    .from("edit_requests")
    .update({
      status: "rejected",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  // Manejar error
  if (rejectError || !rejectedRequest) {
    return NextResponse.json(
      {
        error: "Error al rechazar solicitud",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Solicitud rechazada correctamente",
      data: rejectedRequest,
    },
    { status: 200 }
  );
}
