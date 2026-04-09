import { CoordinatorInstructorDirectory } from "@/components/coordinator/coordinator-instructor-directory";
import { CoordinatorSectionHeader } from "@/components/coordinator/coordinator-section-header";
import { getCoordinatorInstructorModuleData } from "@/lib/mocks/coordinator-console";

type CoordinatorPageProps = {
  searchParams?: Promise<{ site?: string | string[]; filter?: string | string[] }>;
};

export default async function CoordinadorInstructoresPage({
  searchParams,
}: CoordinatorPageProps) {
  const params = (await searchParams) ?? {};
  const siteId = Array.isArray(params.site) ? params.site[0] : params.site;
  const filters = Array.isArray(params.filter)
    ? params.filter
    : params.filter
      ? [params.filter]
      : [];
  const siteData = getCoordinatorInstructorModuleData(siteId, filters);
  const directoryMetrics = [
    {
      label: "Perfiles visibles",
      value: `${siteData.instructors.length}`,
      tone: "neutral" as const,
    },
    {
      label: "Articulacion",
      value: `${siteData.instructors.filter((item) => item.dependency === "Articulacion").length}`,
      tone: "neutral" as const,
    },
    {
      label: "Titulada",
      value: `${siteData.instructors.filter((item) => item.dependency === "Titulada").length}`,
      tone: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-5">
      <CoordinatorSectionHeader
        title="Instructores"
        description={`Directorio operativo con contexto administrativo en ${siteData.site.label}. En articulacion la lectura se adapta por colegio, cobertura y modalidad.`}
      />
      <CoordinatorInstructorDirectory
        key={`${siteData.site.id}-${siteData.activeFilters.join("-") || "all"}`}
        instructors={siteData.instructors}
        metrics={directoryMetrics}
      />
    </div>
  );
}
