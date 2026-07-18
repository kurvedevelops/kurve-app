"use client";
import { CalendarDays, ChartPie, Clock2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ClientConsumption,
  PackageData,
  useClientConsumption,
  usePackageByClient,
} from "@/hooks/middleware";

interface Consumption {
  package_name: string;
  total_hours: number;
  consumed_hours: number;
  remaining_hours: number;
  hours_percent: number;
  traffic_light: "green" | "yellow" | "red";
  package_status: "active" | "paused" | "ended";
  start_date: string;
  end_date: string | null;
}

interface ConsumptionChartProps {
  clientId: string;
}

const trafficColors = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

const trafficMessages = {
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    message: "Tu consumo se encuentra dentro de lo esperado.",
  },
  yellow: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    message: "Has utilizado gran parte de las horas disponibles.",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    message: "Has consumido todas las horas disponibles del paquete.",
  },
};

const ConsumptionChart = ({ clientId }: ConsumptionChartProps) => {
  const router = useRouter();
  const { data, loading } = useClientConsumption(clientId);
  const { clientPackage, loadingClientPackage } = usePackageByClient(clientId);

  console.log(data);

  const consumptionRaw: ClientConsumption | undefined = data?.[0];
  const packageRaw: PackageData | undefined =
    clientPackage && clientPackage.id === consumptionRaw?.package_id
      ? clientPackage
      : undefined;

  console.log("consumptionRaw", consumptionRaw);

  if (loading || loadingClientPackage) {
    return (
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando consumo...</p>
      </div>
    );
  }

  if (!consumptionRaw || !packageRaw) {
    return (
      <div className="rounded-3xl border border-border gap-3 bg-white p-6 shadow-sm flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 rounded-full bg-verde-kurve/10 flex items-center justify-center mb-4">
          <ChartPie className="h-8 w-8 text-verde-kurve" />
        </div>

        <p className="text-lg font-bold text-foreground">
          No hay información de consumo disponible
        </p>

        <p className="text-sm text-gris-kurve-dark max-w-sm">
          Cuando el administrador asigne un paquete y se registren horas
          consumidas, podrás visualizar aquí el progreso y el porcentaje de uso
          de tu plan.
        </p>
      </div>
    );
  }

  const consumption: Consumption = {
    package_name: consumptionRaw.package_name,
    total_hours: consumptionRaw.total_hours,
    consumed_hours: consumptionRaw.consumed_hours ?? 0,
    remaining_hours:
      consumptionRaw.total_hours - (consumptionRaw.consumed_hours ?? 0),
    hours_percent: consumptionRaw.hours_percent,
    traffic_light: consumptionRaw.traffic_light,
    package_status: packageRaw.status,
    start_date: packageRaw.start_date ?? "",
    end_date: packageRaw.end_date,
  };

  const progress = Math.min(consumption.hours_percent, 100);

  const radius = 90;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const traffic = trafficMessages[consumption.traffic_light];

  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-verde-kurve-dark">
          Consumo del paquete
        </h2>

        <p className="text-sm text-muted-foreground">
          Visualiza el consumo de horas de tu paquete actual.
        </p>
      </div>
      <div
        className="flex flex-col items-center transition-opacity hover:opacity-90"
        onClick={() => router.push("/client/consumo/detalle")}
      >
        <div className="relative w-60 h-60">
          <svg width="240" height="240" viewBox="0 0 240 240">
            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke="#ECECEC"
              strokeWidth={strokeWidth}
            />

            <circle
              cx="120"
              cy="120"
              r={radius}
              fill="none"
              stroke={trafficColors[consumption.traffic_light]}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 120 120)"
              style={{
                transition: "stroke-dashoffset .6s ease",
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-[#1E1E1E]">
              {consumption.hours_percent}%
            </span>

            <span className="text-sm text-muted-foreground">Consumido</span>
          </div>
        </div>

        <p className=" text-2xl font-bold mb-2">
          {consumption.consumed_hours} hs / {consumption.total_hours} hs
        </p>
      </div>

      <div className="flex flex-col justify-center items-center text-center">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Horas restantes
        </p>
        <div className="mt-1 flex justify-center items-center gap-2">
          <Clock2 className="h-4 w-4 text-verde-kurve" />
          <span className="font-semibold">
            {consumption.remaining_hours} hs
          </span>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionChart;
