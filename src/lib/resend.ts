import { Resend } from "resend";

// Remitente: usar dominio propio verificado en Resend cuando esté disponible.
// Mientras no haya dominio verificado, usar el sandbox de Resend.
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

// Inicialización lazy: el cliente se crea la primera vez que se usa,
// no al importar el módulo (evita error en build si la env var no está disponible).
let _client: Resend | null = null;

function getClient(): Resend {
  if (!_client) {
    _client = new Resend(process.env.RESEND_API_KEY);
  }
  return _client;
}

export const resend = {
  emails: {
    send: (...args: Parameters<Resend["emails"]["send"]>) =>
      getClient().emails.send(...args),
  },
};
