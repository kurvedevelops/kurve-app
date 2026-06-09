"use client";
import { createPortal } from "react-dom";
import { CheckCircle } from "lucide-react";

interface ConfirmAsignarPaqueteModalProps {
  open: boolean;
  clientName: string;
  data: {
    nombrePaquete: string;
    horasTotales: number;
    precio?: number;
    fechaInicio: string;
    fechaFin?: string;
    publicaciones?: Record<string, number>;
  };
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmAsignarPaqueteModal({
  open,
  clientName,
  data,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmAsignarPaqueteModalProps) {
  if (!open) return null;

  // Calcular total de piezas
  const totalPiezas = data.publicaciones
    ? Object.values(data.publicaciones).reduce((acc, val) => acc + val, 0)
    : 0;

  // Formatear fechas
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "No especificada";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-background w-full max-w-[500px] rounded-2xl border border-border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            ¿Confirmar este paquete?
          </h2>
          <p className="text-sm text-gris-kurve-dark">
            Una vez creado, el cliente podrá ver su consumo en tiempo real.
          </p>
        </div>

        {/* Resumen */}
        <div className="px-6 py-4 bg-verde-kurve/5 border-y border-verde-kurve/20 mx-0">
          <h3 className="text-xs font-semibold text-verde-kurve uppercase tracking-wide mb-4">
            Resumen del paquete
          </h3>

          <div className="space-y-3">
            {/* Cliente */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gris-kurve-dark">Cliente</span>
              <span className="text-sm font-semibold text-foreground">
                {clientName}
              </span>
            </div>

            {/* Nombre del paquete */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gris-kurve-dark">
                Nombre del paquete
              </span>
              <span className="text-sm font-semibold text-foreground">
                {data.nombrePaquete}
              </span>
            </div>

            {/* Horas totales */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gris-kurve-dark">
                Horas totales
              </span>
              <span className="text-sm font-semibold text-foreground">
                {data.horasTotales} hs
              </span>
            </div>

            {/* Periodo */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gris-kurve-dark">Período</span>
              <span className="text-sm font-semibold text-foreground">
                {formatDate(data.fechaInicio)} -{" "}
                {data.fechaFin ? formatDate(data.fechaFin) : "No especificado"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gris-kurve-dark">Total piezas</span>
              <span className="text-sm font-semibold text-foreground">
                {totalPiezas == 0 ? "No especificado" : totalPiezas}
              </span>
            </div>

            {/* Precio (si existe) */}
            <div className="flex justify-between items-center pt-2 border-t border-verde-kurve/20">
              <span className="text-sm text-gris-kurve-dark">Precio (ARS)</span>
              <span className="text-sm font-semibold text-foreground">
                {data.precio
                  ? "$" + data.precio.toLocaleString("es-AR")
                  : "No especificado"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-10 px-4 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            Volver
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="h-10 px-4 text-sm font-medium rounded-lg bg-verde-kurve text-white hover:bg-verde-kurve/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? "Creando..." : "Confirmar y crear"}
            {!loading && <CheckCircle size={16} />}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
