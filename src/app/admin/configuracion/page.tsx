import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TaskTypesTable from "@/components/admin/TaskTypeTable";
import PieceCategoriesTable from "@/components/admin/PieceCategoriesTable";

const category = [
    {
    id: 1,
    nombre: "Community Management",
    cuentaComoPieza: true,
    rolesPermitidos: ["Diseño", "Social Media"],
    activo: true,
  },
      {
    id: 2,
    nombre: "Community Management",
    cuentaComoPieza: true,
    rolesPermitidos: ["Diseño", "Social Media"],
    activo: true,
  },
]

const taskTypes = [
  {
    id: 1,
    nombre: "Community Management",
    cuentaComoPieza: true,
    rolesPermitidos: ["Diseño", "Social Media"],
    activo: true,
  },
  {
    id: 2,
    nombre: "Copywriting",
    cuentaComoPieza: true,
    rolesPermitidos: ["Redacción"],
    activo: true,
  },
  {
    id: 3,
    nombre: "Reunión de coordinación",
    cuentaComoPieza: false,
    rolesPermitidos: ["Todos"],
    activo: false,
  },
  {
    id: 4,
    nombre: "Copywriting",
    cuentaComoPieza: true,
    rolesPermitidos: ["Redacción"],
    activo: true,
  },
  {
    id: 5,
    nombre: "Copywriting",
    cuentaComoPieza: true,
    rolesPermitidos: ["Redacción"],
    activo: true,
  },
];

const ConfigurationPage = () => {
  return (
    <div className="min-h-screen w-full bg-muted flex flex-col md:flex-row">
      <SidebarAdmin />
      <main className="flex-1 md:ml-47 lg:ml-64 px-5 py-8 md:p-8">
        <div className="hidden md:block mb-3">
          <PageHeader
            badge=""
            title="Configuracion"
            subtitle="Define los parametros vase para la operacion del sistema"
          />
        </div>

        <div className="md:hidden mb-6">
          <p className="text-xs font-bold text-verde-kurve uppercase tracking-wide mb-2">
            Configuracion
          </p>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Configuracion
          </h1>
          <p className="text-sm text-gris-kurve-dark">
            Define los parametros vase para la operacion del sistema
          </p>
        </div>
        <div className="mt-10">
          <Tabs defaultValue="tarea" className="mt-10">
            <TabsList
              variant="line"
              className="gap-5 border-b border-gray-300/40"
            >
              <TabsTrigger
                value="tarea"
                className="text-xl font-bold text-gray-300 cursor-pointer pb-4"
              >
                Tipo de tarea
              </TabsTrigger>

              <TabsTrigger
                value="piezas"
                className="text-xl font-bold text-gray-300 cursor-pointer pb-4"
              >
                Categoria de piezas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tarea">
              <TaskTypesTable taskTypes={taskTypes}/>
            </TabsContent>

            <TabsContent value="piezas">
              <PieceCategoriesTable categories={category}/>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ConfigurationPage;
