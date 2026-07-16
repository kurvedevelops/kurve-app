"use client";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import { Button } from "@/components/ui/button";
import { ChevronRight, UserMinus, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, User, Plus } from "lucide-react";
import {
  assignClientToUser,
  deleteMember,
  getInitials,
  useActivityLogs,
  useClients,
  useClientsByUser,
  useMembers,
} from "@/hooks/middleware";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/modals/BorrarEntidadModal";
import {
  EditarmiembroModal,
  EditarMiembroSubmitData,
} from "@/components/modals/EditarMiembroModal";

const MemberDetail = () => {
  const { members, loadingMembers, refetchMembers } = useMembers();
  const { id } = useParams();
  const memberDetail = members.find((m) => m.id === id);
  const { clientsId, loadingClientsId, refetchClientsId } = useClientsByUser(memberDetail?.id);
  const { clients, loadingClients } = useClients();
  const clientIds = clientsId.map((c) => c.client_id);
  const clientesAsociados = clients.filter((client) =>
    clientIds.includes(client.id),
  );
  const [selectedClientId, setSelectedClientId] = useState("");

  const clientesLibres = clients.filter(
    (client) => !clientIds.includes(client.id),
  );
  const router = useRouter();
  const { activityLogs, loadingActivityLogs } = useActivityLogs(
    memberDetail?.id,
  );

  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    memberId: string;
    memberName: string;
  }>({ open: false, memberId: "", memberName: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteMember(id);
      setDeleteConfirm({ open: false, memberId: "", memberName: "" });
      toast.success("Integrante eliminado exitosamente");
      refetchMembers();
    } catch {
      toast.error("Error al eliminar integrante");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddClientToUser = async (clientId: string) => {
    try {
      await assignClientToUser(clientId, memberDetail?.id);
      toast.success("Cliente asignado exitosamente");
      refetchClientsId();
    } catch {
      toast.error("Error al asignar cliente al integrante");
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);

  // Opciones del multi-select: clientes activos + los ya asignados (aunque
  // estén pausados/finalizados) para no perder asignaciones al editar.
  const clientOptions = clients
    .filter((c) => c.status === "active" || clientIds.includes(c.id))
    .map((c) => ({ id: c.id, name: c.name }));

  const handleEditarIntegrante = async (data: EditarMiembroSubmitData) => {
    if (!memberDetail) return;

    const res = await fetch(`/api/activity-logs/members/${memberDetail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: data.full_name,
        phone: data.phone || null,
        position: data.position || null,
        client_ids: data.client_ids ?? [],
      }),
    });

    if (!res.ok) {
      const body = await res
        .json()
        .catch(() => ({ error: "Error desconocido" }));
      toast.error("No se pudo actualizar el integrante", {
        description: body.error ?? "Error desconocido",
      });
      return;
    }

    toast.success("Integrante actualizado correctamente");
    refetchMembers();
    refetchClientsId();
  };

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarAdmin />
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-400">Integrantes</span>
          <ChevronRight size={14} />
          <h3 className="font-bold text-verde-kurve-dark">
            Detalle del Integrante
          </h3>
        </div>

        <div className="md:hidden mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Detalle del Integrante
          </h1>
        </div>

        <div className="bg-white shadow rounded-xl p-8 mt-8">
          <div className="flex gap-8 items-center">
            <div className=" bg-verde-kurve rounded-2xl w-24 h-24 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                {getInitials(memberDetail?.full_name)}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold mb-1">
                {memberDetail?.full_name}
              </h2>
              <div className="flex gap-4">
                <p className="text-gray-600 text-xs">
                  <span className="text-xs font-semibold">Cargo: </span>
                  {memberDetail?.position || "Sin especificar"}
                </p>
                <p className="text-gray-600 text-xs">
                  <span className="text-xs font-semibold">Email: </span>
                  {memberDetail?.email}
                </p>
                <p className="text-gray-600 text-xs">
                  <span className="text-xs font-semibold">Telefono: </span>
                  {memberDetail?.phone || "Sin especificar"}
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                className="px-6 py-6 flex items-center gap-2 border-verde-kurve text-verde-kurve-dark cursor-pointer hover:bg-verde-kurve-light"
                onClick={() => setShowEditModal(true)}
              >
                <Pencil size={16} />
                Editar
              </Button>
              <Button
                variant="outline"
                className="px-6 py-6 flex items-center gap-2 border-red-500 text-red-500 cursor-pointer hover:bg-red-300 hover:text-red-600"
                onClick={() => {
                  setDeleteConfirm({
                    open: true,
                    memberId: memberDetail?.id ?? "",
                    memberName: memberDetail?.full_name ?? "",
                  });
                }}
              >
                <UserMinus />
                Eliminar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 ">
          <Card className="bg-white lg:col-span-2 py-6 px-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Clientes asociados</CardTitle>

              <div className="bg-verde-kurve-light text-verde-kurve-dark text-xs px-3 py-1 rounded-full">
                {clientesAsociados.length}
              </div>
            </CardHeader>

            <CardContent>
              {clientesAsociados.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">
                  No hay clientes asociados a este integrante.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientesAsociados.map((client) => {
                    const lastLogForClient = [...activityLogs]
                      .filter((act) => act.clients?.id === client.id)
                      .sort(
                        (a, b) =>
                          new Date(b.log_date).getTime() -
                          new Date(a.log_date).getTime(),
                      )[0];

                    return (
                      <Card
                        key={client.id}
                        className="border border-gray-100 shadow-none hover:border-verde-kurve transition cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/clientes/${client.id}`)
                        }
                      >
                        <CardContent className="">
                          <div className="flex justify-between items-center">
                            <div className="w-14 h-14 rounded-lg bg-verde-kurve-light flex items-center justify-center">
                              <User size={28} color="#0c4450 " />
                            </div>
                          </div>

                          <h3 className="font-bold mt-3 text-xl">
                            {client.name}
                          </h3>
                          <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-200">
                            <span className="text-center font-semibold">
                              ÚLTIMA ACTIVIDAD
                            </span>
                            {lastLogForClient ? (
                              <span className="text-xs text-center text-muted-foreground">
                                {lastLogForClient?.task_types?.name} |{" "}
                                {lastLogForClient?.log_date}
                              </span>
                            ) : (
                              "No hay actividades recientes"
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="px-2 py-4 bg-white">
              <CardHeader>
                <CardTitle className="textlg flex items-center gap-4">
                  <Link2 size={28} color="#0c4450" />
                  Vincular nuevo cliente
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex flex-col">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full h-10 px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  >
                    <option value="">Selecciona un cliente</option>
                    {clientesLibres.map((client) =>
                      client.status == "active" ? (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ) : null,
                    )}
                  </select>
                </div>
                <Button
                  className="w-full h-10 text-white bg-verde-kurve hover:bg-verde-kurve-dark"
                  onClick={() => handleAddClientToUser(selectedClientId)}
                  disabled={!selectedClientId}
                >
                  <Plus size={16} />
                  Agregar Cliente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      {memberDetail && (
        <EditarmiembroModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          member={memberDetail}
          clients={clientOptions}
          assignedClientIds={clientIds}
          onSubmit={handleEditarIntegrante}
        />
      )}

      <ConfirmDeleteModal
        open={deleteConfirm.open}
        entityName={deleteConfirm.memberName}
        loading={deletingId === deleteConfirm.memberId}
        onConfirm={() => handleDelete(deleteConfirm.memberId)}
        onCancel={() =>
          setDeleteConfirm({
            open: false,
            memberId: "",
            memberName: "",
          })
        }
      />
    </div>
  );
};

export default MemberDetail;
