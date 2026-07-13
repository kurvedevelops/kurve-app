import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/guard";

// Schema para crear integrantes
const createMemberSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.email(),
  password: z.string().min(6),
  client_ids: z.array(z.string().uuid()).optional().default([]),
});

// GET /api/members
// Listar integrantes
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // Crear cliente Supabase
  const supabase = createServiceClient();

  // Obtener integrantes
  const { data: members, error } = await supabase
    .from("users")
    .select("*")
    .eq("role", "member")
    .eq("active", true)
    .order("created_at", { ascending: false });

  // Manejar error
  if (error) {
    return NextResponse.json(
      {
        error: "Error al obtener integrantes",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      data: members,
    },
    { status: 200 }
  );
}

// POST /api/members
// Crear integrante
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // Crear cliente Supabase
  const supabase = createServiceClient();

  // Obtener body
  const body = await request.json();

  // Validar datos con Zod
  const parsed = createMemberSchema.safeParse(body);

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

  // Verificar si el email ya existe (activo o inactivo)
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, active")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existingUser) {
    if (existingUser.active) {
      return NextResponse.json(
        { error: "Ya existe un integrante activo con ese email" },
        { status: 409 }
      );
    }

    // Usuario inactivo (eliminado antes) → reactivarlo sin tocar Auth
    const { data: reactivated, error: reactivateError } = await supabase
      .from("users")
      .update({ full_name: parsed.data.full_name, role: "member", active: true })
      .eq("id", existingUser.id)
      .select()
      .single();

    if (reactivateError) {
      console.error("Error al reactivar integrante:", reactivateError.message, reactivateError);
      return NextResponse.json(
        { error: "Error al reactivar integrante", detail: reactivateError.message },
        { status: 500 }
      );
    }

    // Limpiar asignaciones viejas y reasignar las nuevas
    await supabase.from("client_users").delete().eq("user_id", existingUser.id);

    if (parsed.data.client_ids.length > 0) {
      const rows = parsed.data.client_ids.map((clientId) => ({
        client_id: clientId,
        user_id: existingUser.id,
      }));
      const { error: assignError } = await supabase.from("client_users").insert(rows);
      if (assignError) {
        console.error("Error al reasignar clientes:", assignError.message, assignError);
        return NextResponse.json(
          {
            error: "El integrante se reactivó pero no se pudieron asignar los clientes. Asignalos desde el detalle.",
            detail: assignError.message,
            data: reactivated,
          },
          { status: 207 }
        );
      }
    }

    return NextResponse.json(
      { message: "Integrante reactivado correctamente", data: reactivated },
      { status: 200 }
    );
  }

  // Si no existe → flujo normal de creación en Auth
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });

  // Manejar error auth
  if (authError || !authUser.user) {
    console.error("Error al crear usuario en Auth:", authError?.message, authError);
    return NextResponse.json(
      {
        error: "Error al crear usuario en Auth",
      },
      { status: 500 }
    );
  }

  // El trigger handle_new_user ya insertó la fila en public.users al crear el
  // usuario en Auth (con full_name vacío). Actualizamos con los datos reales
  // en lugar de insertar de nuevo (un insert chocaría con la PK existente).
  const { data: member, error: insertError } = await supabase
    .from("users")
    .update({
      full_name: parsed.data.full_name,
      role: "member",
      active: true,
    })
    .eq("id", authUser.user.id)
    .select()
    .single();

  // Manejar error DB
  if (insertError) {
    console.error("Error al actualizar integrante en users:", insertError.message, insertError);
    return NextResponse.json(
      {
        error: "Error al crear integrante",
        detail: insertError.message,
      },
      { status: 500 }
    );
  }

  // Asignar clientes al integrante (si el modal mandó client_ids)
  if (parsed.data.client_ids.length > 0) {
    const rows = parsed.data.client_ids.map((clientId) => ({
      client_id: clientId,
      user_id: authUser.user.id,
    }));

    const { error: assignError } = await supabase
      .from("client_users")
      .insert(rows);

    if (assignError) {
      console.error("Error al asignar clientes al integrante:", assignError.message, assignError);
      // El integrante ya se creó correctamente. Informamos el éxito parcial
      // para que el admin pueda asignar los clientes desde el detalle.
      return NextResponse.json(
        {
          error: "El integrante se creó pero no se pudieron asignar los clientes. Asignalos desde el detalle del integrante.",
          detail: assignError.message,
          data: member,
        },
        { status: 207 }
      );
    }
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Integrante creado correctamente",
      data: member,
    },
    { status: 201 }
  );
}
