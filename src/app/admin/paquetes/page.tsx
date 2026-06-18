"use client";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import PackageFormModal from "@/components/modals/admin/paquetes/PackageFormModal";
import ConfirmDeleteModal from "@/components/modals/admin/paquetes/ConfirmDeleteModal";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useState } from "react";

type Package = {
  id: number;
  name: string;
  hours: string;
  piezas: number;
  precio: number;
  fechaInicial: string;
  fechaFinal: string | null;
  clients: number;
  estado: boolean;
};

const mockPackages: Package[] = [
  {
    id: 1,
    name: "Pack Mensual Básico",
    hours: "40 hs mensuales",
    piezas: 20,
    precio: 200000,
    fechaInicial: "12/06/2020",
    fechaFinal: "14/07/2020",
    clients: 5,
    estado: true,
  },
  {
    id: 2,
    name: "Pack Mensual Estandar",
    hours: "30 hs mensuales",
    piezas: 30,
    precio: 150000,
    fechaInicial: "01/05/2026",
    fechaFinal: null, // Indefinido
    clients: 3,
    estado: true,
  },
  {
    id: 3,
    name: "Pack Mensual Premium",
    hours: "20 hs mensuales",
    piezas: 15,
    precio: 100000,
    fechaInicial: "01/03/2026",
    fechaFinal: "30/06/2026",
    clients: 8,
    estado: false,
  },
];

const PackagesPage = () => {
  const [packages, setPackages] = useState(mockPackages);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormModalOpen(true);
  };

  const handleDelete = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDeleteModalOpen(true);
  };

  const handleSave = (updated: Package) => {
    setPackages((prev) => {
      const existe = prev.find((p) => p.id === updated.id);
      return existe
        ? prev.map((p) => (p.id === updated.id ? updated : p))
        : [...prev, updated];
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedPackage) return;
    setPackages((prev) => prev.filter((p) => p.id !== selectedPackage.id));
    setDeleteModalOpen(false);
    setSelectedPackage(null);
  };

  const actions = [
    {
      label: "+ Agregar un nuevo paquete",
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

        <div className="md:hidden mb-6">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            Paquetes
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">Paquetes</h1>
          <p className="text-sm text-gris-kurve-dark">
            Revisa y modifica los paquetes disponibles para el cliente
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-10">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden py-0 bg-white">
              <CardHeader className="flex justify-between p-4">
                <h3 className="text-xl font-bold text-azul-kurve">
                  {pkg.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded ${pkg.estado ? "bg-verde-kurve-dark/20 text-verde-kurve" : "bg-gris-kurve-light text-gris-kurve-dark"}`}
                >
                  {pkg.estado ? "Activo" : "Inactivo"}
                </span>
              </CardHeader>
              <CardContent className="px-5 grid grid-cols-2 gap-2">
                <div className="">
                  <h3 className=" font-semibold text-zinc-400/80">Capacidad</h3>
                  <p className="font-semibold">{pkg.hours}</p>
                </div>
                <div>
                  <h3 className=" font-semibold text-zinc-400/80">
                    Entegables
                  </h3>
                  <p className="font-semibold">{pkg.piezas}</p>
                </div>
                <div>
                  <h3 className=" font-semibold text-zinc-400/80">Precio</h3>
                  <p className="font-semibold">${pkg.precio} ARG</p>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-400/80">Vigencia</h3>
                  <p className="font-semibold">
                    {pkg.fechaInicial} — {pkg.fechaFinal ?? "Indefinido"}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
                <span className="text-sm text-gris-kurve">
                  {pkg.clients} clientes activos
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-6 py-4 cursor-pointer"
                    onClick={() => handleEdit(pkg)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-6 py-4 cursor-pointer text-red-500 hover:text-red-600 hover:border-red-300"
                    onClick={() => handleDelete(pkg)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <PackageFormModal
        key={selectedPackage?.id ?? "new-package"}
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        pkg={selectedPackage}
        onSave={handleSave}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        pkg={selectedPackage}
      />
    </div>
  );
};

export default PackagesPage;
