"use client"
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
import { Button } from "@/components/ui/button";
import { FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import TimeActivityDrawer from "@/components/admin/TimeActivityDrawer";
const mockData = [
  {
    id: "1",
    cliente: "Estudio Norte",
    integrante: "Juan Pérez",
    fecha: "2026-06-07",
    estado: "delivered",
    tarea: "Community management",
    pieza: "Post Instagram",
    horas: 5,
    observaciones: "Sin observaciones",
  },
  {
    id: "2",
    cliente: "Agencia Sur",
    integrante: "María López",
    fecha: "2026-06-05",
    estado: "in_progress",
    tarea: "Diseño gráfico",
    pieza: "Banner web",
    horas: 3,
    observaciones: "Revisar colores",
  },
  {
    id: "3",
    cliente: "Estudio Norte",
    integrante: "Carlos Ruiz",
    fecha: "2026-05-29",
    estado: "delivered",
    tarea: "Copywriting",
    pieza: "Newsletter",
    horas: 2,
    observaciones: null,
  },
  {
    id: "4",
    cliente: "Estudio Norte",
    integrante: "Carlos Ruiz",
    fecha: "2026-05-29",
    estado: "delivered",
    tarea: "Copywriting",
    pieza: "Newsletter",
    horas: 2,
    observaciones: null,
  },
  {
    id: "5",
    cliente: "Estudio Norte",
    integrante: "Carlos Ruiz",
    fecha: "2026-05-29",
    estado: "delivered",
    tarea: "Copywriting",
    pieza: "Newsletter",
    horas: 2,
    observaciones: null,
  },
];

const TimeTemplatesPage = () => {
  const [selectedActivity, setSelectedActivity] = useState<
    (typeof mockData)[number] | null
  >(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = (activity: (typeof mockData)[number]) => {
    setSelectedActivity(activity);
    setIsDrawerOpen(true);
  };
  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarAdmin />
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="hidden md:block mb-3">
          <PageHeader
            badge=""
            title="Planilla de tiempos"
            subtitle="Revisa y gestiona las actividades registradas por el equipo."
          />
        </div>

        <div className="md:hidden mb-6">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            PLANILLA DE TIEMPOS
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Planilla de tiempos
          </h1>
          <p className="text-sm text-gris-kurve-dark">
            Revisa y gestiona las actividades registradas por el equipo.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Cliente</label>
                <select className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve">
                  <option value="">Seleccionar cliente</option>
                  <option value="cliente1">Cliente 1</option>
                  <option value="cliente2">Cliente 2</option>
                </select>
              </div>
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">
                  Integrantes
                </label>
                <select className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve">
                  <option value="">Seleccionar integrante</option>
                  <option value="integrante1">Integrante 1</option>
                  <option value="integrante2">Integrante 2</option>
                </select>
              </div>
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Fecha</label>
                <select className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve">
                  <option value="">Seleccionar fecha</option>
                  <option value="2023-01-01">01/01/2023</option>
                  <option value="2023-01-02">02/01/2023</option>
                </select>
              </div>
              <div className="flex flex-col gap-4 mb-4">
                <label className="font-semibold text-foreground">Estado</label>
                <select className="px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve">
                  <option value="">Seleccionar estado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="completado">Completado</option>
                </select>
              </div>
              <div className="lg:col-span-4">
                <Button className="w-full md:w-fit cursor-pointer px-8 py-6 bg-verde-kurve text-white font-semibold rounded-lg hover:bg-verde-kurve-dark transition-colors">
                  Filtrar
                </Button>
                <Button
                  variant="outline"
                  className="w-full md:w-fit px-8 py-6 rounded-lg md:ml-3 cursor-pointer"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
              <h2 className="text-base font-medium text-gray-900">
                Registro de tareas y horas
              </h2>
              <Button
                className="flex items-center bg-verde-kurve text-white px-4 py-5 hover:bg-verde-kurve-dark hover:text-white"
                variant="outline"
              >
                <FileDown />
                Exportar Archivo
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="px-3.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide border-b border-gray-200">
                  <TableHead className="h-12 px-3 font-semibold text-gray-400">
                    Clinetes
                  </TableHead>

                  <TableHead className="font-semibold text-gray-400">
                    Integrantes
                  </TableHead>

                  <TableHead className="font-semibold text-gray-400">
                    Fecha
                  </TableHead>

                  <TableHead className="font-semibold text-gray-400">
                    Estado
                  </TableHead>

                  <TableHead className="font-semibold text-gray-400 w-[300px]">
                    Tarea
                  </TableHead>

                  <TableHead className="font-semibold text-gray-400">
                    Pieza
                  </TableHead>
                  <TableHead className="font-semibold text-gray-400">
                    Horas
                  </TableHead>
                  <TableHead className="font-semibold text-gray-400">
                    Observaciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => handleOpenDrawer(item)}
                    className="border-b border-gray-100 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="text-sm px-4 py-3.5">
                      {item.cliente}
                    </TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {item.integrante}
                    </TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {item.fecha}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
                          item.estado === "delivered"
                            ? "bg-green-100 text-verde-kurve"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.estado === "delivered"
                          ? "Entregado"
                          : "En progreso"}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {item.tarea}
                    </TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {item.pieza}
                    </TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {item.horas}
                    </TableCell>
                    <TableCell className="px-4 py-6 text-sm">
                      {item.observaciones ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {mockData.length > 0 && (
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
        <TimeActivityDrawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          activity={selectedActivity}
        />
      </main>
    </div>
  );
};

export default TimeTemplatesPage;
