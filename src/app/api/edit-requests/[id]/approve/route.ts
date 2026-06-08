import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/guard";
import { resend } from "@/lib/resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "noreply@kurve.app";

// POST /api/edit-requests/:id/approve
// Admin aprueba una solicitud de corrección
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

  // Preparar actualización del activity_log
  const updatePayload = {
    [editRequest.field_name]: editRequest.new_value,
  };

  // Aplicar corrección en la actividad
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
      reviewed_by: guard.user.id,
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

  // Buscar usuario que pidió la corrección para notificarle
  const { data: requestedByUser } = await supabase
    .from("users")
    .select("id, email, full_name")
    .eq("id", editRequest.requested_by)
    .single();

  // Intentar enviar email al member
  // Si falla NO rompe la aprobación
  try {
    if (requestedByUser?.email) {
      await resend.emails.send({
        from: `Kurve <${FROM_EMAIL}>`,
        to: [requestedByUser.email],
        subject: "Tu solicitud de corrección fue aprobada",
        html: `
          <h2>Solicitud aprobada</h2>
          <p>Hola ${requestedByUser.full_name ?? ""},</p>
          <p>Tu solicitud de corrección fue aprobada correctamente.</p>
          <p><strong>Campo:</strong> ${editRequest.field_name}</p>
          <p><strong>Valor anterior:</strong> ${editRequest.old_value}</p>
          <p><strong>Nuevo valor:</strong> ${editRequest.new_value}</p>
        `,
      });

      const adminClient = createAdminClient();
      await adminClient.from("notifications").insert({
        user_id: requestedByUser.id,
        channel: "email" as const,
        type: "edit_request_approved",
        payload: {
          edit_request_id: editRequest.id,
          activity_log_id: editRequest.activity_log_id,
        },
        sent_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error enviando email de aprobación:", error);
  }

  return NextResponse.json(
    {
      message: "Solicitud aprobada correctamente",
      data: approvedRequest,
    },
    { status: 200 }
  );
}
