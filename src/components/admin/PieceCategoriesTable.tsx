"use client";
import { useState } from "react";
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
import ConfirmDeactivateModal from "../modals/admin/configuracion/ConfirmDeactivateModal";
import EditCategoryModal from "../modals/admin/configuracion/EditCategoryModal";
import { createClient } from "@/lib/supabase/client";
import type { PieceCategory } from "@/hooks/middleware";

interface PieceCategoriesTableProps {
  categories: PieceCategory[];
  onSave: (updated: PieceCategory) => Promise<void>;
  onAdd: (nueva: Omit<PieceCategory, "id">) => Promise<void>;
}

const PieceCategoriesTable = ({
  categories,
  onSave,
  onAdd,
}: PieceCategoriesTableProps) => {
  const supabase = createClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<PieceCategory | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<PieceCategory | null>(
    null,
  );
  const [affectedPackages, setAffectedPackages] = useState<
    { id: string; name: string }[]
  >([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const handleEditClick = (category: PieceCategory) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleSave = async (updated: PieceCategory) => {
    const estaDesactivando = selectedCategory?.active && !updated.active;

    if (estaDesactivando) {
      const { data } = await supabase
        .from("package_pieces")
        .select("package_id, packages(id, name, status)")
        .eq("category_id", updated.id)
        .eq("packages.status", "active");

      const afectados = (data ?? [])
        .filter((item: any) => item.packages !== null)
        .map((item: any) => ({
          id: item.packages.id,
          name: item.packages.name,
        }));

      if (afectados.length > 0) {
        setAffectedPackages(afectados);
        setPendingUpdate(updated);
        setEditModalOpen(false);
        setConfirmModalOpen(true);
        return;
      }
    }

    await onSave(updated);
    setEditModalOpen(false);
  };

  const handleConfirmDeactivate = async () => {
    if (!pendingUpdate) return;
    setConfirmLoading(true);
    await onSave(pendingUpdate);
    setConfirmLoading(false);
    setConfirmModalOpen(false);
    setPendingUpdate(null);
  };

  const handleAdd = async (nueva: Omit<PieceCategory, "id">) => {
    await onAdd(nueva);
    setAddModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm overflow-x-auto mt-10 md:mx-20">
      <div className="flex items-center justify-between mb-5 gap-3 mt-4 ml-4 mr-4">
        <h2 className="text-base font-medium text-gray-900">
          Categorías de piezas
        </h2>

        <Button
          className="flex items-center bg-verde-kurve text-white px-3 md:px-4 py-5 hover:bg-verde-kurve-dark hover:text-white"
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
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-20">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <LayoutList className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Sin categorías
                  </p>
                  <p className="text-xs text-gray-400">
                    Agregá una nueva categoría para comenzar
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow
                key={category.id}
                className="border-b border-gray-100 hover:bg-muted/50 transition-colors"
              >
                <TableCell className="text-sm px-4 py-6 md:w-120">
                  {category.name}
                </TableCell>

                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-medium ${
                      category.active
                        ? "bg-green-100 text-verde-kurve"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {category.active ? "Activo" : "Inactivo"}
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
            ))
          )}
        </TableBody>
      </Table>
      <EditCategoryModal
        key={selectedCategory?.id ?? "empty"}
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
        categoryName={pendingUpdate?.name ?? ""}
        affectedPackages={affectedPackages}
        loading={confirmLoading}
      />
    </div>
  );
};

export default PieceCategoriesTable;
