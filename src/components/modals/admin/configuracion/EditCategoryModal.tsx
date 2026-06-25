import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { PieceCategory } from "@/hooks/middleware";


interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: PieceCategory | null;
  onSave: (updated: PieceCategory) => Promise<void>;
}

const EditCategoryModal = ({
  isOpen,
  onClose,
  category,
  onSave,
}: EditCategoryModalProps) => {
  const esNuevo = category === null;
  const [name, setName] = useState(category?.name ?? "");
  const [active, setActive] = useState(category?.active ?? true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await onSave({
      id: category?.id ?? crypto.randomUUID(),
      name: name.trim(),
      active,
    });
    setLoading(false);
    setName("")
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {esNuevo ? "Agregar nueva categoria" : "Editar categoría"}
      </h2>

      <div className="space-y-5">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700">
            Nombre de categoría
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 h-11 px-3 rounded-lg border border-slate-300 text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
            placeholder="Ej: Post feed"
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-gray-700">Estado</p>
            <p className="text-xs text-gray-400">
              Las categorías inactivas no aparecen en el formulario de registro
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
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          className="bg-verde-kurve text-white hover:bg-verde-kurve-dark"
          onClick={handleSave}
          disabled={loading || !name.trim()}
        >
          {loading ? "Guardando..." : esNuevo ? "Agregar categoría" : "Guardar cambios"}
        </Button>
      </div>
    </Modal>
  );
};

export default EditCategoryModal;
