"use client";
import PackageSummaryCard from "../client/PackageSummaryCard";
import { usePackageByClient } from "@/hooks/middleware";

const ConsumptionPackageSection = ({ clientId }: { clientId: string }) => {
  const { clientPackage, loadingClientPackage } = usePackageByClient(clientId);

  if (loadingClientPackage) {
    return (
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm h-96 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando paquete...</p>
      </div>
    );
  }

  return <PackageSummaryCard clientPackage={clientPackage ?? null} />;
};

export default ConsumptionPackageSection;
