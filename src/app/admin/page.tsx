"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import {
  useClients,
  useMembers,
  useClientConsumption,
  useEditRequests,
  useActivityLogsForRequests,
  getInitials,
} from "@/hooks/middleware";
import RedirectedAlert from "@/hooks/redirectedAlert";
import { Suspense } from "react";
import { Clock, ClipboardList } from "lucide-react";
import ConsumptionChartAdmin from "@/components/admin/ConsumptionChartAdmin";
import { useMemo } from "react";
export const dynamic = "force-dynamic";

const AlertWrapper = () => {
  RedirectedAlert();
  return null;
};

interface RecentActivity {
  id: string;
  initials: string;
  name: string;
  client: string;
  taskType: string;
  hours: number;
}

const AdminPage = () => {
  const { clients, loadingClients } = useClients();
  const { members } = useMembers();
  const { data: consumption } = useClientConsumption();
  const { editRequests } = useEditRequests();

  const { activityLogs, loadingActivityLogs } = useActivityLogsForRequests();

  const pendingCorrections = editRequests.filter(
    (req) => req.status === "pending",
  ).length;

  const totalHoursRegistered = consumption.reduce(
    (acc, item) => acc + (item.consumed_hours ?? 0),
    0,
  );

  const activeClients = clients.filter((client) => client.status === "active");

  const recentActivities: RecentActivity[] = useMemo(
    () =>
      activityLogs.slice(0, 5).map((log) => ({
        id: log.id,
        initials: getInitials(log.users?.full_name),
        name: log.users?.full_name ?? "Sin nombre",
        client: log.clients?.name ?? "Sin cliente",
        taskType: log.task_types?.name ?? "Sin tipo",
        hours: log.hours ?? 0,
      })),
    [activityLogs],
  );

  const hasActivities = recentActivities.length > 0;

  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarAdmin />
      <Suspense fallback={<div>Cargando...</div>}>
        <AlertWrapper />
      </Suspense>

      <main className="flex-1 md:ml-50 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          badge="Panel Admin"
          title="Bienvenido/a"
          showName={true}
          subtitle="Bienvenido al panel de control de Kurve."
        />

        {/* Cards Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-background p-6 md:pl-4 lg:p-6 rounded-lg border border-border">
            <div className="text-verde-kurve mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-xs font-bold text-gris-kurve-dark uppercase tracking-wide mb-3">
              Clientes Activos
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-sm text-verde-kurve font-medium">
                {clients.length == 0
                  ? "Sin datos aún"
                  : activeClients.length + " clientes"}
              </p>
            </div>
          </div>

          <div className="bg-background p-6 md:pl-4 lg:p-6 rounded-lg border border-border">
            <div className="text-verde-kurve mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-xs font-bold text-gris-kurve-dark uppercase tracking-wide mb-3">
              Integrantes
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-sm text-verde-kurve font-medium">
                {members.length === 0 ? "Sin integrantes aún" : members.length}
              </p>
            </div>
          </div>

          <div className="bg-background p-6 md:pl-4 lg:p-6 rounded-lg border border-border">
            <div className="text-verde-kurve mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-xs font-bold text-gris-kurve-dark uppercase tracking-wide mb-3">
              Horas Registradas
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-sm text-verde-kurve font-medium">
                {totalHoursRegistered === 0
                  ? "Sin horas registradas"
                  : totalHoursRegistered}
              </p>
            </div>
          </div>

          <div className="bg-background p-6 md:pl-4 lg:p-6 rounded-lg border border-border">
            <div className="text-verde-kurve mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-gris-kurve-dark uppercase tracking-wide mb-3">
              Correcciones Pendientes
            </p>
            <div className="border-t border-border pt-3">
              <p className="text-sm text-verde-kurve font-medium">
                {pendingCorrections === 0
                  ? "Sin correcciones pendientes"
                  : pendingCorrections}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-background p-12 rounded-lg border border-border min-h-96">
          <div className="flex flex-col lg:flex-row gap-4">
            <ConsumptionChartAdmin />
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 w-full lg:w-[480px] h-112.5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-bold text-gris-kurve-dark uppercase tracking-wide">
                  Actividad reciente
                </h2>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Últimos registros
                </span>
              </div>

              <div className="space-y-3">
                {loadingActivityLogs ? (
                  <div className="flex items-center justify-center h-[350px]">
                    <p className="text-sm text-gray-400">
                      Cargando actividad...
                    </p>
                  </div>
                ) : hasActivities ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-verde-kurve/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-verde-kurve">
                              {activity.initials}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {activity.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {activity.client} · {activity.taskType}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-end h-55 mt-4">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <ClipboardList className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Sin actividad reciente
                    </p>
                    <p className="text-xs text-gray-400 mt-1 text-center max-w-48">
                      Los registros del equipo aparecerán aquí cuando se carguen
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
