"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BaseModal } from "../../ModalBase";
import { PackageData, useClients } from "@/hooks/middleware";
import { toast } from "sonner";

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: PackageData | null;
  onSave: (updated: PackageData) => void | Promise<void>;
}

type FormErrors = {
  client_id?: string;
  name?: string;
  hours?: string;
  start_date?: string;
};

const PackageFormModal = ({
  isOpen,
  onClose,
  pkg,
  onSave,
}: PackageFormModalProps) => {
  const esNuevo = pkg === null;
  const { clients } = useClients();

  const [clientId, setClientId] = useState(pkg?.client_id ?? "");
  const [name, setName] = useState(pkg?.name ?? "");
  const [hours, setHours] = useState(pkg?.total_hours?.toString() ?? "");
  const [piezas, setPiezas] = useState(pkg?.total_pieces?.toString() ?? "");
  const [precio, setPrecio] = useState(pkg?.price?.toString() ?? "");
  const [startDate, setStartDate] = useState(pkg?.start_date ?? "");
  const [endDate, setEndDate] = useState(pkg?.end_date ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const activeClients = clients.filter((c) => c.status === "active");

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (esNuevo && !clientId) next.client_id = "Seleccioná un cliente";
    if (!name.trim()) next.name = "El nombre es requerido";
    if (!hours.trim() || Number(hours) <= 0)
      next.hours = "Ingresá las horas totales";
    if (esNuevo && !startDate) next.start_date = "La fecha de inicio es requerida";
    return next;
  }

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Completá los campos requeridos");
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSave({
        ...pkg,
        id: pkg?.id ?? "",
        client_id: esNuevo ? clientId : (pkg?.client_id ?? ""),
        name: name.trim(),
        total_hours: Number(hours),
        total_pieces: piezas ? Number(piezas) : null,
        status: pkg?.status ?? "active",
        price: precio ? Number(precio) : 0,
        start_date: startDate || (pkg?.start_date ?? ""),
        end_date: endDate || null,
        created_at: pkg?.created_at ?? "",
        block_on_limit: pkg?.block_on_limit ?? false,
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background";

  return (
    <BaseModal
      open={isOpen}
      onClose={onClose}
      title={esNuevo ? "Nuevo paquete" : "Editar paquete"}
      description={
        esNuevo
          ? "Completá los datos para crear un nuevo paquete."
          : "Modificá los datos del paquete."
      }
      actions={[
        {
          label: "Cancelar",
          onClick: onClose,
          variant: "secondary",
        },
        {
          label: esNuevo ? "Agregar paquete" : "Guardar cambios",
          onClick: handleSave,
          variant: "primary",
          loading: saving,
          loadingLabel: esNuevo ? "Creando..." : "Guardando...",
        },
      ]}
    >
      {/* Cliente (solo al crear) */}
      {esNuevo && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Cliente <span className="text-red-500">*</span>
          </label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className={inputClass}
          >
            <option value="">Seleccioná un cliente</option>
            {activeClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="text-xs text-red-500 mt-1">{errors.client_id}</p>
          )}
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre del paquete <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Pack Mensual Básico"
          className={inputClass}
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Horas y Entregables */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Horas totales <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min={0}
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Ej: 40"
            className={inputClass}
          />
          {errors.hours && (
            <p className="text-xs text-red-500 mt-1">{errors.hours}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Entregables
          </label>
          <Input
            type="number"
            min={0}
            value={piezas}
            onChange={(e) => setPiezas(e.target.value)}
            placeholder="Ej: 20"
            className={inputClass}
          />
        </div>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Precio (ARS)
        </label>
        <Input
          type="number"
          min={0}
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Ej: 200000"
          className={inputClass}
        />
      </div>

      {/* Fechas (solo al crear) */}
      {esNuevo && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fecha de inicio <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
            {errors.start_date && (
              <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Fecha de fin
            </label>
            <Input
              type="date"
              value={endDate ?? ""}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </BaseModal>
  );
};

export default PackageFormModal;
