"use client";

import {
  CalendarDays,
  Package,
  Boxes,
  Clock3,
  ShieldCheck,
} from "lucide-react";

interface PackageSummary {
  name: string;
  total_hours: number;
  total_pieces: number;
  status: "active" | "ended";
  start_date: string;
  end_date: string | null;
  block_on_limit: boolean;
}

const mockPackage: PackageSummary = {
  name: "Paquete Agencia",
  total_hours: 300,
  total_pieces: 4,
  status: "active",
  start_date: "2026-06-24",
  end_date: null,
  block_on_limit: false,
};

const PackageSummaryCard = () => {
  const pkg = mockPackage;

  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-6">
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
        <h3 className="text-xl font-bold">
          {pkg.name}
        </h3>

        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />

          <span className="text-sm font-medium text-green-700">
            Activo
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-verde-kurve" />
            <span className="text-muted-foreground">
              Horas contratadas
            </span>
          </div>

          <span className="font-semibold">
            {pkg.total_hours} hs
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-verde-kurve" />
            <span className="text-muted-foreground">
              Piezas incluidas
            </span>
          </div>

          <span className="font-semibold">
            {pkg.total_pieces}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-verde-kurve" />
            <span className="text-muted-foreground">
              Inicio
            </span>
          </div>

          <span className="font-semibold">
            {new Date(pkg.start_date).toLocaleDateString("es-AR")}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Finalización
          </span>

          <span className="font-semibold">
            {pkg.end_date
              ? new Date(pkg.end_date).toLocaleDateString("es-AR")
              : "Sin vencimiento"}
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-verde-kurve" />

          <div>
            <p className="font-medium">
              Límite de consumo
            </p>

            <p className="text-sm text-muted-foreground">
              {pkg.block_on_limit
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