import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resend } from "@/lib/resend";

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

  // Buscar usuario que pidió la corrección para enviar email
  const { data: requestedByUser } = await supabase
    .from("users")
    .select("id, email, full_name")
    .eq("id", editRequest.requested_by)
    .single();

  // Intentar enviar email al member
  // Si falla NO rompe el rechazo
  try {
    if (requestedByUser?.email) {
      await resend.emails.send({
        from: "Kurve <onboarding@resend.dev>",

        to: [requestedByUser.email],

        subject: "Tu solicitud de corrección fue rechazada",

        html: `
          <h2>Solicitud rechazada</h2>

          <p>Hola ${requestedByUser.full_name ?? ""},</p>

          <p>Tu solicitud de corrección fue rechazada.</p>

          <p><strong>Campo:</strong> ${editRequest.field_name}</p>

          <p><strong>Valor anterior:</strong> ${editRequest.old_value}</p>

          <p><strong>Valor solicitado:</strong> ${editRequest.new_value}</p>
        `,
      });

      // Guardar notificación enviada
      await supabase.from("notifications").insert({
        user_id: requestedByUser.id,
        channel: "email",
        type: "edit_request_rejected",
        payload: {
          edit_request_id: editRequest.id,
          activity_log_id: editRequest.activity_log_id,
        },
        sent_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error enviando email de rechazo:", error);
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
