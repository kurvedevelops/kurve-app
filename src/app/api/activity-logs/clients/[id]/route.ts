import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema para editar clientes
const updateClientSchema = z.object({
  name: z.string().min(2).max(100).optional(),

  status: z.enum(["active", "paused", "ended"]).optional(),

  start_date: z.string().nullable().optional(),

  end_date: z.string().nullable().optional(),
});

// GET /api/clients/:id
// Obtener cliente por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener ID desde params
  const { id } = await params;

  // Buscar cliente
  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  // Manejar error
  if (error || !client) {
    return NextResponse.json(
      {
        error: "Cliente no encontrado",
      },
      { status: 404 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      data: client,
    },
    { status: 200 }
  );
}

// PATCH /api/clients/:id
// Editar cliente
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener ID
  const { id } = await params;

  // Obtener body
  const body = await request.json();

  // Validar body con Zod
  const parsed = updateClientSchema.safeParse(body);

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

  // Si mandan name verificar duplicados
  if (parsed.data.name) {
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .ilike("name", parsed.data.name)
      .neq("id", id)
      .maybeSingle();

    if (existingClient) {
      return NextResponse.json(
        {
          error: "Ya existe un cliente con ese nombre",
        },
        { status: 409 }
      );
    }
  }

  // Actualizar cliente
  const { data: updatedClient, error } = await supabase
    .from("clients")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  // Manejar error
  if (error || !updatedClient) {
    return NextResponse.json(
      {
        error: "Error al actualizar cliente",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Cliente actualizado correctamente",
      data: updatedClient,
    },
    { status: 200 }
  );
}

// DELETE /api/clients/:id
// Eliminar cliente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener ID
  const { id } = await params;

  // Eliminar cliente
  const { error } = await supabase.from("clients").delete().eq("id", id);

  // Manejar error
  if (error) {
    return NextResponse.json(
      {
        error: "Error al eliminar cliente",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Cliente eliminado correctamente",
    },
    { status: 200 }
  );
}
