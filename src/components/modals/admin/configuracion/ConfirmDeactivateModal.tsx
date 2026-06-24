import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

interface ConfirmDeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  categoryName: string;
  affectedPackages: { id: string; name: string }[];
  loading: boolean;
}

const ConfirmDeactivateModal = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  affectedPackages,
  loading,
}: ConfirmDeactivateModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-start gap-4">
        <div className="bg-yellow-100 p-2 rounded-lg mt-0.5">
          <TriangleAlert className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            ¿Desactivar {categoryName}?
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Esta categoría está siendo usada en{" "}
            <span className="font-medium text-gray-700">
              {affectedPackages.length}{" "}
              {affectedPackages.length === 1 ? "paquete activo" : "paquetes activos"}
            </span>
            :
          </p>

          <ul className="mt-3 space-y-1">
            {affectedPackages.map((pkg) => (
              <li key={pkg.id} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
                {pkg.name}
              </li>
            ))}
          </ul>

          <p className="text-sm text-gray-500 mt-4">
            Los datos existentes no se borran, pero la categoría dejará de
            aparecer en el formulario de registro.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          className="bg-yellow-500 text-white hover:bg-yellow-600"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Desactivando..." : "Sí, desactivar igual"}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeactivateModal;
