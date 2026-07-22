"use client";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const cambiarContraseñaSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
    newPassword: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmá la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof cambiarContraseñaSchema>;
type FormErrors = Partial<Record<keyof FormData, string>>;

export default function CambiarContraseñaAdmin() {
  const [form, setForm] = useState<FormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  function handleChange(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleShow(field: keyof FormData) {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  async function handleSubmit() {
    const parsed = cambiarContraseñaSchema.safeParse(form);

    if (!parsed.success) {
      const newErrors: FormErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FormData;
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const supabase = createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user?.email) {
      toast.error("No se pudo verificar la sesión actual");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: form.currentPassword,
    });

    if (signInError) {
      setErrors({ currentPassword: "La contraseña actual es incorrecta" });
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: form.newPassword,
    });

    setLoading(false);

    if (updateError) {
      toast.error("Error al cambiar la contraseña", {
        description: updateError.message,
      });
      return;
    }

    toast.success("Contraseña actualizada correctamente");
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPassword({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  }

  function inputClass(field: keyof FormData) {
    return `w-full h-10 pl-3 pr-10 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-1 ${
      errors[field]
        ? "border-red-500 bg-red-50 focus:ring-red-200"
        : "border-border bg-white text-foreground focus:border-verde-kurve focus:ring-verde-kurve/30 focus:bg-background"
    }`;
  }

  function renderPasswordField(
    field: keyof FormData,
    label: string,
    autoComplete: string,
  ) {
    return (
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
        <div className="relative">
          <input
            type={showPassword[field] ? "text" : "password"}
            value={form[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            className={inputClass(field)}
            autoComplete={autoComplete}
          />
          <button
            type="button"
            onClick={() => toggleShow(field)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gris-kurve-dark hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword[field] ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {errors[field] && (
          <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mt-10 ml-4">
      <h3 className="text-lg font-bold text-foreground mb-1">
        Cambiar contraseña
      </h3>
      <p className="text-sm text-gris-kurve-dark mb-6">
        Actualizá la contraseña de tu cuenta de administrador.
      </p>

      <div className="flex flex-col gap-4">
        {renderPasswordField(
          "currentPassword",
          "Contraseña actual",
          "current-password",
        )}
        {renderPasswordField("newPassword", "Nueva contraseña", "new-password")}
        {renderPasswordField(
          "confirmPassword",
          "Confirmar nueva contraseña",
          "new-password",
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-2 px-6 py-2 bg-verde-kurve text-white rounded-lg hover:bg-verde-kurve-dark transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-fit"
        >
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </div>
    </div>
  );
}
