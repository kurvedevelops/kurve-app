import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/guard";
import { resend, FROM_EMAIL } from "@/lib/resend";

// POST /api/edit-requests/:id/reject
// Admin rechaza una solicitud de corrección
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
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

  // Marcar solicitud como rechazada
  const { data: rejectedRequest, error: rejectError } = await supabase
    .from("edit_requests")
    .update({
      status: "rejected",
      reviewed_by: guard.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (rejectError || !rejectedRequest) {
    return NextResponse.json(
      {
        error: "Error al rechazar solicitud",
      },
      { status: 500 }
    );
  }

  // Buscar usuario que pidió la corrección para notificarle
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
        from: `Kurve <${FROM_EMAIL}>`,
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

      const adminClient = createAdminClient();
      await adminClient.from("notifications").insert({
        user_id: requestedByUser.id,
        channel: "email" as const,
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

  return NextResponse.json(
    {
      message: "Solicitud rechazada correctamente",
      data: rejectedRequest,
    },
    { status: 200 }
  );
}
