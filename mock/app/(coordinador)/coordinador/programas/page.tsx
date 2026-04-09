import Link from "next/link";

import { CoordinatorAssignmentWorkspace } from "@/components/coordinator/coordinator-assignment-workspace";
import { CoordinatorSectionHeader } from "@/components/coordinator/coordinator-section-header";
import { Button } from "@/components/ui/button";
import { getCoordinatorAssignmentModuleData } from "@/lib/mocks/coordinator-asignaciones";

type CoordinatorPageProps = {
  searchParams?: Promise<{ edit?: string | string[]; site?: string | string[] }>;
};

export default async function CoordinadorProgramasPage({
  searchParams,
}: CoordinatorPageProps) {
  const params = (await searchParams) ?? {};
  const siteId = Array.isArray(params.site) ? params.site[0] : params.site;
  const editId = Array.isArray(params.edit) ? params.edit[0] : params.edit;
  const assignmentData = getCoordinatorAssignmentModuleData(siteId);

  return (
    <div className="space-y-5">
      <CoordinatorSectionHeader
        title="Planeacion"
        description={
          assignmentData.site.id === "articulacion"
            ? "Centro transaccional para planear cobertura de articulacion entre fichas, instructores y colegios."
            : `Centro transaccional para planear fichas, ajustar cobertura y cerrar programacion operativa desde ${assignmentData.site.label}.`
        }
        actions={
          <Button asChild variant="outline">
            <Link href={`/coordinador/asignaciones?site=${assignmentData.site.id}`}>
              Ver asignaciones
            </Link>
          </Button>
        }
      />
      <CoordinatorAssignmentWorkspace
        {...assignmentData}
        initialEditAssignmentId={editId}
      />
    </div>
  );
}
