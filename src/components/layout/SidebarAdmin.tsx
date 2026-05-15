"use client";
import SidebarBase from "./SidebarBase";

const SidebarAdmin = () => {
  const navSections = [
    {
      title: "Principal",
      links: [{ label: "Dashboard", href: "/admin" }],
    },
    {
      title: "Gestion",
      links: [
        { label: "Clientes", href: "/admin/clientes" },
        { label: "Integrantes", href: "/admin/integrantes" },
        { label: "Paquetes", href: "/admin/paquetes" },
      ],
    },
    {
      title: "Operacion",
      links: [
        { label: "Planilla de tiempos", href: "/admin" },
        { label: "Correcciones", href: "/admin" },
      ],
    },
    {
      title: "Configuracion",
      links: [{ label: "Ajustes", href: "/admin" }],
    },
  ];

  return (
    <SidebarBase
      navSections={navSections}
      userAvatar="LM"
      userName="Lucas Méndez"
      userRole="Administrador"
      showLogout={true}
    />
  );
};

export default SidebarAdmin;
