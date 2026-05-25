import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Schema para validar creación de clientes
const createClientSchema = z.object({
  name: z.string().min(2).max(100),

  status: z.enum(["active", "paused", "ended"]).optional(),

  start_date: z.string().nullable().optional(),

  end_date: z.string().nullable().optional(),
});

// GET /api/clients
// Lista todos los clientes
export async function GET() {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Validar sesión
  if (!user) {
    return NextResponse.json(
      {
        error: "No autenticado",
      },
      { status: 401 }
    );
  }

  // Buscar clientes ordenados por fecha de creación
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  // Manejar error
  if (error) {
    return NextResponse.json(
      {
        error: "Error al obtener clientes",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      data: clients,
    },
    { status: 200 }
  );
}

// POST /api/clients
// Crea un nuevo cliente
export async function POST(request: Request) {
  // Crear cliente Supabase
  const supabase = await createClient();

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Validar sesión
  if (!user) {
    return NextResponse.json(
      {
        error: "No autenticado",
      },
      { status: 401 }
    );
  }

  // Obtener body
  const body = await request.json();

  // Validar datos con Zod
  const parsed = createClientSchema.safeParse(body);

  // Si falla la validación
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  // Verificar si ya existe un cliente con el mismo nombre
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .ilike("name", parsed.data.name)
    .maybeSingle();

  // Si existe, no crear duplicado
  if (existingClient) {
    return NextResponse.json(
      {
        error: "Ya existe un cliente con ese nombre",
      },
      { status: 409 }
    );
  }

  // Crear cliente
  const { data: client, error: insertError } = await supabase
    .from("clients")
    .insert({
      name: parsed.data.name,
      status: parsed.data.status ?? "active",
      start_date: parsed.data.start_date ?? null,
      end_date: parsed.data.end_date ?? null,
    })
    .select()
    .single();

  // Manejar error
  if (insertError) {
    return NextResponse.json(
      {
        error: "Error al crear cliente",
      },
      { status: 500 }
    );
  }

  // Respuesta exitosa
  return NextResponse.json(
    {
      message: "Cliente creado correctamente",
      data: client,
    },
    { status: 201 }
  );
}
