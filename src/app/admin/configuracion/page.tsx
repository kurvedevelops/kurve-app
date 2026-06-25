"use client";
import PageHeader from "@/components/layout/PageHeader";
import SidebarAdmin from "@/components/layout/SidebarAdmin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TaskTypesTable from "@/components/admin/TaskTypeTable";
import PieceCategoriesTable from "@/components/admin/PieceCategoriesTable";
import {
  useTaskTypesConfig,
  usePieceCategoriesConfig,
} from "../../../hooks/middleware";

const ConfigurationPage = () => {
  const { tasks, loadingTasks, updateTask, addTask } = useTaskTypesConfig();
  const { categories, loadingCategories, updateCategory, addCategory } =
    usePieceCategoriesConfig();

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
              className=" md:gap-5 border-b border-gray-300/40"
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
              {loadingTasks ? (
                <p className="text-sm text-gray-400 mt-10 ml-4">Cargando...</p>
              ) : (
                <TaskTypesTable
                  taskTypes={tasks}
                  onSave={updateTask}
                  onAdd={addTask}
                />
              )}
            </TabsContent>

            <TabsContent value="piezas">
              {loadingCategories ? (
                <p className="text-sm text-gray-400 mt-10 ml-4">Cargando...</p>
              ) : (
                <PieceCategoriesTable
                  categories={categories}
                  onSave={updateCategory}
                  onAdd={addCategory}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ConfigurationPage;
