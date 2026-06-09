"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import {
  useActivityLogs,
  useActivityLogsForRequests,
  useEditRequests,
  useTaskTypes,
  useUsers,
} from "@/hooks/middleware";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

  const { activityLogs, loadingActivityLogs } = useActivityLogsForRequests();
  const { users, loadingUsers } = useUsers();
  const { tasks, loadingTasks } = useTaskTypes();

  const { editRequests, loadingEditRequests } = useEditRequests();

  const router = useRouter();

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
                {editRequests.length}{" "}
                {editRequests.length === 1 ? "peticion" : "peticiones"}
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
                    Cliente
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
                {editRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-80 text-center text-lg">
                      No hay correcciones para revisar.
                      <br />
                    </TableCell>
                  </TableRow>
                ) : (
                  editRequests.map((req) => (
                    <TableRow
                      key={req.id}
                      className="border-b border-[#E4E4E4] hover:bg-transparent"
                    >
                      <TableCell className="px-6 py-6 font-semibold">
                        {users.find((user) => user.id === req.requested_by)}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {tasks.find(
                          (task) =>
                            task.id ===
                            activityLogs.find(
                              (log) => log.id === req.activity_log_id,
                            ).task_type_id,
                        )}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {
                          activityLogs.find(
                            (log) => log.id === req.activity_log_id,
                          ).log_date
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
                            ? "Aprovada"
                            : req.status === "pending"
                              ? "Pendiente"
                              : "Rechazada"}
                        </span>
                      </TableCell>

                      <TableCell>
                        {req.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              className="h-9 rounded-lg text-sm hover:bg-gray-50"
                            >
                              Aprobar
                            </Button>
                            <Button
                              variant="outline"
                              className="h-9 rounded-lg text-sm hover:bg-gray-50"
                            >
                              Rechazar
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
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
