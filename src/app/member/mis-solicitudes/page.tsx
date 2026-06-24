"use client";
import PageHeader from "@/components/layout/PageHeader";
import {
  useActivityLogsForRequests,
  useCurrentUser,
  useEditRequestsById,
  useTaskTypes,
} from "@/hooks/middleware";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SidebarMember from "@/components/layout/SidebarMember";

const MisSolicitudesPage = () => {
  const statusLabels = {
    pending: "Pendientes",
    approved: "Aprobadas",
    rejected: "Rechazadas",
    all: "Todos los estados",
  };

  const [statusFilter, setStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("pending");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const { activityLogs, loadingActivityLogs } = useActivityLogsForRequests();
  const { user, loadingUser } = useCurrentUser();
  const { tasks, loadingTasks } = useTaskTypes();

  const { editRequests, loadingEditRequests } = useEditRequestsById(
    user?.id || "",
  );

  const filteredRequests =
    statusFilter === "all"
      ? editRequests
      : editRequests.filter((req) => req.status === statusFilter);

  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarMember />
      <main className="flex-1 md:ml-45 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          badge="Solicitudes de correccion"
          title="Listado de solicitudes"
          subtitle="Revisa las correcciones pendientes y su estado"
        />

        <div className="bg-background rounded-xl border border-border mt-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-foreground">
                Pedidos de correccion
              </span>
              <span className="text-sm text-gris-kurve-dark">
                {filteredRequests.length}{" "}
                {filteredRequests.length === 1 ? "peticion" : "peticiones"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Status Filter */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setOpenStatusDropdown(!openStatusDropdown)}
                  className="flex items-center gap-2 px-4 py-2 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm text-foreground font-medium w-full md:w-auto"
                >
                  {statusLabels[statusFilter]}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openStatusDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {openStatusDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-full md:w-48 bg-background border border-border rounded-lg shadow-lg z-40">
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setStatusFilter(
                            value as
                              | "pending"
                              | "approved"
                              | "rejected"
                              | "all",
                          );
                          setOpenStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          statusFilter === value
                            ? "bg-verde-kurve/10 text-verde-kurve font-semibold"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-visible">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Tarea
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Fecha
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Estado
                  </TableHead>

                  <TableHead className="px-4 py-3 text-center text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Solicitado
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-80 text-center text-lg">
                      Todas tus solicitudes fueron revisadas.
                      <br />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <Fragment key={req.id}>
                      <TableRow
                        key={req.id}
                        className="border-b border-[#E4E4E4] hover:bg-muted/40"
                      >
                        <TableCell className="px-6 py-6 font-semibold">
                          {tasks.find(
                            (task) =>
                              task.id ===
                              activityLogs.find(
                                (log) => log.id === req.activity_log_id,
                              )?.task_type_id,
                          )?.name ?? "-"}
                        </TableCell>

                        <TableCell className="font-semibold">
                          {
                            activityLogs.find(
                              (log) => log.id === req.activity_log_id,
                            )?.log_date
                          }
                        </TableCell>

                        <TableCell className="font-semibold">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                              req.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : req.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {req.status === "approved"
                              ? "Aprobada"
                              : req.status === "pending"
                                ? "Pendiente"
                                : "Rechazada"}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-center">
                          {req.created_at.split("T")[0]}
                        </TableCell>
                      </TableRow>

                      <TableRow
                        key={`${req.id}-detail`}
                        className="bg-muted/30 border-b border-[#E4E4E4]"
                      >
                        <TableCell colSpan={5} className="px-6 py-4">
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Valor anterior */}
                            <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-red-500 mb-1">
                                Valor anterior
                              </p>
                              <p className="text-sm font-medium text-red-800">
                                {req.old_value ?? "-"}
                              </p>
                            </div>

                            {/* Flecha separadora */}
                            <div className="hidden md:flex items-center text-gris-kurve-dark">
                              <ChevronRight size={20} />
                            </div>

                            {/* Valor nuevo */}
                            <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-green-600 mb-1">
                                Valor nuevo
                              </p>
                              <p className="text-sm font-medium text-green-800">
                                {req.field_name === "task_type_id"
                                  ? tasks.find(
                                      (task) => task.id == req.new_value,
                                    )?.name
                                  : req.new_value}
                              </p>
                            </div>

                            {/* Motivo */}
                            {req.reason && (
                              <div className="flex-1 rounded-lg border border-border bg-background p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-gris-kurve-dark mb-1">
                                  Motivo
                                </p>
                                <p className="text-sm text-foreground">
                                  {req.reason}
                                </p>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MisSolicitudesPage;
