import { createClient } from "./server";
import {Enums} from "@/lib/supabase/database.types";

// Obtiene los tipos de tarea activos para los selects del formulario

export async function getTaskTypes() {
  const supabase = await createClient();

  return supabase
    .from("task_types")
    .select("id, name")
    .eq("active", true)
    .order("name");
}

// Obtiene las categorías de piezas activas para los selects del formulario
export async function getPieceCategories() {
  const supabase = await createClient();

  return supabase
    .from("piece_categories")
    .select("id, name")
    .eq("active", true)
    .order("name");
}

// Obtiene los clientes asignados al usuario logueado para el select del formulario
export async function getAssignedClients(userId: string) {
  const supabase = await createClient();

  return supabase
    .from("client_users")
    .select(
      `
      clients (
        id,
        name,
        status
      )
    `,
    )
    .eq("user_id", userId);
}

// Obtiene el perfil del usuario autenticado
export async function getCurrentUserProfile(userId: string) {
  const supabase = await createClient();

  return supabase
    .from("users")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .single();
}

// Lista de actividades del integrante con paginacion y filtros.

export async function getMyActivityLogs(filters: {client_id?: string; status?:Enums<"activity_status">; from?: string; to?: string; page?: number;}) {
  const supabase = await createClient();
  let query = supabase
    .from("activity_logs")
    .select(
      `
      id, hours, pieces_count, log_date, status, notes, created_at,
      clients ( id, name ),
      task_types ( id, name ),
      piece_categories ( id, name )
      `,
    )
    .order("log_date", { ascending: false })
    .range((filters.page ?? 0) * 20, (filters.page ?? 0) * 20 + 19);
  if (filters.client_id) query = query.eq("client_id", filters.client_id);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.from) query = query.gte("log_date", filters.from);
  if (filters.to) query = query.lte("log_date", filters.to);
  return query;
}
