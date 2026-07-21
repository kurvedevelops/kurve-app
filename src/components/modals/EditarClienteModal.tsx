"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { BaseModal } from "./ModalBase";
import { toast } from "sonner";

// ── Schema ────────────────────────────────────────────────────────────────────

const editarClienteSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del cliente es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  razonSocial: z
    .string()
    .max(100, "La razón social no puede exceder 100 caracteres")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .email("El email debe ser válido")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .optional()
    .or(z.literal("")),
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
  status: z.enum(["active", "paused", "ended"] as const, {
    message: "Selecciona un estado válido",
  }),
});

export interface Client {
  id: string;
  name: string;
  email: string | null;
  legal_name: string | null;
  phone: string | null;
  status: "active" | "paused" | "ended";
  created_at: string;
  start_date: string | null;
  end_date: string | null;
}

export type EditarClienteFormData = z.infer<typeof editarClienteSchema>;

export type EditarClienteSubmitData = Omit<
  EditarClienteFormData,
  "password"
> & {
  password?: string;
};

interface EditarClienteModalProps {
  open: boolean;
  onClose: () => void;
  client: Client;
  onSubmit: (data: EditarClienteSubmitData) => void | Promise<void>;
}

type FormErrors = Partial<Record<keyof EditarClienteFormData, string>>;

function buildInitialForm(client: Client): EditarClienteFormData {
  return {
    name: client.name ?? "",
    razonSocial: client.legal_name ?? "",
    email: client.email ?? "",
    password: "",
    telefono: client.phone ?? "",
    fechaAlta: client.created_at ? client.created_at.split("T")[0] : "",
    status: client.status ?? "active",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateField(
  field: keyof EditarClienteFormData,
  value?: string,
): string | undefined {
  try {
    editarClienteSchema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .pick({ [field]: true } as any)
      .parse({ [field]: value });
    return undefined;
  } catch (err) {
    if (err instanceof z.ZodError) return err.issues[0]?.message;
    return "Error en validación";
  }
}

export function EditarClienteModal({
  open,
  onClose,
  client,
  onSubmit,
}: EditarClienteModalProps) {
  const [form, setForm] = useState<EditarClienteFormData>(() =>
    buildInitialForm(client),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cambiarContraseña, setCambiarContraseña] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(buildInitialForm(client));
      setErrors({});
      setTouched({});
    }
  }, [open, client]);

  function handleChange(field: keyof EditarClienteFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  }

  function handleBlur(field: keyof EditarClienteFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, form[field]),
    }));
  }

  async function handleSubmit() {
    if (form.password && form.password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const validatedData = editarClienteSchema.parse(form);
      setErrors({});
      setLoading(true);

      const { password, ...rest } = validatedData;

      await onSubmit({
        ...rest,
        ...(password ? { password } : {}),
      });
      toast.success("Cliente editado exitosamente");
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        err.issues.forEach((e) => {
          const field = e.path[0] as keyof EditarClienteFormData;
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
        setTouched({
          name: true,
          razonSocial: true,
          email: true,
          telefono: true,
          fechaAlta: true,
          status: true,
        });
        toast.error("Por favor, corrige los errores del formulario");
      } else {
        toast.error("Error al editar cliente");
      }
    } finally {
      setLoading(false);
    }
  }

  // Clase de input reutilizable
  function inputClass(field: keyof EditarClienteFormData) {
    return `w-full h-10 px-3 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
      errors[field] && touched[field]
        ? "border-red-500 bg-red-50 focus:ring-red-200"
        : "border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
    }`;
  }

  const statusOptions = [
    {
      value: "active",
      label: "Activo",
      color: "bg-verde-kurve/10 text-verde-kurve",
    },
    {
      value: "paused",
      label: "Pausado",
      color: "bg-gris-kurve-light/50 text-gris-kurve-dark",
    },
  ];

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Editar cliente"
      description="Modificá los datos del cliente."
      actions={[
        { label: "Cancelar", onClick: onClose, variant: "secondary" },
        {
          label: "Modificar cliente",
          onClick: handleSubmit,
          variant: "primary",
          loading,
          loadingLabel: "Modificando...",
        },
      ]}
    >
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre del cliente <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Estudio Norte"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          className={inputClass("name")}
        />
        {errors.name && touched.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
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
            value={form.razonSocial}
            onChange={(e) => handleChange("razonSocial", e.target.value)}
            onBlur={() => handleBlur("razonSocial")}
            className={inputClass("razonSocial")}
          />
          {errors.razonSocial && touched.razonSocial && (
            <p className="text-xs text-red-500 mt-1">{errors.razonSocial}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Email de contacto
          </label>
          <input
            type="email"
            placeholder="contacto@empresa.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={inputClass("email")}
          />
          {errors.email && touched.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email}</p>
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
            value={form.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
            onBlur={() => handleBlur("telefono")}
            className={inputClass("telefono")}
          />
          {errors.telefono && touched.telefono && (
            <p className="text-xs text-red-500 mt-1">{errors.telefono}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fecha de alta <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.fechaAlta}
            onChange={(e) => handleChange("fechaAlta", e.target.value)}
            onBlur={() => handleBlur("fechaAlta")}
            className={inputClass("fechaAlta")}
          />
          {errors.fechaAlta && touched.fechaAlta && (
            <p className="text-xs text-red-500 mt-1">{errors.fechaAlta}</p>
          )}
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Estado <span className="text-red-500">*</span>
        </label>
        <select
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value)}
          onBlur={() => handleBlur("status")}
          className={inputClass("status")}
        >
          <option value="">Selecciona un estado</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.status && touched.status && (
          <p className="text-xs text-red-500 mt-1">{errors.status}</p>
        )}
      </div>

      {/* Cambiar contraseña */}
      <div className="flex items-center gap-2">
        <input
          id="cambiar-contrasena-cliente"
          type="checkbox"
          checked={cambiarContraseña}
          onChange={(e) => setCambiarContraseña(e.target.checked)}
          className="h-4 w-4 rounded border-border accent-verde-kurve"
        />
        <label
          htmlFor="cambiar-contrasena-cliente"
          className="text-sm font-medium text-foreground select-none cursor-pointer"
        >
          ¿Desea cambiar la contraseña?
        </label>
      </div>

      {cambiarContraseña && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nueva contraseña
            </label>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              className={inputClass("password")}
              autoComplete="new-password"
            />
            {errors.password && touched.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Confirmar contraseña
            </label>
            <input
              type="password"
              placeholder="Repetí la nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!form.password}
              className={inputClass("password")}
              autoComplete="new-password"
            />
          </div>
        </div>
      )}
    </BaseModal>
  );
}
