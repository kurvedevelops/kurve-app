"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import {
  createNewClient,
  deleteClient,
  editClient,
  getInitials,
  useClients,
  usePackages,
} from "@/hooks/middleware";
import {
  NuevoClienteModal,
  NuevoClienteFormData,
} from "@/components/modals/NuevoClienteModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
  Client,
  EditarClienteFormData,
  EditarClienteModal,
} from "@/components/modals/EditarClienteModal";
import { ConfirmDeleteModal } from "@/components/modals/BorrarEntidadModal";
import { toast } from "sonner";

interface ActionDropdownProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

export function ActionDropdown({
  onEdit,
  onView,
  onDelete,
}: ActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  return (
    <td className="px-4 py-3.5">
      <div className="relative inline-block">
        <button
          ref={buttonRef}
          onClick={() => setOpen(!open)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            />
          </svg>
        </button>

        {open && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-gray-100 bg-white shadow-lg py-1 z-[9999]"
          >
            <button
              type="button"
              onClick={() => {
                console.log("Click editar");
                onEdit?.();
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("Click ver detalle");
                onView?.();
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Ver detalle
            </button>
            <button
              type="button"
              onClick={() => {
                console.log("Click eliminar");
                onDelete?.();
                setOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              Eliminar cliente
            </button>
          </div>
        )}
      </div>
    </td>
  );
}

const ClientesPage = () => {
  const { clients, loadingClients } = useClients();
  const { packages, loadingPackages } = usePackages();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">(
    "all",
  );
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

  const [showNuevoClienteModal, setShowNuevoClienteModal] = useState(false);
  const [showEditarClienteModal, setShowEditarClienteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  type ActiveClient = Omit<Client, "status"> & { status: "active" | "paused" };

  const filteredClients = clients.filter(
    (c): c is ActiveClient => c.status === "active" || c.status === "paused",
  );

  const searchedClients = filteredClients.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    clientId: string;
    clientName: string;
  }>({ open: false, clientId: "", clientName: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      ) {
        setOpenStatusDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteClient(id);
      setDeleteConfirm({ open: false, clientId: "", clientName: "" });
      toast.success("Cliente eliminado exitosamente");
      router.refresh();
    } catch {
      toast.error("Error al eliminar cliente");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCrearCliente = async (data: NuevoClienteFormData) => {
    await createNewClient(data);
    router.refresh();
  };

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setShowEditarClienteModal(true);
  };

  const handleEditarCliente = async (data: EditarClienteFormData) => {
    try {
      if (!selectedClient) return;
      await editClient(selectedClient.id, data);

      router.refresh();
      setShowEditarClienteModal(false);
      setSelectedClient(null);
    } catch (error) {
      console.error("Error al editar cliente:", error);
    }
  };

  const actions = [
    {
      label: "↓ Exportar",
      variant: "secondary" as const,
      onClick: () => console.log("Exportar"),
    },
    {
      label: "+ Nuevo cliente",
      variant: "primary" as const,
      onClick: () => setShowNuevoClienteModal(true),
    },
  ];

  const statusLabels = {
    all: "Todos los estados",
    active: "Activos",
    paused: "Pausados",
  };

  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarAdmin />
      <main className="flex-1 md:ml-45 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          badge="Gestión de Clientes"
          title="Clientes"
          subtitle="Administra los clientes y sus paquetes contratados"
          actions={actions}
        />

        <div className="bg-background rounded-xl border border-border mt-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-foreground">
                Todos los clientes
              </span>
              <span className="text-sm text-gris-kurve-dark">
                {searchedClients.length}{" "}
                {searchedClients.length === 1 ? "registro" : "registros"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Status Filter */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setOpenStatusDropdown(!openStatusDropdown)}
                  className="flex items-center gap-2 px-4 py-2 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm text-foreground font-medium w-full md:w-auto"
                >
                  {statusLabels[statusFilter]}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openStatusDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {openStatusDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full md:w-48 bg-background border border-border rounded-lg shadow-lg z-40">
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          setStatusFilter(value as "all" | "active" | "paused");
                          setOpenStatusDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          statusFilter === value
                            ? "bg-verde-kurve/10 text-verde-kurve font-semibold"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-auto ">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gris-kurve-dark pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 pr-3 h-9 text-sm rounded-lg border border-border bg-gray-50 text-foreground placeholder-gris-kurve-dark focus:outline-none focus:border-verde-kurve focus:bg-background transition-colors w-full"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-visible">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  {["Cliente", "Estado", "Paquete", "Alta", "Opciones"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {searchedClients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-gris-kurve-dark"
                    >
                      {query || statusFilter !== "all"
                        ? "Sin resultados"
                        : "No hay clientes"}
                    </td>
                  </tr>
                ) : (
                  searchedClients.map((client, i) => (
                    <tr
                      key={client.id}
                      className={
                        i < searchedClients.length - 1
                          ? "border-b border-border"
                          : ""
                      }
                    >
                      <td className="px-4 py-3.5 relative">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-verde-kurve/10 flex items-center justify-center text-xs font-semibold text-verde-kurve">
                            {getInitials(client.name)}
                          </div>
                          <Link
                            href={`/admin/clientes/${client.id}`}
                            className="text-sm font-medium text-foreground hover:text-verde-kurve transition-colors"
                          >
                            {client.name}
                          </Link>
                        </div>
                      </td>
                      <td className="py-3.5">
                        {client.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 bg-verde-kurve/10 text-verde-kurve text-xs font-medium px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-verde-kurve" />
                            Activo
                          </span>
                        ) : client.status === "paused" ? (
                          <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 text-yellow-500 text-xs font-medium px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            Pausado
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3.5">
                        {packages.filter((p) => p.client_id === client.id)
                          .length > 0 ? (
                          <span className="inline-flex items-center gap-1.5 bg-azul-kurve/20 text-azul-kurve text-xs font-medium px-2.5 py-1 rounded-lg">
                            {
                              packages.find((p) => p.client_id === client.id)
                                ?.name
                            }
                          </span>
                        ) : (
                          <span className="text-xs text-gris-kurve-dark border border-border rounded-lg px-2.5 py-1 bg-gray-50">
                            Sin paquete
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 text-sm text-gris-kurve-dark">
                        {new Date(client.created_at).toLocaleDateString(
                          "es-AR",
                        )}
                      </td>
                      <ActionDropdown
                        onEdit={() => {
                          handleOpenEditModal(client);
                        }}
                        onView={() =>
                          router.push(`/admin/clientes/${client.id}`)
                        }
                        onDelete={() =>
                          setDeleteConfirm({
                            open: true,
                            clientId: client.id,
                            clientName: client.name,
                          })
                        }
                      />
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal nuevo cliente */}
      <NuevoClienteModal
        open={showNuevoClienteModal}
        onClose={() => setShowNuevoClienteModal(false)}
        onSubmit={handleCrearCliente}
      />

      {/* Modal editar cliente */}
      {selectedClient && (
        <EditarClienteModal
          open={showEditarClienteModal}
          client={selectedClient}
          onClose={() => {
            setShowEditarClienteModal(false);
            setSelectedClient(null);
          }}
          onSubmit={handleEditarCliente}
        />
      )}

      <ConfirmDeleteModal
        open={deleteConfirm.open}
        entityName={deleteConfirm.clientName}
        loading={deletingId === deleteConfirm.clientId}
        onConfirm={() => handleDelete(deleteConfirm.clientId)}
        onCancel={() =>
          setDeleteConfirm({
            open: false,
            clientId: "",
            clientName: "",
          })
        }
      />
    </div>
  );
};

export default ClientesPage;
