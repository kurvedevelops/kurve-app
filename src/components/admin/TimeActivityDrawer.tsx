import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "../ui/button";

interface TimeActivityDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: {
    id: string;
    cliente: string;
    integrante: string;
    fecha: string;
    estado: string;
    tarea: string;
    pieza: string;
    horas: number;
    observaciones: string | null;
  } | null;
}

const TimeActivityDrawer = ({
  open,
  onOpenChange,
  activity,
}: TimeActivityDrawerProps) => {
  if (!activity) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton={false} className="overflow-y-auto bg-white border-l-0!">
        <div className="px-4 py-8 border-b border-gray-200/90">
          <h2 className="text-2xl font-bold text-azul-kurve">
            Detalle de actividad
          </h2>
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
                <p className="mt-1 text-xs font-semibold">{activity.cliente}</p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Integrante
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {activity.integrante}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Fecha
                </label>
                <p className="mt-1 text-xs font-semibold">{activity.fecha}</p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Estado
                </label>
                <p className="mt-1 text-xs text-azul-kurve font-semibold bg-green-300/70 h-4.5 w-20 flex justify-center items-center rounded-full">
                  {activity.estado === "delivered"
                    ? "Entregado"
                    : "En progreso"}
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
                <p className="mt-1 text-xs font-semibold">{activity.tarea}</p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Pieza
                </label>
                <p className="mt-1 text-xs font-semibold">{activity.pieza}</p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Horas registradas
                </label>
                <p className="mt-1 text-xs font-semibold">
                  {activity.horas} hs
                </p>
              </div>

              <div className="col-span-2">
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Observaciones
                </label>

                <div className="mt-2 rounded-lg bg-gris-kurve-light border border-gris-kurve p-3 text-gray-500 font-semibold">
                  {activity.observaciones || "-"}
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
                <p className="mt-1 text-xs font-semibold">07/06/2026</p>
              </div>

              <div>
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400">
                  Hora de registro
                </label>
                <p className="mt-1 text-xs font-semibold">14:32:05</p>
              </div>
            </div>
          </section>
          <section>
            <div className="flex items-center justify-between border-b border-gray-200/90 pb-3 mb-5">
              <h3 className="text-lg text-azul-kurve font-semibold text-end">Historial de correcciones</h3>
              <p className="text-xs pt-2 text-muted-foreground font-semibold text-azul-kurve">Últimas 2</p>
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

          <Button className="cursor-pointer px-8 py-6 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors">
            Ver historial completo
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TimeActivityDrawer;
