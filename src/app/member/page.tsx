"use client";
import SidebarMember from "@/components/layout/SidebarMember";
import { Plus, CheckSquare, Clock, MessageSquare } from "lucide-react";

const MemberPage = () => {
  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className="hidden md:block">
        <SidebarMember />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-verde-kurve-dark to-azul-kurve flex items-center justify-center text-white font-bold text-sm">
            SP
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Sofia P.</p>
            <p className="text-xs text-gris-kurve-dark">Buen día</p>
          </div>
        </div>
        <button className="text-gris-kurve-dark">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M13.73 21a2 2 0 0 1-3.46 0"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <main className="flex-1 md:ml-64 mt-20 md:mt-0 p-4 md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <p className="text-xs font-black text-azul-kurve bg-verde-kurve-dark/10 rounded-xl py-1 px-2.5 w-fit uppercase tracking-wide">
            Portal del Equipo
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Bienvenido/a, <span className="text-verde-kurve">Sofia</span>
          </h1>
          <p className="text-sm text-gris-kurve-dark mt-1">
            Registrá tu actividad y visualizá tus tareas asignadas
          </p>
        </div>

        {/* Mobile Header Section */}
        <div className="md:hidden mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            ¿Trabajaste hoy?
          </h2>
          <p className="text-sm text-gris-kurve-dark mb-4">
            Registrá tu actividad antes de cerrar el día
          </p>
        </div>

        {/* Quick Register Card - Mobile & Desktop */}
        <div className="bg-gradient-to-r from-verde-kurve-dark to-azul-kurve rounded-2xl p-6 md:p-8 text-white relative overflow-hidden mb-6">
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wide mb-2 bg-white/20 w-fit px-2 py-1 rounded-xl opacity-90">
              REGISTRO RÁPIDO
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              ¿Trabajaste hoy?
            </h2>
            <p className="text-sm opacity-90 mb-4 max-w-md">
              Registrá tu actividad antes de cerrar el día para mantener
              actualizado el panel de control
            </p>
            <button className="md:absolute md:right-12 md:top-1/2 md:-translate-y-2.5 bg-white text-azul-kurve font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-100 transition-colors text-md flex items-center gap-2">
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
            <button className="px-6 py-2 bg-verde-kurve text-white rounded-full text-sm font-medium hover:bg-verde-kurve-dark transition-colors">
              Registrar Actividad
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border flex items-center justify-around py-3 z-40">
        <button className="flex flex-col items-center gap-1 text-gris-kurve-dark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-xs">Inicio</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gris-kurve-dark">
          <Clock size={24} />
          <span className="text-xs">Actividades</span>
        </button>

        <button className="flex items-center justify-center w-14 h-14 bg-verde-kurve text-white rounded-full -mt-6 hover:bg-verde-kurve-dark transition-colors">
          <Plus size={28} />
        </button>

        <button className="flex flex-col items-center gap-1 text-gris-kurve-dark">
          <MessageSquare size={24} />
          <span className="text-xs">Mensajes</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gris-kurve-dark">
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
          <span className="text-xs">Perfil</span>
        </button>
      </nav>

      {/* Mobile bottom padding for navbar */}
      <div className="md:hidden h-20"></div>
    </div>
  );
};

export default MemberPage;
