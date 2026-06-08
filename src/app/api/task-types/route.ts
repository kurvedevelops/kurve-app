import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const createTaskTypeSchema = z.object({
  name: z.string().min(2).max(100),
  counts_as_piece: z.boolean().default(false),
  allowed_roles: z
    .array(z.enum(["admin", "member", "client"]))
    .default(["admin", "member"]),
  active: z.boolean().default(true),
});

// GET /api/task-types — lista todos (activos e inactivos), solo admin
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("task_types")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener tipos de tarea" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 200 });
}

// POST /api/task-types — crear tipo de tarea, solo admin
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const body = await request.json();
  const parsed = createTaskTypeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verificar nombre duplicado
  const { data: existing } = await supabase
    .from("task_types")
    .select("id")
    .ilike("name", parsed.data.name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe un tipo de tarea con ese nombre" },
      { status: 409 }
    );
  }

  // counts_as_piece y allowed_roles no están en los tipos generados — actualizar tras TARJETA 8
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("task_types")
    .insert({
      name: parsed.data.name,
      counts_as_piece: parsed.data.counts_as_piece,
      allowed_roles: parsed.data.allowed_roles,
      active: parsed.data.active,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al crear tipo de tarea" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Tipo de tarea creado correctamente", data },
    { status: 201 }
  );
}
