import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/edit-requests/:id/approve
// Admin aprueba una solicitud de corrección
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
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

  if (requestError || !editRequest) {
    return NextResponse.json(
      {
        error: "Solicitud no encontrada o no está pendiente",
      },
      { status: 404 }
    );
  }

  // Preparar actualización del activity_log
  const updatePayload = {
    [editRequest.field_name]: editRequest.new_value,
  };

  // Actualizar activity_log con el cambio aprobado
  // Usamos cast porque field_name es dinámico
  const { error: updateActivityError } = await supabase
    .from("activity_logs")
    .update(updatePayload as never)
    .eq("id", editRequest.activity_log_id);

  if (updateActivityError) {
    return NextResponse.json(
      {
        error: "Error al aplicar corrección en actividad",
      },
      { status: 500 }
    );
  }

  // Marcar solicitud como aprobada
  const { data: approvedRequest, error: approveError } = await supabase
    .from("edit_requests")
    .update({
      status: "approved",
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (approveError || !approvedRequest) {
    return NextResponse.json(
      {
        error: "Error al aprobar solicitud",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Solicitud aprobada correctamente",
      data: approvedRequest,
    },
    { status: 200 }
  );
}
