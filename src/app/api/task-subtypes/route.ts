import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const createSubtypeSchema = z.object({
  name: z.string().min(2).max(100),
  active: z.boolean().default(true),
});

// GET /api/task-subtypes — listar el catálogo completo de subtareas
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("task_subtypes")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener subtareas" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data }, { status: 200 });
}

// POST /api/task-subtypes — crear subtarea, solo admin
// Ya no recibe task_type_id ni display_order: es una tarea del catálogo
// general. El orden por cargo se define aparte en
// /api/task-types/[id]/subtypes-order.
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const body = await request.json();
  const parsed = createSubtypeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: existing } = await supabase
    .from("task_subtypes")
    .select("id")
    .ilike("name", parsed.data.name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una subtarea con ese nombre" },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("task_subtypes")
    .insert({
      name: parsed.data.name,
      active: parsed.data.active,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al crear subtarea" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Subtarea creada correctamente", data },
    { status: 201 },
  );
}
