"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BaseModal } from "../../ModalBase";
import { PackageData } from "@/hooks/middleware";

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: PackageData | null;
  onSave: (updated: PackageData) => void;
}

const PackageFormModal = ({
  isOpen,
  onClose,
  pkg,
  onSave,
}: PackageFormModalProps) => {
  const esNuevo = pkg === null;
  const [name, setName] = useState(pkg?.name ?? "");
  const [hours, setHours] = useState(pkg?.total_hours?.toString() ?? "");
  const [piezas, setPiezas] = useState(pkg?.total_pieces?.toString() ?? "");
  const [precio, setPrecio] = useState(pkg?.price?.toString() ?? "");

  const isValid = name.trim() && hours.trim();

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      ...pkg,
      id: pkg?.id ?? "",
      client_id: pkg?.client_id ?? "",
      name: name.trim(),
      total_hours: Number(hours),
      total_pieces: piezas ? Number(piezas) : null,
      status: pkg?.status ?? "active",
      price: precio ? Number(precio) : 0,
      start_date: pkg?.start_date ?? "",
      end_date: pkg?.end_date ?? "",
      created_at: pkg?.created_at ?? "",
      block_on_limit: pkg?.block_on_limit ?? false,
    });
    onClose();
  };

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
          disabled: !isValid,
        },
      ]}
    >
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Nombre del paquete <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Pack Mensual Básico"
          className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
        />
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
            className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
          />
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
            className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
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
          className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
        />
      </div>
    </BaseModal>
  );
};

export default PackageFormModal;
