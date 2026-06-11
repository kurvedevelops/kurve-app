"use client";
import { useCurrentUser } from "@/hooks/middleware";
import { ReactNode } from "react";

interface Action {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary";
  icon?: ReactNode;
}

interface PageHeaderProps {
  badge?: string;
  title: string;
  showName?: boolean;
  subtitle?: string;
  actions?: Action[];
  children?: ReactNode;
}

const PageHeader = ({
  badge,
  title,
  showName = false,
  subtitle,
  actions,
  children,
}: PageHeaderProps) => {
  const { user, loadingUser } = useCurrentUser();
  return (
    <div className="flex flex-col mt-12 md:mt-0 md:flex-row justify-between items-start">
      <div className="flex-1 mb-3">
        {badge && (
          <p className="text-xs font-bold text-gris-kurve-dark uppercase tracking-wide">
            {badge}
          </p>
        )}
        <h1 className="text-4xl font-bold text-foreground mt-2">
          {title + (showName && user?.full_name ? `, ${user.full_name}` : "")}
        </h1>
        {subtitle && (
          <p className="text-sm text-gris-kurve-dark mt-1">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      {(actions || children) && (
        <div className="flex gap-3 md:mt-5 max-w-65">
          {actions?.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors max-w-fit ${
                action.variant === "primary"
                  ? "bg-verde-kurve text-white hover:bg-verde-kurve-dark"
                  : "border border-border bg-background hover:bg-gris-kurve-light text-foreground"
              }`}
            >
              {action.label}
            </button>
          ))}
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
