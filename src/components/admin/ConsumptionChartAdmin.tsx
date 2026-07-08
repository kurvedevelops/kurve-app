"use client";
import { useClientConsumption } from "@/hooks/middleware";
import { BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const getColor = (trafficLight: string) => {
  if (trafficLight === "red") return "#ef4444";
  if (trafficLight === "yellow") return "#eab308";
  return "#22c55e";
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow text-sm">
        <p className="font-semibold text-gray-800 mb-1">{d.package_name}</p>
        <p className="text-gray-400">
          Total:{" "}
          <span className="text-gray-700 font-medium">{d.total_hours} hs</span>
        </p>
        <p className="text-gray-400">
          Consumido:{" "}
          <span className="text-gray-700 font-medium">
            {d.consumed_hours} hs
          </span>
        </p>
        <p className="text-gray-400">
          Uso:{" "}
          <span
            className="font-medium"
            style={{ color: getColor(d.traffic_light) }}
          >
            {d.hours_percent}%
          </span>
        </p>
      </div>
    );
  }
  return null;
};

const ConsumptionChartAdmin = () => {
  const { data, loading, error } = useClientConsumption();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex items-center justify-center min-h-[380px] flex-1">
        <p className="text-sm text-gray-400">Cargando datos...</p>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex flex-col items-center justify-center min-h-[380px] flex-1">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <BarChart2 className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700">
          Sin datos de consumo
        </p>
        <p className="text-xs text-gray-400 mt-1 text-center max-w-48">
          Cuando se registren actividades aparecerá el consumo por cliente
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm p-6 flex-1">
      <h2 className="text-base font-semibold text-gray-800 mb-1">
        Consumo de horas por cliente
      </h2>
      <p className="text-xs text-gray-400 mb-6">Mes actual</p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 8, left: -20, bottom: 40 }}
          barSize={75}
        >
          <XAxis
            dataKey="package_name"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={(v) => `${v}hs`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="total_hours"
            fill="#06b6d4"
            radius={[6, 6, 0, 0]}
            minPointSize={4}
          />
          <Bar dataKey="consumed_hours" radius={[6, 6, 0, 0]} minPointSize={4}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.traffic_light)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
          Total
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
          Bajo consumo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
          Consumo alto
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
          Límite alcanzado
        </span>
      </div>
    </div>
  );
};

export default ConsumptionChartAdmin;
