"use client";
import SidebarClient from "@/components/layout/SidebarClient";

const ClientPage = () => {
  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarClient />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div>
          <p className="text-xs font-black text-azul-kurve bg-verde-kurve-dark/10 rounded-xl py-1 px-2.5 w-fit uppercase tracking-wide">
            Portal del Cliente
          </p>
          <h1 className="text-4xl font-bold text-foreground mt-2">
            Bienvenido, <span className="text-verde-kurve">Estudio Norte</span>
          </h1>
          <p className="text-sm text-gris-kurve-dark mt-1">
            Acá vas a poder ver el estado de tu plan y todo lo que hicimos por
            vos
          </p>
        </div>

        {/* Hero Card */}
        <div className="mt-4 mb-4 bg-gradient-to-r from-verde-kurve-dark to-azul-kurve rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-90">
              FASE 1 - LAYOUT BASE
            </p>
            <h2 className="text-3xl font-bold mb-4">Tu panel está listo</h2>
            <p className="text-sm opacity-90 max-w-md">
              El portal del cliente está construido y conectado. En las próximas
              fases vas a ver tu consumo en tiempo real, las piezas entregadas y
              el equipo trabajando para vos.
            </p>
          </div>

          {/* Circle with SIN DATOS */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-white/20 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-wide opacity-70">
                Sin datos
              </p>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-background p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
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
            <h3 className="text-md font-bold text-foreground mb-2">
              Consumo de horas
            </h3>
            <p className="text-md text-gris-kurve-dark">
              Cuántas horas se consumieron del paquete contratado.
            </p>
          </div>

          <div className="bg-background p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
            <div className="text-verde-kurve mb-4">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3 className="text-md font-bold text-foreground mb-2">
              Piezas entregadas
            </h3>
            <p className="text-md text-gris-kurve-dark">
              Publicaciones realizadas durante el período.
            </p>
          </div>

          <div className="bg-background p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
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
            <h3 className="text-md font-bold text-foreground mb-2">
              Equipo asignado
            </h3>
            <p className="text-md text-gris-kurve-dark">
              Las personas trabajando en tu cuenta y sus roles.
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-background p-12 rounded-lg border border-border flex flex-col items-center justify-center min-h-80">
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
          <h3 className="text-xl font-bold text-foreground mb-2">
            Vista del cliente preparada
          </h3>
          <p className="text-sm text-gris-kurve-dark text-center max-w-md">
            Toda la estructura del portal del cliente está construida y la
            autenticación funciona correctamente. Las métricas en tiempo real,
            las piezas y el equipo asignado se cargarán en las fases siguientes.
          </p>
          <button className="mt-6 px-6 py-2 bg-verde-kurve text-white rounded-full text-sm font-medium hover:bg-verde-kurve-dark transition-colors">
            FASE 1 — LAYOUT BASE COMPLETO
          </button>
        </div>
      </main>
    </div>
  );
};

export default ClientPage;
