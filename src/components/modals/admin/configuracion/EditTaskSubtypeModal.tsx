import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { TaskSubtype } from "@/hooks/middleware";

interface EditTaskSubtypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtype: TaskSubtype | null;
  onSave: (updated: TaskSubtype) => Promise<void>;
}

const EditTaskSubtypeModal = ({
  isOpen,
  onClose,
  subtype,
  onSave,
}: EditTaskSubtypeModalProps) => {
  const esNuevo = subtype === null;
  const [name, setName] = useState(subtype?.name ?? "");
  const [active, setActive] = useState(subtype?.active ?? true);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: subtype?.id ?? crypto.randomUUID(),
        name: name.trim(),
        active,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {esNuevo ? "Nuevo subtipo de tarea" : "Editar subtipo de tarea"}
      </h2>

      <div className="space-y-5">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-11 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
            placeholder="Ej: Pintura al óleo"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            <p className="text-xs text-gray-400">
              Los subtipos inactivos no aparecen en el formulario
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              active ? "bg-verde-kurve" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                active ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          className="bg-verde-kurve text-white hover:bg-verde-kurve-dark"
          onClick={handleSave}
          disabled={!name.trim()}
        >
          {esNuevo ? "Agregar subtipo" : "Guardar cambios"}
        </Button>
      </div>
    </Modal>
  );
};

export default EditTaskSubtypeModal;
