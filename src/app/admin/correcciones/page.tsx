"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import {
  AproveEditRequest,
  RejectEditRequest,
  useActivityLogsForRequests,
  useCurrentUser,
  useEditRequests,
  useTaskTypes,
  useUsers,
} from "@/hooks/middleware";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AprovedCorrectionData,
  CorrectionFormData,
} from "@/components/modals/member/CorrectionModal";
import { toast } from "sonner";

const CorrecionesPage = () => {
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

  const [aprovingReq, setAprovingReq] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const { activityLogs, loadingActivityLogs } = useActivityLogsForRequests();
  const { user, loadingUser } = useCurrentUser();
  const { users, loadingUsers } = useUsers();
  const { tasks, loadingTasks } = useTaskTypes();

  const userId = user?.id;

  const handleAproveRequest = async (
    data: AprovedCorrectionData,
    userId: string,
  ) => {
    try {
      setAprovingReq(true);
      await AproveEditRequest(data, userId);
      toast.success(
        "Pedido de correccion aprobado, la actividad ha sido modificada",
      );
    } catch {
      toast.error("Error al aprobar correccion");
    } finally {
      setAprovingReq(false);
    }
  };

  const handleRejectReq = async (reqId: string, adminId: string) => {
    try {
      await RejectEditRequest(reqId, adminId);
      toast.success(
        "Pedido de correccion rechazado, la actividad se mantiene igual",
      );
    } catch {
      toast.error("Error al rechazar correccion");
    }
  };

  const { editRequests, loadingEditRequests } = useEditRequests();

  const filteredRequests =
    statusFilter === "all"
      ? editRequests
      : editRequests.filter((req) => req.status === statusFilter);

  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarAdmin />
      <main className="flex-1 md:ml-45 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          badge="Revision de Correcciones"
          title="Correcciones"
          subtitle="Administra las correcciones pendientes y su estado"
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
                    Miembro
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Tarea
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Fecha
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Estado
                  </TableHead>

                  <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-80 text-center text-lg">
                      No hay correcciones para revisar.
                      <br />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((req) => (
                    <Fragment key={req.id}>
                      <TableRow
                        key={req.id}
                        className="border-b border-[#E4E4E4] hover:bg-muted/40 cursor-pointer"
                        onClick={() => toggleRow(req.id)}
                      >
                        <TableCell className="px-6 py-6 font-semibold">
                          {users.find((user) => user.id === req.requested_by)
                            ?.full_name ?? "-"}
                        </TableCell>

                        <TableCell className="font-semibold">
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

                        <TableCell>
                          <div className="flex items-center gap-3">
                            {req.status === "pending" && (
                              <div
                                className="flex gap-3"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="outline"
                                  className="h-9 rounded-lg text-sm hover:bg-verde-kurve/60 hover:text-verde-kurve-dark bg-verde-kurve/30 text-verde-kurve-dark"
                                  onClick={() =>
                                    handleAproveRequest(req, req.requested_by)
                                  }
                                >
                                  Aprobar
                                </Button>
                                <Button
                                  variant="outline"
                                  className="h-9 rounded-lg text-sm hover:bg-red-600/70 hover:text-red-850 bg-red-600/50 text-red-800"
                                  onClick={() => {
                                    if (user) {
                                      handleRejectReq(req.id, user.id);
                                    }
                                  }}
                                >
                                  Rechazar
                                </Button>
                              </div>
                            )}
                          </div>
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

export default CorrecionesPage;
