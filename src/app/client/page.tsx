"use client";
import ConsumptionChart from "@/components/client/ConsumptionChart";
import PageHeader from "@/components/layout/PageHeader";
import SidebarClient from "@/components/layout/SidebarClient";
import { Card, CardHeader } from "@/components/ui/card";
import RedirectedAlert from "@/hooks/redirectedAlert";
import { Suspense } from "react";
import { FileText, Folder, BarChart3, BookOpen } from "lucide-react";

const planData = {
  used: 44,
  total: 100,
  percent: 44,
};

const deliverablesData = {
  completed: 22,
  total: 100,
  percent: 20,

  items: [
    {
      label: "website",
      current: 55,
      total: 100,
      progress: 55,
    },
    {
      label: "marketing",
      current: 22,
      total: 100,
      progress: 22,
    },
    {
      label: "contenido",
      current: 33,
      total: 100,
      progress: 33,
    },
  ],
};

const links = [
  {
    title: "Contrato",
    description: "Documento de contrato con los detalles del acuerdo y términos.",
    icon: FileText,
    color: "#5B8E3D",
    bg: "#EEF8E7",
  },
  {
    title: "Google Drive",
    description: "Google Drive con los entregables y archivos compartidos del proyecto.",
    icon: Folder,
    color: "#D2A500",
    bg: "#FFF7DD",
  },
  {
    title: "Analytics",
    description:
      "Datos clave y métricas de rendimiento del proyecto para monitorear el éxito y tomar decisiones informadas.",
    icon: BarChart3,
    color: "#D4871F",
    bg: "#FFF1E3",
  },
  {
    title: "Documentación",
    description:
      "Documentación detallada del proyecto, incluyendo procesos, guías y recursos para referencia futura.",
    icon: BookOpen,
    color: "#7A52B3",
    bg: "#F4ECFF",
  },
];

const AlertWrapper = () => {
  RedirectedAlert();
  return null;
};

const ClientPage = () => {
  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarClient />
      <Suspense fallback={<div>Cargando...</div>}>
        <AlertWrapper />
      </Suspense>

      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          badge="Portal del Cliente"
          title="Bienvenido/a! Sofia"
          subtitle="Monitorea tu actividad y metricas clave"
        />
        <div className="flex justify-between items-center mt-8 gap-8 md:flex-row flex-col">
          <div className="">
            <ConsumptionChart />
          </div>
          <div className="flex flex-col gap-5 flex-1">
            <div className="bg-white rounded-3xl border border-border px-6 py-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                  Consumo de Plan
                </h2>

                <span className="text-verde-kurve text-2xl font-bold">
                  {planData.percent}%
                </span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <p className="font-medium">
                  Horas Utilizadas: {planData.used}
                </p>

                <p className="font-medium">
                  Horas Incluidas: {planData.total}
                </p>
              </div>

              <div className="w-full h-4 bg-[#ECECEC] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-verde-kurve"
                  style={{
                    width: `${planData.percent}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-border px-6 py-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                  Resumen de Entregables
                </h2>

                <span className="text-verde-kurve text-2xl font-bold">
                  {deliverablesData.percent}%
                </span>
              </div>

              <div className="flex justify-between items-center mb-3">
                <p className="font-medium">
                  Piezas Realizadas: {deliverablesData.completed}
                </p>

                <p className="font-medium">
                  Incluidas: {deliverablesData.total}
                </p>
              </div>
              <div className="w-full h-4 bg-[#ECECEC] rounded-full overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-verde-kurve"
                  style={{
                    width: `${deliverablesData.percent}%`,
                  }}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {deliverablesData.items.map((item) => (
                  <div key={item.label} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {item.label ?? "Pieza"}
                      </span>

                      <span className="font-medium">
                        {item.current}/{item.total}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#ECECEC] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-verde-kurve"
                        style={{
                          width: `${item.progress}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full mt-10">
          <h2 className="text-[28px] font-semibold text-[#1E1E1E] mb-4">
            Enlaces Importantes
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4 ml-10 md:ml-0">
            {links.map((item) => (
              <Card
                key={item.title}
                className="rounded-2xl border border-[#ECECEC] shadow-none px-5 py-5 w-90 hover:shadow-sm transition-all"
              >
                <CardHeader className="p-0 flex flex-col gap-5">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: item.bg,
                    }}
                  >
                    <item.icon
                      className="w-8 h-8"
                      style={{
                        color: item.color,
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-2xl leading-none font-semibold text-[#1F1F1F]">
                      {item.title}
                    </h3>

                    <p className=" text-[#707070]">{item.description}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientPage;
