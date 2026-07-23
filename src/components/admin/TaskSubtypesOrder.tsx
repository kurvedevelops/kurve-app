"use client";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TaskType {
  id: string;
  name: string;
}

interface OrderedSubtype {
  id: string;
  name: string;
  priority: number | null;
}

interface TaskSubtypesOrderProps {
  taskTypes: TaskType[];
}

const TaskSubtypesOrder = ({ taskTypes }: TaskSubtypesOrderProps) => {
  const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string | null>(
    null,
  );
  const [subtypes, setSubtypes] = useState<OrderedSubtype[]>([]);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (taskTypes?.length && !selectedTaskTypeId) {
      setSelectedTaskTypeId(taskTypes[0].id);
    }
  }, [taskTypes, selectedTaskTypeId]);

  useEffect(() => {
    if (!selectedTaskTypeId) return;

    const fetchOrder = async () => {
      setLoadingOrder(true);
      try {
        const res = await fetch(
          `/api/task-types/${selectedTaskTypeId}/subtypes-order`,
        );
        const json = await res.json();
        setSubtypes(json.data ?? []);
      } catch {
        toast.error("Error al cargar el orden de tareas");
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrder();
  }, [selectedTaskTypeId]);

  const moveItem = (index: number, direction: "up" | "down") => {
    setSubtypes((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedTaskTypeId) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/task-types/${selectedTaskTypeId}/subtypes-order`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: subtypes.map((s) => s.id) }),
        },
      );
      if (!res.ok) throw new Error();
      toast.success("Orden guardado correctamente");
    } catch {
      toast.error("Error al guardar el orden");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-10">
      {/* Selector de cargo */}
      <div className="flex flex-wrap gap-2 mb-6">
        {taskTypes.map((tt) => (
          <button
            key={tt.id}
            onClick={() => setSelectedTaskTypeId(tt.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              selectedTaskTypeId === tt.id
                ? "bg-verde-kurve/20 border-verde-kurve text-verde-kurve-dark"
                : "border-border bg-white text-foreground hover:bg-muted"
            }`}
          >
            {tt.name}
          </button>
        ))}
      </div>

      {/* Lista ordenable */}
      {loadingOrder ? (
        <p className="text-sm text-gray-400 ml-4">Cargando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {subtypes.map((st, index) => (
            <div
              key={st.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-white"
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-gris-kurve-dark" />
                <span className="text-sm font-medium text-foreground">
                  {index + 1}. {st.name}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  className="h-8 w-8 cursor-pointer hover:text-verde-kurve-dark"
                  disabled={index === 0}
                  onClick={() => moveItem(index, "up")}
                >
                  <ArrowUp size={14} />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8 cursor-pointer hover:text-verde-kurve-dark"
                  disabled={index === subtypes.length - 1}
                  onClick={() => moveItem(index, "down")}
                >
                  <ArrowDown size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleSave}
          disabled={saving || loadingOrder}
          className="bg-verde-kurve text-white hover:bg-verde-kurve-dark"
        >
          {saving ? "Guardando..." : "Guardar orden"}
        </Button>
      </div>
    </div>
  );
};

export default TaskSubtypesOrder;
