import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { ActivityLogWithRelations, formatDate } from "@/hooks/middleware";
import { useRouter } from "next/navigation";

interface TimeActivityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: {
    id: string;
    hours: number;
    pieces_count: number;
    log_date: string;
    status: "delivered" | "in_progress";
    notes: string | null;
    is_draft: boolean;
    users: { id: string; full_name: string } | null;
    task_types: { id: string; name: string } | null;
    clients: { id: string; name: string } | null;
    piece_categories: { id: string; name: string } | null;
    created_at: string;
  };
}

const TimeActivityDrawer = ({
  open,
  onOpenChange,
  activity,
}: TimeActivityDrawerProps) => {
  const router = useRouter();
  if (!activity) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="overflow-y-auto bg-white border-l-0!"
      >
        <div className="px-4 py-8 border-b border-gray-200/90">
          <SheetTitle className="text-2xl font-bold text-azul-kurve">
            Detalle de actividad
          </SheetTitle>
        </div>

        <div className="px-6 py-2 space-y-6">
          <section className="">
            <h3 className="text-lg text-azul-kurve font-semibold mb-5 border-b pb-2 border-gray-200/90">
              Información general
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Cliente
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {activity.clients?.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Integrante
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {activity.users?.full_name}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Fecha
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {formatDate(activity.log_date)}
                </p>
              </div>
            </div>
          </section>
          <section>
            <h3 className="text-lg text-azul-kurve font-semibold mb-5 border-b pb-3 border-gray-200/90">
              Registro de actividad
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Tarea
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {activity.task_types?.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Cantidad de piezas
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {activity.pieces_count
                    ? activity.pieces_count
                    : "No entrego piezas"}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Horas registradas
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {activity.hours} hs
                </p>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Observaciones
                </label>

                <div className="mt-2 rounded-lg bg-gris-kurve-light border border-gris-kurve p-3 text-gray-500 font-semibold">
                  {activity.notes || "No hay comentarios sobre la actividad"}
                </div>
              </div>
            </div>
          </section>
          {/* Información administrativa */}
          <section>
            <h3 className="text-lg text-azul-kurve font-semibold mb-5 border-b pb-3 border-gray-200/90">
              Información administrativa
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Fecha de registro
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {formatDate(activity.log_date)}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Hora de registro
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {activity.created_at.slice(11, 16)}
                </p>
              </div>
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between border-b border-gray-200/90 pb-3 mb-5">
              <h3 className="text-lg text-azul-kurve font-semibold text-end">
                Historial de correcciones
              </h3>
              <p className="text-xs pt-2 text-muted-foreground font-semibold text-azul-kurve">
                Últimas 2
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-gris-kurve p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  05/06/2026 15:40 · Admin Kurve
                </p>

                <p className="mt-2 text-sm">
                  Horas registradas:
                  <span className="line-through text-gray-400 ml-1">4 hs</span>
                  <span className="mx-2 text-verde-kurve">→</span>
                  <span>5 hs</span>
                </p>
              </div>

              <div className="rounded-lg border border-gris-kurve p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  05/06/2026 10:15 · Admin Kurve
                </p>

                <p className="mt-2 text-sm">
                  Estado:
                  <span className="line-through text-gray-400 ml-1">
                    En progreso
                  </span>
                  <span className="mx-2 text-verde-kurve">→</span>
                  <span>Entregado</span>
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-200/80 bg-white py-4">
          <Button
            className=" md:w-fit px-8 py-6 rounded-lg md:ml-3 cursor-pointer"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>

          <Button
            className="cursor-pointer px-8 py-6 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors"
            onClick={() => router.push("/admin/correcciones")}
          >
            Ver historial completo
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimeActivityDrawer;
