import {
  CoordinatorArticulationFichaUnit,
  CoordinatorArticulationInstructor,
  CoordinatorArticulationMode,
  CoordinatorArticulationSchoolUnit,
  CoordinatorOperationalMetric,
} from "@/lib/types";
import {
  coordinatorQuickFilters,
  coordinatorSites,
  coordinatorOperationalInstructors,
  resolveCoordinatorFilters,
  resolveCoordinatorSite,
} from "@/lib/mocks/coordinator-console";

const schoolTemplatesBySite = {
  Chapinero: [
    {
      name: "Colegio San Jorge",
      address: "Carrera 13 # 54-22",
      city: "Chapinero",
    },
    {
      name: "Colegio Nuevo Horizonte",
      address: "Calle 63 # 9-41",
      city: "Chapinero",
    },
    {
      name: "Colegio Tecnico Metropolitano",
      address: "Carrera 7 # 58-12",
      city: "Chapinero",
    },
    {
      name: "Colegio Distrital Palermo",
      address: "Calle 45 # 19-08",
      city: "Teusaquillo",
    },
  ],
  Corferias: [
    {
      name: "Institucion Educativa Corferias",
      address: "Carrera 37 # 24-19",
      city: "Corferias",
    },
    {
      name: "Colegio Empresarial Occidente",
      address: "Calle 26 # 40-15",
      city: "Corferias",
    },
    {
      name: "Colegio Integrado La Sabana",
      address: "Avenida Esperanza # 42-18",
      city: "Corferias",
    },
    {
      name: "Colegio Distrital Gran Estacion",
      address: "Carrera 33 # 25-60",
      city: "Teusaquillo",
    },
  ],
} as const;

const programTemplates = [
  "Software",
  "Bilinguismo",
  "Emprendimiento",
  "Gestion administrativa",
  "Programacion Web",
];

const modalityTemplates: Exclude<CoordinatorArticulationMode, "No aplica">[] = [
  "Compartida",
  "Unica",
  "Colegio privado",
];

const shiftTemplates = ["Manana", "Tarde"] as const;
const requiredHours = [12, 16, 20, 24];

function buildArticulationInstructors(siteLabel: string): CoordinatorArticulationInstructor[] {
  return coordinatorOperationalInstructors
    .filter((item) => item.dependency === "Articulacion" && item.site === siteLabel)
    .slice(0, 30)
    .map((item, index) => {
      const hoursAssigned = index % 5 === 0 ? 0 : index % 4 === 0 ? 8 : index % 3 === 0 ? 12 : 16;

      return {
        id: item.id,
        name: item.name,
        initials: item.initials,
        area: item.area,
        site: item.site,
        hoursAssigned,
        status:
          hoursAssigned === 0
            ? "Libre"
            : hoursAssigned >= 16
              ? "Cubierto"
              : "Parcial",
      };
    });
}

function buildGeneralCoverage(fichas: CoordinatorArticulationFichaUnit[]) {
  const complete = fichas.filter((item) => item.coverageStatus === "Completa").length;
  const partial = fichas.filter((item) => item.coverageStatus === "Parcial").length;
  const pending = fichas.filter((item) => item.coverageStatus === "Sin asignar").length;

  return `${complete} completas · ${partial} parciales · ${pending} pendientes`;
}

