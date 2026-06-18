"use client";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

interface ConfirmDeleteModalProps {
  open: boolean;
  entityName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  entityName,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-background w-full max-w-[400px] rounded-2xl border border-border shadow-xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-xl font-medium text-foreground mb-1">
              ¿Eliminar entidad?
            </h2>
            <p className="text-sm text-gris-kurve-dark mb-4">
              Se eliminará permanentemente{" "}
              <span className="font-semibold">{entityName}</span> y todos sus
              datos asociados.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center text-gris-kurve-dark cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Warning */}
        <div className="px-6 py-4 bg-red-50 border-y border-red-200 mx-6 rounded-lg">
          <p className="text-xs text-red-600 font-medium">
            ⚠️ Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-9 px-4 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
