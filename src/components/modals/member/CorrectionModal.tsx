"use client";
import { useState } from "react";
import { BaseModal } from "@/components/modals/ModalBase";
import { Info } from "lucide-react";
import {
  ActivityLogWithRelations,
  useOrderedTaskSubtypes,
} from "@/hooks/middleware";

// Valores exactos del enum `editable_field` de la DB
export type EditableField =
  | "hours"
  | "subtype_id"
  | "log_date"
  | "notes"
  | "pieces_count";

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

export interface AprovedCorrectionData {
  id: string;
  activity_log_id: string; // FK → activity_logs
  field_name: EditableField; // enum editable_field
  old_value: string; // valor actual (text)
  new_value: string; // valor corregido (text)
  reason: string; // nullable en la DB, pero lo pedimos igual
}

const EDITABLE_FIELDS: { value: EditableField; label: string }[] = [
  { value: "hours", label: "Horas" },
  { value: "subtype_id", label: "Tarea" },
  { value: "log_date", label: "Fecha" },
];

const OLD_VALUE_MAP: Record<
  EditableField,
  (a: ActivityLogWithRelations) => string
> = {
  hours: (a) => String(a.hours ?? ""),
  subtype_id: (a) => String(a.task_subtypes?.name ?? ""),
  log_date: (a) => a.log_date ?? "",
  notes: (a) => a.notes ?? "",
  pieces_count: (a) => String(a.pieces_count ?? ""),
};

export function CorrectionModal({
  open,
  onClose,
  activity,
  onSubmit,
}: CorrectionModalProps) {
  const [fieldName, setFieldName] = useState<EditableField | "">("");
  const [valuesByField, setValuesByField] = useState<Record<string, string>>(
    {},
  );

  const newValue = valuesByField[fieldName] ?? "";
  const setNewValue = (val: string) =>
    setValuesByField((prev) => ({ ...prev, [fieldName]: val }));
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { orderedSubtypes } = useOrderedTaskSubtypes();
  const editableFields: { value: EditableField; label: string }[] = [
    { value: "hours", label: "Horas" },
    { value: "subtype_id", label: "Tarea" },
    { value: "log_date", label: "Fecha" },
    { value: "pieces_count" as const, label: "Cantidad de piezas" },
  ];
  const [errorsByField, setErrorsByField] = useState<
    Record<string, string | null>
  >({});

  const fieldError = errorsByField[fieldName] ?? null;
  const setFieldError = (err: string | null) =>
    setErrorsByField((prev) => ({ ...prev, [fieldName]: err }));

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
          {editableFields.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

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
            {fieldName === "subtype_id" ? (
              <select
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                disabled={!fieldName}
                className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-verde-kurve disabled:bg-muted disabled:cursor-not-allowed"
              >
                <option value="">Selecciona la nueva tarea</option>
                {orderedSubtypes.map((tarea) => (
                  <option key={tarea.id} value={tarea.task_subtype_id}>
                    {tarea.name}
                  </option>
                ))}
              </select>
            ) : fieldName === "notes" ? (
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Ej: Falta el renderizado de..."
                disabled={!fieldName}
                className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-verde-kurve disabled:bg-muted disabled:cursor-not-allowed"
              />
            ) : fieldName === "log_date" ? (
              <>
                <input
                  type="date"
                  value={newValue}
                  min={(() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 9);
                    return d.toISOString().split("T")[0];
                  })()}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    const minDate = new Date();
                    minDate.setDate(minDate.getDate() - 9);
                    minDate.setHours(0, 0, 0, 0);
                    if (selected < minDate) {
                      setFieldError(
                        "No se permiten fechas anteriores a 7 días hábiles",
                      );
                    } else {
                      setFieldError(null);
                      setNewValue(e.target.value);
                    }
                  }}
                  className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                />
                {fieldError && (
                  <p className="text-xs text-red-500">{fieldError}</p>
                )}
              </>
            ) : fieldName === "hours" ? (
              <>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < 0.5) {
                      setFieldError("Mínimo 0.5 horas");
                    } else if (val > 12) {
                      setFieldError("Máximo 12 horas");
                    } else {
                      setFieldError(null);
                      setNewValue(e.target.value);
                    }
                  }}
                  min={0.5}
                  max={12}
                  step={0.5}
                  placeholder="Ej: 2.5"
                  className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                />
                {fieldError && (
                  <p className="text-xs text-red-500">{fieldError}</p>
                )}
              </>
            ) : fieldName === "pieces_count" ? (
              <input
                type="number"
                value={newValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val < 1) {
                    setFieldError("Ingresa al menos 1 pieza");
                  } else {
                    setFieldError(null);
                    setNewValue(e.target.value);
                  }
                }}
                min={1}
                step={1}
                placeholder="Ej: 3"
                className="px-3 py-2.5 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-verde-kurve"
              />
            ) : null}
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
