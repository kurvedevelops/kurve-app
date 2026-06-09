import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import type { Database, Tables } from "@/lib/supabase/database.types";

type UserRow = Pick<Tables<"users">, "id" | "full_name" | "phone">;

// POST /api/reminders/send
// Llamado por el cron de Vercel. Envía recordatorio por WhatsApp a usuarios
// activos que no registraron actividad hoy.
export async function POST(request: Request) {
  // Validar header secreto para proteger el endpoint de cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Cliente con service role para leer todos los usuarios sin restricciones de RLS
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // Fecha de hoy en UTC (formato YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  // Obtener usuarios activos con teléfono configurado
  const { data: activeUsers, error: usersError } = await supabase
    .from("users")
    .select("id, full_name, phone")
    .eq("active", true)
    .not("phone", "is", null);

  if (usersError) {
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    );
  }

  // .not("phone", "is", null) garantiza valores no nulos; el predicate lo comunica al tipo
  const users = (activeUsers ?? [] as UserRow[]).filter(
    (u): u is UserRow & { phone: string } => u.phone !== null
  );

  if (users.length === 0) {
    return NextResponse.json({ message: "Sin usuarios para recordar", sent: 0 });
  }

  // Obtener IDs de usuarios que ya registraron actividad hoy
  const { data: logsHoy, error: logsError } = await supabase
    .from("activity_logs")
    .select("user_id")
    .eq("log_date", today);

  if (logsError) {
    return NextResponse.json(
      { error: "Error al consultar actividades de hoy" },
      { status: 500 }
    );
  }

  const idsConActividad = new Set((logsHoy ?? []).map((l) => l.user_id));

  // Filtrar usuarios que NO registraron actividad hoy
  const usuariosASaludar = users.filter((u) => !idsConActividad.has(u.id));

  let enviados = 0;
  let errores = 0;

  for (const usuario of usuariosASaludar) {
    try {
      const mensaje =
        `¡Hola ${usuario.full_name}! 👋 No olvidés registrar tu actividad del día en Kurve. ` +
        `Solo te lleva un momento. ¡Gracias!`;

      await sendWhatsAppMessage(usuario.phone, mensaje);

      // Registrar el envío en la tabla de notificaciones
      await supabase.from("notifications").insert({
        user_id: usuario.id,
        channel: "whatsapp",
        type: "daily_reminder",
        payload: { log_date: today },
        sent_at: new Date().toISOString(),
      });

      enviados++;
    } catch (error) {
      console.error(`Error enviando recordatorio a ${usuario.id}:`, error);
      errores++;
    }
  }

  return NextResponse.json({
    message: "Recordatorios procesados",
    sent: enviados,
    errors: errores,
    skipped: users.length - usuariosASaludar.length,
  });
}
