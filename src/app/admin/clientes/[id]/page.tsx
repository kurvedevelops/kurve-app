"use client";
import { useParams, useRouter } from "next/navigation";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import PageHeader from "@/components/layout/PageHeader";
import { Package, Calendar, Mail, Phone, Plus } from "lucide-react";
import {
  assignPackage,
  editClient,
  getInitials,
  useClients,
  usePackageByClient,
  usePackageConsumption,
} from "@/hooks/middleware";
import {
  EditarClienteFormData,
  EditarClienteModal,
} from "@/components/modals/EditarClienteModal";
import { useState } from "react";
import {
  AsignarPaqueteFormData,
  AsignarPaqueteModal,
} from "@/components/modals/AsignarPaquete";

const ClientDetailPage = () => {
  const params = useParams();
  const clientId = params.id as string;
  const [showEditarClienteModal, setShowEditarClienteModal] = useState(false);
  const [showAsignarPaqueteModal, setShowAsignarPaqueteModal] = useState(false);
  const { clients, loadingClients } = useClients();
  const { packageConsumption, loadingPackageConsumption } =
    usePackageConsumption(clientId);

  const client = clients.find((c) => c.id === clientId);
  const initials = getInitials(client?.name);
  const router = useRouter();

  const handleActions = {
    edit: () => setShowEditarClienteModal(true),
    assignPackage: () => setShowAsignarPaqueteModal(true),
  };

  const handleAsignarPaquete = async (data: AsignarPaqueteFormData) => {
    await assignPackage(clientId, data);
    router.refresh();
  };

  const handleEditarCliente = async (data: EditarClienteFormData) => {
    await editClient(clientId, data);
    router.refresh();
  };

  if (!client)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cliente no encontrado
      </div>
    );

  const actions = [
    {
      label: "Editar",
      variant: "secondary" as const,
      onClick: () => setShowEditarClienteModal(true),
    },
    {
      label: "Asignar paquete",
      variant: "primary" as const,
      onClick: () => setShowAsignarPaqueteModal(true),
    },
  ];

  const statusColor =
    client.status === "active"
      ? "bg-verde-kurve/10 text-verde-kurve"
      : "bg-yellow-500/20 text-yellow-500";

  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarAdmin />

      <main className="flex-1 md:ml-45 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          badge={`Clientes • ${client.name}`}
          title="Detalle del cliente"
          actions={actions}
        />

        {/* Header Section */}
        <div className="flex flex-col bg-white p-5 rounded-xl md:flex-row md:items-start md:justify-between gap-4 mb-4 mt-4 border border-border">
          <div className="flex items-start gap-4">
            {/* Client Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-verde-kurve-dark to-verde-kurve flex items-center justify-center text-white font-bold text-2xl">
              {initials}
            </div>

            {/* Client Info */}
            <div className="flex-1 self-center pl-3">
              <h2 className="text-[22px] font-bold text-foreground mb-1">
                {client.name}
              </h2>

              <div className="flex gap-2">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor}`}
                  >
                    {client.status === "active" ? "● Activo" : "● Pausado"}
                  </span>
                </div>

                <span className="flex flex-col gap-1 text-sm text-gris-kurve-dark">
                  •
                </span>

                {/* Contact Info */}
                <div className="flex flex-col gap-1 text-sm text-gris-kurve-dark">
                  {client.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>
                        Alta:{" "}
                        {new Date(client.created_at).toLocaleDateString(
                          "es-AR",
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {client.email ? (
                  <>
                    <span className="flex flex-col gap-1 text-sm text-gris-kurve-dark">
                      •
                    </span>
                    <div className="flex flex-col gap-1 text-sm text-gris-kurve-dark">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{client.email}</span>
                      </div>
                    </div>
                  </>
                ) : null}

                {client.phone ? (
                  <>
                    <span className="flex flex-col gap-1 text-sm text-gris-kurve-dark">
                      •
                    </span>
                    <div className="flex flex-col gap-1 text-sm text-gris-kurve-dark">
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-4 ml-5">
          Paquetes activos
        </h1>
        {/* Paquete Section */}
        <div className="bg-background rounded-xl border border-border p-8">
          {packageConsumption.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-verde-kurve/10 flex items-center justify-center mb-4">
                <Package size={32} className="text-verde-kurve" />
              </div>

              <h4 className="text-lg font-bold text-foreground mb-2">
                Este cliente todavía no tiene paquete
              </h4>

              <p className="text-sm text-gris-kurve-dark text-center max-w-sm mb-6">
                Asigná el primer paquete con la cantidad de horas contratadas y
                la distribución de piezas por categoría.
              </p>

              <button
                onClick={handleActions.assignPackage}
                className="px-6 py-2 bg-verde-kurve text-white rounded-lg hover:bg-verde-kurve-dark transition-colors font-semibold"
              >
                + Asignar paquete
              </button>
            </div>
          ) : (
            <>
              {packageConsumption.map((pkg) => (
                <div key={pkg.package_id} className="mb-5">
                  {/* Package Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-1">
                        {pkg.package_name}
                      </h4>
                      <p className="text-sm text-gris-kurve-dark">
                        {pkg.start_date
                          ? new Date(pkg.start_date).toLocaleDateString("es-AR")
                          : "Indefinido"}{" "}
                        -{" "}
                        {pkg.end_date
                          ? new Date(pkg.end_date).toLocaleDateString("es-AR")
                          : "Indefinido"}
                      </p>
                    </div>
                    <span className="px-3 py-1 mt-3 rounded-full text-xs font-bold bg-verde-kurve/10 text-verde-kurve">
                      ●{" "}
                      {pkg.package_status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {/* Horas */}
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-xs font-semibold text-gris-kurve-dark uppercase tracking-wide mb-2">
                        Horas Totales
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {pkg.total_hours}
                        <span className="text-sm ml-1 font-normal">hs</span>
                      </p>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-xs font-semibold text-gris-kurve-dark uppercase tracking-wide mb-2">
                        Horas Consumidas
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {pkg.consumed_hours}
                        <span className="text-sm ml-1 font-normal">hs</span>
                      </p>
                    </div>

                    {/* Posts */}
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-xs font-semibold text-gris-kurve-dark uppercase tracking-wide mb-2">
                        Publicaciones totales
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {pkg.total_pieces || 0}
                      </p>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-xs font-semibold text-gris-kurve-dark uppercase tracking-wide mb-2">
                        Publicaciones consumidas
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {pkg.total_pieces || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>

      <EditarClienteModal
        open={showEditarClienteModal}
        onClose={() => setShowEditarClienteModal(false)}
        client={client}
        onSubmit={handleEditarCliente}
      />
      <AsignarPaqueteModal
        open={showAsignarPaqueteModal}
        clientName={client.name}
        clientId={client.id}
        onClose={() => setShowAsignarPaqueteModal(false)}
        onSubmit={handleAsignarPaquete}
      />
    </div>
  );
};

export default ClientDetailPage;
