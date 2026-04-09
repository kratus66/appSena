import { CoordinatorAssignmentsOverview } from "@/components/coordinator/coordinator-assignments-overview";
import { CoordinatorSectionHeader } from "@/components/coordinator/coordinator-section-header";
import { Button } from "@/components/ui/button";
import { getCoordinatorAssignmentModuleData } from "@/lib/mocks/coordinator-asignaciones";
import Link from "next/link";

type CoordinatorPageProps = {
  searchParams?: Promise<{ site?: string | string[] }>;
};

export default async function CoordinadorAsignacionesPage({
  searchParams,
}: CoordinatorPageProps) {
  const params = (await searchParams) ?? {};
  const siteId = Array.isArray(params.site) ? params.site[0] : params.site;
  const assignmentData = getCoordinatorAssignmentModuleData(siteId);

  return (
    <div className="space-y-5">
      <CoordinatorSectionHeader
        title="Asignaciones"
        description={
          assignmentData.site.id === "articulacion"
            ? "Vista global consolidada de cobertura activa entre instructores, fichas y colegios de articulacion."
            : `Vista global consolidada para leer instructores, fichas, ambientes y cobertura activa desde ${assignmentData.site.label}.`
        }
        actions={
          <Button asChild>
            <Link href={`/coordinador/programas?site=${assignmentData.site.id}`}>
              Abrir planeacion
            </Link>
          </Button>
        }
      />
      <CoordinatorAssignmentsOverview {...assignmentData} />
    </div>
  );
}
