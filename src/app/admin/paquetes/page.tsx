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
  editPackage,
  Package,
  deletePackage,
} from "@/hooks/middleware";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/modals/BorrarEntidadModal";

const PackagesPage = () => {
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const { packages, loadingPackages } = usePackages();

  // Abre el modal de edición con el paquete seleccionado
  const handleOpenEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormModalOpen(true);
  };

  // Abre el modal de confirmación de borrado
  const handleOpenDelete = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDeleteModalOpen(true);
  };

  // Guarda un paquete nuevo o editado llamando a Supabase
  const handleSave = async (updated: Package) => {
    try {
      if (selectedPackage) {
        // Edición
        await editPackage(updated, updated.id);
        toast.success("Paquete editado exitosamente");
      }
    } catch (err) {
      toast.error(`Error al editar paquete: ${err}`);
    }
  };

  // Confirma y ejecuta el borrado
  const handleConfirmDelete = async () => {
    if (!selectedPackage) return;
    try {
      await deletePackage(selectedPackage.id);
      toast.success("Paquete eliminado");
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden py-0 bg-white">
                <CardHeader className="flex justify-between p-4">
                  <h3 className="text-xl font-bold text-azul-kurve">
                    {pkg.name}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      pkg.status === "active"
                        ? "bg-verde-kurve-dark/20 text-verde-kurve"
                        : "bg-gris-kurve-light text-gris-kurve-dark"
                    }`}
                  >
                    {pkg.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </CardHeader>

                <CardContent className="px-5 grid grid-cols-2 gap-2">
                  <div>
                    <h3 className="font-semibold text-zinc-400/80">
                      Capacidad
                    </h3>
                    <p className="font-semibold">{pkg.total_hours} hs</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-400/80">
                      Entregables
                    </h3>
                    <p className="font-semibold">{pkg.total_pieces ?? "—"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-400/80">Precio</h3>
                    <p className="font-semibold">
                      {pkg.price != null
                        ? `$${pkg.price.toLocaleString("es-AR")} ARS`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-400/80">Vigencia</h3>
                    <p className="font-semibold">
                      {formatDate(pkg.start_date) ?? "—"} —{" "}
                      {formatDate(pkg.end_date) ?? "Indefinido"}
                    </p>
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
                      className="px-6 py-4 cursor-pointer text-red-500 hover:text-red-600 hover:border-red-300"
                      onClick={() => handleOpenDelete(pkg)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
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

      {/* Modal de confirmación de borrado */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedPackage(null);
        }}
        onConfirm={handleConfirmDelete}
        entityName={selectedPackage?.name}
      />
    </div>
  );
};

export default PackagesPage;
