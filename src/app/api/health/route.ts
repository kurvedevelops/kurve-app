import { NextResponse } from "next/server";

// GET /api/health
// Endpoint público para monitores externos (UptimeRobot, Vercel, etc.).
// Pinga el root de PostgREST (/rest/v1/) con la anon key: responde 200
// sin tocar ninguna tabla ni requerir RLS. Si PostgREST no responde,
// Postgres tampoco está disponible.
export async function GET() {
  const start = Date.now();

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
        signal: AbortSignal.timeout(5000),
      }
    );

    const latency_ms = Date.now() - start;

    if (!res.ok) {
      return NextResponse.json(
        { status: "error", db: "unreachable", latency_ms, detail: `HTTP ${res.status}` },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { status: "ok", db: "reachable", latency_ms },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: "error", db: "unreachable", latency_ms: Date.now() - start, detail: String(err) },
      { status: 503 }
    );
  }
}
