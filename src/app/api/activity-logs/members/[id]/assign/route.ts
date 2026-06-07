import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema para asignar/desasignar clientes a un integrante
const assignClientsSchema = z.object({
  client_ids: z.array(z.string().uuid()),

  action: z.enum(["assign", "unassign"]),
});

// POST /api/members/:id/assign
// Asignar o desasignar clientes a un integrante
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener ID del integrante
  const { id } = await params;

  // Obtener body
  const body = await request.json();

  // Validar body con Zod
  const parsed = assignClientsSchema.safeParse(body);

  // Manejar error de validación
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Verificar que el usuario exista y sea member
  const { data: member, error: memberError } = await supabase
    .from("users")
    .select("id")
    .eq("id", id)
    .eq("role", "member")
    .single();

  if (memberError || !member) {
    return NextResponse.json(
      {
        error: "Integrante no encontrado",
      },
      { status: 404 }
    );
  }

  // Si la acción es asignar clientes
  if (parsed.data.action === "assign") {
    const payload = parsed.data.client_ids.map((clientId) => ({
      user_id: id,
      client_id: clientId,
    }));

    const { error } = await supabase.from("client_users").upsert(payload, {
      onConflict: "user_id,client_id",
    });

    if (error) {
      return NextResponse.json(
        {
          error: "Error al asignar clientes",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Clientes asignados correctamente",
      },
      { status: 200 }
    );
  }

  // Si la acción es desasignar clientes
  const { error } = await supabase
    .from("client_users")
    .delete()
    .eq("user_id", id)
    .in("client_id", parsed.data.client_ids);

  if (error) {
    return NextResponse.json(
      {
        error: "Error al desasignar clientes",
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message: "Clientes desasignados correctamente",
    },
    { status: 200 }
  );
}
