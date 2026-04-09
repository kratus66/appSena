import { CoordinatorMetricStrip } from "@/components/coordinator/coordinator-metric-strip";
import { CoordinatorSectionHeader } from "@/components/coordinator/coordinator-section-header";
import { CoordinatorSchoolWorkspace } from "@/components/coordinator/coordinator-school-workspace";
import { coordinatorCenterName } from "@/lib/mocks/coordinator-console";
import { getCoordinatorSchoolsData } from "@/lib/mocks/coordinator-colegios";

type CoordinatorPageProps = {
  searchParams?: Promise<{ site?: string | string[] }>;
};

export default async function CoordinadorColegiosPage({
  searchParams: _searchParams,
}: CoordinatorPageProps) {
  const schoolsData = getCoordinatorSchoolsData();

  return (
    <div className="space-y-5">
      <CoordinatorSectionHeader
        title="Colegios"
        description="Modulo operativo para preparar la asignacion de instructores de articulacion con la media."
      />
      <CoordinatorMetricStrip metrics={schoolsData.metrics} />
      <CoordinatorSchoolWorkspace
        schools={schoolsData.schools}
        siteLabel={coordinatorCenterName}
      />
    </div>
  );
}
