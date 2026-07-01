import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/guard";

// Schema para editar integrantes
const updateMemberSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),

  email: z.email().optional(),

  active: z.boolean().optional(),
});

// GET /api/members/:id
// Obtener integrante por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // Crear cliente Supabase
  const supabase = createServiceClient();

  // Obtener ID desde params
  const { id } = await params;

  // Buscar integrante
  const { data: member, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .eq("role", "member")
    .single();

  // Manejar error
  if (error || !member) {
    return NextResponse.json(
      {
        error: "Integrante no encontrado",
      },
      { status: 404 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      data: member,
    },
    { status: 200 }
  );
}

// PATCH /api/members/:id
// Editar integrante
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // Crear cliente Supabase
  const supabase = createServiceClient();

  // Obtener ID desde params
  const { id } = await params;

  // Obtener body
  const body = await request.json();

  // Validar body con Zod
  const parsed = updateMemberSchema.safeParse(body);

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

  // Si mandan email, verificar duplicado
  if (parsed.data.email) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", parsed.data.email)
      .neq("id", id)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Ya existe un usuario con ese email",
        },
        { status: 409 }
      );
    }
  }

  // Actualizar integrante en public.users
  const { data: updatedMember, error } = await supabase
    .from("users")
    .update(parsed.data)
    .eq("id", id)
    .eq("role", "member")
    .select()
    .single();

  // Manejar error
  if (error || !updatedMember) {
    return NextResponse.json(
      {
        error: "Error al actualizar integrante",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Integrante actualizado correctamente",
      data: updatedMember,
    },
    { status: 200 }
  );
}

// DELETE /api/members/:id
// Desactivar integrante
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // Crear cliente Supabase
  const supabase = createServiceClient();

  // Obtener ID desde params
  const { id } = await params;

  // No borramos el usuario, solo lo desactivamos
  const { data: disabledMember, error } = await supabase
    .from("users")
    .update({
      active: false,
    })
    .eq("id", id)
    .eq("role", "member")
    .select()
    .single();

  // Manejar error
  if (error || !disabledMember) {
    return NextResponse.json(
      {
        error: "Error al desactivar integrante",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Integrante desactivado correctamente",
      data: disabledMember,
    },
    { status: 200 }
  );
}
