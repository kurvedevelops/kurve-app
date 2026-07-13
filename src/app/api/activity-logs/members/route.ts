import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/guard";

// Schema para crear integrantes
const createMemberSchema = z.object({
  full_name: z.string().min(2).max(100),

  email: z.email(),

  password: z.string().min(6),
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

  // Verificar email duplicado
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  // Si existe usuario devolver error
  if (existingUser) {
    return NextResponse.json(
      {
        error: "Ya existe un usuario con ese email",
      },
      { status: 409 }
    );
  }

  // Crear usuario en Supabase Auth
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

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Integrante creado correctamente",
      data: member,
    },
    { status: 201 }
  );
}
