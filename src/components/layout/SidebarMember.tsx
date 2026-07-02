"use client";
import { getInitials, useCurrentUser } from "@/hooks/middleware";
import SidebarBase from "./SidebarBase";

const SidebarMember = () => {
  const { user, loadingUser } = useCurrentUser();
  const navSections = [
    {
      title: "Actividades",
      links: [
        { label: "Registrar actividad", href: "/member/registrar" },
        { label: "Mis registros", href: "/member/mis-actividades" },
        { label: "Mis solicitudes", href: "/member/mis-solicitudes" },
      ],
    },
    {
      title: "Asignaciones",
      links: [
        { label: "Clientes asignados", href: "/member/clientes-asignados" },
      ],
    },
  ];

  return (
    <SidebarBase
      navSections={navSections}
      userAvatar={getInitials(user?.full_name)}
      userName={user?.full_name?.toString() || "U"}
      userRole="Usuario"
      showLogout={true}
    />
  );
};

export default SidebarMember;
