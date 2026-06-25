"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TimeActivityDrawer from "@/components/admin/TimeActivityDrawer";
import {
  formatDate,
  useActivityLogsForRequests,
  useClients,
  useEditRequestsById,
  useMembers,
} from "@/hooks/middleware";

const PAGE_SIZE = 10;

const TimeTemplatesPage = () => {
  const { activityLogs, loadingActivityLogs } = useActivityLogsForRequests();
  const { clients, loadingClients } = useClients();
  const { members, loadingMembers } = useMembers();

  // Filter state
  const [filterClient, setFilterClient] = useState("");
  const [filterMember, setFilterMember] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Applied filters (only set when "Filtrar" is clicked)
  const [appliedClient, setAppliedClient] = useState("");
  const [appliedMember, setAppliedMember] = useState("");
  const [appliedDate, setAppliedDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer
  const [selectedActivity, setSelectedActivity] = useState<
    (typeof activityLogs)[number] | null
  >(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = (activity: (typeof activityLogs)[number]) => {
    setSelectedActivity(activity);
    setIsDrawerOpen(true);
  };

  // Unique dates from activityLogs for the date selector
  const uniqueDates = useMemo(() => {
    const dates = activityLogs
      .map((a) => a.log_date)
      .filter((d): d is string => !!d);
    return Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  }, [activityLogs]);

  // Filtered data
  const filteredLogs = useMemo(() => {
    return activityLogs.filter((act) => {
      if (appliedClient && act.clients?.id !== appliedClient) return false;
      if (appliedMember && act.users?.id !== appliedMember) return false;
      if (appliedDate && act.log_date !== appliedDate) return false;
      return true;
    });
  }, [activityLogs, appliedClient, appliedMember, appliedDate]);

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleFilter = () => {
    setAppliedClient(filterClient);
    setAppliedMember(filterMember);
    setAppliedDate(filterDate);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilterClient("");
    setFilterMember("");
    setFilterDate("");
    setAppliedClient("");
    setAppliedMember("");
    setAppliedDate("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Planilla de tiempos", 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    const today = new Date().toLocaleDateString("es-AR");
    doc.text(`Exportado el ${today}`, 14, 22);
    doc.setTextColor(0, 0, 0);

    autoTable(doc, {
      startY: 28,
      head: [
        [
          "Cliente",
          "Integrante",
          "Fecha",
          "Tarea",
          "Piezas",
          "Horas",
          "Observaciones",
        ],
      ],
      body: filteredLogs.map((act) => [
        act.clients?.name ?? "-",
        act.users?.full_name ?? "-",
        formatDate(act.log_date),
        act.task_types?.name ?? "-",
        act.pieces_count ?? "-",
        act.hours ?? "-",
        act.notes ?? "-",
      ]),
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 250, 245] },
      margin: { left: 14, right: 14 },
    });

    doc.save(`planilla-tiempos-${today.replace(/\//g, "-")}.pdf`);
  };

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarAdmin />
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="hidden md:block mb-3">
          <PageHeader
            badge=""
            title="Planilla de tiempos"
            subtitle="Revisa y gestiona las actividades registradas por el equipo."
          />
        </div>

        <div className="md:hidden mb-6">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            PLANILLA DE TIEMPOS
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Planilla de tiempos
          </h1>
          <p className="text-sm text-gris-kurve-dark">
            Revisa y gestiona las actividades registradas por el equipo.
          </p>
        </div>

        <div className="flex flex-col justify-between gap-6">
          {/* Filters */}
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Cliente</label>
                <select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">
                  Integrantes
                </label>
                <select
                  value={filterMember}
                  onChange={(e) => setFilterMember(e.target.value)}
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                >
                  <option value="">Seleccionar integrante</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Fecha</label>
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                >
                  <option value="">Seleccionar fecha</option>
                  {uniqueDates.map((date) => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-4 flex flex-wrap gap-3">
                <Button
                  onClick={handleFilter}
                  className="w-full md:w-fit cursor-pointer px-8 py-6 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors"
                >
                  Filtrar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="w-full md:w-fit px-8 py-6 rounded-lg cursor-pointer"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
              <h2 className="text-base font-medium text-gray-900">
                Registro de tareas y horas
              </h2>
              <Button
                className="flex items-center bg-verde-kurve text-white px-4 py-5 hover:bg-verde-kurve-dark hover:text-white"
                variant="outline"
                onClick={handleExport}
                disabled={filteredLogs.length === 0}
              >
                <FileDown />
                Exportar Archivo
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="px-3.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide border-b border-gray-200">
                  <TableHead className="h-12 px-3 font-semibold text-gray-400">
                    Clientes
                  </TableHead>
                  <TableHead className="font-semibold text-gray-400">
                    Integrantes
                  </TableHead>
                  <TableHead className="font-semibold text-gray-400">
                    Fecha
                  </TableHead>
                  <TableHead className="font-semibold text-gray-400 w-[300px]">
                    Tarea
                  </TableHead>
                  <TableHead className="font-semibold text-gray-400">
                    Piezas
                  </TableHead>
                  <TableHead className="font-semibold text-gray-400">
                    Horas
                  </TableHead>
                  <TableHead className="font-semibold text-gray-400">
                    Observaciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingActivityLogs ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      Cargando actividades...
                    </TableCell>
                  </TableRow>
                ) : paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-sm text-muted-foreground"
                    >
                      No se encontraron actividades con los filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((act) => (
                    <TableRow
                      key={act.id}
                      onClick={() => handleOpenDrawer(act)}
                      className="border-b border-gray-100 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="text-sm px-4 py-3.5">
                        {act.clients?.name}
                      </TableCell>
                      <TableCell className="px-4 py-6 text-sm">
                        {act.users?.full_name}
                      </TableCell>
                      <TableCell className="px-4 py-6 text-sm">
                        {formatDate(act.log_date)}
                      </TableCell>
                      <TableCell className="px-4 py-6 text-sm">
                        {act.task_types?.name}
                      </TableCell>
                      <TableCell className="px-4 py-6 text-sm">
                        {act.pieces_count}
                      </TableCell>
                      <TableCell className="px-4 py-6 text-sm">
                        {act.hours}
                      </TableCell>
                      <TableCell className="px-4 py-6 text-sm">
                        {act.notes ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {filteredLogs.length > 0 && (
              <div className="h-14 px-6 py-6 border-t border-gray-200 gap-4 flex items-center text-sm text-muted-foreground">
                <h4 className="font-semibold">
                  Página {currentPage} de {totalPages} &mdash;{" "}
                  {filteredLogs.length}{" "}
                  {filteredLogs.length === 1 ? "resultado" : "resultados"}
                </h4>

                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    className="border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <TimeActivityDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          activity={selectedActivity}
        />
      </main>
    </div>
  );
};

export default TimeTemplatesPage;
