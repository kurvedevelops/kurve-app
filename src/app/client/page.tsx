"use client";
import ConsumptionChart from "@/components/client/ConsumptionChart";
import PageHeader from "@/components/layout/PageHeader";
import SidebarClient from "@/components/layout/SidebarClient";
import { Card, CardHeader } from "@/components/ui/card";
import RedirectedAlert from "@/hooks/redirectedAlert";
import PackageSummaryCard from "@/components/client/PackageSummaryCard";
import { Suspense } from "react";
import { FileText, Folder, BarChart3, BookOpen } from "lucide-react";
import {
  useCurrentUser,
  useClientsByUser,
  useClients,
  usePackageByClient,
} from "@/hooks/middleware";

const links = [
  {
    title: "Contrato",
    description:
      "Documento de contrato con los detalles del acuerdo y términos.",
    icon: FileText,
    color: "#5B8E3D",
    bg: "#EEF8E7",
  },
  {
    title: "Google Drive",
    description:
      "Google Drive con los entregables y archivos compartidos del proyecto.",
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
  const { user, loadingUser } = useCurrentUser();
  const clientId = user?.client_id;

  const { clientPackage, loadingClientPackage } = usePackageByClient(clientId);

  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarClient />
      <Suspense fallback={<div>Cargando...</div>}>
        <AlertWrapper />
      </Suspense>

      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          badge="Portal del Cliente"
          title="Bienvenido"
          showName={true}
          subtitle="Monitorea tu actividad y metricas clave"
        />
        <div className="flex justify-between mt-3 gap-8 md:flex-row flex-col">
          <div className="w-full md:w-1/2">
            {clientId && <ConsumptionChart clientId={clientId} />}
          </div>
          <div className="w-full md:w-1/2">
            <PackageSummaryCard
              clientPackage={clientPackage ? clientPackage : null}
            />
          </div>
        </div>
        <div className="w-full mt-4">
          <h2 className="text-[28px] font-semibold text-[#1E1E1E] mb-4">
            Enlaces Importantes
          </h2>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-2 md:ml-8 ml-0">
            {links.map((item) => (
              <Card
                key={item.title}
                className="rounded-2xl bg-white border border-[#ECECEC] cursor-pointer shadow-none px-5 py-5 w-80 hover:shadow-sm transition-all"
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
