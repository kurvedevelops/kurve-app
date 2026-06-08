import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const updateSubtypeSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  active: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
});

// PATCH /api/task-subtypes/:id — editar subtarea
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
      { status: 400 }
    );
  }

  // task_subtypes no está en los tipos generados — actualizar tras TARJETA 8
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("task_subtypes")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Subtarea no encontrada o error al actualizar" },
      { status: error ? 500 : 404 }
    );
  }

  return NextResponse.json(
    { message: "Subtarea actualizada correctamente", data },
    { status: 200 }
  );
}

// DELETE /api/task-subtypes/:id — soft delete (active = false)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  // task_subtypes no está en los tipos generados — actualizar tras TARJETA 8
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data, error } = await db
    .from("task_subtypes")
    .update({ active: false })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Subtarea no encontrada o error al desactivar" },
      { status: error ? 500 : 404 }
    );
  }

  return NextResponse.json(
    { message: "Subtarea desactivada correctamente", data },
    { status: 200 }
  );
}