function buildSchoolUnits(
  siteLabel: string,
  instructors: CoordinatorArticulationInstructor[],
): CoordinatorArticulationSchoolUnit[] {
  const templates = schoolTemplatesBySite[siteLabel as keyof typeof schoolTemplatesBySite] ?? [];

  return templates.map((school, schoolIndex) => {
    const fichas = Array.from({ length: 3 }, (_, fichaIndex) => {
      const absoluteIndex = schoolIndex * 3 + fichaIndex;
      const program = programTemplates[absoluteIndex % programTemplates.length];
      const compatibleInstructors = instructors.filter((item) => item.area === program);
      const coverageStatus =
        absoluteIndex % 3 === 0
          ? "Sin asignar"
          : absoluteIndex % 3 === 1
            ? "Parcial"
            : "Completa";
      const assignedInstructors =
        coverageStatus === "Sin asignar"
          ? []
          : coverageStatus === "Parcial"
            ? compatibleInstructors.slice(0, 1).map((item) => item.name)
            : compatibleInstructors.slice(0, 2).map((item) => item.name);

      return {
        id: `${siteLabel}-FIC-${absoluteIndex + 1}`,
        schoolId: `${siteLabel}-COL-${schoolIndex + 1}`,
        number: `30${siteLabel === "Chapinero" ? "11" : "22"}${String(absoluteIndex + 1).padStart(3, "0")}`,
        program,
        modality: modalityTemplates[absoluteIndex % modalityTemplates.length],
        shift: shiftTemplates[absoluteIndex % shiftTemplates.length],
        hoursRequired: requiredHours[absoluteIndex % requiredHours.length],
        apprenticeCount: 28 + (absoluteIndex % 7),
        coverageStatus,
        assignedInstructors,
        site: siteLabel,
      } satisfies CoordinatorArticulationFichaUnit;
    });

    return {
      id: `${siteLabel}-COL-${schoolIndex + 1}`,
      name: school.name,
      address: school.address,
      city: school.city,
      site: siteLabel,
      totalFichas: fichas.length,
      generalCoverage: buildGeneralCoverage(fichas),
      fichas,
    };
  });
}

function buildMetrics(
  instructors: CoordinatorArticulationInstructor[],
  schools: CoordinatorArticulationSchoolUnit[],
): CoordinatorOperationalMetric[] {
  const allFichas = schools.flatMap((school) => school.fichas);
  const critical = allFichas.filter((item) => item.coverageStatus === "Sin asignar").length;

  return [
    { label: "Instructores", value: `${instructors.length}`, tone: "neutral" },
    { label: "Colegios activos", value: `${schools.length}`, tone: "neutral" },
    { label: "Fichas activas", value: `${allFichas.length}`, tone: "neutral" },
    { label: "Cobertura critica", value: `${critical}`, tone: critical ? "danger" : "neutral" },
  ];
}

export function getCoordinatorArticulationData(siteId?: string, filters?: string[] | string) {
  const site = resolveCoordinatorSite(siteId);
  const activeFilters = resolveCoordinatorFilters(filters);
  const dependencyFilters = activeFilters.filter((filter) =>
    filter === "Articulacion" || filter === "Titulada" || filter === "Complementaria",
  );

  if (dependencyFilters.length && !dependencyFilters.includes("Articulacion")) {
    return {
      site,
      activeFilters,
      instructors: [] as CoordinatorArticulationInstructor[],
      schools: [] as CoordinatorArticulationSchoolUnit[],
      metrics: buildMetrics([], []),
    };
  }

  const allInstructors = buildArticulationInstructors(site.label);
  const allSchools = buildSchoolUnits(site.label, allInstructors);
  const onlyFree = activeFilters.includes("Solo libres");
  const instructors = onlyFree
    ? allInstructors.filter((item) => item.hoursAssigned === 0)
    : allInstructors;
  const schools = allSchools
    .map((school) => {
      const fichas = onlyFree
        ? school.fichas.filter((item) => item.coverageStatus === "Sin asignar")
        : school.fichas;

      return {
        ...school,
        totalFichas: fichas.length,
        generalCoverage: buildGeneralCoverage(fichas),
        fichas,
      };
    })
    .filter((school) => school.fichas.length > 0);

  return {
    site,
    activeFilters,
    instructors,
    schools,
    metrics: buildMetrics(instructors, schools),
  };
}

export const coordinatorArticulationQuickFilters = coordinatorQuickFilters;
export const coordinatorArticulationSites = coordinatorSites;
