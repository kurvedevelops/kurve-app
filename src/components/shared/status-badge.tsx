import { cn } from "@/lib/utils";
type Status = "in_progress" | "delivered" | "published";
const config = {
  in_progress: {
    label: "En proceso",
    className: "bg-blue-100 text-blue-700",
  },
  delivered: {
    label: "Entregado",
    className: "bg-amber-100 text-amber-700",
  },
  published: {
    label: "Publicado",
    className: "bg-kurve-light text-kurve-dark",
  },
};
export function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status];
  return (
    <span
      className={cn("px-2 py-1 rounded-full text-xs font-medium", className)}
    >
      {label}
    </span>
  );
}
