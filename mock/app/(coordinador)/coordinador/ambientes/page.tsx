import { CoordinatorMetricStrip } from "@/components/coordinator/coordinator-metric-strip";
import { CoordinatorSectionHeader } from "@/components/coordinator/coordinator-section-header";
import { CoordinatorEnvironmentWorkspace } from "@/components/coordinator/coordinator-environment-workspace";
import { getCoordinatorEnvironmentBoardData } from "@/lib/mocks/coordinator-ambientes";

type CoordinatorPageProps = {
  searchParams?: Promise<{ site?: string | string[]; filter?: string | string[] }>;
};

export default async function CoordinadorAmbientesPage({
  searchParams,
}: CoordinatorPageProps) {
  const params = (await searchParams) ?? {};
  const siteId = Array.isArray(params.site) ? params.site[0] : params.site;
  const filters = Array.isArray(params.filter)
    ? params.filter
    : params.filter
      ? [params.filter]
      : [];
  const boardData = getCoordinatorEnvironmentBoardData(siteId, filters);

  return (
    <div className="space-y-5">
      <CoordinatorSectionHeader
        title="Ambientes"
        description={`Tablero operativo de ${boardData.site.label} para ubicar ambientes de titulada y complementaria en una semana completa de lunes a domingo.`}
      />
      <CoordinatorMetricStrip metrics={boardData.metrics} />
      <CoordinatorEnvironmentWorkspace
        rows={boardData.rows}
        blocks={boardData.blocks}
        catalog={boardData.catalog}
        siteLabel={boardData.site.label}
      />
    </div>
  );
}
