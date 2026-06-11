import SidebarAdmin from "@/components/layout/SidebarAdmin";
import { Button } from "@/components/ui/button";
import { ChevronRight, UserMinus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, User, Plus, Link2Off } from "lucide-react";

const MemberDetail = () => {
  const clients = [
    {
      id: 1,
      name: "Cliente A",
      description:
        "Se posteo en redes sociales posts sobre bienestar y estilo de vida saludable.",
      lastActivity: "Hace 2 horas",
    },
    {
      id: 2,
      name: "Cliente B",
      description:
        "Se realizó una campaña de email marketing enfocada en la promoción de productos de fitness.",
      lastActivity: "Ayer",
    },
  ];
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
              <span className="text-white font-bold text-2xl">MA</span>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-bold mb-1">María Álvarez</h2>
              <div className="flex gap-4">
                <p className="text-gray-600 text-xs">
                  <span className="text-xs font-semibold">Rol: </span>
                  Desarrolladora Full Stack
                </p>
                <p className="text-gray-600 text-xs">
                  <span className="text-xs font-semibold">Email: </span>
                  maria.alvarez@example.com
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="ml-auto px-10 py-6 flex items-center gap-2 border-red-500 text-red-500 cursor-pointer hover:text-red-600"
            >
              <UserMinus />
              Desactivar Integrante
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 ">
          <Card className="bg-white lg:col-span-2 py-6 px-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Clientes asociados</CardTitle>

              <div className="bg-verde-kurve-light text-verde-kurve-dark text-xs px-3 py-1 rounded-full">
                {clients.length}
              </div>
            </CardHeader>

            <CardContent>
              {clients.length === 0 ? (
                <p className="text-center text-gray-500 mt-10">
                  No hay clientes asociados a este integrante.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clients.map((client) => (
                    <Card
                      key={client.id}
                      className="border border-gray-100 shadow-none hover:border-verde-kurve transition"
                  >
                    <CardContent className="">
                      <div className="flex justify-between items-center">
                        <div className="w-14 h-14 rounded-lg bg-verde-kurve-light flex items-center justify-center">
                          <User size={28} color="#0c4450 " />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-azul-kurve cursor-pointer"
                        >
                          <Link2Off size={24} />
                        </Button>
                      </div>

                      <h3 className="font-bold mt-3 text-xl">{client.name}</h3>

                      <p className="text-sm text-gray-600 mt-2">
                        {client.description}
                      </p>

                      <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-200">
                        <span className=" font-semibold mt-3">
                          ÚLTIMA ACTIVIDAD
                        </span>

                        <span className="text-xs text-muted-foreground">
                          {client.lastActivity}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  <label className="text-gray-600 ">
                    Seleccionar Cliente
                  </label>
                  <select className="mt-4 w-full h-10 px-2 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-verde-kurve">
                    <option value="">Selecciona un cliente</option>
                    <option value="clienteA">Cliente A</option>
                    <option value="clienteB">Cliente B</option>
                    <option value="clienteC">Cliente C</option>
                  </select>
                </div>
                <Button className="w-full h-10 text-white bg-verde-kurve hover:bg-verde-kurve-dark">
                  <Plus size={16} />
                  Agregar Cliente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MemberDetail;
