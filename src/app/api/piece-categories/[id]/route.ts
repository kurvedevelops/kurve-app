import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  active: z.boolean().optional(),
});

// PATCH /api/piece-categories/:id — editar categoría
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  const body = await request.json();
  const parsed = updateCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verificar nombre duplicado si se manda name
  if (parsed.data.name) {
    const { data: existing } = await supabase
      .from("piece_categories")
      .select("id")
      .ilike("name", parsed.data.name)
      .neq("id", id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una categoría con ese nombre" },
        { status: 409 }
      );
    }
  }

  const { data, error } = await supabase
    .from("piece_categories")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Categoría no encontrada o error al actualizar" },
      { status: error ? 500 : 404 }
    );
  }

  return NextResponse.json(
    { message: "Categoría actualizada correctamente", data },
    { status: 200 }
  );
}

// DELETE /api/piece-categories/:id — soft delete (active = false)
// No permitir si la categoría está en uso en paquetes activos
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();
  const { id } = await params;

  // Verificar que la categoría existe
  const { data: category, error: findError } = await supabase
    .from("piece_categories")
    .select("id, name")
    .eq("id", id)
    .single();

  if (findError || !category) {
    return NextResponse.json(
      { error: "Categoría no encontrada" },
      { status: 404 }
    );
  }

  // Verificar uso en paquetes activos (dos pasos para mantener tipos limpios)
  const { data: pieces } = await supabase
    .from("package_pieces")
    .select("package_id")
    .eq("category_id", id);

  if (pieces && pieces.length > 0) {
    const packageIds = pieces.map((p) => p.package_id);

    const { count: activeCount } = await supabase
      .from("packages")
      .select("id", { count: "exact", head: true })
      .in("id", packageIds)
      .eq("status", "active");

    if ((activeCount ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `La categoría está en uso en ${activeCount} paquete(s) activo(s) y no puede desactivarse`,
        },
        { status: 409 }
      );
    }
  }

  const { data, error } = await supabase
    .from("piece_categories")
    .update({ active: false })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al desactivar categoría" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Categoría desactivada correctamente", data },
    { status: 200 }
  );
}
