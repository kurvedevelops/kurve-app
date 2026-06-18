"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BaseModal } from "../../ModalBase";

type Package = {
  id: number;
  name: string;
  hours: string;
  piezas: number;
  precio: number;
  fechaInicial: string;
  fechaFinal: string | null;
  clients: number;
  estado: boolean;
};

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package | null;
  onSave: (updated: Package) => void;
}

const PackageFormModal = ({
  isOpen,
  onClose,
  pkg,
  onSave,
}: PackageFormModalProps) => {
  const esNuevo = pkg === null;
  const [name, setName] = useState(pkg?.name ?? "");
  const [hours, setHours] = useState(pkg?.hours ?? "");
  const [piezas, setPiezas] = useState(pkg?.piezas?.toString() ?? "");
  const [precio, setPrecio] = useState(pkg?.precio?.toString() ?? "");
  const [fechaInicial, setFechaInicial] = useState(pkg?.fechaInicial ?? "");
  const [fechaFinal, setFechaFinal] = useState(pkg?.fechaFinal ?? "");
  const [estado, setEstado] = useState(pkg?.estado ?? true);

  const isValid = name.trim() && hours.trim() && fechaInicial.trim();

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      id: pkg?.id ?? Date.now(),
      name: name.trim(),
      hours: hours.trim(),
      piezas: Number(piezas),
      precio: Number(precio),
      fechaInicial: fechaInicial.trim(),
      fechaFinal: fechaFinal.trim() || null,
      clients: pkg?.clients ?? 0,
      estado,
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
      <div className="">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Horas mensuales <span className="text-red-500">*</span>
          </label>
          <Input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="Ej: 40 hs mensuales"
            className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Entregables
          </label>
          <Input
            type="number"
            value={piezas}
            onChange={(e) => setPiezas(e.target.value)}
            placeholder="Ej: 20"
            className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fecha inicial <span className="text-red-500">*</span>
          </label>
          <Input
            value={fechaInicial}
            onChange={(e) => setFechaInicial(e.target.value)}
            placeholder="dd/mm/aaaa"
            className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
          />
        </div>
        <div className="">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Fecha final
          </label>
          <Input
            value={fechaFinal}
            onChange={(e) => setFechaFinal(e.target.value)}
            placeholder="Vacío = Indefinido"
            className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
          />
        </div>
      </div>

      <div className="">
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Precio (ARS)
        </label>
        <Input
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Ej: 200000"
          className="w-full h-10 px-3 text-sm rounded-lg border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
        />
      </div>

      <div className="flex items-center justify-between py-1">
        <div>
          <p className="block text-sm font-medium text-foreground mb-1.5">Estado</p>
          <p className="text-xs text-gray-400">
            Los paquetes inactivos no se pueden asignar
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEstado(!estado)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            estado ? "bg-verde-kurve" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              estado ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </BaseModal>
  );
};

export default PackageFormModal;
