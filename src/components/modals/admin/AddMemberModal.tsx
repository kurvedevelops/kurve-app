import Modal from "@/components/modals/Modal";
import { useFormik } from "formik";
import { z } from "zod";

type AddMemberFormValues = {
  name: string;
  email: string;
  password: string;
};

export const addMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo"),
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .email("Ingresa un email válido"),

  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const validate = (values: AddMemberFormValues) => {
  const result = addMemberSchema.safeParse(values);

  if (result.success) return {};

  return result.error.issues.reduce((acc: Record<string, string>, issue) => {
    const field = issue.path[0] as string;

    acc[field] = issue.message;

    return acc;
  }, {});
};

const AddMemberModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const formik = useFormik<AddMemberFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },

    validate,

    validateOnMount: true,

    onSubmit: async (values) => {
      const response = await fetch("/api/members/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.name,
          email: values.email,
          password: values.password,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        console.error("Error al crear miembro:", result.error);
        // acá podés setear un estado de error para mostrar en el modal
        return;
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full">
        <div className="pb-4">
          <h2 className="text-xl font-semibold text-azul-kurve">
            Información del Nuevo Miembro
          </h2>
          <p className="text-sm text-gris-kurve-dark mt-1">
            Completa los datos para invitar a un nuevo colaborador al equipo.
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-azul-kurve mb-2"
            >
              Nombre del Integrante
            </label>

            <input
              type="text"
              id="name"
              placeholder="Ej: nombre del usuario"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-azul-kurve mb-2"
            >
              Email
            </label>

            <input
              type="email"
              id="email"
              placeholder="empresa.nombre@empresa.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-xs text-red-500">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-azul-kurve mb-2"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              placeholder="********"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendInvitation"
              className="h-4 w-4 rounded border-slate-300"
            />

            <label
              htmlFor="sendInvitation"
              className="text-sm text-gris-kurve-dark"
            >
              Enviar invitación por correo automáticamente
            </label>
          </div>

          <div className="border-t border-gris-kurve-light pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer h-9 px-4 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={!(formik.isValid && formik.dirty)}
              className="cursor-pointer h-9 px-4 text-sm font-medium rounded-lg bg-verde-kurve text-white hover:bg-verde-kurve/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddMemberModal;
