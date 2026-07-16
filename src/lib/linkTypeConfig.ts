import { FileText, FolderOpen, BarChart3, Link as LinkIcon, LucideIcon } from "lucide-react";

export type LinkType = "contract" | "drive" | "analytics" | "custom";

interface LinkTypeConfig {
  label: string;
  icon: LucideIcon;
  bg: string;
  color: string;
}

export const linkTypeConfig: Record<LinkType, LinkTypeConfig> = {
  contract: {
    label: "Contrato",
    icon: FileText,
    bg: "#EAF2FF",
    color: "#2563EB",
  },
  drive: {
    label: "Drive",
    icon: FolderOpen,
    bg: "#FFF4E5",
    color: "#F59E0B",
  },
  analytics: {
    label: "Analíticas",
    icon: BarChart3,
    bg: "#EAFBF1",
    color: "#16A34A",
  },
  custom: {
    label: "Personalizado",
    icon: LinkIcon,
    bg: "#F3F0FF",
    color: "#7C3AED",
  },
};