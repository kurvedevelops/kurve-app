"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { BaseModal } from "./ModalBase";
import { toast } from "sonner";
import { checkClientExists } from "@/hooks/middleware";

// ── Schema ────────────────────────────────────────────────────────────────────

const nuevoClienteSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del cliente es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .refine(async (name) => {
      const exists = await checkClientExists(name);
      return !exists;
    }, "Este cliente ya existe"),
  razonSocial: z
    .string()
    .max(100, "La razón social no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .min(1, "El email es requerido para crear el acceso del cliente")
    .email("El email debe ser válido"),
  telefono: z
    .string()
    .regex(/^[\d\s\-\+\(\)]*$/, "El teléfono contiene caracteres inválidos")
    .optional()
    .or(z.literal("")),
  fechaAlta: z
    .string()
    .min(1, "La fecha de alta es requerida")
    .refine(
      (date) => new Date(date) <= new Date(),
      "La fecha de alta no puede ser en el futuro",
    ),
});

export type NuevoClienteFormData = z.infer<typeof nuevoClienteSchema>;

const usuarioClienteSchema = z.object({
  fullName: z
    .string()
    .max(100, "El nombre no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
  email: z.string().email("El email debe ser válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type UsuarioClienteFormData = z.infer<typeof usuarioClienteSchema>;

interface NuevoClienteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ClienteFormErrors = Partial<Record<keyof NuevoClienteFormData, string>>;
type UsuarioFormErrors = Partial<Record<keyof UsuarioClienteFormData, string>>;

type Step = "cliente" | "usuario";

const initialClienteForm: NuevoClienteFormData = {
  name: "",
  razonSocial: "",
  email: "",
  telefono: "",
  fechaAlta: new Date().toISOString().split("T")[0],
};

const initialUsuarioForm: UsuarioClienteFormData = {
  fullName: "",
  email: "",
  password: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function validateClienteField(
  field: keyof NuevoClienteFormData,
  value?: string,
): Promise<string | undefined> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await nuevoClienteSchema
      .pick({ [field]: true } as any)
      .parseAsync({ [field]: value });
    return undefined;
  } catch (err) {
    if (err instanceof z.ZodError) return err.issues[0]?.message;
    return "Error en validación";
  }
}

function validateUsuarioField(
  field: keyof UsuarioClienteFormData,
  value?: string,
): string | undefined {
  const result = usuarioClienteSchema.shape[field].safeParse(value ?? "");
  return result.success ? undefined : result.error.issues[0]?.message;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NuevoClienteModal({
  open,
  onClose,
  onSuccess,
}: NuevoClienteModalProps) {
  const [step, setStep] = useState<Step>("cliente");

  const [clienteForm, setClienteForm] =
    useState<NuevoClienteFormData>(initialClienteForm);
  const [clienteErrors, setClienteErrors] = useState<ClienteFormErrors>({});
  const [clienteTouched, setClienteTouched] = useState<Record<string, boolean>>(
    {},
  );

  const [usuarioForm, setUsuarioForm] =
    useState<UsuarioClienteFormData>(initialUsuarioForm);
  const [usuarioErrors, setUsuarioErrors] = useState<UsuarioFormErrors>({});
  const [usuarioTouched, setUsuarioTouched] = useState<Record<string, boolean>>(
    {},
  );

  const [loading, setLoading] = useState(false);

  // Reset total al abrir
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStep("cliente");
      setClienteForm(initialClienteForm);
      setClienteErrors({});
      setClienteTouched({});
      setUsuarioForm(initialUsuarioForm);
      setUsuarioErrors({});
      setUsuarioTouched({});
    }
  }, [open]);

  // --- Step cliente: handlers ---
  async function handleClienteChange(
    field: keyof NuevoClienteFormData,
    value: string,
  ) {
    setClienteForm((prev) => ({ ...prev, [field]: value }));
    if (clienteTouched[field]) {
      const error = await validateClienteField(field, value);
      setClienteErrors((prev) => ({ ...prev, [field]: error }));
    }
  }

  async function handleClienteBlur(field: keyof NuevoClienteFormData) {
    setClienteTouched((prev) => ({ ...prev, [field]: true }));
    const error = await validateClienteField(field, clienteForm[field]);
    setClienteErrors((prev) => ({ ...prev, [field]: error }));
  }

  async function handleAvanzarAUsuario() {
    try {
      await nuevoClienteSchema.parseAsync(clienteForm);
      setClienteErrors({});
      setStep("usuario"); // solo avanza de paso, no crea nada todavía
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: ClienteFormErrors = {};
        err.issues.forEach((e) => {
          const field = e.path[0] as keyof NuevoClienteFormData;
          newErrors[field] = e.message;
        });
        setClienteErrors(newErrors);
        setClienteTouched({
          name: true,
          razonSocial: true,
          email: true,
          telefono: true,
          fechaAlta: true,
        });
        toast.error("Por favor, corrige los errores en el formulario");
      }
    }
  }

  // --- Step usuario: handlers ---
  function handleUsuarioChange(
    field: keyof UsuarioClienteFormData,
    value: string,
  ) {
    setUsuarioForm((prev) => ({ ...prev, [field]: value }));
    if (usuarioTouched[field]) {
      const error = validateUsuarioField(field, value);
      setUsuarioErrors((prev) => ({ ...prev, [field]: error }));
    }
  }

  function handleUsuarioBlur(field: keyof UsuarioClienteFormData) {
    setUsuarioTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateUsuarioField(field, usuarioForm[field]);
    setUsuarioErrors((prev) => ({ ...prev, [field]: error }));
  }

  // --- Submit final: acá se llama al endpoint combinado ---
  async function handleSubmitFinal() {
    try {
      const validatedUsuario = await usuarioClienteSchema.parseAsync({
        ...usuarioForm,
        email: clienteForm.email,
        fullName: clienteForm.name,
      });
      setUsuarioErrors({});
      setLoading(true);

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: {
            name: clienteForm.name,
            legal_name: clienteForm.razonSocial,
            email: clienteForm.email,
            phone: clienteForm.telefono,
            created_at: clienteForm.fechaAlta,
          },
          usuario: validatedUsuario,
        }),
      });

      if (!response.ok) {
        const body = await response
          .json()
          .catch(() => ({ error: "Error desconocido" }));
        toast.error("No se pudo crear el cliente", {
          description: body.error ?? "Error desconocido",
        });
        return; // no cerramos el modal, dejamos que corrija
      }

      toast.success("Cliente y usuario creados exitosamente");
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: UsuarioFormErrors = {};
        err.issues.forEach((e) => {
          const field = e.path[0] as keyof UsuarioClienteFormData;
          newErrors[field] = e.message;
        });
        setUsuarioErrors(newErrors);
        setUsuarioTouched({ fullName: true, email: true, password: true });
        toast.error("Por favor, corrige los errores en el formulario");
      } else {
        console.error("Error al crear cliente + usuario:", err);
        toast.error("Error al crear el cliente");
      }
    } finally {
      setLoading(false);
    }
  }

  function inputClassCliente(field: keyof NuevoClienteFormData) {
    return `w-full h-10 px-3 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
      clienteErrors[field] && clienteTouched[field]
        ? "border-red-500 bg-red-50 focus:ring-red-200"
        : "border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
    }`;
  }

  function inputClassUsuario(field: keyof UsuarioClienteFormData) {
    return `w-full h-10 px-3 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
      usuarioErrors[field] && usuarioTouched[field]
        ? "border-red-500 bg-red-50 focus:ring-red-200"
        : "border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
    }`;
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={
        step === "cliente" ? "Nuevo cliente" : "Crear acceso para el cliente"
      }
      description={
        step === "cliente"
          ? "Empezá creando el cliente. Después le vas a poder asignar un paquete."
          : `Creá el usuario con el que ${clienteForm.name} va a poder ingresar al portal.`
      }
      actions={
        step === "cliente"
          ? [
              { label: "Cancelar", onClick: onClose, variant: "secondary" },
              {
                label: "Siguiente",
                onClick: handleAvanzarAUsuario,
                variant: "primary",
              },
            ]
          : [
              {
                label: "Atrás",
                onClick: () => setStep("cliente"),
                variant: "secondary",
              },
              {
                label: "Crear cliente",
                onClick: handleSubmitFinal,
                variant: "primary",
                loading,
                loadingLabel: "Creando...",
              },
            ]
      }
    >
      {step === "cliente" ? (
        <>
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre del cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Estudio Norte"
              value={clienteForm.name}
              onChange={(e) => handleClienteChange("name", e.target.value)}
              onBlur={() => handleClienteBlur("name")}
              className={inputClassCliente("name")}
            />
            {clienteErrors.name && clienteTouched.name && (
              <p className="text-xs text-red-500 mt-1">{clienteErrors.name}</p>
            )}
            <p className="text-xs text-gris-kurve-dark mt-1">
              Este nombre se mostrará en todo el sistema.
            </p>
          </div>

          {/* Razón social + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Razón social
              </label>
              <input
                type="text"
                placeholder="Razón social (opcional)"
                value={clienteForm.razonSocial}
                onChange={(e) =>
                  handleClienteChange("razonSocial", e.target.value)
                }
                onBlur={() => handleClienteBlur("razonSocial")}
                className={inputClassCliente("razonSocial")}
              />
              {clienteErrors.razonSocial && clienteTouched.razonSocial && (
                <p className="text-xs text-red-500 mt-1">
                  {clienteErrors.razonSocial}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email de contacto <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="contacto@empresa.com"
                value={clienteForm.email}
                onChange={(e) => handleClienteChange("email", e.target.value)}
                onBlur={() => handleClienteBlur("email")}
                className={inputClassCliente("email")}
              />
              {clienteErrors.email && clienteTouched.email && (
                <p className="text-xs text-red-500 mt-1">
                  {clienteErrors.email}
                </p>
              )}
            </div>
          </div>

          {/* Teléfono + Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+54 11 0000-0000"
                value={clienteForm.telefono}
                onChange={(e) =>
                  handleClienteChange("telefono", e.target.value)
                }
                onBlur={() => handleClienteBlur("telefono")}
                className={inputClassCliente("telefono")}
              />
              {clienteErrors.telefono && clienteTouched.telefono && (
                <p className="text-xs text-red-500 mt-1">
                  {clienteErrors.telefono}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha de alta <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={clienteForm.fechaAlta}
                onChange={(e) =>
                  handleClienteChange("fechaAlta", e.target.value)
                }
                onBlur={() => handleClienteBlur("fechaAlta")}
                className={inputClassCliente("fechaAlta")}
              />
              {clienteErrors.fechaAlta && clienteTouched.fechaAlta && (
                <p className="text-xs text-red-500 mt-1">
                  {clienteErrors.fechaAlta}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Email — solo lectura, viene del cliente */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email de acceso
            </label>
            <input
              type="email"
              value={clienteForm.email}
              disabled
              className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-gray-100 text-gris-kurve-dark cursor-not-allowed"
            />
            <p className="text-xs text-gris-kurve-dark mt-1">
              Se usa el mismo email de contacto del cliente.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={usuarioForm.password}
              onChange={(e) => handleUsuarioChange("password", e.target.value)}
              onBlur={() => handleUsuarioBlur("password")}
              className={inputClassUsuario("password")}
            />
            {usuarioErrors.password && usuarioTouched.password && (
              <p className="text-xs text-red-500 mt-1">
                {usuarioErrors.password}
              </p>
            )}
          </div>
        </>
      )}
    </BaseModal>
  );
}
