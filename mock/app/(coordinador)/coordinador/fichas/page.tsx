import { CoordinatorFichaDirectory } from "@/components/coordinator/coordinator-ficha-directory";
import { CoordinatorSectionHeader } from "@/components/coordinator/coordinator-section-header";
import { getCoordinatorFichaModuleData } from "@/lib/mocks/coordinator-fichas";

type CoordinatorPageProps = {
  searchParams?: Promise<{ site?: string | string[]; filter?: string | string[] }>;
};

export default async function CoordinadorFichasPage({
  searchParams,
}: CoordinatorPageProps) {
  const params = (await searchParams) ?? {};
  const siteId = Array.isArray(params.site) ? params.site[0] : params.site;
  const filters = Array.isArray(params.filter)
    ? params.filter
    : params.filter
      ? [params.filter]
      : [];
  const fichaData = getCoordinatorFichaModuleData(siteId, filters);

  return (
    <div className="space-y-5">
      <CoordinatorSectionHeader
        title="Fichas"
        description={`Gestiona las fichas de ${fichaData.site.label} como objetos operativos: crea, consulta detalle, importa aprendices y revisa su alistamiento.`}
      />
      <CoordinatorFichaDirectory
        key={`${fichaData.site.id}-${fichaData.activeFilters.join("-") || "all"}`}
        fichas={fichaData.fichas}
        metrics={fichaData.metrics}
        siteLabel={fichaData.site.label}
      />
    </div>
  );
}
