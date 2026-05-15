"use client";
import SidebarBase from "./SidebarBase";

const SidebarMember = () => {
  const navSections = [
    {
      title: "Actividades",
      links: [
        { label: "Registrar actividad", href: "/member/register" },
        { label: "Mis registros", href: "/member/activities" },
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
      userAvatar="SP"
      userName="Sofia P."
      userRole="Usuario"
      showLogout={true}
    />
  );
};

export default SidebarMember;
