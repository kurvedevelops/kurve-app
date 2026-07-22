import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/guard";

const createTaskTypeSchema = z.object({
  name: z.string().min(2).max(100),
  counts_as_piece: z.boolean().default(false),
  allowed_roles: z
    .array(z.enum(["admin", "member", "client"]))
    .default(["admin", "member"]),
  active: z.boolean().default(true),
});

// GET /api/task-types
// Admin: todos los tipos (activos e inactivos), sin ordenamiento especial.
// Member: solo activos, ordenados por especialidad asignada primero
//   (is_primary → asignados → resto), con campos is_assigned e is_primary.
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (profile.role === "admin") {
    const { data, error } = await supabase
      .from("task_types")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener tipos de tarea" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  }

  if (profile.role === "member") {
    // Traer especialidades asignadas al member
    const { data: assignments } = await supabase
      .from("member_task_types")
      .select("task_type_id, is_primary")
      .eq("user_id", user.id);

    const assignedMap = new Map(
      (assignments ?? []).map((a) => [a.task_type_id, a.is_primary])
    );

    // Traer todos los task_types activos
    const { data: taskTypes, error } = await supabase
      .from("task_types")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener tipos de tarea" },
        { status: 500 }
      );
    }

    // Ordenar: primary → asignados → resto (dentro de cada grupo, ya viene por nombre)
    const sorted = (taskTypes ?? []).sort((a, b) => {
      const aPrimary = assignedMap.get(a.id) === true;
      const bPrimary = assignedMap.get(b.id) === true;
      if (aPrimary !== bPrimary) return aPrimary ? -1 : 1;

      const aAssigned = assignedMap.has(a.id);
      const bAssigned = assignedMap.has(b.id);
      if (aAssigned !== bAssigned) return aAssigned ? -1 : 1;

      return 0;
    });

    return NextResponse.json(
      {
        data: sorted.map((tt) => ({
          ...tt,
          is_assigned: assignedMap.has(tt.id),
          is_primary: assignedMap.get(tt.id) === true,
        })),
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
}

// POST /api/task-types — crear tipo de tarea, solo admin
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (guard.error) return guard.error;

  const supabase = await createClient();

  const body = await request.json();
  const parsed = createTaskTypeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verificar nombre duplicado
  const { data: existing } = await supabase
    .from("task_types")
    .select("id")
    .ilike("name", parsed.data.name)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Ya existe un tipo de tarea con ese nombre" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("task_types")
    .insert({
      name: parsed.data.name,
      counts_as_piece: parsed.data.counts_as_piece,
      allowed_roles: parsed.data.allowed_roles,
      active: parsed.data.active,
    })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Error al crear tipo de tarea" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Tipo de tarea creado correctamente", data },
    { status: 201 }
  );
}
