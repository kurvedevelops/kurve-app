"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddMemberModal from "@/components/modals/admin/AddMemberModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMember, getInitials, useMembers } from "@/hooks/middleware";
import { ConfirmDeleteModal } from "@/components/modals/BorrarEntidadModal";
import { createClient } from "@/lib/supabase/client";
import {
  EditarMiembroFormData,
  EditarmiembroModal,
} from "@/components/modals/EditarMiembroModal";
import { toast } from "sonner";

export interface Member {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone: string;
  active: boolean;
  created_at: string;
}

export async function editMember(
  memberId: string,
  data: EditarMiembroFormData,
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("users")
    .update({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      created_at: data.fechaAlta,
    })
    .eq("id", memberId);

  if (error) throw error;
}

const MembersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [showNuevoMiembroModal, setShowNuevoMiembroModal] = useState(false);
  const [showEditarMiembroModal, setShowEditarMiembroModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const { members, loadingMembers } = useMembers();

  const searchedMembers = members.filter((c) => {
    const matchesSearch = c.full_name
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesSearch;
  });

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
      router.refresh();
    } catch {
      toast.error("Error al eliminar integrante");
    } finally {
      setDeletingId(null);
    }
  };

  const acciones = [
    {
      label: "+ Nuevo miembro",
      variant: "primary" as const,
      onClick: () => setIsModalOpen(true),
    },
  ];

  const handleOpenEditModal = (member: Member) => {
    setSelectedMember(member);
    setShowEditarMiembroModal(true);
  };

  const handleEditarMiembro = async (data: EditarMiembroFormData) => {
    try {
      if (!selectedMember) return;
      await editMember(selectedMember.id, data);

      router.refresh();
      setShowEditarMiembroModal(false);
      setSelectedMember(null);
    } catch (error) {
      console.error("Error al editar miembro:", error);
    }
  };

  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarAdmin />
      <main className="flex-1 mt-12 md:mt-0 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="hidden md:block mb-3">
          <PageHeader
            badge="Gestion de Miembros"
            title="Integrantes"
            subtitle="Revisa y administra los miembros de tu equipo"
            actions={acciones}
          />
        </div>

        <div className="md:hidden mb-6">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            INTEGRANTES
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Listado de Integrantes
          </h1>
          <p className="text-sm text-gris-kurve-dark">
            Gestiona los miembros de tu equipo
          </p>
        </div>
        <div className="bg-background rounded-xl border border-border mt-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-foreground">
                Todos los miembros
              </span>
              <span className="text-sm text-gris-kurve-dark">
                {searchedMembers.length}{" "}
                {searchedMembers.length === 1 ? "miembro" : "miembros"}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
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
                  placeholder="Buscar integrante..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 pr-3 h-9 text-sm rounded-lg border border-border bg-gray-50 text-foreground placeholder-gris-kurve-dark focus:outline-none focus:border-verde-kurve focus:bg-background transition-colors w-full"
                />
              </div>
            </div>
          </div>
          <AddMemberModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          <Table>
            <TableHeader>
              <TableRow className="px-3.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide border-b border-gray-200">
                <TableHead className="h-12 px-3 font-semibold text-gray-400">
                  Nombre
                </TableHead>

                <TableHead className="font-semibold text-gray-400">
                  Email
                </TableHead>

                <TableHead className="font-semibold text-gray-400">
                  Telefono
                </TableHead>

                <TableHead className="font-semibold text-gray-400">
                  Rol
                </TableHead>

                <TableHead className="font-semibold text-gray-400">
                  Estado
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchedMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-80 text-center text-lg font-semibold"
                  >
                    {query ? "Sin resultados" : "No hay clientes"}
                  </TableCell>
                </TableRow>
              ) : (
                searchedMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-b border-gray-100 cursor-pointer hover:bg-gris-kurve/10"
                    onClick={() =>
                      router.push(`/admin/integrantes/${member.id}`)
                    }
                  >
                    <TableCell className="text-sm px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-verde-kurve-light flex items-center justify-center text-verde-kurve-dark text-xs font-bold shrink-0">
                          {getInitials(member.full_name)}
                        </div>
                        {member.full_name}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {member.email ? member.email : "No especificado"}
                    </TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {member.phone ? member.phone : "No especificado"}
                    </TableCell>
                    <TableCell>–</TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {member.active === true ? (
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-medium px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Inactivo
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Modal editar cliente */}
      {selectedMember && (
        <EditarmiembroModal
          open={showEditarMiembroModal}
          member={selectedMember}
          onClose={() => {
            setShowEditarMiembroModal(false);
            setSelectedMember(null);
          }}
          onSubmit={handleEditarMiembro}
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

export default MembersPage;
