import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  active: z.boolean().default(true),
});

// GET /api/piece-categories — listar todas, solo admin
export async function GET() {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("piece_categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener categorías" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 200 });
}

// POST /api/piece-categories — crear categoría, solo admin
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const body = await request.json();
  const parsed = createCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verificar nombre duplicado
  const { data: existing } = await supabase
    .from("piece_categories")
    .select("id")
    .ilike("name", parsed.data.name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe una categoría con ese nombre" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("piece_categories")
    .insert({ name: parsed.data.name, active: parsed.data.active })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al crear categoría" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Categoría creada correctamente", data },
    { status: 201 }
  );
}
