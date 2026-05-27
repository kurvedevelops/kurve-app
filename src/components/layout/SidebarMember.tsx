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
      ],
    },
    {
      title: "Asignaciones",
      links: [
        { label: "Tareas", href: "/member/tasks" },
        { label: "Clientes asignados", href: "/member/clients" },
        { label: "Proyectos activos", href: "/member/projects" },
      ],
    },
    {
      title: "Comunicación",
      links: [{ label: "Mensajes", href: "/member/messages" }],
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
