import { CheckSquare, Clock, Plus } from "lucide-react";

export const navItems = [
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
    href: "/member/mis-actividades",
  },
  {
    label: "Registrar",
    icon: <Plus size={28} />,
    href: "/member/registrar",
    isFab: true,
  },
  {
    label: "Correciones",
    icon: <CheckSquare size={24} />,
    href: "/member/mis-solicitudes",
  },
  {
    label: "Clientes",
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
    href: "/member/clientes-asignados",
  },
];
