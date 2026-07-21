import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdmin } from "@/lib/supabase/guard";

// Schema para editar clientes
const updateClientSchema = z.object({
  name: z.string().min(2).max(100).optional(),

  email: z.email().optional(),

  password: z.string().min(6).optional(), // <- nuevo

  status: z.enum(["active", "paused", "ended"]).optional(),

  start_date: z.string().nullable().optional(),

  end_date: z.string().nullable().optional(),

  legal_name: z.string().max(100).nullable().optional(),

  phone: z.string().max(50).nullable().optional(),
});

// GET /api/clients/:id
// Obtener cliente por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: client, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !client) {
    return NextResponse.json(
      { error: "Cliente no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: client }, { status: 200 });
}

// PATCH /api/clients/:id
// Editar cliente
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  // Usamos service client porque necesitamos tocar Auth (password)
  const supabase = createServiceClient();
  const { id } = await params;
  const body = await request.json();

  const parsed = updateClientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Si mandan name, verificar duplicados
  if (parsed.data.name) {
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .ilike("name", parsed.data.name)
      .neq("id", id)
      .maybeSingle();

    if (existingClient) {
      return NextResponse.json(
        { error: "Ya existe un cliente con ese nombre" },
        { status: 409 },
      );
    }
  }

  // Si mandan email o password, hay que tocar la cuenta de login del cliente
  if (parsed.data.email || parsed.data.password) {
    // Buscar la cuenta de login asociada a este cliente
    const { data: clientUser, error: findUserError } = await supabase
      .from("users")
      .select("id")
      .eq("client_id", id)
      .eq("role", "client")
      .maybeSingle();

    if (findUserError || !clientUser) {
      return NextResponse.json(
        {
          error:
            "Este cliente no tiene una cuenta de acceso asociada. No se pudo actualizar email/contraseña.",
        },
        { status: 404 },
      );
    }

    // Si mandan email, verificar que no esté en uso por otro usuario
    if (parsed.data.email) {
      const { data: existingEmail } = await supabase
        .from("users")
        .select("id")
        .eq("email", parsed.data.email)
        .neq("id", clientUser.id)
        .maybeSingle();

      if (existingEmail) {
        return NextResponse.json(
          { error: "Ya existe un usuario con ese email" },
          { status: 409 },
        );
      }
    }

    const authUpdate: { email?: string; password?: string } = {};
    if (parsed.data.email) authUpdate.email = parsed.data.email;
    if (parsed.data.password) authUpdate.password = parsed.data.password;

    const { error: authError } = await supabase.auth.admin.updateUserById(
      clientUser.id,
      authUpdate,
    );

    if (authError) {
      console.error(
        "Error al actualizar cuenta del cliente:",
        authError.message,
        authError,
      );
      return NextResponse.json(
        {
          error: "Error al actualizar cuenta del cliente",
          detail: authError.message,
        },
        { status: 500 },
      );
    }

    // Mantener sincronizada la tabla users con el nuevo email
    if (parsed.data.email) {
      await supabase
        .from("users")
        .update({ email: parsed.data.email })
        .eq("id", clientUser.id);
    }
  }

  // Separar email/password (no son columnas de clients) del resto
  const { email, password, ...clientFields } = parsed.data;

  // Actualizar cliente en la tabla clients
  const { data: updatedClient, error } = await supabase
    .from("clients")
    .update(clientFields)
    .eq("id", id)
    .select()
    .single();

  if (error || !updatedClient) {
    console.error("Error al actualizar cliente:", error?.message, error);
    return NextResponse.json(
      { error: "Error al actualizar cliente", detail: error?.message },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Cliente actualizado correctamente", data: updatedClient },
    { status: 200 },
  );
}

// DELETE /api/clients/:id
// Soft delete del cliente: no se borra, se marca como ended
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const { data: endedClient, error } = await supabase
    .from("clients")
    .update({
      status: "ended",
      end_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !endedClient) {
    return NextResponse.json(
      { error: "Error al desactivar cliente" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Cliente desactivado correctamente", data: endedClient },
    { status: 200 },
  );
}
