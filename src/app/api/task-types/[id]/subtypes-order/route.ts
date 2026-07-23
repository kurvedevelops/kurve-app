import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const updateOrderSchema = z.object({
  order: z.array(z.string().uuid()).min(1),
});

// GET /api/task-types/:id/subtypes-order
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const { data: taskType, error: taskTypeError } = await supabase
    .from("task_types")
    .select("id")
    .eq("id", id)
    .single();

  if (taskTypeError || !taskType) {
    return NextResponse.json(
      { error: "Tipo de tarea no encontrado" },
      { status: 404 },
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("task_type_subtypes_order")
    .select("task_subtype_id, priority")
    .eq("task_type_id", id);

  if (orderError) {
    return NextResponse.json(
      { error: "Error al obtener el orden" },
      { status: 500 },
    );
  }

  const priorityMap = new Map(
    (order ?? []).map((o) => [o.task_subtype_id, o.priority]),
  );

  const { data: subtypes, error: subtypesError } = await supabase
    .from("task_subtypes")
    .select("*")
    .eq("active", true);

  if (subtypesError) {
    return NextResponse.json(
      { error: "Error al obtener subtareas" },
      { status: 500 },
    );
  }

  const sorted = (subtypes ?? [])
    .map((st) => ({ ...st, priority: priorityMap.get(st.id) ?? null }))
    .sort((a, b) => {
      if (a.priority === null && b.priority === null) return 0;
      if (a.priority === null) return 1;
      if (b.priority === null) return -1;
      return a.priority - b.priority;
    });

  return NextResponse.json({ data: sorted }, { status: 200 });
}

// PUT /api/task-types/:id/subtypes-order
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const body = await request.json();
  const parsed = updateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { data: taskType, error: taskTypeError } = await supabase
    .from("task_types")
    .select("id")
    .eq("id", id)
    .single();

  if (taskTypeError || !taskType) {
    return NextResponse.json(
      { error: "Tipo de tarea no encontrado" },
      { status: 404 },
    );
  }

  const { error: deleteError } = await supabase
    .from("task_type_subtypes_order")
    .delete()
    .eq("task_type_id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Error al guardar el orden" },
      { status: 500 },
    );
  }

  const rows = parsed.data.order.map((task_subtype_id, index) => ({
    task_type_id: id,
    task_subtype_id,
    priority: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("task_type_subtypes_order")
    .insert(rows);

  if (insertError) {
    return NextResponse.json(
      { error: "Error al guardar el orden" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
