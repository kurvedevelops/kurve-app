"use client";
import {
  getInitials,
  useClients,
  useCurrentUser,
  usePackageByClient,
} from "@/hooks/middleware";
import SidebarBase from "./SidebarBase";

function getMesActual() {
  const mes = new Date().toLocaleDateString("es-ES", { month: "long" });
  return mes.charAt(0).toUpperCase() + mes.slice(1);
}

const SidebarClient = () => {
  const { user, loadingUser } = useCurrentUser();
  const clientId = user?.client_id;
  const { clients, loadingClients } = useClients();
  const client = clients.find((c) => c.id === clientId);
  const { clientPackage, loadingClientPackage } = usePackageByClient(clientId);

  const navSections = [
    {
      title: "Tu cuenta",
      links: [
        { label: "Resumen de consumo", href: "/client" },
        { label: "Equipo asignado", href: "/client/equipo" },
      ],
    },
  ];

  return (
    <SidebarBase
      headerComponent={
        <div className="p-4 bg-verde-kurve-light rounded-lg border border-verde-kurve/20">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            Cliente
          </p>
          <h3 className="text-sm font-bold text-foreground mb-2">
            {loadingClients ? "Cargando..." : client?.name}
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-verde-kurve"></div>
            <p className="text-xs text-gris-kurve-dark">
              Plan{" "}
              {loadingClientPackage
                ? "Cargando..."
                : clientPackage?.status === "active"
                  ? "activo"
                  : clientPackage?.status === "paused"
                    ? "pausado"
                    : "inactivo"}{" "}
              · {getMesActual()}
            </p>
          </div>
        </div>
      }
      navSections={navSections}
      userAvatar={getInitials(client?.name)}
      userName={
        loadingClients
          ? "Cargando..."
          : client?.name?.toString() || "Sin nombre"
      }
      userRole="Cliente"
      showLogout={true}
    />
  );
};

export default SidebarClient;
