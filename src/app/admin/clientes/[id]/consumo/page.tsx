import SidebarAdmin from "@/components/layout/SidebarAdmin"
import PageHeader from "@/components/layout/PageHeader"
import ConsumptionChart from "@/components/client/ConsumptionChart";
import ConsumptionPackageSection from "@/components/admin/ConsumptionPackageSection";
interface ConsumoPageProps {
  params: Promise<{ id: string }>;
}

const ConsumptionClient = async ({ params }: ConsumoPageProps) => {
  const { id } = await params;
  return (
    <div className="min-h-screen w-full bg-muted flex">
      <SidebarAdmin />
      <main className="flex-1 md:ml-50 lg:ml-64 px-5 py-8 md:p-8">
        <PageHeader
          title="Bienvenido/a"
          showName={true}
          subtitle="Consumo del Cliente"
        />
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ConsumptionChart
            clientId={id}
          />
          <ConsumptionPackageSection clientId={id} />
        </div>
      </main>
    </div>
  )
}

export default ConsumptionClient
