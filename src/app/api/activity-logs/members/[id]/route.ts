import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/guard";

// Schema para editar integrantes
const updateMemberSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),

  email: z.email().optional(),

  password: z.string().min(6).optional(), // <- nuevo

  active: z.boolean().optional(),

  phone: z.string().max(50).optional().nullable(),

  position: z.string().max(100).optional().nullable(),

  client_ids: z.array(z.string().uuid()).optional(),
});

// GET /api/members/:id
// Obtener integrante por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
      { status: 404 },
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      data: member,
    },
    { status: 200 },
  );
}

// PATCH /api/members/:id
// Editar integrante
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
      { status: 400 },
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
        { status: 409 },
      );
    }
  }

  // Si mandan password, actualizarla en Auth primero
  if (parsed.data.password) {
    const { error: passError } = await supabase.auth.admin.updateUserById(id, {
      password: parsed.data.password,
    });

    if (passError) {
      console.error(
        "Error al actualizar contraseña:",
        passError.message,
        passError,
      );
      return NextResponse.json(
        {
          error: "Error al actualizar contraseña",
          detail: passError.message,
        },
        { status: 500 },
      );
    }
  }

  // Separar client_ids y password (no son columnas de users) de los campos del usuario
  const { client_ids, password, ...userFields } = parsed.data;

  // Actualizar integrante en public.users
  const { data: updatedMember, error } = await supabase
    .from("users")
    .update(userFields)
    .eq("id", id)
    .eq("role", "member")
    .select()
    .single();

  // Manejar error
  if (error || !updatedMember) {
    console.error("Error al actualizar integrante:", error?.message, error);
    return NextResponse.json(
      {
        error: "Error al actualizar integrante",
        detail: error?.message,
      },
      { status: 500 },
    );
  }

  // Si mandaron client_ids, reasignar: limpiar asignaciones viejas e insertar las nuevas
  if (client_ids) {
    const { error: deleteError } = await supabase
      .from("client_users")
      .delete()
      .eq("user_id", id);

    if (deleteError) {
      console.error(
        "Error al limpiar clientes del integrante:",
        deleteError.message,
        deleteError,
      );
      return NextResponse.json(
        {
          error:
            "El integrante se actualizó pero no se pudieron reasignar los clientes.",
          detail: deleteError.message,
          data: updatedMember,
        },
        { status: 207 },
      );
    }

    if (client_ids.length > 0) {
      const rows = client_ids.map((clientId) => ({
        client_id: clientId,
        user_id: id,
      }));

      const { error: assignError } = await supabase
        .from("client_users")
        .insert(rows);

      if (assignError) {
        console.error(
          "Error al reasignar clientes al integrante:",
          assignError.message,
          assignError,
        );
        return NextResponse.json(
          {
            error:
              "El integrante se actualizó pero no se pudieron reasignar los clientes.",
            detail: assignError.message,
            data: updatedMember,
          },
          { status: 207 },
        );
      }
    }
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Integrante actualizado correctamente",
      data: updatedMember,
    },
    { status: 200 },
  );
}

// DELETE /api/members/:id
// Desactivar integrante
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
      { status: 500 },
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Integrante desactivado correctamente",
      data: disabledMember,
    },
    { status: 200 },
  );
}
