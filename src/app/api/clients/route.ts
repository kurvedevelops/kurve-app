import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/guard";

const createClientWithUserSchema = z.object({
  cliente: z.object({
    name: z.string().min(2).max(100),
    legal_name: z.string().optional(),
    email: z.email().optional(),
    phone: z.string().optional(),
    created_at: z.string().optional(),
  }),
  usuario: z.object({
    email: z.email(),
    password: z.string().min(6),
    full_name: z.string().max(100).optional(),
  }),
});

export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = createServiceClient();

  const body = await request.json();
  const parsed = createClientWithUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { cliente, usuario } = parsed.data;

  // --- Paso A: crear el cliente ---
const { data: newClient, error: clientError } = await supabase
  .from("clients")
  .insert({
    name: cliente.name,
    legal_name: cliente.legal_name,
    email: cliente.email,
    phone: cliente.phone,
    created_at: cliente.created_at,
    status: "active",
  })
  .select()
  .single();

if (clientError || !newClient) {
  console.error("Error real al crear cliente:", clientError);
  return NextResponse.json(
    { error: "Error al crear el cliente" },
    { status: 500 }
  );
}

  // --- Paso B: verificar email duplicado antes de tocar Auth ---
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", usuario.email)
    .maybeSingle();

  if (existingUser) {
    // rollback: el cliente ya se creó, hay que borrarlo
    await supabase.from("clients").delete().eq("id", newClient.id);
    return NextResponse.json(
      { error: "Ya existe un usuario con ese email" },
      { status: 409 }
    );
  }

  // --- Paso C: crear el usuario en Supabase Auth ---
  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email: usuario.email,
      password: usuario.password,
      email_confirm: true,
    });

  if (authError || !authUser.user) {
    // rollback: borrar el cliente recién creado
    await supabase.from("clients").delete().eq("id", newClient.id);
    return NextResponse.json(
      { error: "Error al crear el usuario en Auth" },
      { status: 500 }
    );
  }

  // --- Paso D: crear la fila en public.users, asociada al cliente ---
const { data: clientUser, error: insertUserError } = await supabase
  .from("users")
  .update({
    full_name: usuario.full_name,
    role: "client",
    client_id: newClient.id,
    active: true,
  } as never)
  .eq("id", authUser.user.id)
  .select()
  .single();

  if (insertUserError) {
    console.error("Error real al crear usuario:", insertUserError);
    
    // rollback doble: borrar el user de Auth y el cliente
    await supabase.auth.admin.deleteUser(authUser.user.id);
    await supabase.from("clients").delete().eq("id", newClient.id);
    return NextResponse.json(
      { error: "Error al crear el usuario del cliente" },
      { status: 500 }
    );
  }

  // --- Todo salió bien ---
  return NextResponse.json(
    {
      message: "Cliente y usuario creados correctamente",
      data: { client: newClient, user: clientUser },
    },
    { status: 201 }
  );
}