import { createClient } from "./server";

export async function getTaskTypes() {
  const supabase = await createClient();

  return supabase.from("task_types").select("*").order("name");
}

export async function getPieceCategories() {
  const supabase = await createClient();

  return supabase.from("piece_categories").select("*").order("name");
}

export async function getClients() {
  const supabase = await createClient();

  return supabase.from("clients").select("*").order("name");
}

export async function getCurrentUserProfile(userId: string) {
  const supabase = await createClient();

  return supabase.from("users").select("*").eq("id", userId).single();
}
