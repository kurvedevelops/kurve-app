import Modal from "@/components/modals/Modal";
import { useTaskTypes } from "@/hooks/middleware";
import { useFormik } from "formik";
import { toast } from "sonner";
import { z } from "zod";

type AddMemberFormValues = {
  name: string;
  email: string;
  password: string;
  phone: string;
  task_type_id: string;
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
  task_type_id: z.string().min(1, "Selecciona un cargo"),
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
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) => {
  const { tasks } = useTaskTypes();

  const formik = useFormik<AddMemberFormValues>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      task_type_id: "",
    },

    validate,

    validateOnMount: true,

    onSubmit: async (values, { resetForm }) => {
      const response = await fetch("/api/activity-logs/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone || null,
          task_type_id: values.task_type_id,
        }),
      });

      if (!response.ok) {
        const body = await response
          .json()
          .catch(() => ({ error: "Error desconocido" }));
        toast.error("No se pudo crear el integrante", {
          description: body.error ?? "Error desconocido",
        });
        return;
      }

      toast.success("Integrante creado correctamente");
      resetForm();
      onSuccess?.();
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full">
        <div className="pb-4">
          <h2 className="text-xl font-semibold text-azul-kurve">
            Información del nuevo miembro
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
              placeholder="Ej: Juan Perez"
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
              placeholder="mail@empresa.com"
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
              htmlFor="password"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-azul-kurve mb-2"
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                placeholder="+54 11 0000-0000"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
              />
            </div>

            <div>
              <label
                htmlFor="task_type_id"
                className="block text-sm font-medium text-azul-kurve mb-2"
              >
                Cargo
              </label>
              <select
                id="task_type_id"
                name="task_type_id"
                value={formik.values.task_type_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full h-11 px-3 rounded-lg border border-slate-300 bg-white text-sm outline-none focus:ring-1 focus:ring-verde-kurve"
              >
                <option value="">Selecciona el cargo</option>
                {tasks.map((cargo) => (
                  <option key={cargo.id} value={cargo.id}>
                    {cargo.name}
                  </option>
                ))}
              </select>
              {formik.touched.task_type_id && formik.errors.task_type_id && (
                <p className="mt-1 text-xs text-red-500">
                  {formik.errors.task_type_id}
                </p>
              )}
            </div>
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
