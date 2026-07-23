import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const updateSubtypeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  active: z.boolean().optional(),
});

// PATCH /api/task-subtypes/:id — editar subtarea
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const body = await request.json();
  const parsed = updateSubtypeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.name) {
    const { data: existing } = await supabase
      .from("task_subtypes")
      .select("id")
      .ilike("name", parsed.data.name)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una subtarea con ese nombre" },
        { status: 409 },
      );
    }
  }

  const { data, error } = await supabase
    .from("task_subtypes")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Subtarea no encontrada o error al actualizar" },
      { status: error ? 500 : 404 },
    );
  }

  return NextResponse.json(
    { message: "Subtarea actualizada correctamente", data },
    { status: 200 },
  );
}

// DELETE /api/task-subtypes/:id — soft delete (active = false)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("task_subtypes")
    .update({ active: false })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Subtarea no encontrada o error al desactivar" },
      { status: error ? 500 : 404 },
    );
  }

  return NextResponse.json(
    { message: "Subtarea desactivada correctamente", data },
    { status: 200 },
  );
}
