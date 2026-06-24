"use member";
import { useState, useEffect } from "react";
import { z } from "zod";
import { BaseModal } from "./ModalBase";
import { toast } from "sonner";

// ── Schema ────────────────────────────────────────────────────────────────────

const editarMiembroSchema = z.object({
  full_name: z
    .string()
    .min(1, "El nombre del miembro es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email: z
    .string()
    .email("El email debe ser válido")
    .optional()
    .or(z.literal("")),
  phone: z
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

interface Member {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
  active: boolean;
  created_at: string;
}

export type EditarMiembroFormData = z.infer<typeof editarMiembroSchema>;

interface EditarmiembroModalProps {
  open: boolean;
  onClose: () => void;
  member: Member;
  onSubmit: (data: EditarMiembroFormData) => void | Promise<void>;
}

type FormErrors = Partial<Record<keyof EditarMiembroFormData, string>>;

function buildInitialForm(member: Member): EditarMiembroFormData {
  return {
    full_name: member.full_name ?? "",
    email: member.email ?? "",
    phone: member.phone ?? "",
    fechaAlta: member.created_at ? member.created_at.split("T")[0] : "",
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateField(
  field: keyof EditarMiembroFormData,
  value?: string,
): string | undefined {
  try {
    editarMiembroSchema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .pick({ [field]: true } as any)
      .parse({ [field]: value });
    return undefined;
  } catch (err) {
    if (err instanceof z.ZodError) return err.issues[0]?.message;
    return "Error en validación";
  }
}

export function EditarmiembroModal({
  open,
  onClose,
  member,
  onSubmit,
}: EditarmiembroModalProps) {
  const [form, setForm] = useState<EditarMiembroFormData>(() =>
    buildInitialForm(member),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(buildInitialForm(member));
      setErrors({});
      setTouched({});
    }
  }, [open, member]);

  function handleChange(field: keyof EditarMiembroFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  }

  function handleBlur(field: keyof EditarMiembroFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, form[field]),
    }));
  }

  async function handleSubmit() {
    try {
      const validatedData = editarMiembroSchema.parse(form);
      setErrors({});
      setLoading(true);
      await onSubmit(validatedData);
      toast.success("miembro editado exitosamente");
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        err.issues.forEach((e) => {
          const field = e.path[0] as keyof EditarMiembroFormData;
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
        setTouched({
          full_name: true,
          email: true,
          phone: true,
          fechaAlta: true,
        });
        toast.error("Por favor, corrige los errores del formulario");
      } else {
        toast.error("Error al editar miembro");
      }
    } finally {
      setLoading(false);
    }
  }

  // Clase de input reutilizable
  function inputClass(field: keyof EditarMiembroFormData) {
    return `w-full h-10 px-3 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
      errors[field] && touched[field]
        ? "border-red-500 bg-red-50 focus:ring-red-200"
        : "border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
    }`;
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title="Editar miembro"
      description="Modificá los datos del miembro."
      actions={[
        { label: "Cancelar", onClick: onClose, variant: "secondary" },
        {
          label: "Modificar miembro",
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
          Nombre del miembro <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Estudio Norte"
          value={form.full_name}
          onChange={(e) => handleChange("full_name", e.target.value)}
          onBlur={() => handleBlur("full_name")}
          className={inputClass("full_name")}
        />
        {errors.full_name && touched.name && (
          <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
        )}
        <p className="text-xs text-gris-kurve-dark mt-1">
          Este nombre se mostrará en todo el sistema.
        </p>
      </div>

      {/* Razón social + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Teléfono
          </label>
          <input
            type="tel"
            placeholder="+54 11 0000-0000"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            className={inputClass("phone")}
          />
          {errors.phone && touched.telefono && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Teléfono + Fecha */}
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
    </BaseModal>
  );
}
