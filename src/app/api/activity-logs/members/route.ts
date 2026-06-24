import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";

// Schema para crear integrantes
const createMemberSchema = z.object({
  full_name: z.string().min(2).max(100),

  email: z.email(),

  password: z.string().min(6),
});

// GET /api/members
// Listar integrantes
export async function GET() {
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
    return NextResponse.json(
      {
        error: "Error al crear usuario en Auth",
      },
      { status: 500 }
    );
  }

  // Crear usuario en tabla public.users
  const { data: member, error: insertError } = await supabase
    .from("users")
    .insert({
      id: authUser.user.id,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      role: "member",
      active: true,
    })
    .select()
    .single();

  // Manejar error DB
  if (insertError) {
    return NextResponse.json(
      {
        error: "Error al crear integrante",
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
