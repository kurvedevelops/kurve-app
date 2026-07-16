"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { BaseModal } from "../../ModalBase";
import { toast } from "sonner";
import { linkTypeConfig } from "@/lib/linkTypeConfig";
import type { ClientLink, LinkType } from "@/hooks/middleware";

const clientLinkSchema = z.object({
  type: z.enum(["contract", "drive", "analytics", "custom"], {
    message: "Seleccioná un tipo de link",
  }),
  label: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  url: z
    .string()
    .min(1, "La URL es requerida")
    .url("Ingresá una URL válida (con https://)"),
});

export type ClientLinkFormData = z.infer<typeof clientLinkSchema>;

type FormErrors = Partial<Record<keyof ClientLinkFormData, string>>;

interface ClientLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: ClientLink | null; // null = modo creación, con valor = modo edición
  onSave: (data: ClientLinkFormData) => Promise<void> | void;
}

const initialForm: ClientLinkFormData = {
  type: "custom",
  label: "",
  url: "",
};

function validateField(
  field: keyof ClientLinkFormData,
  value?: string,
): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clientLinkSchema.pick({ [field]: true } as any).parse({ [field]: value });
    return undefined;
  } catch (err) {
    if (err instanceof z.ZodError) return err.issues[0]?.message;
    return "Error en validación";
  }
}
const ClientLinkModal = ({ isOpen, onClose, link, onSave,}: ClientLinkModalProps) => {
  const isEditMode = !!link;

  const [form, setForm] = useState<ClientLinkFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(
        link
          ? { type: link.type, label: link.label, url: link.url }
          : initialForm,
      );
      setErrors({});
      setTouched({});
    }
  }, [isOpen, link]);

  function handleChange(field: keyof ClientLinkFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }

  function handleBlur(field: keyof ClientLinkFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }

  async function handleSubmit() {
    try {
      const validatedData = clientLinkSchema.parse(form);
      setErrors({});
      setLoading(true);
      await onSave(validatedData);
      toast.success(
        isEditMode ? "Link actualizado exitosamente" : "Link creado exitosamente",
      );
      onClose();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        err.issues.forEach((e) => {
          const field = e.path[0] as keyof ClientLinkFormData;
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
        setTouched({ type: true, label: true, url: true });
        toast.error("Por favor, corrige los errores en el formulario");
      } else {
        console.error("Error al guardar link:", err);
        toast.error("Error al guardar el link");
      }
    } finally {
      setLoading(false);
    }
  }

  function inputClass(field: keyof ClientLinkFormData) {
    return `w-full h-10 px-3 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
      errors[field] && touched[field]
        ? "border-red-500 bg-red-50 focus:ring-red-200"
        : "border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
    }`;
  }

  const linkTypes = Object.keys(linkTypeConfig) as LinkType[];

  return (
    <BaseModal
      open={isOpen}
      onClose={onClose}
      title={isEditMode ? "Editar link" : "Nuevo link"}
      description={
        isEditMode
          ? "Modificá los datos del link."
          : "Agregá un nuevo acceso para este cliente."
      }
      actions={[
        { label: "Cancelar", onClick: onClose, variant: "secondary" },
        {
          label: isEditMode ? "Guardar cambios" : "Crear link",
          onClick: handleSubmit,
          variant: "primary",
          loading,
          loadingLabel: isEditMode ? "Guardando..." : "Creando...",
        },
      ]}
    >
      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Tipo de link <span className="text-red-500">*</span>
        </label>
        <select
          value={form.type}
          onChange={(e) => handleChange("type", e.target.value)}
          onBlur={() => handleBlur("type")}
          className={inputClass("type")}
        >
          {linkTypes.map((type) => (
            <option key={type} value={type}>
              {linkTypeConfig[type].label}
            </option>
          ))}
        </select>
        {errors.type && touched.type && (
          <p className="text-xs text-red-500 mt-1">{errors.type}</p>
        )}
      </div>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Contrato firmado"
          value={form.label}
          onChange={(e) => handleChange("label", e.target.value)}
          onBlur={() => handleBlur("label")}
          className={inputClass("label")}
        />
        {errors.label && touched.label && (
          <p className="text-xs text-red-500 mt-1">{errors.label}</p>
        )}
      </div>

      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          placeholder="https://..."
          value={form.url}
          onChange={(e) => handleChange("url", e.target.value)}
          onBlur={() => handleBlur("url")}
          className={inputClass("url")}
        />
        {errors.url && touched.url && (
          <p className="text-xs text-red-500 mt-1">{errors.url}</p>
        )}
      </div>
    </BaseModal>
  );
}

export default ClientLinkModal
