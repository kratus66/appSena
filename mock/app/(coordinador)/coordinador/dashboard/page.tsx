import { Button } from "@/components/ui/button";
import { CoordinatorMetricStrip } from "@/components/coordinator/coordinator-metric-strip";
import { CoordinatorSectionHeader } from "@/components/coordinator/coordinator-section-header";
import { CoordinatorSummaryBoard } from "@/components/coordinator/coordinator-summary-board";
import { getCoordinatorSiteData } from "@/lib/mocks/coordinator-console";
import { CoordinatorOperationalDependency } from "@/lib/types";

type CoordinatorPageProps = {
  searchParams?: Promise<{ site?: string | string[]; filter?: string | string[] }>;
};

export default async function CoordinadorDashboardPage({
  searchParams,
}: CoordinatorPageProps) {
  const params = (await searchParams) ?? {};
  const siteId = Array.isArray(params.site) ? params.site[0] : params.site;
  const filters = Array.isArray(params.filter)
    ? params.filter
    : params.filter
      ? [params.filter]
      : [];
  const siteData = getCoordinatorSiteData(siteId, filters);
  const dependencies: CoordinatorOperationalDependency[] = [
    "Articulacion",
    "Titulada",
    "Complementaria",
  ];
  const focusCount = dependencies.filter((dependency) =>
    siteData.fichas.some(
      (item) => item.dependency === dependency && item.status === "Sin asignar",
    ),
  ).length;
  const summaryMetrics = [
    siteData.metrics[0],
    siteData.metrics[2],
    {
      label: siteData.site.id === "articulacion" ? "Colegios listos" : "Ambientes libres",
      value: siteData.environmentMetrics[0]?.value ?? "0",
      tone: "neutral" as const,
    },
    {
      label: "Frentes activos",
      value: `${focusCount}`,
      tone: focusCount > 1 ? ("warning" as const) : ("neutral" as const),
    },
  ];

  return (
    <div className="space-y-5">
      <CoordinatorSectionHeader
        title="Resumen operativo"
        description={
          siteData.site.id === "articulacion"
            ? "Portada operativa de articulacion. Resume cobertura, colegios y fichas sin abrir listas completas."
            : `Portada operativa de ${siteData.site.label}. Resume donde actuar sin abrir listas completas.`
        }
        actions={
          <>
            <Button variant="outline">Exportar corte</Button>
            <Button>Actualizar planeacion</Button>
          </>
        }
      />

      <CoordinatorMetricStrip metrics={summaryMetrics} />

      <CoordinatorSummaryBoard
        key={`${siteData.site.id}-${siteData.activeFilters.join("-") || "all"}`}
        siteId={siteData.site.id}
        filters={siteData.activeFilters}
        instructors={siteData.instructors}
        fichas={siteData.fichas}
      />
    </div>
  );
}
