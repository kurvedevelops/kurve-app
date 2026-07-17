import { FileText, FolderOpen, BarChart3, Link as LinkIcon, LucideIcon } from "lucide-react";

export type LinkType = "contract" | "drive" | "analytics" | "custom";

interface LinkTypeConfig {
  label: string;
  description: string;
  icon: LucideIcon;
  bg: string;
  color: string;
}

export const linkTypeConfig: Record<LinkType, LinkTypeConfig> = {
  contract: {
    label: "Contrato",
    description: "Documento de contrato con los detalles del acuerdo y términos.",
    icon: FileText,
    bg: "#EEF8E7",
    color: "#5B8E3D",
  },
  drive: {
    label: "Drive",
    description: "Google Drive con los entregables y archivos compartidos del proyecto.",
    icon: FolderOpen,
    bg: "#FFF7DD",
    color: "#D2A500",
  },
  analytics: {
    label: "Analíticas",
    description: "Datos clave y métricas de rendimiento del proyecto para monitorear el éxito y tomar decisiones informadas.",
    icon: BarChart3,
    bg: "#FFF1E3",
    color: "#D4871F",
  },
  custom: {
    label: "Personalizado",
    description: "Acceso personalizado agregado para este cliente.",
    icon: LinkIcon,
    bg: "#F4ECFF",
    color: "#7A52B3",
  },
};