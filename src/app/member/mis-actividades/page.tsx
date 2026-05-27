import PageHeader from "@/components/layout/PageHeader";
import SidebarMember from "@/components/layout/SidebarMember";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMyActivityLogs } from "@/lib/supabase/queries";
import Link from "next/link";

const MisActividadesPage = async () => {
  // const { data: actividades, error } = await getMyActivityLogs({});

  // console.log("actividades:", actividades);
  // console.log("error:", error);

  const getStatusStyles = (estado: string) => {
    switch (estado) {
      case "En proceso":
        return "bg-[#E5EFE5] text-[#4E6B4E]";
      case "Entregado":
        return "bg-[#178A2F] text-white";
      case "Publicado":
        return "bg-[#2CD321] text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const actividades = [
    {
      id: 1,
      cliente: "Empresa A",
      tarea: "Diseño de logo",
      categoria: "Diseño",
      horas: "3hs",
      piezas: 2,
      estado: "Publicado",
      fecha: "01/10/2023",
    },
    {
      id: 2,
      cliente: "Empresa B",
      tarea: "Redacción de contenido",
      categoria: "Marketing",
      horas: "5hs",
      piezas: 4,
      estado: "Pendiente",
      fecha: "02/10/2023",
    },
    {
      id: 3,
      cliente: "Empresa C",
      tarea: "Desarrollo web",
      categoria: "Programación",
      horas: "8hs",
      piezas: 1,
      estado: "En proceso",
      fecha: "03/10/2023",
    },
    {
      id: 4,
      cliente: "Empresa A",
      tarea: "Gestión de redes",
      categoria: "Marketing",
      horas: "2hs",
      piezas: 6,
      estado: "Publicado",
      fecha: "04/10/2023",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarMember />
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="hidden md:block mb-3">
          <PageHeader
            badge="MIS ACTIVIDADES"
            title="Listado de Actividades"
            subtitle="Administra y supervisa el flujo de trabajo de tu equipo"
          />
        </div>

        <div className="md:hidden mb-6">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            MIS ACTIVIDADES
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Listado de Actividades
          </h1>
          <p className="text-sm text-gris-kurve-dark">
            Administra y supervisa el flujo de trabajo de tu equipo
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Fecha</label>
                <select
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  name="fecha"
                  id="fecha"
                >
                  <option value="">Seleccionar fecha</option>
                  <option value="2023-10-01">01/10/2023</option>
                  <option value="2023-10-02">02/10/2023</option>
                </select>
              </div>
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Cliente</label>
                <select
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  name="cliente"
                  id="cliente"
                >
                  <option value="">Seleccionar cliente</option>
                  <option value="1">Cliente 1</option>
                  <option value="2">Cliente 2</option>
                </select>
              </div>
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Estado</label>
                <select
                  className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve"
                  name="estado"
                  id="estado"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en-proceso">En proceso</option>
                  <option value="Publicado">Publicado</option>
                </select>
              </div>
              <div className="lg:col-span-4">
                <Button className="w-full md:w-fit cursor-pointer px-8 py-6 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors">
                  Filtrar
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#E4E4E4] rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-white hover:bg-white border-b border-[#E4E4E4]">
                  <TableHead className="h-12 px-6 text-[14px] font-semibold text-black">
                    Cliente
                  </TableHead>

                  <TableHead className="text-[14px] font-semibold text-black">
                    Tarea
                  </TableHead>

                  <TableHead className="text-[14px] font-semibold text-black">
                    Categoría
                  </TableHead>

                  <TableHead className="text-[14px] font-semibold text-black">
                    Horas
                  </TableHead>

                  <TableHead className="text-[14px] font-semibold text-black">
                    Piezas
                  </TableHead>

                  <TableHead className="text-[14px] font-semibold text-black">
                    Estado
                  </TableHead>

                  <TableHead className="text-[14px] font-semibold text-black">
                    Fecha
                  </TableHead>

                  <TableHead className="text-[14px] font-semibold text-black">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {actividades.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-80 text-center text-lg font-semibold"
                    >
                      No hay actividades registradas.
                      <br />
                      <Link
                        href="/member/registrar"
                        className="text-verde-kurve-dark font-semibold text-sm"
                      >
                        Registrar una actividad
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  actividades.map((actividad) => (
                    <TableRow
                      key={actividad.id}
                      className="border-b border-[#E4E4E4] hover:bg-transparent"
                    >
                      <TableCell className="px-6 py-6 font-semibold">
                        {actividad.cliente}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {actividad.tarea}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {actividad.categoria}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {actividad.horas}
                      </TableCell>

                      <TableCell className="font-semibold">
                        {actividad.piezas}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${getStatusStyles(
                            actividad.estado,
                          )}`}
                        >
                          {actividad.estado}
                        </span>
                      </TableCell>

                      <TableCell className="text-[15px]">
                        {actividad.fecha}
                      </TableCell>

                      <TableCell>
                        <Button
                          variant="outline"
                          className="h-9 rounded-lg text-sm hover:bg-gray-50"
                        >
                          Solicitar corrección
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {actividades.length > 0 && (
              <div className="h-14 px-6 py-6 border-t border-gray-200 gap-4 flex items-center text-sm text-muted-foreground">
                <h4 className="font-semibold">1 de 20</h4>

                <div className="ml-auto flex items-center gap-2">
                  <Button className="border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <ChevronLeft size={16} />
                  </Button>

                  <Button className="border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MisActividadesPage;
