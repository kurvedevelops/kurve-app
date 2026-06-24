"use client";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import EditTaskTypeModal from "../modals/admin/configuracion/EditTaskTypeModal";

type TaskType = {
  id: number;
  nombre: string;
  cuentaComoPieza: boolean;
  rolesPermitidos: string[];
  activo: boolean;
};

interface TaskTypesTableProps {
  taskTypes: TaskType[];
}

const TaskTypesTable = ({
  taskTypes: initialTaskTypes,
}: TaskTypesTableProps) => {
  const [taskTypes, setTaskTypes] = useState(initialTaskTypes);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleAdd = (nueva: TaskType) => {
    setTaskTypes((prev) => [...prev, nueva]);
  };

  const handleEditClick = (task: TaskType) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleSave = (updated: TaskType) => {
    setTaskTypes((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t)),
    );
  };
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm overflow-x-auto mt-10 md:mx-20">
      <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
        <h2 className="text-base font-medium text-gray-900">
          Registro de tareas
        </h2>

        <Button
          className="flex items-center bg-verde-kurve text-white px-4 py-5 hover:bg-verde-kurve-dark hover:text-white"
          variant="outline"
          onClick={() => setAddModalOpen(true)}
        >
          + Agregar una nueva tarea
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="px-3.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide border-b border-gray-200">
            <TableHead className="h-12 px-3 font-semibold text-gray-400">
              NOMBRE
            </TableHead>

            <TableHead className="font-semibold text-gray-400">
              CUENTA COMO PIEZA
            </TableHead>

            <TableHead className="font-semibold text-gray-400">
              ROLES PERMITIDOS
            </TableHead>

            <TableHead className="font-semibold text-gray-400">
              ACTIVO
            </TableHead>

            <TableHead className="font-semibold text-gray-400">
              ACCIONES
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {taskTypes.map((task) => (
            <TableRow
              key={task.id}
              className="border-b border-gray-100 hover:bg-muted/50 transition-colors"
            >
              <TableCell className="text-sm px-4 py-6 w-75">
                {task.nombre}
              </TableCell>

              <TableCell className="w-70">
                <input
                  type="checkbox"
                  checked={task.cuentaComoPieza}
                  readOnly
                  className="ml-12 accent-verde-kurve-dark w-5 h-5"
                />
              </TableCell>

              <TableCell className="w-75">
                <div className="flex flex-wrap gap-1">
                  {task.rolesPermitidos.map((rol) => (
                    <span
                      key={rol}
                      className="px-2 py-1 text-xs rounded-full bg-blue-100 font-semibold"
                    >
                      {rol}
                    </span>
                  ))}
                </div>
              </TableCell>

              <TableCell className="w-75">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    task.activo
                      ? "bg-verde-kurve-light text-verde-kurve"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.activo ? "Activo" : "Inactivo"}
                </span>
              </TableCell>

              <TableCell className="w-75">
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                  onClick={() => handleEditClick(task)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <EditTaskTypeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        taskType={selectedTask}
        onSave={handleSave}
      />
      <EditTaskTypeModal
        key="new-task"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        taskType={null}
        onSave={handleAdd}
      />
    </div>
  );
};

export default TaskTypesTable;
