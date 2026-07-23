"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { BaseModal } from "./ModalBase";
import { toast } from "sonner";
import { useTaskTypes } from "@/hooks/middleware";

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
  task_type_id: z.string().min(1, "El cargo es requerido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
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
  task_type_id: string;
  active: boolean;
  created_at: string;
}

interface ClientOption {
  id: string;
  name: string;
}

export type EditarMiembroFormData = z.infer<typeof editarMiembroSchema>;

export type EditarMiembroSubmitData = Omit<
  EditarMiembroFormData,
  "password"
> & {
  password?: string;
  client_ids?: string[];
};

interface EditarmiembroModalProps {
  open: boolean;
  onClose: () => void;
  member: Member;
  onSubmit: (data: EditarMiembroSubmitData) => void | Promise<void>;
  // Si se pasan clientes, se muestra el multi-select de clientes asignados.
  clients?: ClientOption[];
  assignedClientIds?: string[];
}

type FormErrors = Partial<Record<keyof EditarMiembroFormData, string>>;

function buildInitialForm(member: Member): EditarMiembroFormData {
  return {
    full_name: member.full_name ?? "",
    email: member.email ?? "",
    phone: member.phone ?? "",
    task_type_id: member.task_type_id ?? "",
    password: "",
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
  clients,
  assignedClientIds,
}: EditarmiembroModalProps) {
  const { tasks } = useTaskTypes();
  const [form, setForm] = useState<EditarMiembroFormData>(() =>
    buildInitialForm(member),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(
    assignedClientIds ?? [],
  );
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cambiarContraseña, setCambiarContraseña] = useState(false);

  const showClients = Array.isArray(clients);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(buildInitialForm(member));
      setErrors({});
      setTouched({});
      setSelectedClientIds(assignedClientIds ?? []);
      setCambiarContraseña(false); // ← agregar
      setConfirmPassword(""); // ← agregar
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function toggleClient(clientId: string) {
    setSelectedClientIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId],
    );
  }

  async function handleSubmit() {
    if (form.password && form.password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const validatedData = editarMiembroSchema.parse(form);
      setErrors({});
      setLoading(true);

      const { password, ...rest } = validatedData;

      await onSubmit({
        ...rest,
        ...(password ? { password } : {}),
        ...(showClients ? { client_ids: selectedClientIds } : {}),
      });
      onClose();
    } catch (err) {
      // ...igual que antes
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
      title="Editar integrante"
      description="Modificá los datos del integrante."
      actions={[
        { label: "Cancelar", onClick: onClose, variant: "secondary" },
        {
          label: "Guardar cambios",
          onClick: handleSubmit,
          variant: "primary",
          loading,
          loadingLabel: "Guardando...",
        },
      ]}
    >
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre del integrante <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Juan Pérez"
          value={form.full_name}
          onChange={(e) => handleChange("full_name", e.target.value)}
          onBlur={() => handleBlur("full_name")}
          className={inputClass("full_name")}
        />
        {errors.full_name && touched.full_name && (
          <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>
        )}
        <p className="text-xs text-gris-kurve-dark mt-1">
          Este nombre se mostrará en todo el sistema.
        </p>
      </div>

      {/* Teléfono + Cargo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          {errors.phone && touched.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="task_type_id"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Cargo
          </label>
          <select
            id="task_type_id"
            value={form.task_type_id}
            onChange={(e) => handleChange("task_type_id", e.target.value)}
            onBlur={() => handleBlur("task_type_id")}
            className={inputClass("task_type_id")}
          >
            <option value="">Selecciona el cargo</option>
            {tasks.map((cargo) => (
              <option key={cargo.id} value={cargo.id}>
                {cargo.name}
              </option>
            ))}
          </select>
          {errors.task_type_id && touched.task_type_id && (
            <p className="text-xs text-red-500 mt-1">{errors.task_type_id}</p>
          )}
        </div>
      </div>

      {/* Clientes asignados (solo si se pasan clientes) */}
      {showClients && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Clientes asignados
          </label>
          {clients!.length === 0 ? (
            <p className="text-xs text-gris-kurve-dark">
              No hay clientes disponibles.
            </p>
          ) : (
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted p-2 flex flex-col gap-1">
              {clients!.map((client) => (
                <label
                  key={client.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-background cursor-pointer text-sm text-foreground"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-verde-kurve"
                    checked={selectedClientIds.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                  />
                  {client.name}
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-gris-kurve-dark mt-1">
            {selectedClientIds.length}{" "}
            {selectedClientIds.length === 1
              ? "cliente seleccionado"
              : "clientes seleccionados"}
          </p>

          <div className="flex items-center gap-2 mt-4">
            <label
              htmlFor="asignar-cliente"
              className="text-sm font-medium text-foreground select-none cursor-pointer"
            >
              Desea cambiar la contraseña?
            </label>
            <input
              id="asignar-cliente"
              type="checkbox"
              checked={cambiarContraseña}
              onChange={(e) => setCambiarContraseña(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-verde-kurve"
            />
          </div>
          {/* Nueva contraseña (opcional) */}
          {cambiarContraseña ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  placeholder="Dejar en blanco para no cambiar"
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
          ) : null}
        </div>
      )}
    </BaseModal>
  );
}
