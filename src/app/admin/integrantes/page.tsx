"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import AddMemberModal from "@/components/modals/admin/AddMemberModal";
import { useState } from "react";

const members = [
  {
    id: 1,
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    role: "Desarrollador",
    assignedClients: 5,
    status: "active",
  },
  {
    id: 2,
    name: "María García",
    email: "maria.garcia@example.com",
    role: "Diseñadora",
    assignedClients: 3,
    status: "active",
  },
  {
    id: 3,
    name: "Carlos López",
    email: "carlos.lopez@example.com",
    role: "PM",
    assignedClients: 8,
    status: "Inactivo",
  },
  {
    id: 4,
    name: "Sofía Martínez",
    email: "sofia.martinez@example.com",
    role: "Desarrolladora",
    assignedClients: 2,
    status: "active",
  },
];

const MembersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarAdmin />
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="hidden md:block mb-3">
          <PageHeader
            badge=""
            title="Integrantes"
            subtitle="Gestiona los miembros de tu equipo"
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

        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto bg-white">
          <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
            <h2 className="text-base font-medium text-gray-900">
              Listado de Integrantes
            </h2>
            <Button
              className="flex items-center bg-verde-kurve text-white px-4 py-5 hover:bg-verde-kurve-dark hover:text-white"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              >
              <Plus className="" />
              Agregar Integrante
            </Button>
          </div>
          <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
                  Rol
                </TableHead>

                <TableHead className="font-semibold text-gray-400 w-[301px]">
                  Clientes asignados
                </TableHead>

                <TableHead className="font-semibold text-gray-400">
                  Estado
                </TableHead>

                <TableHead className="font-semibold text-gray-400">

                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-80 text-center text-lg font-semibold"
                    >
                      No hay integrantes registrados.
                      <br />
                      <button
                        className="text-verde-kurve-dark font-semibold text-lg cursor-pointer"
                        onClick={() => setIsModalOpen(true)}
                      >
                        Registre un integrante
                      </button>
                    </TableCell>
                  </TableRow>
              ) :(
                members.map((member) => (
                  <TableRow key={member.id} className="border-b border-gray-100 ">
                  <TableCell className="text-sm px-4 py-3.5">
                  <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-verde-kurve-light flex items-center justify-center text-verde-kurve text-xs font-bold shrink-0">
                  {member.name
                    .split(" ")
                    .slice(0, 2)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                          </div>
                          {member.name}
                          </div>
                          </TableCell>
                          <TableCell className="px-4 py-6 text-sm">
                          {member.email}
                          </TableCell>
                          <TableCell className="px-4 py-6 text-sm">
                          {member.role}
                          </TableCell>
                          <TableCell className="px-4 py-6 text-sm">
                          <div className="w-6 h-6 rounded-full bg-verde-kurve-light flex items-center justify-center text-verde-kurve text-xs font-bold shrink-0">
                          {member.assignedClients}
                          </div>
                          </TableCell>
                          <TableCell className="px-4 py-6 text-sm">
                          {member.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-verde-kurve text-xs font-medium px-2.5 py-1 rounded-full">
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
                    <TableCell className="px-4 py-6 text-sm">
                    <Link href={`/admin/integrantes/id`}>
                    <Button className="text-white bg-verde-kurve px-3 py-2 rounded-md text-xs font-medium cursor-pointer">
                    Ver detalle
                    </Button>
                    </Link>
                    </TableCell>
                    </TableRow>
                  ))
                )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default MembersPage;
