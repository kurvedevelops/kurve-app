"use client";
import { useParams } from "next/navigation";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import PageHeader from "@/components/layout/PageHeader";
import {
  Package,
  Calendar,
  Mail,
  Phone,
  Link as LinkIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  assignPackage,
  editClient,
  getInitials,
  useClients,
  useClientLinks,
  usePackageConsumption,
  ClientLink,
} from "@/hooks/middleware";
import { linkTypeConfig } from "@/lib/linkTypeConfig";
import {
  EditarClienteFormData,
  EditarClienteModal,
} from "@/components/modals/EditarClienteModal";
import { useState } from "react";
import {
  AsignarPaqueteFormData,
  AsignarPaqueteModal,
} from "@/components/modals/AsignarPaquete";
import ClientLinkModal from "@/components/modals/admin/cliente/ClientLinkModal";
import type { ClientLinkFormData } from "@/components/modals/admin/cliente/ClientLinkModal";
import { Card, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/modals/BorrarEntidadModal";

const ClientDetailPage = () => {
  const params = useParams();
  const clientId = params.id as string;
  const [showEditarClienteModal, setShowEditarClienteModal] = useState(false);
  const [showAsignarPaqueteModal, setShowAsignarPaqueteModal] = useState(false);
  const { links, loadingLinks, addLink, updateLink, deleteLink } =
    useClientLinks(clientId);
  const { clients, loadingClients, refetchClients } = useClients();
  const { packageConsumption, loadingPackageConsumption, refetchPackageConsumption } =
    usePackageConsumption(clientId);
  console.log("Package Consumption:", packageConsumption);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ClientLink | null>(null);
  const [deleteLinkConfirm, setDeleteLinkConfirm] = useState<{
    open: boolean;
    linkId: string;
    linkLabel: string;
  }>({ open: false, linkId: "", linkLabel: "" });
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const client = clients.find((c) => c.id === clientId);
  const initials = getInitials(client?.name);

  const handleActions = {
    edit: () => setShowEditarClienteModal(true),
    assignPackage: () => setShowAsignarPaqueteModal(true),
  };

  const handleAsignarPaquete = async (data: AsignarPaqueteFormData) => {
    await assignPackage(clientId, data);
    setShowAsignarPaqueteModal(false);
    refetchPackageConsumption();
  };

  const handleEditarCliente = async (data: EditarClienteFormData) => {
    await editClient(clientId, data);
    setShowEditarClienteModal(false);
    refetchClients();
  };

  const handleOpenNewLinkModal = () => {
    setSelectedLink(null); // null = modo creación
    setShowLinkModal(true);
  };

  const handleOpenEditLinkModal = (link: ClientLink) => {
    setSelectedLink(link); // con valor = modo edición
    setShowLinkModal(true);
  };

  const handleSaveLink = async (data: ClientLinkFormData) => {
    if (selectedLink) {
      await updateLink({ ...selectedLink, ...data });
    } else {
      await addLink(clientId, data);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      setDeletingLinkId(linkId);
      await deleteLink(linkId);
      setDeleteLinkConfirm({ open: false, linkId: "", linkLabel: "" });
      toast.success("Link eliminado exitosamente");
    } catch {
      toast.error("Error al eliminar el link");
    } finally {
      setDeletingLinkId(null);
    }
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
      label: "+ Asignar paquete",
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
                <div key={pkg.package_id} className="mb-2">
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
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between text-center mb-4 ml-5 mt-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center text-center">
              Links del cliente
            </h1>
            <div className="flex items-center text-center">
              <button
                onClick={handleOpenNewLinkModal}
                className="px-4 py-2 bg-verde-kurve text-white rounded-lg hover:bg-verde-kurve-dark transition-colors font-semibold text-sm"
              >
                + Agregar link
              </button>
            </div>
          </div>

          <div>
            {loadingLinks ? (
              <p className="text-sm text-gray-400">Cargando...</p>
            ) : links.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-full bg-verde-kurve/10 flex items-center justify-center mb-4">
                  <LinkIcon size={32} className="text-verde-kurve" />
                </div>

                <h4 className="text-lg font-bold text-foreground mb-2">
                  Este cliente todavía no tiene links
                </h4>

                <p className="text-sm text-gris-kurve-dark text-center max-w-sm mb-6">
                  Agregá el contrato, el Drive, las analíticas u otros accesos
                  relevantes para este cliente.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {links.map((link) => {
                    const config = linkTypeConfig[link.type];
                    const Icon = config.icon;
                    return (
                      <div key={link.id} className="relative group">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Card className="rounded-2xl bg-white border border-[#ECECEC] cursor-pointer shadow-none px-5 py-5 hover:shadow-sm transition-all">
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
                                <h3 className="text-xl leading-none font-semibold text-[#1F1F1F]">
                                  {link.label}
                                </h3>
                                <p className="text-sm text-[#707070]">
                                  {config.label}
                                </p>
                              </div>
                            </CardHeader>
                          </Card>
                        </a>
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOpenEditLinkModal(link);
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDeleteLinkConfirm({
                                open: true,
                                linkId: link.id,
                                linkLabel: link.label,
                              });
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <ClientLinkModal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setSelectedLink(null);
        }}
        link={selectedLink}
        onSave={handleSaveLink}
      />
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
      <ConfirmDeleteModal
        open={deleteLinkConfirm.open}
        entityName={deleteLinkConfirm.linkLabel}
        loading={deletingLinkId === deleteLinkConfirm.linkId}
        onConfirm={() => handleDeleteLink(deleteLinkConfirm.linkId)}
        onCancel={() =>
          setDeleteLinkConfirm({ open: false, linkId: "", linkLabel: "" })
        }
      />
    </div>
  );
};

export default ClientDetailPage;
