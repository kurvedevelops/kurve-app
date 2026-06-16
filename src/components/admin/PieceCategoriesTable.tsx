"use client";
import { useState } from "react";
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
import ConfirmDeactivateModal from "../modals/admin/configuracion/ConfirmDeactivateModal";
import EditCategoryModal from "../modals/admin/configuracion/EditCategoryModal";

type Category = {
  id: number;
  nombre: string;
  activo: boolean;
};

interface PieceCategoriesTableProps {
  categories: Category[];
}

const mockPackages = [
  { id: "1", name: "Pack Básico", cat1_name: "Post feed", cat2_name: "Story" },
  { id: "2", name: "Pack Premium", cat1_name: "Reel", cat2_name: "Post feed" },
];

const PieceCategoriesTable = ({
  categories: initialCategories,
}: PieceCategoriesTableProps) => {
  const [categories, setCategories] = useState(initialCategories);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [pendingUpdate, setPendingUpdate] = useState<Category | null>(null);
  const [affectedPackages, setAffectedPackages] = useState<
    { id: string; name: string }[]
  >([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleSave = async (updated: Category) => {
    const estaDesactivando = selectedCategory?.activo && !updated.activo;

    if (estaDesactivando) {
      const afectados = mockPackages.filter((pkg) =>
        [pkg.cat1_name, pkg.cat2_name].includes(updated.nombre),
      );

      if (afectados.length > 0) {
        setAffectedPackages(afectados);
        setPendingUpdate(updated);
        setEditModalOpen(false);
        setConfirmModalOpen(true);
        return;
      }
    }

    guardarCategoria(updated);
    setEditModalOpen(false);
  };

  const handleConfirmDeactivate = async () => {
    if (!pendingUpdate) return;
    setConfirmLoading(true);

    await new Promise((res) => setTimeout(res, 800));

    guardarCategoria(pendingUpdate);
    setConfirmLoading(false);
    setConfirmModalOpen(false);
    setPendingUpdate(null);
  };

  const guardarCategoria = (updated: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
  };

  const handleAdd = async (nueva: Category) => {
    setCategories((prev) => [...prev, nueva]);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm overflow-x-auto mt-10 md:mx-20">
      <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
        <h2 className="text-base font-medium text-gray-900">
          Categorías de piezas
        </h2>
        <Button
          className="flex items-center bg-verde-kurve text-white px-4 py-5 hover:bg-verde-kurve-dark hover:text-white"
          variant="outline"
          onClick={() => setAddModalOpen(true)}
        >
          + Agregar categoría
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="px-3.5 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide border-b border-gray-200">
            <TableHead className="h-12 px-3 font-semibold text-gray-400">
              NOMBRE DE CATEGORÍA
            </TableHead>
            <TableHead className="font-semibold text-gray-400">
              ESTADO
            </TableHead>
            <TableHead className="font-semibold text-gray-400">
              ACCIONES
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              className="border-b border-gray-100 hover:bg-muted/50 transition-colors"
            >
              <TableCell className="text-sm px-4 py-6 md:w-120">
                {category.nombre}
              </TableCell>

              <TableCell>
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                    category.activo
                      ? "bg-green-100 text-verde-kurve"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.activo ? "Activo" : "Inactivo"}
                </span>
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                  onClick={() => handleEditClick(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <EditCategoryModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        category={selectedCategory}
        onSave={handleSave}
      />

      <EditCategoryModal
        key="new-category"
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        category={null}
        onSave={handleAdd}
      />

      <ConfirmDeactivateModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmDeactivate}
        categoryName={pendingUpdate?.nombre ?? ""}
        affectedPackages={affectedPackages}
        loading={confirmLoading}
      />
    </div>
  );
};

export default PieceCategoriesTable;
