import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/guard";

// Schema para crear el user asociado a un cliente
const createClientUserSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
  full_name: z.string().min(2).max(100).optional(),
});

// POST /api/clients/[id]/users
// Crea el user (Auth + tabla users) y lo asocia al client_id recibido por params
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id: clientId } = await params;

  const supabase = createServiceClient();

  const body = await request.json();
  const parsed = createClientUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // (Opcional pero recomendado) verificar que el cliente exista
  const { data: existingClient, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle();

  if (clientError || !existingClient) {
    return NextResponse.json(
      { error: "El cliente no existe" },
      { status: 404 },
    );
  }

  // Verificar email duplicado
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      { error: "Ya existe un usuario con ese email" },
      { status: 409 },
    );
  }

  // Crear usuario en Supabase Auth
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });

  if (authError || !authUser.user) {
    return NextResponse.json(
      { error: "Error al crear usuario en Auth" },
      { status: 500 },
    );
  }

  // Crear fila en public.users, asociada al cliente
  const { data: clientUser, error: insertError } = await supabase
    .from("users")
    .insert({
      id: authUser.user.id,
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      role: "client",
      client_id: clientId,
      active: true,
    } as never)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Error al crear el usuario del cliente" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Usuario creado correctamente", data: clientUser },
    { status: 201 },
  );
}
