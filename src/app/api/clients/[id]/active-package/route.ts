import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/clients/[id]/active-package
// Devuelve los paquetes activos del cliente con consumo.
// Accesible por admin y por members asignados al cliente.
// Con migration 018 un cliente puede tener N paquetes activos —
// se devuelve un array para que el front auto-seleccione si hay uno
// o muestre un selector si hay varios.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id: clientId } = await params;

  // Verificar acceso: admin ve todos, member solo sus clientes asignados
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (profile.role === "member") {
    const { data: assigned } = await supabase
      .from("client_users")
      .select("client_id")
      .eq("user_id", user.id)
      .eq("client_id", clientId)
      .maybeSingle();

    if (!assigned) {
      return NextResponse.json(
        { error: "Sin acceso a este cliente" },
        { status: 403 },
      );
    }
  } else if (profile.role === "client") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  // v_client_consumption filtra por status = 'active' y devuelve una fila
  // por paquete activo (soporta múltiples paquetes activos por cliente)
  const { data: packages, error } = await supabase
    .from("v_client_consumption")
    .select(
      "package_id, package_name, total_hours, consumed_hours, hours_percent, start_date, end_date",
    )
    .eq("client_id", clientId)
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error al obtener paquetes activos:", error.message, error);
    return NextResponse.json(
      { error: "Error al obtener paquetes activos" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: packages ?? [] }, { status: 200 });
}
