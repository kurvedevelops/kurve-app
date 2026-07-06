"use client";
import { CalendarDays, Package, Clock2 } from "lucide-react";
import { useRouter } from "next/navigation";

const mockConsumption: Consumption = {
  package_name: "Paquete Agencia",
  total_hours: 300,
  consumed_hours: 228,
  remaining_hours: 72,
  hours_percent: 76,
  traffic_light: "yellow",
  package_status: "active",
  start_date: "2026-06-24",
  end_date: null,
};

interface Consumption {
  package_name: string;
  total_hours: number;
  consumed_hours: number;
  remaining_hours: number;
  hours_percent: number;
  traffic_light: "green" | "yellow" | "red";
  package_status: "active" | "ended";
  start_date: string;
  end_date: string | null;
}

interface ConsumptionChartProps {
  consumption: Consumption;
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

const ConsumptionChart = () => {

  const consumption = mockConsumption;
  const router = useRouter();

  const progress = Math.min(consumption.hours_percent, 100);

  const radius = 90;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset =
    circumference - (progress / 100) * circumference;

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
        className="flex flex-col items-center cursor-pointer transition-opacity hover:opacity-90"
        onClick={() => router.push("/client/consumo/detalle")}
      >
        <div className="relative w-60 h-60">
          <svg
            width="240"
            height="240"
            viewBox="0 0 240 240"
          >
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

            <span className="text-sm text-muted-foreground">
              Consumido
            </span>
          </div>
        </div>

        <p className=" text-2xl font-bold">
          {consumption.consumed_hours} hs / {consumption.total_hours} hs
        </p>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-5 border-t border-border pt-5 justify-items-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Paquete
          </p>

          <div className="mt-1 flex items-center gap-2">
            <Package className="h-4 w-4 text-verde-kurve" />
            <span className="font-semibold">
              {consumption.package_name}
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Estado
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                consumption.package_status === "active"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />

            <span className="font-semibold capitalize">
              {consumption.package_status}
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Inicio
          </p>

          <div className="mt-1 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-verde-kurve" />
            <span className="font-semibold">
              {new Date(
                consumption.start_date,
              ).toLocaleDateString("es-AR")}
            </span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Horas restantes
          </p>
          <div className="mt-1 flex items-center gap-2 ml-4">
            <Clock2 className="h-4 w-4 text-verde-kurve" />
          <span className=" font-semibold">
            {consumption.remaining_hours} hs
          </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsumptionChart;
