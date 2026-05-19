"use client";
import SidebarBase from "./SidebarBase";

const SidebarMember = () => {
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
      userAvatar="SP"
      userName="Sofia P."
      userRole="Usuario"
      showLogout={true}
    />
  );
};

export default SidebarMember;
