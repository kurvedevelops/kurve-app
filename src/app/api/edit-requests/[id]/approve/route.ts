import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/guard";
import { resend, FROM_EMAIL } from "@/lib/resend";
import type { Tables } from "@/lib/supabase/database.types";

// POST /api/edit-requests/:id/approve
// Admin aprueba una solicitud de corrección.
// El UPDATE a activity_logs y el UPDATE a edit_requests se ejecutan
// en una sola transacción Postgres vía approve_edit_request().
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  // Transacción atómica: aplica corrección en activity_logs + marca como aprobada.
  // SELECT FOR UPDATE dentro de la función previene aprobaciones dobles concurrentes.
  const { data: approvedRequest, error: txError } = await supabase.rpc(
    "approve_edit_request",
    {
      p_request_id: id,
      p_reviewer_id: guard.user.id,
    },
  );

  if (txError || !approvedRequest) {
    const isNotFound = txError?.message === "edit_request_not_found";
    return NextResponse.json(
      {
        error: isNotFound
          ? "Solicitud no encontrada o ya fue procesada"
          : "Error al aprobar solicitud",
      },
      { status: isNotFound ? 404 : 500 },
    );
  }

  // La función devuelve el row completo del edit_request aprobado como JSON
  const approved = approvedRequest as unknown as Tables<"edit_requests">;

  // Notificación al member — best-effort: no rompe la aprobación si falla
  try {
    const { data: requestedByUser } = await supabase
      .from("users")
      .select("id, email, full_name")
      .eq("id", approved.requested_by)
      .single();

    if (requestedByUser?.email) {
      await resend.emails.send({
        from: `Kurve <${FROM_EMAIL}>`,
        to: [requestedByUser.email],
        subject: "Tu solicitud de corrección fue aprobada",
        html: `
          <h2>Solicitud aprobada</h2>
          <p>Hola ${requestedByUser.full_name ?? ""},</p>
          <p>Tu solicitud de corrección fue aprobada correctamente.</p>
          <p><strong>Campo:</strong> ${approved.field_name}</p>
          <p><strong>Valor anterior:</strong> ${approved.old_value}</p>
          <p><strong>Nuevo valor:</strong> ${approved.new_value}</p>
        `,
      });

      const adminClient = createAdminClient();
      await adminClient.from("notifications").insert({
        user_id: requestedByUser.id,
        channel: "email" as const,
        type: "edit_request_approved",
        payload: {
          edit_request_id: approved.id,
          activity_log_id: approved.activity_log_id,
        },
        sent_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error enviando email de aprobación:", error);
  }

  return NextResponse.json(
    { message: "Solicitud aprobada correctamente", data: approved },
    { status: 200 },
  );
}
