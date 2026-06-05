"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Info } from "lucide-react";

interface BaseModalAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions: BaseModalAction[];
  maxWidth?: string;
  footerNote?: React.ReactNode;
  hideRequiredNote?: boolean;
}

export function BaseModal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  maxWidth = "560px",
  footerNote,
  hideRequiredNote = false,
}: BaseModalProps) {
  const firstFocusableRef = useRef<HTMLElement | null>(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Foco al primer elemento focusable cuando abre
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const modal = document.getElementById("base-modal-content");
        const focusable = modal?.querySelector<HTMLElement>(
          "input, select, textarea, button:not([data-modal-close])",
        );
        focusable?.focus();
      }, 50);
    }
  }, [open]);

  if (!open) return null;

  const defaultFooterNote = !hideRequiredNote && (
    <span className="flex items-center gap-1.5 text-xs text-gris-kurve-dark">
      <Info size={14} />
      Campos con <span className="text-red-500 font-medium">*</span> son
      obligatorios
    </span>
  );

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="base-modal-content"
        className="bg-background w-full rounded-2xl border border-border shadow-xl"
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex items-start justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-medium text-foreground mt-3 mb-1">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-gris-kurve-dark mb-5">{description}</p>
            )}
          </div>
          <button
            data-modal-close
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-gris-kurve-dark hover:bg-muted transition-colors shrink-0 mt-1"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-4">{children}</div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div>{footerNote ?? defaultFooterNote}</div>
          <div className="flex gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={
                  action.variant === "primary"
                    ? "h-9 px-4 text-sm font-medium rounded-lg bg-verde-kurve text-white hover:bg-verde-kurve/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    : "h-9 px-4 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                }
              >
                {action.loading ? action.loadingLabel : action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
