import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const updateTaskTypeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  active: z.boolean().optional(),
});

// GET /api/task-types/:id — detalle con subtareas activas
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const { data: taskType, error } = await supabase
    .from("task_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !taskType) {
    return NextResponse.json(
      { error: "Tipo de tarea no encontrado" },
      { status: 404 },
    );
  }

  const { data: order } = await supabase
    .from("task_type_subtypes_order")
    .select("task_subtype_id, priority")
    .eq("task_type_id", id);

  const priorityMap = new Map(
    (order ?? []).map((o) => [o.task_subtype_id, o.priority]),
  );

  const { data: allSubtypes } = await supabase
    .from("task_subtypes")
    .select("*")
    .eq("active", true);

  const subtypes = (allSubtypes ?? [])
    .map((st) => ({ ...st, priority: priorityMap.get(st.id) ?? null }))
    .sort((a, b) => {
      if (a.priority === null && b.priority === null) return 0;
      if (a.priority === null) return 1;
      if (b.priority === null) return -1;
      return a.priority - b.priority;
    });

  return NextResponse.json(
    { data: { ...taskType, subtypes } },
    { status: 200 },
  );
}

// PATCH /api/task-types/:id — editar
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const body = await request.json();
  const parsed = updateTaskTypeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.name) {
    const { data: existing } = await supabase
      .from("task_types")
      .select("id")
      .ilike("name", parsed.data.name)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un tipo de tarea con ese nombre" },
        { status: 409 },
      );
    }
  }

  const { data, error } = await supabase
    .from("task_types")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al actualizar tipo de tarea" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Tipo de tarea actualizado correctamente", data },
    { status: 200 },
  );
}

// DELETE /api/task-types/:id — soft delete (active = false)
// No permitir si tiene actividades registradas
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const { data: taskType, error: findError } = await supabase
    .from("task_types")
    .select("id, name")
    .eq("id", id)
    .single();

  if (findError || !taskType) {
    return NextResponse.json(
      { error: "Tipo de tarea no encontrado" },
      { status: 404 },
    );
  }

  const { count, error: countError } = await supabase
    .from("activity_logs")
    .select("id", { count: "exact", head: true })
    .eq("task_type_id", id);

  if (countError) {
    return NextResponse.json(
      { error: "Error al verificar uso del tipo de tarea" },
      { status: 500 },
    );
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `No se puede desactivar: el tipo de tarea tiene ${count} actividad(es) registrada(s)`,
      },
      { status: 409 },
    );
  }

  const { data, error } = await supabase
    .from("task_types")
    .update({ active: false })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al desactivar tipo de tarea" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Tipo de tarea desactivado correctamente", data },
    { status: 200 },
  );
}
