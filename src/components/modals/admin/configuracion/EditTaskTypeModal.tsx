// components/modals/EditTaskTypeModal.tsx
import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";


type TaskType = {
  id: number;
  nombre: string;
  cuentaComoPieza: boolean;
  rolesPermitidos: string[];
  activo: boolean;
};

const ROLES_DISPONIBLES = ["Diseño", "Social Media", "Community", "Coordinación", "Fotografía", "Edición de video"];

interface EditTaskTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskType: TaskType | null;
  onSave: (updated: TaskType) => void;
}

const EditTaskTypeModal = ({ isOpen, onClose, taskType, onSave }: EditTaskTypeModalProps) => {
  const esNuevo = taskType === null;
  const [nombre, setNombre] = useState(taskType?.nombre ?? "");
  const [cuentaComoPieza, setCuentaComoPieza] = useState(taskType?.cuentaComoPieza ?? false);
  const [rolesPermitidos, setRolesPermitidos] = useState<string[]>(taskType?.rolesPermitidos ?? []);
  const [activo, setActivo] = useState(taskType?.activo ?? true);

  useEffect(() => {
    if (taskType) {
      setNombre(taskType.nombre);
      setCuentaComoPieza(taskType.cuentaComoPieza);
      setRolesPermitidos(taskType.rolesPermitidos);
      setActivo(taskType.activo);
    }
  }, [taskType]);

  const toggleRol = (rol: string) => {
    setRolesPermitidos((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  const handleSave = () => {
    if (!nombre.trim()) return;
    onSave({
      id: taskType?.id ?? Date.now(),
      nombre: nombre.trim(),
      cuentaComoPieza,
      rolesPermitidos,
      activo,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">{esNuevo ? "Nueva tipo de tarea" : "Editar tipo de tarea"}</h2>

      <div className="space-y-5">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-2 h-11 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
            placeholder="Ej: Diseño"
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Cuenta como pieza</p>
            <p className="text-xs text-gray-400">Suma al contador de piezas del cliente</p>
          </div>
          <button
            type="button"
            onClick={() => setCuentaComoPieza(!cuentaComoPieza)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              cuentaComoPieza ? "bg-verde-kurve" : "bg-gray-200"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              cuentaComoPieza ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Roles permitidos</p>
          <div className="flex flex-wrap gap-2">
            {ROLES_DISPONIBLES.map((rol) => {
              const seleccionado = rolesPermitidos.includes(rol);
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
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            <p className="text-xs text-gray-400">Las tareas inactivas no aparecen en el formulario</p>
          </div>
          <button
            type="button"
            onClick={() => setActivo(!activo)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              activo ? "bg-verde-kurve" : "bg-gray-200"
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              activo ? "translate-x-6" : "translate-x-1"
            }`} />
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          className="bg-verde-kurve text-white hover:bg-verde-kurve-dark"
          onClick={handleSave}
          disabled={!nombre.trim()}
        >
          {esNuevo ? "Agregar tarea" : "Guardar cambios"}
        </Button>
      </div>
    </Modal>
  );
};

export default EditTaskTypeModal;