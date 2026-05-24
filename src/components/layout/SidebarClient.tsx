"use client";
import { getInitials, useCurrentUser } from "@/hooks/middleware";
import SidebarBase from "./SidebarBase";

const ClientHeader = () => (
  <div className="p-4 bg-verde-kurve-light rounded-lg border border-verde-kurve/20">
    <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
      Cliente
    </p>
    <h3 className="text-sm font-bold text-foreground mb-2">Estudio Norte</h3>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-verde-kurve"></div>
      <p className="text-xs text-gris-kurve-dark">Plan activo · Mayo</p>
    </div>
  </div>
);

const SidebarClient = () => {
  const { user, loading } = useCurrentUser();
  const navSections = [
    {
      title: "Tu cuenta",
      links: [
        { label: "Resumen de consumo", href: "/client/consumo" },
        { label: "Piezas entregadas", href: "/client/piezas" },
        { label: "Equipo asignado", href: "/client/equipo" },
      ],
    },
    {
      title: "Recursos",
      links: [
        { label: "Links y documentos", href: "/client/links-docs" },
        { label: "Estado de cuenta", href: "/client/estado" },
      ],
    },
  ];

  return (
    <SidebarBase
      headerComponent={<ClientHeader />}
      navSections={navSections}
      userAvatar={getInitials(user?.full_name)}
      userName={user?.full_name?.toString() || "U"}
      userRole="Cliente"
      showLogout={true}
    />
  );
};

export default SidebarClient;
