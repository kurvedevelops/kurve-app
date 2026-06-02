"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import { useClients } from "@/hooks/middleware";
import RedirectedAlert from "@/hooks/redirectedAlert";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const AlertWrapper = () => {
  RedirectedAlert();
  return null;
};

const AdminPage = () => {
  const { clients, loadingClients } = useClients();

  const activeClients = clients.filter((client) => client.status === "active");

  const actions = [
    {
      label: "↓ Exportar",
      variant: "secondary" as const,
      onClick: () => console.log("Exportar"),
    },
    {
      label: "+ Nuevo cliente",
      variant: "primary" as const,
      onClick: () => console.log("Nuevo cliente"),
    },
  ];

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
                Sin datos aún
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
                Sin datos aún
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
                Sin datos aún
              </p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-background p-12 rounded-lg border border-border flex flex-col items-center justify-center min-h-96">
          <div className="w-20 h-20 bg-verde-kurve/10 rounded-full flex items-center justify-center mb-6">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#65B32E"
              strokeWidth="2"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <h3 className="text-xl text-center font-bold text-azul-kurve mb-2">
            Estructura lista, sin datos todavía
          </h3>
          <p className="text-sm text-gris-kurve-dark text-center max-w-md">
            El layout y la estructura de navegación están construidos. Las
            funcionalidades de gestión y los datos reales se incorporarán en las
            próximas fases del desarrollo.
          </p>
          <button className="mt-6 px-6 py-2 bg-verde-kurve text-white rounded-full text-sm font-medium hover:bg-verde-kurve-dark transition-colors">
            FASE 1 — INFRAESTRUCTURA COMPLETA
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
