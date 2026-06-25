import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export type TaskType = {
  id: string;
  name: string;
  active: boolean;
  counts_as_piece: boolean;
  allowed_roles: string[];
};

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
  const [counts_as_piece, setCountsAsPiece] = useState(
    taskType?.counts_as_piece ?? false,
  );
  const [allowed_roles, setAllowedRoles] = useState<string[]>(
    taskType?.allowed_roles ?? [],
  );
  const [active, setActive] = useState(taskType?.active ?? true);

  const toggleRol = (rol: string) => {
    setAllowedRoles((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol],
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: taskType?.id ?? crypto.randomUUID(),
      name: name.trim(),
      counts_as_piece,
      allowed_roles,
      active,
    });
    onClose();
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
            <p className="text-sm font-medium text-gray-700">
              Cuenta como pieza
            </p>
            <p className="text-xs text-gray-400">
              Suma al contador de piezas del cliente
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCountsAsPiece(!counts_as_piece)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              counts_as_piece ? "bg-verde-kurve" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                counts_as_piece ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(taskType?.allowed_roles ?? []).map((rol) => {
            const seleccionado = allowed_roles.includes(rol);
            return (
              <button
                key={rol}
                type="button"
                onClick={() => toggleRol(rol)}
                className={`px-3 py-1 text-xs rounded-full font-medium border transition-colors cursor-pointer ${
                  seleccionado
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {rol}
              </button>
            );
          })}
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
