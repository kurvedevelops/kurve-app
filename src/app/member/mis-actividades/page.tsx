"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarMember from "@/components/layout/SidebarMember";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCurrentUser,
  useActivityLogs,
  useClients,
  useActivityLogDates,
  createCorrectionRequest,
} from "@/hooks/middleware";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  CorrectionFormData,
  CorrectionModal,
} from "@/components/modals/member/CorrectionModal";

const MisActividadesPage = () => {
  const { user } = useCurrentUser();
  const { clients } = useClients();
  const { dates } = useActivityLogDates(user?.id || "");
  const defaultFilters = {
    client_id: "",
    status: "",
    from: "",
    to: "",
    page: 0,
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const [correctionActivity, setCorrectionActivity] = useState<
    (typeof activityLogs)[number] | null
  >(null);

  const { activityLogs, loadingActivityLogs, totalCount } = useActivityLogs(
    user?.id || "",
    appliedFilters,
  );

  const totalPages = Math.ceil(totalCount / 5);
<<<<<<< HEAD
  const fechasUnicas = [...new Set(activityLogs.map((log) => log.log_date))];
=======
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const fechasUnicas = [...new Set(activityLogs.map((log) => log.log_date))];
>>>>>>> c9f12d4 (Vista de mis solicitudes)
>>>>>>> 7b3e45a (Vista de mis solicitudes)

  async function handleCorrectionSubmit(data: CorrectionFormData) {
    try {
      await createCorrectionRequest(data, user?.id || "");
      toast.success("Solicitud de corrección enviada con éxito");
    } catch {
      toast.error("Error al enviar la solicitud de corrección");
    } finally {
      setCorrectionActivity(null);
    }
  }

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarMember />
      <main className="flex-1 mt-10 md:mt-0 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="hidden md:block mb-3">
          <PageHeader
            badge="MIS ACTIVIDADES"
            title="Listado de Actividades"
            subtitle="Administra y supervisa el flujo de trabajo de tu equipo"
          />
        </div>

        <div className="md:hidden mb-6">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            MIS ACTIVIDADES
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Listado de Actividades
          </h1>
          <p className="text-sm text-gris-kurve-dark">
            Administra y supervisa el flujo de trabajo de tu equipo
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-5 bg-gray-50 border border-[#E4E4E4] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gris-kurve-dark uppercase tracking-wide">
                  Fecha
                </label>
                <select
                  className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve/40 focus:border-verde-kurve transition-colors"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      from: e.target.value,
                      to: e.target.value,
                    })
                  }
                >
                  <option value="">Seleccionar fecha</option>
                  {dates.map((fecha) => (
                    <option key={fecha} value={fecha}>
                      {fecha}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gris-kurve-dark uppercase tracking-wide">
                  Cliente
                </label>
                <select
                  className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve/40 focus:border-verde-kurve transition-colors"
                  value={filters.client_id}
                  onChange={(e) =>
                    setFilters({ ...filters, client_id: e.target.value })
                  }
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 justify-center md:col-span-2 lg:col-span-2 lg:justify-end lg:self-center">
                <Button
                  onClick={() => setAppliedFilters({ ...filters, page: 0 })}
                  className="flex-1 md:flex-none cursor-pointer px-4 py-2 text-sm bg-verde-kurve text-white font-medium rounded-md hover:bg-verde-kurve-dark transition-colors"
                >
                  Filtrar
                </Button>
                <Button
                  onClick={() => {
                    setFilters(defaultFilters);
                    setAppliedFilters(defaultFilters);
                  }}
                  variant="outline"
                  className="flex-1 md:flex-none px-4 py-2 text-sm rounded-md cursor-pointer"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#E4E4E4] overflow-hidden rounded-lg">
            {activityLogs.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-center text-lg font-semibold px-4">
                No hay actividades registradas.
                <Link
                  href="/member/registrar"
                  className="text-verde-kurve-dark font-semibold text-sm mt-1"
                >
                  Registrar una actividad
                </Link>
              </div>
            ) : (
              <>
                {/* Mobile cards (sm and below) */}
                <div className="md:hidden divide-y divide-[#E4E4E4]">
                  {activityLogs.map((activity) => (
                    <div key={activity.id} className="p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-base">
                          {activity.clients?.name}
                        </span>
                        <span className="text-[15px] text-gris-kurve-dark">
                          {activity.log_date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">
                          {activity.task_types?.name}
                        </span>
                        <span className="font-semibold">
                          {activity.hours} hs
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="h-9 rounded-lg text-sm hover:bg-gray-50 w-full mt-1"
                        onClick={() => setCorrectionActivity(activity)}
                      >
                        Solicitar corrección
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Table (md and above) */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="px-4 py-3 text-center text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                          Cliente
                        </TableHead>

                        <TableHead className="px-4 py-3 text-center text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                          Tarea
                        </TableHead>

                        <TableHead className="px-4 py-3 text-center text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                          Horas
                        </TableHead>

                        <TableHead className="px-4 py-3 text-center text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                          Fecha
                        </TableHead>

                        <TableHead className="px-4 py-3 text-center text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {activityLogs.map((activity) => (
                        <TableRow
                          key={activity.id}
                          className="border-b border-[#E4E4E4] hover:bg-muted/40"
                        >
                          <TableCell className="px-4 py-4 text-center font-semibold">
                            {activity.clients?.name}
                          </TableCell>

                          <TableCell className="px-4 py-4 text-center font-semibold">
                            {activity.task_types?.name}
                          </TableCell>

                          {/* whitespace-nowrap evita que el número se parta si hay un símbolo al lado */}
                          <TableCell className="px-4 py-4 text-center font-semibold whitespace-nowrap">
                            {activity.hours}
                          </TableCell>

                          {/* whitespace-nowrap asegura que la fecha se mantenga en una línea */}
                          <TableCell className="px-4 py-4 text-center text-[15px] whitespace-nowrap">
                            {activity.log_date}
                          </TableCell>

                          {/* Alineado a la derecha para empujar el botón al borde final */}
                          <TableCell className="px-4 py-4 text-center">
                            <Button
                              variant="outline"
                              className="h-9 rounded-lg text-sm hover:bg-gray-50 whitespace-nowrap"
                              onClick={() => setCorrectionActivity(activity)}
                            >
                              Solicitar corrección
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
            {activityLogs.length > 0 && (
              <div className="h-14 px-6 py-6 border-t border-gray-200 gap-4 flex items-center text-sm text-muted-foreground">
                <h4 className="font-semibold">
                  {appliedFilters.page + 1} de {totalPages}
                </h4>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    onClick={() =>
                      setAppliedFilters({
                        ...appliedFilters,
                        page: Math.max(0, appliedFilters.page - 1),
                      })
                    }
                    disabled={appliedFilters.page === 0}
                    className="border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    onClick={() =>
                      setAppliedFilters({
                        ...appliedFilters,
                        page: appliedFilters.page + 1,
                      })
                    }
                    disabled={appliedFilters.page + 1 >= totalPages}
                    className="border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <CorrectionModal
          open={correctionActivity !== null}
          onClose={() => setCorrectionActivity(null)}
          onSubmit={handleCorrectionSubmit}
          activity={correctionActivity}
        />
      </main>
    </div>
  );
};

export default MisActividadesPage;
