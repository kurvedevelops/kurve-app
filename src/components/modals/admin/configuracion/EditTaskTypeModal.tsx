import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { TaskType } from "@/hooks/middleware";
import { toast } from "sonner";

interface EditTaskTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: TaskType | null;
  onSave: (updated: TaskType) => void;
}

const EditTaskTypeModal = ({
  isOpen,
  onClose,
  taskType,
  onSave,
}: EditTaskTypeModalProps) => {
  const esNuevo = taskType === null;
  const [name, setName] = useState(taskType?.name ?? "");
  const [active, setActive] = useState(taskType?.active ?? true);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: taskType?.id ?? crypto.randomUUID(),
      name: name.trim(),
      active,
    });
    onClose();
    toast.success("Tarea guardada exitosamente");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {esNuevo ? "Nueva tipo de tarea" : "Editar tipo de tarea"}
      </h2>

      <div className="space-y-5">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-11 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
            placeholder="Ej: Diseño"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            <p className="text-xs text-gray-400">
              Las tareas inactivas no aparecen en el formulario
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
          {esNuevo ? "Agregar tarea" : "Guardar cambios"}
        </Button>
      </div>
    </Modal>
  );
};

export default EditTaskTypeModal;
