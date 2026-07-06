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
  useTaskSubtypesConfig,
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
  const { subtypes, loadingSubtypes } = useTaskSubtypesConfig();

  const totalPages = Math.ceil(totalCount / 5);

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
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
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
          <div className="p-6 bg-white border border-[#E4E4E4] overflow-hidden overflow-x-auto rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Fecha</label>
                <select
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
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
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Cliente</label>
                <select
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
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

              <div className="lg:col-span-4">
                <Button
                  onClick={() => setAppliedFilters({ ...filters, page: 0 })}
                  className="w-full md:w-fit cursor-pointer px-8 py-6 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors"
                >
                  Filtrar
                </Button>
                <Button
                  onClick={() => {
                    setFilters(defaultFilters);
                    setAppliedFilters(defaultFilters);
                  }}
                  variant="outline"
                  className="w-full md:w-fit px-8 py-6 rounded-lg md:ml-3 cursor-pointer"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#E4E4E4] overflow-hidden overflow-x-auto rounded-lg">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Cliente
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Rol
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Tarea
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Horas
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Fecha
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {activityLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-80 text-center text-lg font-semibold"
                    >
                      No hay actividades registradas.
                      <br />
                      <Link
                        href="/member/registrar"
                        className="text-verde-kurve-dark font-semibold text-sm"
                      >
                        Registrar una actividad
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  activityLogs.map((activity) => (
                    <TableRow
                      key={activity.id}
                      className="border-b border-[#E4E4E4] hover:bg-transparent"
                    >
                      <TableCell className="px-6 py-6 font-semibold">
                        {activity.clients?.name}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {activity.task_types?.name}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {activity.task_subtypes?.name}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {activity.hours}
                      </TableCell>

                      <TableCell className="text-[15px]">
                        {activity.log_date}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outline"
                          className="h-9 rounded-lg text-sm hover:bg-gray-50"
                          onClick={() => setCorrectionActivity(activity)}
                        >
                          Solicitar corrección
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
