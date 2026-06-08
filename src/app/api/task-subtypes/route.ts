import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const createSubtypeSchema = z.object({
  task_type_id: z.string().uuid(),
  name: z.string().min(2).max(100),
  active: z.boolean().default(true),
  display_order: z.number().int().min(0).default(0),
});

// GET /api/task-subtypes?task_type_id=uuid — listar subtareas
export async function GET(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const taskTypeId = searchParams.get("task_type_id");

  let query = supabase
    .from("task_subtypes")
    .select("*")
    .order("display_order", { ascending: true });

  if (taskTypeId) {
    query = query.eq("task_type_id", taskTypeId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener subtareas" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 200 });
}

// POST /api/task-subtypes — crear subtarea, solo admin
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const body = await request.json();
  const parsed = createSubtypeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verificar que el task_type existe
  const { data: taskType, error: taskTypeError } = await supabase
    .from("task_types")
    .select("id")
    .eq("id", parsed.data.task_type_id)
    .single();

  if (taskTypeError || !taskType) {
    return NextResponse.json(
      { error: "Tipo de tarea no encontrado" },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from("task_subtypes")
    .insert({
      task_type_id: parsed.data.task_type_id,
      name: parsed.data.name,
      active: parsed.data.active,
      display_order: parsed.data.display_order,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al crear subtarea" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Subtarea creada correctamente", data },
    { status: 201 }
  );
}
