"use client";

import { PackageData } from "@/hooks/middleware";
import {
  CalendarDays,
  Package,
  Boxes,
  Clock3,
  ShieldCheck,
} from "lucide-react";

const statusStyles = {
  active: {
    bg: "bg-green-100",
    dot: "bg-green-500",
    text: "text-green-700",
    label: "Activo",
  },
  paused: {
    bg: "bg-yellow-100",
    dot: "bg-yellow-500",
    text: "text-yellow-700",
    label: "Pausado",
  },
  ended: {
    bg: "bg-gray-100",
    dot: "bg-gray-400",
    text: "text-gray-600",
    label: "Finalizado",
  },
} as const;

const PackageSummaryCard = ({
  clientPackage,
}: {
  clientPackage: PackageData | null;
}) => {
  if (!clientPackage) {
    return null;
  }
  const status = statusStyles[clientPackage.status];
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm h-full">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-verde-kurve/10">
          <Package className="h-6 w-6 text-verde-kurve-dark" />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-verde-kurve-dark">
            Mi paquete
          </h2>

          <p className="text-sm text-muted-foreground">
            Información general del plan contratado.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-muted/30 p-4">
        <h3 className="text-xl font-bold">{clientPackage.name}</h3>

        <div
          className={`mt-2 inline-flex items-center gap-2 rounded-full ${status.bg} px-3 py-1`}
        >
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          <span className={`text-sm font-medium ${status.text}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-verde-kurve" />
            <span className="text-muted-foreground">Horas contratadas</span>
          </div>

          <span className="font-semibold">{clientPackage.total_hours} hs</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-verde-kurve" />
            <span className="text-muted-foreground">Piezas incluidas</span>
          </div>

          <span className="font-semibold">{clientPackage.total_pieces}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-verde-kurve" />
            <span className="text-muted-foreground">Inicio</span>
          </div>

          <span className="font-semibold">{clientPackage.start_date}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-verde-kurve" />
            <span className="text-muted-foreground">Fin</span>
          </div>

          <span className="font-semibold">
            {clientPackage.end_date
              ? clientPackage.end_date
              : "Sin vencimiento"}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-verde-kurve" />

          <div>
            <p className="font-medium">Límite de consumo</p>

            <p className="text-sm text-muted-foreground">
              {clientPackage.block_on_limit
                ? "El servicio se bloqueará al alcanzar el límite."
                : "El servicio continuará disponible aunque alcances el límite."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageSummaryCard;
