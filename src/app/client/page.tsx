"use client";
import ConsumptionChart from "@/components/client/ConsumptionChart";
import PageHeader from "@/components/layout/PageHeader";
import SidebarClient from "@/components/layout/SidebarClient";
import { Card, CardHeader } from "@/components/ui/card";
import RedirectedAlert from "@/hooks/redirectedAlert";
import PackageSummaryCard from "@/components/client/PackageSummaryCard";
import { Suspense } from "react";
import { linkTypeConfig } from "@/lib/linkTypeConfig";
import {
  useCurrentUser,
  useClientLinks,
  usePackageByClient,
} from "@/hooks/middleware";
import {LinkIcon} from "lucide-react"

const AlertWrapper = () => {
  RedirectedAlert();
  return null;
};

const ClientPage = () => {
  const { user, loadingUser } = useCurrentUser();
  const clientId = user?.client_id;
  const { links, loadingLinks } = useClientLinks(clientId);
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

            {loadingLinks ? (
              <p className="text-sm text-gray-400">Cargando...</p>
            ) : links.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-4xl">
                <div className="w-16 h-16 rounded-full bg-verde-kurve/10 flex items-center justify-center mb-4">
                  <LinkIcon size={32} className="text-verde-kurve" />
                </div>

                <h4 className="text-lg font-bold text-foreground mb-2">
                  Este cliente todavía no tiene links
                </h4>

                <p className="text-sm text-gris-kurve-dark text-center max-w-sm mb-6">
                  El administrador va a cargar los links importantes para el cliente
                </p>
              </div>
            ): (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4 md:ml-8 ml-0">
              {links.map((link) => {
                const config = linkTypeConfig[link.type];
                const Icon = config.icon;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Card className="rounded-2xl bg-white border border-[#ECECEC] cursor-pointer shadow-none px-5 py-5 w-80 hover:shadow-sm transition-all">
                      <CardHeader className="p-0 flex flex-col gap-5">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: config.bg }}
                        >
                          <Icon
                            className="w-8 h-8"
                            style={{ color: config.color }}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <h3 className="text-2xl leading-none font-semibold text-[#1F1F1F]">
                            {link.label}
                          </h3>
                          <p className="text-[#707070]">{config.description}</p>
                        </div>
                      </CardHeader>
                    </Card>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientPage;
