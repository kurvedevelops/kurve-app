"use client";
import SidebarMember from "@/components/layout/SidebarMember";
import PageHeader from "@/components/layout/PageHeader";
import BottomNav from "@/components/layout/BottomNav";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Clock, Plus, MessageSquare } from "lucide-react";
import {
  usePieceCategories,
  useClients,
  useClientsByUser,
  useCurrentUser,
  useTaskTypes,
  useActivityLogs,
} from "@/hooks/middleware";
import { createClient } from "@/lib/supabase/client";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const registroSchema = Yup.object().shape({
  client_id: Yup.string().required("Selecciona un cliente"),
  task_type_id: Yup.string().required("Selecciona una tarea"),
  category_id: Yup.string().nullable(),
  log_date: Yup.string()
    .required("La fecha es requerida")
    .test(
      "fecha-minima",
      "No se permiten fechas anteriores a 7 días hábiles",
      (value) => {
        if (!value) return false;
        const fechaIngresada = new Date(value);
        const fechaMinima = new Date();
        fechaMinima.setDate(fechaMinima.getDate() - 9);
        fechaMinima.setHours(0, 0, 0, 0);
        return fechaIngresada >= fechaMinima;
      },
    ),
  hours: Yup.number()
    .min(0.5, "Mínimo 0.5 horas")
    .max(12, "Máximo 12 horas")
    .required("Las horas son requeridas"),
  is_publication: Yup.boolean(),
  activity_status: Yup.string()
    .oneOf(["in_progress", "delivered"], "Estado de actividad inválido")
    .required("El estado de actividad es requerido"),
  pieces_count: Yup.number()
    .min(0, "No puede ser negativo")
    .integer("Debe ser un número entero")
    .required("Ingresa la cantidad de piezas"),
  notes: Yup.string().nullable(),
});

