"use client";
import { Pencil, LayoutList } from "lucide-react";
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
import type { TaskType } from "@/hooks/middleware";

interface TaskTypesTableProps {
  taskTypes: TaskType[];
  onSave: (updated: TaskType) => Promise<void>;
  onAdd: (nueva: TaskType) => Promise<void>;
}

const TaskTypesTable = ({ taskTypes, onSave, onAdd }: TaskTypesTableProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleEditClick = (task: TaskType) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm overflow-x-auto mt-10 md:mx-20">
      <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
        <h2 className="text-base font-medium text-gray-900">
          Registro de tareas
        </h2>

        <Button
          className="flex items-center bg-verde-kurve text-white px-2 py-5 md:px-4 hover:bg-verde-kurve-dark hover:text-white"
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
          {taskTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-20">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <LayoutList className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Sin tipos de tarea
                  </p>
                  <p className="text-xs text-gray-400">
                    Agregá un nuevo tipo de tarea para comenzar
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            taskTypes.map((task) => (
              <TableRow
                key={task.id}
                className="border-b border-gray-100 hover:bg-muted/50 transition-colors"
              >
                <TableCell className="text-sm px-4 py-6 w-75">
                  {task.name}
                </TableCell>

                <TableCell className="w-70">
                  <input
                    type="checkbox"
                    checked={task.counts_as_piece}
                    readOnly
                    className="ml-12 accent-verde-kurve-dark w-5 h-5"
                  />
                </TableCell>

                <TableCell className="w-75">
                  <div className="flex flex-wrap gap-1">
                    {task.allowed_roles.map((rol) => (
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
                      task.active
                        ? "bg-verde-kurve-light text-verde-kurve"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {task.active ? "Activo" : "Inactivo"}
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
            ))
          )}
        </TableBody>
      </Table>
      <EditTaskTypeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        taskType={selectedTask}
        onSave={onSave}
      />
      <EditTaskTypeModal
        key="new-task"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        taskType={null}
        onSave={onAdd}
      />
    </div>
  );
};

export default TaskTypesTable;
