"use client";
import { useState } from "react";
import { BaseModal } from "@/components/modals/ModalBase";
import { Info } from "lucide-react";
import { ActivityLogWithRelations, useTaskTypes } from "@/hooks/middleware";

// Valores exactos del enum `editable_field` de la DB
export type EditableField = "hours" | "task_type_id" | "log_date" | "notes";

interface ActivityLog {
  id: string;
  clients?: { name: string };
  task_types?: { name: string };
  hours?: number;
  pieces_count?: number;
  status?: string;
  log_date?: string;
}

interface CorrectionModalProps {
  open: boolean;
  onClose: () => void;
  activity: ActivityLogWithRelations | null;
  onSubmit?: (data: CorrectionFormData) => Promise<void>;
}

// Refleja exactamente las columnas NOT NULL de la tabla correction_requests
export interface CorrectionFormData {
  activity_log_id: string; // FK → activity_logs
  field_name: EditableField; // enum editable_field
  old_value: string; // valor actual (text)
  new_value: string; // valor corregido (text)
  reason: string; // nullable en la DB, pero lo pedimos igual
}

const EDITABLE_FIELDS: { value: EditableField; label: string }[] = [
  { value: "hours", label: "Horas" },
  { value: "task_type_id", label: "Tarea" },
  { value: "log_date", label: "Fecha" },
];

const OLD_VALUE_MAP: Record<
  EditableField,
  (a: ActivityLogWithRelations) => string
> = {
  hours: (a) => String(a.hours ?? ""),
  task_type_id: (a) => String(a.task_types?.name ?? ""),
  log_date: (a) => a.log_date ?? "",
  notes: (a) => a.notes ?? "",
};

export function CorrectionModal({
  open,
  onClose,
  activity,
  onSubmit,
}: CorrectionModalProps) {
  const [fieldName, setFieldName] = useState<EditableField | "">("");
  const [newValue, setNewValue] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { tasks, loadingTasks } = useTaskTypes();

  const oldValue =
    activity && fieldName ? OLD_VALUE_MAP[fieldName](activity) : "";

  const isValid = fieldName !== "" && newValue.trim() !== "";

  function handleClose() {
    setFieldName("");
    setNewValue("");
    setReason("");
    onClose();
  }

  async function handleSubmit() {
    if (!activity || !isValid || !fieldName) return;
    setLoading(true);
    try {
      await onSubmit?.({
        activity_log_id: activity.id,
        field_name: fieldName,
        old_value: oldValue,
        new_value: newValue,
        reason,
      });
      handleClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <BaseModal
      open={open}
      onClose={handleClose}
      title="Solicitar corrección"
      description="Completá los datos para enviar tu solicitud de corrección."
      maxWidth="560px"
      footerNote={
        <span className="flex items-center gap-1.5 text-xs text-gris-kurve-dark">
          <Info size={14} />
          Campos con <span className="text-red-500 font-medium">*</span> son
          obligatorios
        </span>
      }
      actions={[
        {
          label: "Cancelar",
          onClick: handleClose,
          variant: "secondary",
        },
        {
          label: "Enviar solicitud",
          loadingLabel: "Enviando...",
          onClick: handleSubmit,
          variant: "primary",
          disabled: !isValid,
          loading,
        },
      ]}
    >
      {/* Campo a corregir (field_name → enum editable_field) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Campo a corregir <span className="text-red-500">*</span>
        </label>
        <select
          className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-verde-kurve"
          value={fieldName}
          onChange={(e) => {
            setFieldName(e.target.value as EditableField);
            setNewValue("");
          }}
        >
          <option value="">Seleccionar campo</option>
          {EDITABLE_FIELDS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* old_value (auto) / new_value */}
      {fieldName ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Valor actual
            </label>
            <input
              type="text"
              disabled
              value={oldValue}
              className="px-3 py-2.5 border border-border rounded-lg text-sm cursor-not-allowed bg-gris-kurve-light text-gray-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Valor correcto <span className="text-red-500">*</span>
            </label>
            <select
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={!fieldName}
              className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-verde-kurve disabled:bg-muted disabled:cursor-not-allowed"
            >
              <option value="">Selecciona la nueva tarea</option>
              {tasks.map((tarea) => (
                <option key={tarea.id} value={tarea.id}>
                  {tarea.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {/* reason (nullable en DB, pero recomendado) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Motivo</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describí por qué necesitás esta corrección..."
          rows={4}
          className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-verde-kurve resize-none"
        />
      </div>
    </BaseModal>
  );
}