const RegistrarHorasPage = () => {
  const supabase = createClient();
  const { user, loadingUser } = useCurrentUser();
  const { clients, loadingClients } = useClients();
  const { clientsId, loadingClientsId } = useClientsByUser(user?.id || "");
  const { categories, loadingCategories } = usePieceCategories();
  const { tasks, loadingTasks } = useTaskTypes();
  const { activityLogs, loadingActivityLogs } = useActivityLogs(user?.id || "");

  const communityManagementId = tasks.find(
    (t) => t.name === "Community management",
  )?.id;

  const userClients = clients.filter((client) =>
    clientsId.some((item) => item.client_id === client.id),
  );

  const horasTotales = activityLogs
    .filter((log) => {
      const logDate = new Date(log.log_date);
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return logDate >= startOfWeek && logDate <= endOfWeek;
    })
    .reduce((total, log) => total + log.hours, 0);

  const navItems = [
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
      href: "/member/activities",
    },
    {
      label: "Registrar",
      icon: <Plus size={28} />,
      href: "/member/register",
      isFab: true,
    },
    {
      label: "Mensajes",
      icon: <MessageSquare size={24} />,
      href: "/member/messages",
    },
    {
      label: "Perfil",
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
      href: "/member/profile",
    },
  ];

  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      client_id: "",
      task_type_id: "",
      category_id: "",
      log_date: new Date().toISOString().split("T")[0],
      hours: 0,
      is_publication: false,
      activity_status: "",
      pieces_count: 0,
      notes: "",
    },
    validationSchema: registroSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setStatus }) => {
      if (!user?.id) {
        setStatus({ error: "Usuario no autenticado" });
        setSubmitting(false);
        return;
      }

      try {
        const { error } = await supabase.from("activity_logs").insert({
          user_id: user.id,
          client_id: values.client_id,
          task_type_id: values.task_type_id,
          category_id: values.category_id || null,
          log_date: values.log_date,
          hours: values.hours,
          pieces_count: values.pieces_count,
          notes: values.notes || null,
          status: values.activity_status,
        });

        if (error) throw error;

        setStatus({ success: "Horas registradas correctamente" });
        Swal.fire({
          icon: "success",
          title: "Éxito",
          confirmButtonColor: "#65B32E",
          confirmButtonText: "Aceptar",
          text: "Las horas se han registrado correctamente.",
        });
        resetForm();
        localStorage.removeItem("activity_draft");
      } catch (err: any) {
        setStatus({ error: err.message || "Error al registrar las horas" });
        Swal.fire({
          icon: "error",
          title: "Error",
          confirmButtonColor: "#65B32E",
          confirmButtonText: "Vuelve a intentarlo",
          text: err.message || "Error al registrar las horas",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const values = formik.values;
      if (values.client_id || values.task_type_id) {
        localStorage.setItem("activity_draft", JSON.stringify(values));
      } else {
        localStorage.removeItem("activity_draft");
      }
    }, 30);
    return () => clearInterval(interval);
  }, [formik.values]);

  useEffect(() => {
    const draft = localStorage.getItem("activity_draft");
    if (!draft) return;

    try {
      const parsed = JSON.parse(draft);
      if (parsed.client_id || parsed.task_type_id) {
        formik.setValues({
          ...formik.initialValues,
          ...parsed,
        });

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: "Recuperamos tu borrador",
          showConfirmButton: false,
          iconColor: "#65B32E",
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch {
      localStorage.removeItem("activity_draft");
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarMember />

      <main className="flex-1 md:ml-45 lg:ml-64 mt-15 md:mt-0 p-4 md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:block mb-3">
          <PageHeader
            badge="Registro Diario"
            title="Carga Horas"
            subtitle="Ingresa el detalle de tus actividades diarias"
          />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            Registro Diario
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Carga horas
          </h1>
          <p className="text-sm text-gris-kurve-dark">
            Ingresa el detalle de tus actividades diarias
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 bg-background rounded-xl border border-border p-6 md:p-8">
            {/* Status messages */}
            {formik.status?.success && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                {formik.status.success}
              </div>
            )}
            {formik.status?.error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formik.status.error}
              </div>
            )}

            <form
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-6"
            >
              {/* Row 1: Cliente y Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    Cliente
                  </label>
                  <select
                    name="client_id"
                    value={formik.values.client_id}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  >
                    <option value="">Selecciona un cliente</option>
                    {userClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.client_id && formik.errors.client_id && (
                    <p className="text-xs text-red-500">
                      {formik.errors.client_id}
                    </p>
                  )}
                </div>

                {/* Fecha */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    Fecha de la actividad
                  </label>
                  <input
                    type="date"
                    name="log_date"
                    value={formik.values.log_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  />
                  {formik.touched.log_date && formik.errors.log_date && (
                    <p className="text-xs text-red-500">
                      {formik.errors.log_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: Tarea y Horas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tarea */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    Tipo de tarea
                  </label>
                  <select
                    name="task_type_id"
                    value={formik.values.task_type_id}
                    onChange={(e) => {
                      formik.handleChange(e);
                      if (e.target.value !== communityManagementId) {
                        formik.setFieldValue("pieces_count", 0);
                        formik.setFieldValue("category_id", "");
                      }
                    }}
                    onBlur={formik.handleBlur}
                    className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  >
                    <option value="">Selecciona una tarea</option>
                    {tasks.map((tarea) => (
                      <option key={tarea.id} value={tarea.id}>
                        {tarea.name}
                      </option>
                    ))}
                  </select>
                  {formik.touched.task_type_id &&
                    formik.errors.task_type_id && (
                      <p className="text-xs text-red-500">
                        {formik.errors.task_type_id}
                      </p>
                    )}
                </div>

                {/* Horas */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    Horas dedicadas
                  </label>
                  <input
                    type="number"
                    name="hours"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formik.values.hours}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                    placeholder="0.00"
                  />
                  {formik.touched.hours && formik.errors.hours && (
                    <p className="text-xs text-red-500">
                      {formik.errors.hours}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                  <input
                    type="checkbox"
                    name="is_publication"
                    checked={formik.values.is_publication}
                    onChange={formik.handleChange}
                    className="w-4 h-4 accent-verde-kurve"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    ¿Es una publicación?
                  </span>
                </label>
              </div>

              {/* Row 3: Piezas y Categoría */}
              {formik.values.is_publication && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Piezas */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-foreground">
                        Cantidad de piezas
                      </label>
                      <input
                        type="number"
                        name="pieces_count"
                        min="0"
                        step="1"
                        value={formik.values.pieces_count}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                        placeholder="0"
                      />
                      {formik.touched.pieces_count &&
                        formik.errors.pieces_count && (
                          <p className="text-xs text-red-500">
                            {formik.errors.pieces_count}
                          </p>
                        )}
                    </div>

                    {/* Categoría */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-foreground">
                        Categoría{" "}
                        <span className="text-gris-kurve-dark font-normal">
                          (opcional)
                        </span>
                      </label>
                      <select
                        name="category_id"
                        value={formik.values.category_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                      >
                        <option value="">Selecciona una categoria</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Estado de actividad
                </label>
                <select
                  name="activity_status"
                  value={formik.values.activity_status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                >
                  <option value="">Selecciona un estado</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="delivered">Completado</option>
                </select>
              </div>

              {/* Row 4: Notas */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Notas{" "}
                  <span className="text-gris-kurve-dark font-normal">
                    (opcional)
                  </span>
                </label>
                <textarea
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve resize-none"
                  placeholder="Agrega comentarios adicionales..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={formik.isSubmitting}
                  className="w-full md:w-fit px-8 py-3 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formik.isSubmitting ? "Registrando..." : "Registrar Horas"}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Records Section */}
          <div className="lg:col-span-1">
            <div className="bg-background rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Registros Recientes
                </h3>
                <button
                  onClick={() => router.push("./mis-actividades")}
                  className="text-xs text-verde-kurve font-semibold hover:underline cursor-pointer"
                >
                  Ver todo
                </button>
              </div>

              {/* Records List */}
              <div className="flex flex-col gap-4">
                {[...activityLogs].slice(0, 4).map((log, index) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 pb-4 border-b border-border ${
                      index === activityLogs.length - 1 ? "border-b-0 pb-0" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {log.task_types?.name}
                      </p>
                      <p className="text-xs text-gris-kurve-dark">
                        {log.clients?.name} • {log.log_date}
                      </p>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {log.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className="text-sm font-bold text-verde-kurve">
                        {log.hours}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Weekly */}
              <div className="bg-gradient-to-r from-verde-kurve-dark to-verde-kurve rounded-lg p-4 text-white">
                <p className="text-sm font-semibold opacity-90 mb-2">
                  Total Semanal
                </p>
                <h4 className="text-3xl font-bold mb-3">
                  {horasTotales} horas
                </h4>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((horasTotales / 40) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav items={navItems} onFabClick={() => {}} />

      {/* Mobile bottom padding */}
      <div className="md:hidden h-20"></div>
    </div>
  );
};

export default RegistrarHorasPage;
