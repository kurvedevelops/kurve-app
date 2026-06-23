import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/guard";
import { createServiceClient } from "@/lib/supabase/service";

// GET /api/clients/[id]/package-status
// Admin consulta el estado del paquete activo de un cliente.
// v_client_consumption ya filtra por status = 'active', por lo que
// la ausencia de fila equivale a "sin paquete activo".
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id } = await params;

  const supabase = createServiceClient();

  // Una sola query: la vista ya incluye total_hours, nombre, status y end_date del paquete
  const { data: consumo, error } = await supabase
    .from("v_client_consumption")
    .select(
      "package_id, package_name, total_hours, consumed_hours, hours_percent, end_date, package_status"
    )
    .eq("client_id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener estado del paquete" },
      { status: 500 }
    );
  }

  // La vista solo devuelve paquetes activos; sin fila = sin paquete activo
  if (!consumo?.package_id) {
    return NextResponse.json(
      { error: "No hay paquete activo para este cliente" },
      { status: 404 }
    );
  }

  const consumedHours = consumo.consumed_hours ?? 0;
  const totalHours = consumo.total_hours ?? 0;
  const isExceeded = consumedHours > totalHours;

  return NextResponse.json(
    {
      package_id: consumo.package_id,
      package_name: consumo.package_name,
      total_hours: totalHours,
      consumed_hours: consumedHours,
      hours_percent: consumo.hours_percent ?? 0,
      exceeded_hours: isExceeded
        ? Math.round((consumedHours - totalHours) * 10) / 10
        : 0,
      is_exceeded: isExceeded,
      package_end_date: consumo.end_date,
      status: consumo.package_status,
    },
    { status: 200 }
  );
}
