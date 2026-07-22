import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const assignTaskTypesSchema = z
  .object({
    task_type_ids: z
      .array(z.string().uuid())
      .refine((ids) => new Set(ids).size === ids.length, {
        message: "task_type_ids no puede contener duplicados",
      }),
    primary_task_type_id: z.string().uuid().nullable().optional(),
  })
  .superRefine(({ task_type_ids, primary_task_type_id }, ctx) => {
    if (primary_task_type_id && !task_type_ids.includes(primary_task_type_id)) {
      ctx.addIssue({
        code: "custom",
        path: ["primary_task_type_id"],
        message: "La especialidad principal debe estar incluida en task_type_ids",
      });
    }
  });

// GET /api/members/[id]/task-types
// Admin: devuelve todos los task_types activos con flag is_assigned e is_primary
// según las asignaciones actuales del member. Usado para el panel de edición.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id: memberId } = await params;

  const supabase = await createClient();

  // Verificar que el member existe
  const { data: member } = await supabase
    .from("users")
    .select("id, full_name, position")
    .eq("id", memberId)
    .eq("role", "member")
    .maybeSingle();

  if (!member) {
    return NextResponse.json(
      { error: "Integrante no encontrado" },
      { status: 404 },
    );
  }

  // Asignaciones actuales del member
  const { data: assignments } = await supabase
    .from("member_task_types")
    .select("task_type_id, is_primary")
    .eq("user_id", memberId);

  const assignedMap = new Map(
    (assignments ?? []).map((a) => [a.task_type_id, a.is_primary]),
  );

  // Todos los task_types activos
  const { data: taskTypes, error } = await supabase
    .from("task_types")
    .select("id, name, counts_as_piece, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error al obtener tipos de tarea:", error.message, error);
    return NextResponse.json(
      { error: "Error al obtener tipos de tarea" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      member,
      data: (taskTypes ?? []).map((tt) => ({
        ...tt,
        is_assigned: assignedMap.has(tt.id),
        is_primary: assignedMap.get(tt.id) === true,
      })),
    },
    { status: 200 },
  );
}

// POST /api/members/[id]/task-types
// Admin: reemplaza todas las especialidades del member.
// Enviar task_type_ids vacío limpia todas las asignaciones.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const { id: memberId } = await params;

  const body = await request.json();
  const parsed = assignTaskTypesSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // Verificar que el member existe
  const { data: member } = await supabase
    .from("users")
    .select("id")
    .eq("id", memberId)
    .eq("role", "member")
    .maybeSingle();

  if (!member) {
    return NextResponse.json(
      { error: "Integrante no encontrado" },
      { status: 404 },
    );
  }

  // Eliminar asignaciones existentes
  const { error: deleteError } = await supabase
    .from("member_task_types")
    .delete()
    .eq("user_id", memberId);

  if (deleteError) {
    console.error("Error al limpiar especialidades:", deleteError.message, deleteError);
    return NextResponse.json(
      { error: "Error al actualizar especialidades" },
      { status: 500 },
    );
  }

  // Insertar nuevas asignaciones (si las hay)
  if (parsed.data.task_type_ids.length > 0) {
    const rows = parsed.data.task_type_ids.map((ttId) => ({
      user_id: memberId,
      task_type_id: ttId,
      is_primary: ttId === parsed.data.primary_task_type_id,
    }));

    const { error: insertError } = await supabase
      .from("member_task_types")
      .insert(rows);

    if (insertError) {
      console.error("Error al asignar especialidades:", insertError.message, insertError);
      return NextResponse.json(
        { error: "Error al asignar especialidades" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { message: "Especialidades actualizadas correctamente" },
    { status: 200 },
  );
}
