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
import EditTaskSubtypeModal from "../modals/admin/configuracion/EditTaskSubtypeModal";
import type { TaskSubtype, TaskType } from "@/hooks/middleware";

interface TaskSubtypesTableProps {
  subtypes: TaskSubtype[];
  taskTypes: TaskType[];
  onSave: (updated: TaskSubtype) => Promise<void>;
  onAdd: (nueva: Omit<TaskSubtype, "id">) => Promise<void>;
}

const TaskSubtypesTable = ({
  subtypes,
  taskTypes,
  onSave,
  onAdd,
}: TaskSubtypesTableProps) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubtype, setSelectedSubtype] = useState<TaskSubtype | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleEditClick = (subtype: TaskSubtype) => {
    setSelectedSubtype(subtype);
    setEditModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm overflow-x-auto mt-10 md:mx-20">
      <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
        <h2 className="text-base font-medium text-gray-900">
          Registro de subtipos de tarea
        </h2>

        <Button
          className="flex items-center bg-verde-kurve text-white px-2 py-5 md:px-4 hover:bg-verde-kurve-dark hover:text-white"
          variant="outline"
          onClick={() => setAddModalOpen(true)}
        >
          + Agregar un nuevo subtipo
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="px-3.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide border-b border-gray-200">
            <TableHead className="h-12 px-3 font-semibold text-gray-400">
              NOMBRE
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
          {subtypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-20">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <LayoutList className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Sin subtipos de tarea
                  </p>
                  <p className="text-xs text-gray-400">
                    Agregá un nuevo subtipo para comenzar
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            subtypes.map((subtype) => (
              <TableRow
                key={subtype.id}
                className="border-b border-gray-100 hover:bg-muted/50 transition-colors"
              >
                <TableCell className="text-sm px-4 py-6 w-75">
                  {subtype.name}
                </TableCell>

                <TableCell className="w-75">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      subtype.active
                        ? "bg-verde-kurve-light text-verde-kurve"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {subtype.active ? "Activo" : "Inactivo"}
                  </span>
                </TableCell>

                <TableCell className="w-75">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleEditClick(subtype)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <EditTaskSubtypeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        subtype={selectedSubtype}
        onSave={onSave}
      />
      <EditTaskSubtypeModal
        key="new-subtype"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        subtype={null}
        onSave={onAdd}
      />
    </div>
  );
};

export default TaskSubtypesTable;
