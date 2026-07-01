import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// GET /api/health
// Endpoint público para monitores externos (UptimeRobot, Vercel, etc.).
// Devuelve 200 + latencia si la DB responde; 503 si no.
export async function GET() {
  const start = Date.now();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("task_types")
    .select("id")
    .limit(1)
    .maybeSingle();

  const latency_ms = Date.now() - start;

  if (error) {
    return NextResponse.json(
      { status: "error", db: "unreachable", latency_ms, detail: error.message },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { status: "ok", db: "reachable", latency_ms },
    { status: 200 }
  );
}
