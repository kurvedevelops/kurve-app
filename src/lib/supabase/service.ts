import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Cliente con service role: bypasea RLS y habilita auth.admin.*
// Usar solo en rutas de servidor que requieran privilegios elevados
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
