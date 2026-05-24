"use client";
import SidebarMember from "@/components/layout/SidebarMember";
import PageHeader from "@/components/layout/PageHeader";
import BottomNav from "@/components/layout/BottomNav";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Clock, Plus, MessageSquare } from "lucide-react";
import {
  useClients,
  useClientsByUser,
  useCurrentUser,
} from "@/hooks/middleware";

const registroSchema = Yup.object().shape({
  cliente: Yup.string().required("Selecciona un cliente"),
  tarea: Yup.string().required("Selecciona una tarea"),
  fecha: Yup.string().required("La fecha es requerida"),
  horas: Yup.number()
    .min(0.5, "Mínimo 0.5 horas")
    .max(24, "Máximo 24 horas")
    .required("Las horas son requeridas"),
});

const RegistrarHorasPage = () => {
  const { user, loadingUser } = useCurrentUser();
  const { clients, loadingClients } = useClients();
  const { clientsId, loadingClientsId } = useClientsByUser(user?.id || "");

  const userClients = clients.filter((client) =>
    clientsId.some((item) => item.client_id === client.id),
  );

  const horasTotales = 34.5;
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

  const formik = useFormik({
    initialValues: {
      cliente: "",
      tarea: "",
      fecha: new Date().toISOString().split("T")[0],
      horas: 0,
    },
    validationSchema: registroSchema,
    onSubmit: async (values) => {
      console.log("Formulario enviado:", values);
      // Aquí iría la lógica para enviar a Supabase
    },
  });

  const tareas = [
    { id: 1, nombre: "Diseño de UI" },
    { id: 2, nombre: "Desarrollo Frontend" },
    { id: 3, nombre: "Testing" },
    { id: 4, nombre: "Reunión de Estatus" },
  ];

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarMember />

      <main className="flex-1 md:ml-45 lg:ml-64 mt-15 md:mt-0 p-4 md:p-8">
        {/* Desktop Header */}
        <div className="hidden md:block mb-3">
          <PageHeader
            badge="Registro Diario"
            title="Cargar Horas"
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
                    name="cliente"
                    value={formik.values.cliente}
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
                  {formik.touched.cliente && formik.errors.cliente && (
                    <p className="text-xs text-red-500">
                      {formik.errors.cliente}
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
                    name="fecha"
                    value={formik.values.fecha}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="px-2  py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  />
                  {formik.touched.fecha && formik.errors.fecha && (
                    <p className="text-xs text-red-500">
                      {formik.errors.fecha}
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
                    name="tarea"
                    value={formik.values.tarea}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="px-2  py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  >
                    <option value="">Selecciona una tarea</option>
                    {tareas.map((tarea) => (
                      <option key={tarea.id} value={tarea.id}>
                        {tarea.nombre}
                      </option>
                    ))}
                  </select>
                  {formik.touched.tarea && formik.errors.tarea && (
                    <p className="text-xs text-red-500">
                      {formik.errors.tarea}
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
                    name="horas"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formik.values.horas}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                    placeholder="0.00"
                  />
                  {formik.touched.horas && formik.errors.horas && (
                    <p className="text-xs text-red-500">
                      {formik.errors.horas}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full md:w-fit px-8 py-3 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors"
              >
                Registrar Horas
              </button>
            </form>
          </div>

          {/* Recent Records Section */}
          <div className="lg:col-span-1">
            <div className="bg-background rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Registros Recientes
                </h3>
                <a
                  href="#"
                  className="text-xs text-verde-kurve font-semibold hover:underline"
                >
                  Ver todo
                </a>
              </div>

              {/* Records List */}
              <div className="flex flex-col gap-4">
                {/* Record Item */}
                <div className="flex items-start gap-3 pb-4 border-b border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      Diseño de UI Dashboard
                    </p>
                    <p className="text-xs text-gris-kurve-dark">
                      Stark Industries • Hoy
                    </p>
                  </div>
                  <p className="text-sm font-bold text-verde-kurve flex-shrink-0">
                    4.5h
                  </p>
                </div>

                <div className="flex items-start gap-3 pb-4 border-b border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      Post RRSS Semanal
                    </p>
                    <p className="text-xs text-gris-kurve-dark">
                      Globex Corp • Ayer
                    </p>
                  </div>
                  <p className="text-sm font-bold text-verde-kurve flex-shrink-0">
                    2.0h
                  </p>
                </div>

                <div className="flex items-start gap-3 pb-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      Reunión de Estatus
                    </p>
                    <p className="text-xs text-gris-kurve-dark">
                      Wayne Ent • 20 May
                    </p>
                  </div>
                  <p className="text-sm font-bold text-verde-kurve flex-shrink-0">
                    1.0h
                  </p>
                </div>
              </div>

              {/* Total Weekly */}
              <div className="mt-6 bg-gradient-to-r from-verde-kurve-dark to-verde-kurve rounded-lg p-4 text-white">
                <p className="text-sm font-semibold opacity-90 mb-2">
                  Total Semanal
                </p>
                <h4 className="text-3xl font-bold mb-3">
                  {horasTotales} horas
                </h4>
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-white rounded-full"></div>
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
