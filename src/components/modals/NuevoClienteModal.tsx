"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Info } from "lucide-react";

export interface NuevoClienteFormData {
  name: string;
  razonSocial: string;
  email: string;
  telefono: string;
  fechaAlta: string;
}

interface NuevoClienteModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NuevoClienteFormData) => void | Promise<void>;
}

const initialForm: NuevoClienteFormData = {
  name: "",
  razonSocial: "",
  email: "",
  telefono: "",
  fechaAlta: "",
};

export function NuevoClienteModal({
  open,
  onClose,
  onSubmit,
}: NuevoClienteModalProps) {
  const [form, setForm] = useState<NuevoClienteFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus primer campo al abrir
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialForm);
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const isValid = form.name.trim().length > 0 && form.fechaAlta.length > 0;

  async function handleSubmit() {
    if (!isValid || loading) return;
    setLoading(true);
    try {
      await onSubmit(form);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof NuevoClienteFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (!open) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-background w-full max-w-[560px] rounded-2xl border border-border shadow-xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-0 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-2xl font-medium text-foreground mt-3 mb-1">
              Nuevo cliente
            </h2>
            <p className="text-sm text-gris-kurve-dark mb-5">
              Empezá creando el cliente. Después le vas a poder asignar un
              paquete.
            </p>
          </div>
          <div className="flex justify-end self-start mb-1">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-gris-kurve-dark hover:bg-muted transition-colors"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nombre del cliente <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              type="text"
              placeholder="Ej: Estudio Norte"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-lg border border-verde-kurve bg-background text-foreground placeholder-gris-kurve-dark focus:outline-none focus:border-verde-kurve focus:ring-1 focus:ring-verde-kurve/30 transition-colors"
            />
            <p className="text-xs text-gris-kurve-dark mt-1">
              Este nombre se mostrará en todo el sistema.
            </p>
          </div>

          {/* Razón social + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Razón social
              </label>
              <input
                type="text"
                placeholder="Razón social (opcional)"
                value={form.razonSocial}
                onChange={(e) => handleChange("razonSocial", e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:outline-none focus:border-verde-kurve focus:bg-background transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email de contacto
              </label>
              <input
                type="email"
                placeholder="contacto@empresa.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:outline-none focus:border-verde-kurve focus:bg-background transition-colors"
              />
            </div>
          </div>

          {/* Teléfono + Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+54 11 0000-0000"
                value={form.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-muted text-foreground placeholder-gris-kurve-dark focus:outline-none focus:border-verde-kurve focus:bg-background transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Fecha de alta <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.fechaAlta}
                onChange={(e) => handleChange("fechaAlta", e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:border-verde-kurve focus:bg-background transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="flex items-center gap-1.5 text-xs text-gris-kurve-dark">
            <Info size={14} />
            Campos con <span className="text-red-500 font-medium">*</span> son
            obligatorios
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-9 px-4 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValid || loading}
              className="h-9 px-4 text-sm font-medium rounded-lg bg-verde-kurve text-white hover:bg-verde-kurve/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando..." : "Crear cliente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
