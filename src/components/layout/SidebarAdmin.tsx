"use client";
import { getInitials, useCurrentUser } from "@/hooks/middleware";
import SidebarBase from "./SidebarBase";

const SidebarAdmin = () => {
  const { user, loadingUser } = useCurrentUser();

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
        { label: "Planilla de tiempos", href: "/admin/planilla/planilla" },
        { label: "Correcciones", href: "/admin/correcciones" },
      ],
    },
    {
      title: "Configuracion",
      links: [{ label: "Ajustes", href: "/admin/configuracion" }],
    },
  ];

  return (
    <SidebarBase
      navSections={navSections}
      userAvatar={getInitials(user?.full_name)}
      userName={user?.full_name?.toString() || "U"}
      userRole="Administrador"
      showLogout={true}
    />
  );
};

export default SidebarAdmin;
