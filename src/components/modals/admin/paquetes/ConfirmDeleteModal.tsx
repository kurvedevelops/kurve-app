"use client";

import Modal from "@/components/modals/Modal";
import { Button } from "@/components/ui/button";

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

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pkg: Package | null;
}

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, pkg }: ConfirmDeleteModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-lg font-semibold text-gray-900 mb-2">
        ¿Eliminar "{pkg?.name}"?
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Esta acción no se puede deshacer.
      </p>

      {pkg && pkg.clients > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-red-600 font-medium">
            Este paquete tiene {pkg.clients}{" "}
            {pkg.clients === 1 ? "cliente activo" : "clientes activos"}.
            Eliminarlo puede afectar su información.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          className="bg-red-500 text-white hover:bg-red-600"
          onClick={onConfirm}
        >
          Sí, eliminar
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;