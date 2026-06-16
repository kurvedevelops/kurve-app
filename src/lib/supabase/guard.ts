import { NextResponse } from "next/server";
import { createClient } from "./server";
import type { Database } from "./database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

type GuardSuccess = { id: string; email: string; role: UserRole };
type GuardResult =
  | { user: GuardSuccess; error: null }
  | { user: null; error: NextResponse };

export async function requireAdmin(): Promise<GuardResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Acceso no autorizado" },
        { status: 403 }
      ),
    };
  }

  return {
    user: { id: user.id, email: user.email ?? "", role: "admin" },
    error: null,
  };
}

export async function requireRole(roles: UserRole[]): Promise<GuardResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "No autenticado" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !roles.includes(profile.role)) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Acceso no autorizado" },
        { status: 403 }
      ),
    };
  }

  return {
    user: { id: user.id, email: user.email ?? "", role: profile.role },
    error: null,
  };
}
