"use client";
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
  subtitle?: string;
  actions?: Action[];
  children?: ReactNode;
}

const PageHeader = ({
  badge,
  title,
  subtitle,
  actions,
  children,
}: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="flex-1">
        {badge && (
          <p className="text-xs font-bold text-gris-kurve-dark uppercase tracking-wide">
            {badge}
          </p>
        )}
        <h1 className="text-4xl font-bold text-foreground mt-2">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gris-kurve-dark mt-1">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      {(actions || children) && (
        <div className="flex gap-3 ml-8">
          {actions?.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                action.variant === "primary"
                  ? "bg-verde-kurve text-white hover:bg-verde-kurve-dark"
                  : "border border-border bg-background hover:bg-gris-kurve-light text-foreground"
              }`}
            >
              {action.icon}
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
