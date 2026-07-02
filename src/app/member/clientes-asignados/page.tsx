"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarMember from "@/components/layout/SidebarMember";
import {
  useClients,
  useClientsByUser,
  useCurrentUser,
} from "@/hooks/middleware";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mail, Phone } from "lucide-react";

const ClientesAsignadosPage = () => {
  const { user, loadingUser } = useCurrentUser();
  const { clientsId, loadingClientsId } = useClientsByUser(user?.id);
  const { clients, loadingClients } = useClients();

  const clientesAsignadosIds = clientsId
    .filter((match) => match.client_id)
    .map((match) => match.client_id);

  const clientesAsignados = clients.filter((client) =>
    clientesAsignadosIds.includes(client.id),
  );

  const isLoading = loadingUser || loadingClientsId || loadingClients;

  return (
    <div className="flex min-h-screen bg-muted">
      <SidebarMember />
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="mb-6">
          <PageHeader
            badge="Clientes asignados"
            title="Listado de clientes"
            subtitle="Aquí puedes ver todos los clientes que te han sido asignados."
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : clientesAsignados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-gris-kurve-dark font-medium">
              Todavía no tenés clientes asignados.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Cuando te asignen un cliente, va a aparecer acá.
            </p>
          </div>
        ) : (
          <>
            {/* Tabla - md+ */}
            <div className="bg-white border border-[#E4E4E4] overflow-hidden overflow-x-auto rounded-lg">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Nombre
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Email
                    </TableHead>
                    <TableHead className="px-4 py-3 text-left text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border">
                      Teléfono
                    </TableHead>
                    <TableHead className="px-4 py-3 text-[11px] font-medium text-gris-kurve-dark uppercase tracking-wide border-b border-border text-right">
                      Estado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesAsignados.map((client) => (
                    <TableRow
                      key={client.id}
                      className="border-b border-[#E4E4E4] hover:bg-transparent"
                    >
                      <TableCell className="px-6 py-6 font-semibold">
                        {client.name}
                      </TableCell>
                      <TableCell className="px-6 py-6 font-semibold">
                        {client.email || "—"}
                      </TableCell>
                      <TableCell className="px-6 py-6 font-semibold">
                        {client.phone || "—"}
                      </TableCell>
                      <TableCell className="px-6 py-6 font-semibold text-right">
                        {client.status ? (
                          <span
                            className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                              client.status === "active"
                                ? "bg-verde-kurve text-white"
                                : "bg-gris-kurve-dark/10 text-gris-kurve-dark"
                            }`}
                          >
                            {client.status === "active" ? "Activo" : "Pausado"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Cards - mobile */}
            <div className="md:hidden space-y-3">
              {clientesAsignados.map((client) => (
                <div
                  key={client.id}
                  className="rounded-xl border bg-white p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gris-kurve-dark">
                      {client.name}
                    </h3>
                    {client.status && (
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          client.status === "active"
                            ? "bg-verde-kurve text-white"
                            : "bg-gris-kurve-dark/10 text-gris-kurve-dark"
                        }`}
                      >
                        {client.status === "active" ? "Activo" : "Pausado"}
                      </span>
                    )}
                  </div>
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={14} className="shrink-0" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} className="shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ClientesAsignadosPage;
