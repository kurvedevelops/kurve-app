"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import PageHeader from "@/components/layout/PageHeader";
import { Package, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { useClients, usePackageByClient } from "@/hooks/middleware";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  created_at: string;
  city?: string;
}

interface ClientPackage {
  id: string;
  name: string;
  hours: number;
  status: string;
}

const ClientDetailPage = () => {
  const params = useParams();
  const clientId = params.id as string;

  const { clients, loadingClients } = useClients();
  const { packages, loadingPackages } = usePackageByClient(clientId);

  const client = clients.find((c) => c.id === clientId);

  const handleActions = {
    edit: () => console.log("Editar cliente"),
    assignPackage: () => console.log("Asignar paquete"),
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
      onClick: () => console.log("Editar"),
    },
    {
      label: "Asignar paquete",
      variant: "primary" as const,
      onClick: () => console.log("Asignar paquete"),
    },
  ];

  const statusColor =
    client.status === "active"
      ? "bg-verde-kurve/10 text-verde-kurve"
      : "bg-red-100 text-red-600";

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
        <div className="flex flex-col bg-white p-5 rounded-xl md:flex-row md:items-start md:justify-between gap-4 mb-8 mt-4 border border-border">
          <div className="flex items-start gap-4">
            {/* Client Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-verde-kurve-dark to-verde-kurve flex items-center justify-center text-white font-bold text-2xl">
              {client.name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")
                .toUpperCase()
                .slice(0, 2)}
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
                    {client.status === "active" ? "● Activo" : "● Inactivo"}
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
              </div>
            </div>
          </div>
        </div>

        {/* Packages Section */}
        <div className="bg-background rounded-xl border border-border p-8">
          <h3 className="text-xl font-bold text-foreground mb-4">Paquetes</h3>

          {packages.length === 0 ? (
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
            // Packages List
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-1/2 lg:w-2/3 md:min-w-10/12">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="relative border border-border rounded-lg p-4 hover:bg-muted hover:border-verde-kurve cursor-pointer transition-colors"
                >
                  <span
                    className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full ${
                      pkg.status === "active"
                        ? "bg-verde-kurve/10 text-verde-kurve"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {pkg.status === "active" ? "Activo" : "Inactivo"}
                  </span>

                  <h4 className="font-semibold text-foreground mb-2">
                    {pkg.name}
                  </h4>
                  <p className="text-sm text-gris-kurve-dark mb-1">
                    {pkg.total_hours} horas contratadas
                  </p>
                  <div className="flex flex-col">
                    <span className="text-sm text-gris-kurve-dark my-2">
                      {new Date(pkg.start_date).toLocaleDateString("es-AR") +
                        " - " +
                        new Date(pkg.end_date).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientDetailPage;
