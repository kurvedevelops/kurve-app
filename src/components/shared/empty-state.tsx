interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Sin resultados",
  description = "No hay datos para mostrar.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs mt-1">{description}</p>
    </div>
  );
}
