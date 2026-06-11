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

const TaskTypesTable = ({ taskTypes }: TaskTypesTableProps) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm overflow-x-auto mt-10 md:mx-20">
      <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
        <h2 className="text-base font-medium text-gray-900">
          Registro de tareas
        </h2>

        <Button
          className="flex items-center bg-verde-kurve text-white px-4 py-5 hover:bg-verde-kurve-dark hover:text-white"
          variant="outline"
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
                  className="ml-12"
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
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.activo ? "Activo" : "Inactivo"}
                </span>
              </TableCell>

              <TableCell className="w-75">
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTypesTable;
