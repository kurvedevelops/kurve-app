"use client";
import SidebarMember from "@/components/layout/SidebarMember";
import BottomNav from "@/components/layout/BottomNav";
import PageHeader from "@/components/layout/PageHeader";
import { Plus, CheckSquare, Clock, MessageSquare } from "lucide-react";
import RedirectedAlert from "@/hooks/redirectedAlert";
import { Suspense } from "react";

const AlertWrapper = () => {
  RedirectedAlert();
  return null;
};

const MemberPage = () => {
  const navItems = [
    {
      label: "Inicio",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
      href: "/member",
    },
    {
      label: "Actividades",
      icon: <Clock size={24} />,
      href: "/member/activities",
    },
    {
      label: "Registrar",
      icon: <Plus size={28} />,
      href: "/member/register",
      isFab: true,
    },
    {
      label: "Mensajes",
      icon: <MessageSquare size={24} />,
      href: "/member/messages",
    },
    {
      label: "Perfil",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      href: "/member/profile",
    },
  ];

  const handleFabClick = () => {
    console.log("Registrar actividad");
  };

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      {/* Sidebar */}
      <SidebarMember />
      <Suspense fallback={<div>Cargando...</div>}>
        <AlertWrapper />
      </Suspense>

      <main className="flex-1 md:ml-46 lg:ml-64 mt-4 md:mt-0 p-4 md:p-8">
        {/* Desktop Header */}
        <div className="md:mb-3">
          <PageHeader
            badge="Portal del Equipo"
            title="Bienvenido/a, Sofia"
            subtitle="Registrá tu actividad y visualizá tus tareas asignadas"
          />
        </div>

        {/* Quick Register Card */}
        <div className="bg-gradient-to-r from-verde-kurve-dark to-azul-kurve rounded-2xl p-6 md:p-8 text-white relative overflow-hidden mb-6">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wide mb-2 bg-white/20 w-fit px-2 py-1 rounded-xl opacity-90">
              REGISTRO RÁPIDO
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              ¿Trabajaste hoy?
            </h2>
            <p className="text-sm opacity-90 mb-4 max-w-62">
              Registrá tu actividad antes de cerrar el día para mantener
              actualizado el panel de control
            </p>
            <button className="md:absolute md:right-1 md:top-1/2 md:-translate-y-2.5 bg-white text-azul-kurve font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-100 transition-colors text-md flex items-center gap-2">
              Registrar ahora <span>→</span>
            </button>
          </div>
        </div>

        {/* Today's Activities Section */}
        <div className="mb-8">
          <h3 className="text-xs font-black uppercase tracking-wide text-gris-kurve-dark mb-4">
            HOY
          </h3>
          <div className="bg-background p-8 md:p-12 rounded-lg border border-dashed border-border flex flex-col items-center justify-center min-h-80">
            <div className="w-16 md:w-20 h-16 md:h-20 bg-verde-kurve/10 rounded-full flex items-center justify-center mb-6">
              <CheckSquare className="w-8 md:w-10 h-8 md:h-10 text-verde-kurve" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 text-center">
              Aún sin actividad de hoy
            </h3>
            <p className="text-sm text-gris-kurve-dark text-center max-w-md mb-6">
              Cuando registres tu primera tarea aparecerá aquí. ¡Comienza ahora!
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav items={navItems} onFabClick={handleFabClick} />

      {/* Mobile bottom padding for navbar */}
      <div className="md:hidden h-20"></div>
    </div>
  );
};

export default MemberPage;
