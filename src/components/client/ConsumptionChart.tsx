"use client";
import { useRouter } from "next/navigation";
const getTrafficLight = (percent: number) => {
  if (percent >= 100) return "#ef4444";
  if (percent >= 70) return "#eab308";
  return "#22c55e";
};

const consumption = {
  consumed_hours: 20,
  total_hours: 100,
};

const ConsumptionChart = () => {
  const router = useRouter();

  const percent = Math.round(
    (consumption.consumed_hours / consumption.total_hours) * 100,
  );
  const progress = Math.min(percent, 100);
  const color = getTrafficLight(percent);
  const hasData = consumption.total_hours > 0;

  const radius = 100;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="h-91 w-90 md:w-4xl bg-white rounded-2xl shadow border border-border p-6">
      <div
        className={`h-full flex flex-col justify-center items-center ${
          hasData ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
        }`}
        onClick={() => {
          if (hasData) router.push("/client/consumo/detalle");
        }}
      >
        <svg width="240" height="240" viewBox="0 0 240 240">
          {/* Fondo gris */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="#ececec"
            strokeWidth={strokeWidth}
          />
          {/* Arco de progreso */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke={hasData ? color : "#d1d5db"}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={hasData ? strokeDashoffset : circumference}
            strokeLinecap="round"
            transform="rotate(-90 120 120)" // arranca desde las 12
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>

        <p className="text-3xl font-bold leading-none mt-2">
          {hasData
            ? `${consumption.consumed_hours}hs / ${consumption.total_hours}hs`
            : "Sin consumo"}
        </p>

        <p className="text-sm text-muted-foreground mt-2">
          {hasData
            ? `${percent}% consumido`
            : "Todavía no hay horas registradas"}
        </p>
      </div>
    </div>
  );
};

export default ConsumptionChart;
