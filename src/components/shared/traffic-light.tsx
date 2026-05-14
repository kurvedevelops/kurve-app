interface Props {
  consumed: number; // horas consumidas
  total: number; // horas contratadas
}
export function TrafficLight({ consumed, total }: Props) {
  const percent = (consumed / total) * 100;
  let color = "bg-green-500";
  let label = "Saludable";
  if (percent >= 100) {
    color = "bg-red-500";
    label = "Excedido";
  } else if (percent >= 70) {
    color = "bg-amber-500";
    label = "Atención";
  }
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm">
        {label} ({percent.toFixed(0)}%)
      </span>
    </div>
  );
}
