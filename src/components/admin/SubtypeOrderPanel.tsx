"use client";
import { useState, useEffect } from "react";
import { GripVertical } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTaskTypeSubtypeOrder } from "@/hooks/middleware";
import type { TaskType, SubtypeOrderItem } from "@/hooks/middleware";

const SubtypeOrderList = ({ taskTypeId }: { taskTypeId: string }) => {
  const { items, loading, saveOrder } = useTaskTypeSubtypeOrder(taskTypeId);
  const [localItems, setLocalItems] = useState<SubtypeOrderItem[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocalItems(items);
    setDirty(false);
  }, [items]);

  const handleDragOver = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    setLocalItems((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(index);
    setDirty(true);
  };

  const handleSave = async () => {
    await saveOrder(localItems.map((i) => i.task_subtype_id));
    setDirty(false);
  };

  if (loading) {
    return <p className="text-sm text-gray-400 mt-6 ml-4">Cargando...</p>;
  }

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-2">
        {localItems.map((item, index) => (
          <div
            key={item.task_subtype_id}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => {
              e.preventDefault();
              handleDragOver(index);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 cursor-grab active:cursor-grabbing ${
              !item.active ? "opacity-50" : ""
            }`}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500 w-6">
              {index + 1}
            </span>
            <span className="text-sm text-gray-900">{item.name}</span>
            {!item.active && (
              <span className="ml-auto text-xs text-gray-400">Inactivo</span>
            )}
          </div>
        ))}
      </div>

      {dirty && (
        <div className="flex justify-end mt-4">
          <Button
            className="bg-verde-kurve text-white hover:bg-verde-kurve-dark"
            onClick={handleSave}
          >
            Guardar orden
          </Button>
        </div>
      )}
    </div>
  );
};

interface SubtypeOrderPanelProps {
  taskTypes: TaskType[];
}

const SubtypeOrderPanel = ({ taskTypes }: SubtypeOrderPanelProps) => {
  if (taskTypes.length === 0) return null;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm mt-10 md:mx-20 p-4">
      <h2 className="text-base font-medium text-gray-900 mb-4">
        Orden de tareas por rol
      </h2>
      <Tabs defaultValue={taskTypes[0].id}>
        <TabsList variant="line" className="gap-3 border-b border-gray-200">
          {taskTypes.map((tt) => (
            <TabsTrigger
              key={tt.id}
              value={tt.id}
              className="text-sm font-semibold text-gray-500 cursor-pointer pb-2"
            >
              {tt.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {taskTypes.map((tt) => (
          <TabsContent key={tt.id} value={tt.id}>
            <SubtypeOrderList taskTypeId={tt.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SubtypeOrderPanel;
