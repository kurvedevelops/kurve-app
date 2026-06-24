// Ventana deslizante en memoria: 30 requests por minuto por usuario.
// Vive en el proceso Node.js; se reinicia con cada cold start (suficiente sin Redis).
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

const requestLog = new Map<string, number[]>();

export function checkRateLimit(userId: string): { limited: boolean } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const recent = (requestLog.get(userId) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS) {
    requestLog.set(userId, recent);
    return { limited: true };
  }

  recent.push(now);
  // Limpiar entrada vacía para evitar crecimiento ilimitado del Map
  if (recent.length === 0) {
    requestLog.delete(userId);
  } else {
    requestLog.set(userId, recent);
  }

  return { limited: false };
}
