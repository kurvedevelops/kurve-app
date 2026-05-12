import { createClient } from "./server";

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
    `
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
