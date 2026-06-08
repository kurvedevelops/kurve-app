import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const updateTaskTypeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  counts_as_piece: z.boolean().optional(),
  allowed_roles: z
    .array(z.enum(["admin", "member", "client"]))
    .optional(),
  active: z.boolean().optional(),
});

// GET /api/task-types/:id — detalle con subtareas activas
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      { status: 404 }
    );
  }

  // task_subtypes no está en los tipos generados — actualizar tras TARJETA 8
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: subtypes } = await db
    .from("task_subtypes")
    .select("*")
    .eq("task_type_id", id)
    .eq("active", true)
    .order("display_order", { ascending: true });

  return NextResponse.json(
    { data: { ...taskType, subtypes: subtypes ?? [] } },
    { status: 200 }
  );
}

// PATCH /api/task-types/:id — editar
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      { status: 400 }
    );
  }

  // Verificar nombre duplicado si se manda name
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
        { status: 409 }
      );
    }
  }

  // counts_as_piece y allowed_roles no están en los tipos generados — actualizar tras TARJETA 8
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("task_types")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al actualizar tipo de tarea" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Tipo de tarea actualizado correctamente", data },
    { status: 200 }
  );
}

// DELETE /api/task-types/:id — soft delete (active = false)
// No permitir si tiene actividades registradas
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      { status: 404 }
    );
  }

  // Verificar si tiene actividades registradas
  const { count, error: countError } = await supabase
    .from("activity_logs")
    .select("id", { count: "exact", head: true })
    .eq("task_type_id", id);

  if (countError) {
    return NextResponse.json(
      { error: "Error al verificar uso del tipo de tarea" },
      { status: 500 }
    );
  }

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      {
        error: `No se puede desactivar: el tipo de tarea tiene ${count} actividad(es) registrada(s)`,
      },
      { status: 409 }
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
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Tipo de tarea desactivado correctamente", data },
    { status: 200 }
  );
}
