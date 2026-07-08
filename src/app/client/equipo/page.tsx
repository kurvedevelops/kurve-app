import { Suspense } from "react";
import SidebarClient from "@/components/layout/SidebarClient";
import PageHeader from "@/components/layout/PageHeader";
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell} from "@/components/ui/table";

const TeamPage = () => {
  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarClient />
      <Suspense fallback={<div>Cargando...</div>}></Suspense>

      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          title="Equipo Asignado"
          subtitle="Aquí puedes ver el equipo asignado a tu proyecto y sus roles."
        />
        <div className="bg-background rounded-xl border border-border mt-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 md:p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-base font-medium text-foreground">
                Todos los miembros
              </span>
              <span className="text-sm text-gris-kurve-dark">
                5 miembros
              </span>
            </div>
          </div>

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
                <TableRow className="px-3.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide border-b border-gray-200">
                  <TableCell className="h-12 px-3">
                    Marcos Perez
                  </TableCell>
                  <TableCell className="h-12 px-3">
                    marcos.perez@example.com
                  </TableCell>
                  <TableCell className="h-12 px-3">
                    123-456-7890
                  </TableCell>
                  <TableCell className="h-12 px-3">
                    Desarrollador
                  </TableCell>
                  <TableCell className="h-12 px-3">
                    Activo
                  </TableCell>
                </TableRow>
            </TableBody>
            </Table>
        </div>
      </main>
    </div>
  );
};

export default TeamPage;
