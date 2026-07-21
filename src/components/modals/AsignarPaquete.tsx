"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { BaseModal } from "./ModalBase";
import { toast } from "sonner";
import { ConfirmAsignarPaqueteModal } from "./ConfirmarAsignacionModal";
import { usePackages } from "@/hooks/middleware"; // ajustar si el hook tiene otro nombre/ruta

// ── Schema ────────────────────────────────────────────────────────────────────

const asignarPaqueteSchema = z.object({
  packageId: z.string().uuid().optional(), // presente si se está usando un paquete existente
  nombrePaquete: z
    .string()
    .min(1, "El nombre del paquete es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  horasTotales: z.number().min(1, "Las horas deben ser mayores a 0"),
  precio: z
    .number()
    .min(0, "El precio no puede ser negativo")
    .optional()
    .default(0),
  fechaInicio: z
    .string()
    .min(1, "La fecha de inicio es requerida")
    .refine(
      (date) => new Date(date) <= new Date(),
      "La fecha no puede ser en el futuro",
    ),
  fechaFin: z
    .string()
    .optional()
    .or(z.literal("").transform((v) => v ?? "")),
  publicaciones: z.record(
    z.string(),
    z.number().min(0, "No puede ser negativo"),
  ),
});

export type AsignarPaqueteFormData = z.infer<typeof asignarPaqueteSchema>;

interface AsignarPaqueteModalProps {
  open: boolean;
  clientName: string;
  clientId: string;
  onClose: () => void;
  onSubmit: (data: AsignarPaqueteFormData) => void | Promise<void>;
  categorias?: Array<{ id: string; nombre: string; descripcion: string }>;
}

type FormErrors = Partial<Record<keyof AsignarPaqueteFormData, string>>;

const initialForm: AsignarPaqueteFormData = {
  packageId: undefined,
  nombrePaquete: "",
  horasTotales: 0,
  precio: 0,
  fechaInicio: new Date().toISOString().split("T")[0],
  fechaFin: "",
  publicaciones: {
    total: 0,
  },
};

function validateField(
  field: keyof AsignarPaqueteFormData,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any,
): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    asignarPaqueteSchema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .pick({ [field]: true } as any)
      .parse({ [field]: value });
    return undefined;
  } catch (err) {
    if (err instanceof z.ZodError) return err.issues[0]?.message;
    return "Error en validación";
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AsignarPaqueteModal({
  open,
  clientName,
  clientId,
  onClose,
  onSubmit,
}: AsignarPaqueteModalProps) {
  const [modo, setModo] = useState<"nuevo" | "existente">("nuevo");
  const { packages } = usePackages();

  const paquetesBase = packages.filter((p) => !p.client_id);

  const [form, setForm] = useState<AsignarPaqueteFormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [validatedData, setValidatedData] =
    useState<AsignarPaqueteFormData | null>(null);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialForm);
      setModo("nuevo");
      setErrors({});
      setTouched({});
    }
  }, [open]);

  function handleChange(field: keyof AsignarPaqueteFormData, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  }

  function handleBlur(field: keyof AsignarPaqueteFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, form[field]),
    }));
  }

  function handleModoChange(nuevoModo: "nuevo" | "existente") {
    setModo(nuevoModo);
    setForm(initialForm);
    setErrors({});
    setTouched({});
  }

  function handleSeleccionarPaquete(packageId: string) {
    if (!packageId) {
      setForm(initialForm);
      return;
    }
    const pkg = packages.find((p) => p.id === packageId);
    if (!pkg) return;

    setForm({
      packageId: pkg.id,
      nombrePaquete: pkg.name,
      horasTotales: pkg.total_hours,
      precio: pkg.price ?? 0,
      fechaInicio: pkg.start_date || new Date().toISOString().split("T")[0],
      fechaFin: pkg.end_date ?? "",
      publicaciones: { total: pkg.total_pieces ?? 0 },
    });
    setErrors({});
    setTouched({});
  }

  async function handleSubmit() {
    try {
      const validatedData = asignarPaqueteSchema.parse(form);
      setErrors({});
      setValidatedData(validatedData);
      setShowConfirm(true);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        err.issues.forEach((e) => {
          const field = e.path[0] as keyof AsignarPaqueteFormData;
          newErrors[field] = e.message;
        });
        setErrors(newErrors);
        setTouched({
          nombrePaquete: true,
          horasTotales: true,
          precio: true,
          fechaInicio: true,
          fechaFin: true,
          publicaciones: true,
        });
        toast.error("Por favor, corrige los errores en el formulario");
      }
    }
  }

  async function handleConfirmSubmit() {
    if (!validatedData) return;
    try {
      setLoading(true);
      await onSubmit(validatedData);
      toast.success("Paquete asignado exitosamente");
      setShowConfirm(false);
      onClose();
    } catch (error) {
      toast.error("Error al asignar paquete");
    } finally {
      setLoading(false);
    }
  }

  function inputClass(field: keyof AsignarPaqueteFormData) {
    return `w-full h-10 px-3 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
      errors[field] && touched[field]
        ? "border-red-500 bg-red-50 focus:ring-red-200"
        : "border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
    }`;
  }

  return (
    <>
      <BaseModal
        open={open}
        onClose={onClose}
        title="Asignar paquete"
        description={`Definí las horas totales y la cantidad de publicaciones para ${clientName}`}
        actions={[
          { label: "Cancelar", onClick: onClose, variant: "secondary" },
          {
            label: "Revisar y crear",
            onClick: handleSubmit,
            variant: "primary",
          },
        ]}
      >
        {/* Selector de modo */}
        <div className="flex gap-2 p-1 rounded-lg bg-muted w-fit">
          <button
            type="button"
            onClick={() => handleModoChange("nuevo")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              modo === "nuevo"
                ? "bg-background text-foreground shadow-sm"
                : "text-gris-kurve-dark"
            }`}
          >
            Crear nuevo
          </button>
          <button
            type="button"
            onClick={() => handleModoChange("existente")}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              modo === "existente"
                ? "bg-background text-foreground shadow-sm"
                : "text-gris-kurve-dark"
            }`}
          >
            Usar paquete existente
          </button>
        </div>

        {/* Selector de paquete existente */}
        {modo === "existente" && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Paquete <span className="text-red-500">*</span>
            </label>
            <select
              value={form.packageId ?? ""}
              onChange={(e) => handleSeleccionarPaquete(e.target.value)}
              className={inputClass("packageId")}
            >
              <option value="">Seleccioná un paquete</option>
              {paquetesBase.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {pkg.client_id ? pkg.client_id : "Paquete base"}
                </option>
              ))}
            </select>
            {paquetesBase.length === 0 && (
              <p className="text-xs text-gris-kurve-dark mt-1">
                No hay paquetes disponibles. Creá uno nuevo.
              </p>
            )}
          </div>
        )}

        {/* Nombre del paquete */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre del paquete <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ej: Paquete Mensual"
            value={form.nombrePaquete}
            onChange={(e) => handleChange("nombrePaquete", e.target.value)}
            onBlur={() => handleBlur("nombrePaquete")}
            className={inputClass("nombrePaquete")}
            disabled={modo === "existente" && !form.packageId}
          />
          {errors.nombrePaquete && touched.nombrePaquete && (
            <p className="text-xs text-red-500 mt-1">{errors.nombrePaquete}</p>
          )}
        </div>

        {/* Horas totales + Precio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Horas totales <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="Ej: 50"
              value={form.horasTotales || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === "" ? 0 : parseInt(value);
                if (numValue >= 0) {
                  handleChange("horasTotales", numValue);
                }
              }}
              onBlur={() => handleBlur("horasTotales")}
              className={inputClass("horasTotales")}
              min="0"
              disabled={modo === "existente" && !form.packageId}
            />
            {errors.horasTotales && touched.horasTotales && (
              <p className="text-xs text-red-500 mt-1">{errors.horasTotales}</p>
            )}
            <p className="text-xs text-gris-kurve-dark mt-1">
              Horas totales del período del paquete.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Precio (ARS)
            </label>
            <input
              type="number"
              placeholder="Ej: 180000"
              value={form.precio || ""}
              onChange={(e) => {
                const value = e.target.value;
                const numValue = value === "" ? 0 : parseInt(value);
                if (numValue >= 0) {
                  handleChange("precio", numValue);
                }
              }}
              onBlur={() => handleBlur("precio")}
              className={inputClass("precio")}
              min="0"
              disabled={modo === "existente" && !form.packageId}
            />
            {errors.precio && touched.precio && (
              <p className="text-xs text-red-500 mt-1">{errors.precio}</p>
            )}
            <p className="text-xs text-gris-kurve-dark mt-1">
              Opcional, para referencia interna.
            </p>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Inicio
              <span className="ml-1 text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.fechaInicio}
              onChange={(e) => handleChange("fechaInicio", e.target.value)}
              onBlur={() => handleBlur("fechaInicio")}
              className={inputClass("fechaInicio")}
            />
            {errors.fechaInicio && touched.fechaInicio && (
              <p className="text-xs text-red-500 mt-1">{errors.fechaInicio}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fin estimado
            </label>
            <input
              type="date"
              value={form.fechaFin}
              onChange={(e) => handleChange("fechaFin", e.target.value)}
              onBlur={() => handleBlur("fechaFin")}
              className={inputClass("fechaFin")}
            />
            {errors.fechaFin && touched.fechaFin && (
              <p className="text-xs text-red-500 mt-1">{errors.fechaFin}</p>
            )}
          </div>
        </div>

        {/* Piezas por categoría */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Cantidad de publicaciones
          </label>
          <input
            type="number"
            placeholder="Ej: 30"
            value={form.publicaciones["total"] || ""}
            onChange={(e) => {
              const value = parseInt(e.target.value) || 0;
              if (value >= 0) {
                handleChange("publicaciones", {
                  ...form.publicaciones,
                  total: value,
                });
              }
            }}
            onBlur={() => handleBlur("publicaciones")}
            className={inputClass("publicaciones")}
          />
          {errors.publicaciones && touched.publicaciones && (
            <p className="text-xs text-red-500 mt-1">{errors.publicaciones}</p>
          )}
        </div>

        {/* Nota */}
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs text-blue-600">
            {modo === "existente"
              ? "Podés editar los datos del paquete antes de asignarlo."
              : "El cliente verá su consumo en tiempo real"}
          </p>
        </div>
      </BaseModal>
      {validatedData && (
        <ConfirmAsignarPaqueteModal
          open={showConfirm}
          clientName={clientName}
          data={validatedData}
          loading={loading}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
