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
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  Plus,
} from "lucide-react";
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
import BottomNav from "@/components/layout/BottomNav";
import { navItems } from "@/components/layout/NavItems";

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

  async function handleCorrectionSubmit(data: CorrectionFormData) {
    try {
      await createCorrectionRequest(data, user?.id || "");
      toast.success("Solicitud de corrección enviada con éxito");
    } catch (error) {
      toast.error("Error al enviar la solicitud de corrección");
      console.log(error);
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
        <div className="flex flex-col gap-6 min-w-0">
          <div className="p-6 bg-white border border-[#E4E4E4] rounded-lg min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
              <div className="flex flex-col gap-4 mb-4 min-w-0">
                <label className="font-semibold text-foreground">Fecha</label>
                <select
                  className="w-full min-w-0 px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
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
              <div className="flex flex-col gap-4 mb-4 min-w-0">
                <label className="font-semibold text-foreground">Cliente</label>
                <select
                  className="w-full min-w-0 px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
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

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 min-w-0">
                <Button
                  onClick={() => setAppliedFilters({ ...filters, page: 0 })}
                  className="w-full sm:w-fit cursor-pointer px-8 py-6 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors"
                >
                  Filtrar
                </Button>
                <Button
                  onClick={() => {
                    setFilters(defaultFilters);
                    setAppliedFilters(defaultFilters);
                  }}
                  variant="outline"
                  className="w-full sm:w-fit px-8 py-6 rounded-lg cursor-pointer"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#E4E4E4] overflow-hidden overflow-x-auto rounded-lg">
            {/* Mobile/tablet: cards */}
            <div className="flex flex-col gap-3 lg:hidden">
              {activityLogs.length === 0 ? (
                <div className="bg-white border border-[#E4E4E4] rounded-lg p-8 text-center text-sm font-semibold">
                  No hay actividades registradas.
                  <br />
                  <Link
                    href="/member/registrar"
                    className="text-verde-kurve-dark font-semibold text-sm"
                  >
                    Registrar una actividad
                  </Link>
                </div>
              ) : (
                activityLogs.map((activity) => (
                  <div
                    key={activity.id}
                    className="bg-white border-b border-[#E4E4E4] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {activity.clients?.name}
                        </p>
                        <p className="text-xs text-gris-kurve-dark">
                          {activity.task_types?.name} •{" "}
                          {activity.task_subtypes?.name}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-verde-kurve flex-shrink-0">
                        {activity.hours}h
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gris-kurve-dark">
                        {activity.log_date}
                      </span>
                      <Button
                        variant="outline"
                        className="h-9 rounded-lg text-sm hover:bg-gray-50"
                        onClick={() => setCorrectionActivity(activity)}
                      >
                        Solicitar corrección
                      </Button>
                    </div>

                    {activity.pieces_count > 0 && (
                      <p className="mt-1 text-xs text-gris-kurve-dark">
                        {activity.pieces_count}{" "}
                        {activity.pieces_count === 1 ? "pieza" : "piezas"}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop: tabla */}
            <div className="hidden lg:block bg-white border-b border-[#E4E4E4] overflow-hidden">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Cliente
                    </TableHead>
                    <TableHead className="pr-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Rol
                    </TableHead>
                    <TableHead className="pr-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Tarea
                    </TableHead>
                    <TableHead className="pr-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Horas
                    </TableHead>
                    <TableHead className="pr-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Piezas
                    </TableHead>
                    <TableHead className="pr-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Fecha
                    </TableHead>
                    <TableHead className="pr-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {activityLogs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
                        <TableCell className="font-semibold">
                          {activity.pieces_count > 0
                            ? activity.pieces_count
                            : "—"}
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
            </div>

            {activityLogs.length > 0 && (
              <div className="h-14 px-6 py-6 bg-white rounded-lg gap-4 flex items-center text-sm text-muted-foreground">
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
      <BottomNav items={navItems} onFabClick={() => {}} />
    </div>
  );
};

export default MisActividadesPage;
