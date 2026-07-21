"use client";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import PackageFormModal from "@/components/modals/admin/paquetes/PackageFormModal";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useState } from "react";
import {
  usePackages,
  useClients,
  editPackage,
  deletePackage,
  PackageData,
} from "@/hooks/middleware";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/modals/BorrarEntidadModal";

const PackagesPage = () => {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(
    null,
  );

  const { packages, loadingPackages, refetchPackages } = usePackages();
  const { clients } = useClients();

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find((c) => c.id === clientId)?.name ?? null;
  };

  const paquetesBase = packages.filter((pkg) => !pkg.client_id);
  const paquetesAsignados = packages.filter((pkg) => !!pkg.client_id);

  // Abre el modal de edición con el paquete seleccionado
  const handleOpenEdit = (pkg: PackageData) => {
    setSelectedPackage(pkg);
    setFormModalOpen(true);
  };

  // Abre el modal de confirmación de borrado
  const handleOpenDelete = (pkg: PackageData) => {
    setSelectedPackage(pkg);
    setDeleteModalOpen(true);
  };

  // Guarda un paquete: edición directa en Supabase o creación vía endpoint
  const handleSave = async (updated: PackageData) => {
    try {
      if (selectedPackage) {
        // Edición
        await editPackage(updated, updated.id);
        toast.success("Paquete editado exitosamente");
      } else {
        // Creación → POST al endpoint
        const res = await fetch("/api/activity-logs/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: updated.client_id,
            name: updated.name,
            total_hours: updated.total_hours,
            total_pieces: updated.total_pieces,
            price: updated.price,
            start_date: updated.start_date,
            end_date: updated.end_date || null,
          }),
        });

        if (!res.ok) {
          const body = await res
            .json()
            .catch(() => ({ error: "Error desconocido" }));
          toast.error("No se pudo crear el paquete", {
            description: body.error ?? "Error desconocido",
          });
          return;
        }

        toast.success("Paquete creado correctamente");
      }

      setFormModalOpen(false);
      setSelectedPackage(null);
      refetchPackages();
    } catch (err) {
      toast.error(`Error al guardar paquete: ${err}`);
    }
  };

  // Confirma y ejecuta el borrado
  const handleConfirmDelete = async () => {
    if (!selectedPackage) return;
    try {
      await deletePackage(selectedPackage.id);
      toast.success("Paquete eliminado");
      refetchPackages();
    } catch (err) {
      toast.error(`Error al eliminar paquete: ${err}`);
    } finally {
      setDeleteModalOpen(false);
      setSelectedPackage(null);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Indefinido";
    const [y, m, d] = date.split("-");
    return `${d}/${m}/${y}`;
  };

  const actions = [
    {
      label: "+ Agregar nuevo paquete",
      variant: "primary" as const,
      onClick: () => {
        setSelectedPackage(null);
        setFormModalOpen(true);
      },
    },
  ];

  const renderPackageCard = (pkg: PackageData) => {
    const clientName = getClientName(pkg.client_id);

    return (
      <Card key={pkg.id} className="overflow-hidden py-0 bg-white">
        <CardHeader className="flex justify-between p-4 pb-0">
          <h3 className="text-xl font-bold text-azul-kurve">{pkg.name}</h3>
          <span
            className={`px-2 py-1 rounded text-sm font-medium ${
              pkg.status === "active"
                ? "bg-verde-kurve/10 text-verde-kurve"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {pkg.status === "active" ? "Activo" : "Inactivo"}
          </span>
        </CardHeader>

        <CardContent className="px-5 space-y-3">
          {/* Cliente asignado */}
          {clientName ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-azul-kurve/10 text-azul-kurve">
                {clientName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-azul-kurve/10 text-azul-kurve">
                Paquete base
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <h3 className="font-semibold text-zinc-400/80">Capacidad</h3>
              <p className="font-semibold">{pkg.total_hours} hs</p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-400/80">Entregables</h3>
              <p className="font-semibold">{pkg.total_pieces ?? "—"}</p>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-400/80">Precio</h3>
              <p className="font-semibold">
                {pkg.price != null
                  ? `$${pkg.price.toLocaleString("es-AR")} USD`
                  : "—"}
              </p>
            </div>
            {clientName ? (
              <div>
                <h3 className="font-semibold text-zinc-400/80">Vigencia</h3>
                <p className="font-semibold">
                  {formatDate(pkg.start_date) ?? "—"} —{" "}
                  {formatDate(pkg.end_date) ?? "Indefinido"}
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-6 py-4 cursor-pointer"
              onClick={() => handleOpenEdit(pkg)}
            >
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-6 py-4 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-200 hover:border-red-300"
              onClick={() => handleOpenDelete(pkg)}
            >
              Eliminar
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarAdmin />
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="hidden md:block mb-3">
          <PageHeader
            badge=""
            title="Paquetes"
            subtitle="Revisa y modifica los paquetes disponibles para el cliente"
            actions={actions}
          />
        </div>

        {loadingPackages ? (
          <p className="mt-10 text-zinc-400">Cargando paquetes...</p>
        ) : (
          <div className="space-y-8">
            {/* Paquetes base */}
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Paquetes base
                <span className="ml-2 text-sm font-normal text-zinc-400">
                  ({paquetesBase.length})
                </span>
              </h2>
              {paquetesBase.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  No hay paquetes base creados.
                </p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paquetesBase.map(renderPackageCard)}
                </div>
              )}
            </section>

            {/* Paquetes asignados */}
            <section>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Paquetes asignados
                <span className="ml-2 text-sm font-normal text-zinc-400">
                  ({paquetesAsignados.length})
                </span>
              </h2>
              {paquetesAsignados.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  No hay paquetes asignados a clientes todavía.
                </p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {paquetesAsignados.map(renderPackageCard)}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Modal de creación / edición */}
      <PackageFormModal
        key={selectedPackage?.id ?? "new-package"}
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        pkg={selectedPackage}
        onSave={handleSave}
      />

      {selectedPackage && (
        <ConfirmDeleteModal
          open={deleteModalOpen}
          onCancel={() => {
            setDeleteModalOpen(false);
            setSelectedPackage(null);
          }}
          onConfirm={handleConfirmDelete}
          entityName={selectedPackage.name}
        />
      )}
    </div>
  );
};

export default PackagesPage;
