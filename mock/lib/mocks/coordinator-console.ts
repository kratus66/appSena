import {
  CoordinatorAlertChip,
  CoordinatorArticulationCoverageRow,
  CoordinatorArticulationMode,
  CoordinatorAssignmentConflict,
  CoordinatorEnvironmentMatrixRow,
  CoordinatorOperationalDependency,
  CoordinatorOperationalFicha,
  CoordinatorOperationalInstructor,
  CoordinatorOperationalMetric,
  CoordinatorOperationalSchool,
  CoordinatorSiteOption,
} from "@/lib/types";

export const coordinatorCenterName = "Centro de Gestion Financiera";

export const coordinatorSites: CoordinatorSiteOption[] = [
  { id: "chapinero", label: "Chapinero" },
  { id: "corferias", label: "Corferias" },
];

export const coordinatorArticulationContextOption: CoordinatorSiteOption = {
  id: "articulacion",
  label: "Articulacion",
};

export const coordinatorQuickFilters = [
  "Solo libres",
  "Articulacion",
  "Titulada",
  "Complementaria",
];

const firstNames = [
  "Laura",
  "Diego",
  "Paola",
  "Julian",
  "Camilo",
  "Marcela",
  "Andres",
  "Nathalia",
  "Ricardo",
  "Diana",
  "Felipe",
  "Sandra",
  "Viviana",
  "Oscar",
  "Luisa",
  "Katherine",
  "Juan",
  "Martha",
  "Sergio",
  "Andrea",
];

const lastNames = [
  "Martinez",
  "Rios",
  "Herrera",
  "Franco",
  "Perez",
  "Ospina",
  "Vargas",
  "Cruz",
  "Melo",
  "Rojas",
  "Murcia",
  "Leon",
  "Castro",
  "Garcia",
  "Pineda",
  "Lopez",
  "Quintero",
  "Rodriguez",
  "Torres",
  "Sanchez",
];

const articulationAreas = [
  "Software",
  "Bilinguismo",
  "Emprendimiento",
  "Gestion administrativa",
  "Programacion Web",
];

const titledAreas = [
  "ADSO",
  "Redes",
  "Contabilidad",
  "Mantenimiento",
  "Analitica de datos",
];

const complementaryAreas = [
  "Servicio al cliente",
  "Logistica",
  "Soporte TI",
  "Ofimatica",
  "Marketing digital",
];

const blocks = ["07:00 - 11:00", "08:00 - 12:00", "13:00 - 17:00", "14:00 - 18:00"];
const shifts = ["AM", "AM", "PM", "PM"];
const titledEnvironmentOptions = Array.from({ length: 30 }, (_, index) => {
  const code = String(index + 1).padStart(2, "0");
  return `Ambiente T-${code}`;
});
const articulationSchoolOptions = [
  ["Colegio San Jorge", "Colegio Nuevo Horizonte"],
  ["Colegio Tecnico Metropolitano", "Colegio Nuevo Horizonte"],
  ["Colegio Distrital Palermo"],
  ["Colegio San Jorge", "Colegio Tecnico Metropolitano"],
];
const articulationLocalities = [
  "Chapinero",
  "Teusaquillo",
  "Barrios Unidos",
  "Puente Aranda",
];
const articulationEnvironmentOptions = [
  ["Aula A-12", "Aula A-18"],
  ["Sala TIC C-04", "Aula C-07"],
  ["Laboratorio Bilinguismo", "Aula B-09"],
  ["Aula D-05", "Aula D-06"],
];
const articulationModes: Exclude<CoordinatorArticulationMode, "No aplica">[] = [
  "Compartida",
  "Unica",
  "Colegio privado",
];

const dependencyConfigs = [
  {
    dependency: "Articulacion" as CoordinatorOperationalDependency,
    total: 60,
    areas: articulationAreas,
    programType: "Media tecnica",
    professions: [
      "Ingeniera de sistemas",
      "Licenciado en idiomas",
      "Administrador de empresas",
      "Ingeniera industrial",
      "Ingeniero de software",
    ],
  },
  {
    dependency: "Titulada" as CoordinatorOperationalDependency,
    total: 35,
    areas: titledAreas,
    programType: "Formacion titulada",
    professions: [
      "Ingeniero de sistemas",
      "Ingeniera de telecomunicaciones",
      "Contadora publica",
      "Ingeniero electromecanico",
      "Ingeniera de datos",
    ],
  },
  {
    dependency: "Complementaria" as CoordinatorOperationalDependency,
    total: 30,
    areas: complementaryAreas,
    programType: "Formacion complementaria",
    professions: [
      "Administrador comercial",
      "Profesional en logistica",
      "Ingeniero de soporte",
      "Licenciada en informatica",
      "Profesional en mercadeo",
    ],
  },
];

function makeName(index: number) {
  const first = firstNames[index % firstNames.length];
  const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
  return `${first} ${last}`;
}

function makeInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function makePhone(index: number) {
  return `3${String(100000000 + index * 731).slice(0, 9)}`;
}

function makeEmail(name: string, index: number) {
  const normalized = name.toLowerCase().replaceAll(" ", ".");
  return `${normalized}${index % 7}@gmail.com`;
}

function makePhoto(initials: string, index: number) {
  const palettes = [
    ["#E8F4EC", "#A9D5B4", "#205C33"],
    ["#EEF5FF", "#B6D2F4", "#224E7A"],
    ["#F7F2EA", "#E5CCAB", "#6B4D2E"],
    ["#F4F0FA", "#D8C9EE", "#5A3E7A"],
  ];
  const [bg, accent, ink] = palettes[index % palettes.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="24" fill="${bg}"/>
      <circle cx="64" cy="46" r="22" fill="${accent}"/>
      <path d="M24 112c6-22 22-34 40-34s34 12 40 34" fill="${accent}"/>
      <circle cx="64" cy="42" r="16" fill="#F6E7D7"/>
      <path d="M38 112c6-18 19-28 26-28s20 10 26 28" fill="${ink}" opacity="0.18"/>
      <text x="64" y="118" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${ink}">
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const coordinatorOperationalInstructors: CoordinatorOperationalInstructor[] =
  dependencyConfigs.flatMap((config, dependencyIndex) =>
    Array.from({ length: config.total }, (_, index) => {
      const absoluteIndex =
        dependencyConfigs
          .slice(0, dependencyIndex)
          .reduce((sum, item) => sum + item.total, 0) + index;
      const name = makeName(absoluteIndex);

      return {
        id: `OP-INS-${String(absoluteIndex + 1).padStart(3, "0")}`,
        name,
        initials: makeInitials(name),
        photoUrl: makePhoto(makeInitials(name), absoluteIndex),
        phone: makePhone(absoluteIndex + 1),
        personalEmail: makeEmail(name, absoluteIndex + 1),
        profession: config.professions[index % config.professions.length],
        dependency: config.dependency,
        area: config.areas[index % config.areas.length],
        programType: config.programType,
        site: coordinatorSites[index % coordinatorSites.length].label,
        contractStartDate: "2026-01-30",
        contractEndDate:
          config.dependency === "Articulacion" ? "2026-11-30" : "2026-12-20",
        currentLoad: "0 fichas · 0h",
        activeBlocks: 0,
        status: "Disponible",
        articulationSchool:
          config.dependency === "Articulacion"
            ? articulationSchoolOptions[index % articulationSchoolOptions.length]?.[0]
            : undefined,
        articulationMode:
          config.dependency === "Articulacion"
            ? articulationModes[index % articulationModes.length]
            : undefined,
        articulationShift:
          config.dependency === "Articulacion"
            ? index % 2 === 0
              ? "Manana"
              : "Tarde"
            : undefined,
        locality:
          config.dependency === "Articulacion"
            ? articulationLocalities[index % articulationLocalities.length]
            : undefined,
      };
    }),
  );

const articulacionInstructors = coordinatorOperationalInstructors.filter(
  (item) => item.dependency === "Articulacion",
);
const tituladaInstructors = coordinatorOperationalInstructors.filter(
  (item) => item.dependency === "Titulada",
);
const complementariaInstructors = coordinatorOperationalInstructors.filter(
  (item) => item.dependency === "Complementaria",
);

function buildArticulationFicha(
  instructor: CoordinatorOperationalInstructor,
  index: number,
): CoordinatorOperationalFicha {
  const number = String(3011000 + index);

  return {
    id: `OP-FIC-A-${index + 1}`,
    number,
    program: articulationAreas[index % articulationAreas.length],
    dependency: "Articulacion",
    site: instructor.site,
    block: blocks[index % blocks.length],
    shift: shifts[index % shifts.length],
    articulationMode: articulationModes[index % articulationModes.length],
    status: "Sin asignar",
    requiresSchool: true,
    requiresEnvironment: index % 2 === 0,
    schoolOptions: articulationSchoolOptions[index % articulationSchoolOptions.length],
    environmentOptions: articulationEnvironmentOptions[index % articulationEnvironmentOptions.length],
  };
}

function buildStandardFicha(
  instructor: CoordinatorOperationalInstructor,
  index: number,
  dependency: "Titulada" | "Complementaria",
): CoordinatorOperationalFicha {
  const areaPool = dependency === "Titulada" ? titledAreas : complementaryAreas;
  const number = String((dependency === "Titulada" ? 2874000 : 3155000) + index);

  return {
    id: `OP-FIC-${dependency === "Titulada" ? "T" : "C"}-${index + 1}`,
    number,
    program: areaPool[index % areaPool.length],
    dependency,
    site: instructor.site,
    block: blocks[index % blocks.length],
    shift: shifts[index % shifts.length],
    articulationMode: "No aplica",
    status: "Sin asignar",
    requiresSchool: false,
    requiresEnvironment: true,
    schoolOptions: [],
    environmentOptions:
      dependency === "Titulada"
        ? titledEnvironmentOptions.slice(0, 30)
        : ["Ambiente C-01", "Ambiente C-02", "Ambiente C-03"],
  };
}

export const coordinatorOperationalFichas: CoordinatorOperationalFicha[] = [
  ...articulacionInstructors.flatMap((instructor, instructorIndex) =>
    Array.from({ length: 4 }, (_, fichaIndex) =>
      buildArticulationFicha(instructor, instructorIndex * 4 + fichaIndex),
    ),
  ),
  ...tituladaInstructors.map((instructor, index) =>
    buildStandardFicha(instructor, index, "Titulada"),
  ),
  ...complementariaInstructors.map((instructor, index) =>
    buildStandardFicha(instructor, index, "Complementaria"),
  ),
];

const pendingFichas = coordinatorOperationalFichas.length;
const partialFichas = 0;
const titledFreeEnvironments = 30;

export const coordinatorAlertChips: CoordinatorAlertChip[] = [
  { id: "ALT-1", label: `${pendingFichas} fichas por asignar`, severity: "media" },
  { id: "ALT-2", label: `${titledFreeEnvironments} ambientes libres titulada`, severity: "baja" },
];

export const coordinatorCompactMetrics: CoordinatorOperationalMetric[] = [
  { label: "Total instructores", value: `${coordinatorOperationalInstructors.length}`, tone: "neutral" },
  { label: "Total articulacion", value: `${articulacionInstructors.length}`, tone: "neutral" },
  { label: "Fichas sin asignar", value: `${pendingFichas}`, tone: "warning" },
  { label: "Ambientes en conflicto", value: "0", tone: "neutral" },
  { label: "Asignaciones parciales", value: "0", tone: "neutral" },
];

export const coordinatorOperationalSchools: CoordinatorOperationalSchool[] = [
  {
    id: "COL-OP-001",
    name: "Colegio San Jorge",
    city: "Bogota",
    coverage: "Pendiente asignacion inicial",
    activeFichas: 18,
    modalityMix: ["Compartida", "Unica"],
    coordinator: "Viviana Castro",
    status: "Parcial",
  },
  {
    id: "COL-OP-002",
    name: "Colegio Nuevo Horizonte",
    city: "Bogota",
    coverage: "Pendiente asignacion inicial",
    activeFichas: 16,
    modalityMix: ["Unica"],
    coordinator: "Felipe Murcia",
    status: "Parcial",
  },
  {
    id: "COL-OP-003",
    name: "Colegio Tecnico Metropolitano",
    city: "Bogota",
    coverage: "Sin cobertura registrada",
    activeFichas: 14,
    modalityMix: ["Compartida"],
    coordinator: "Sandra Leon",
    status: "Critico",
  },
  {
    id: "COL-OP-004",
    name: "Colegio Distrital Palermo",
    city: "Bogota",
    coverage: "Sin cobertura registrada",
    activeFichas: 12,
    modalityMix: ["Colegio privado"],
    coordinator: "Martha Pineda",
    status: "Critico",
  },
];

export const coordinatorAssignmentConflicts: CoordinatorAssignmentConflict[] = [];

export const coordinatorEnvironmentBlocks = [
  "Lun AM",
  "Lun PM",
  "Mar AM",
  "Mar PM",
  "Mie AM",
  "Mie PM",
];

export const coordinatorEnvironmentMatrix: CoordinatorEnvironmentMatrixRow[] = Array.from(
  { length: titledFreeEnvironments },
  (_, index) => {
    const code = String(index + 1).padStart(2, "0");

    return {
      id: `ENV-T-${code}`,
      name: `Ambiente T-${code}`,
      site: coordinatorSites[index % coordinatorSites.length].label,
      type: "Titulada",
      capacity: 30,
      cells: coordinatorEnvironmentBlocks.map((block) => ({
        id: `ENV-T-${code}-${block}`,
        block,
        state: "Libre" as const,
      })),
    };
  },
);

export const coordinatorArticulationCoverage: CoordinatorArticulationCoverageRow[] = [
  {
    id: "ART-001",
    instructor: "Sin asignar",
    ficha: "3011004",
    school: "Colegio San Jorge",
    site: "Chapinero",
    articulationMode: "Compartida",
    coverage: "0 de 4 bloques",
    status: "Pendiente",
  },
  {
    id: "ART-002",
    instructor: "Sin asignar",
    ficha: "3011023",
    school: "Colegio Nuevo Horizonte",
    site: "Corferias",
    articulationMode: "Unica",
    coverage: "0 de 4 bloques",
    status: "Pendiente",
  },
  {
    id: "ART-003",
    instructor: "Sin asignar",
    ficha: "3011058",
    school: "Colegio Distrital Palermo",
    site: "Chapinero",
    articulationMode: "Colegio privado",
    coverage: "0 de 4 bloques",
    status: "Pendiente",
  },
  {
    id: "ART-004",
    instructor: "Sin asignar",
    ficha: "3011032",
    school: "Colegio Tecnico Metropolitano",
    site: "Corferias",
    articulationMode: "Compartida",
    coverage: "0 de 4 bloques",
    status: "Pendiente",
  },
];

export const coordinatorOperationalNotes = [
  `Base operativa cargada con ${coordinatorOperationalInstructors.length} instructores libres para iniciar asignacion.`,
  `Articulacion concentra ${articulacionInstructors.length} instructores y ${
    articulacionInstructors.length * 4
  } fichas pendientes.`,
  `Las fichas activas siguen la regla: 4 por articulacion, 1 por titulada y 1 por complementaria.`,
];

export type CoordinatorQuickFilter = (typeof coordinatorQuickFilters)[number];

const validQuickFilters = new Set<string>(coordinatorQuickFilters);

export function resolveCoordinatorFilters(filters?: string[] | string) {
  const values = Array.isArray(filters) ? filters : filters ? [filters] : [];

  return Array.from(new Set(values)).filter(
    (filter): filter is CoordinatorQuickFilter => validQuickFilters.has(filter),
  );
}

export function resolveCoordinatorSite(siteId?: string) {
  return coordinatorSites.find((site) => site.id === siteId) ?? coordinatorSites[0];
}

export function isCoordinatorArticulationContext(siteId?: string) {
  return siteId === coordinatorArticulationContextOption.id;
}

export function getCoordinatorAlertChips(siteId?: string, filters?: string[] | string) {
  if (isCoordinatorArticulationContext(siteId)) {
    return [
      {
        id: "ALT-1",
        label: `${coordinatorOperationalFichas.filter((item) => item.dependency === "Articulacion").length} fichas articulacion`,
        severity: "media" as const,
      },
      {
        id: "ALT-2",
        label: `${coordinatorOperationalInstructors.filter((item) => item.dependency === "Articulacion").length} instructores articulacion`,
        severity: "baja" as const,
      },
    ];
  }

  const siteData = getCoordinatorSiteData(siteId, filters);

  return [
    {
      id: "ALT-1",
      label: `${siteData.metrics[2]?.value ?? "0"} fichas por asignar`,
      severity: "media" as const,
    },
    {
      id: "ALT-2",
      label: `${siteData.environmentMetrics[0]?.value ?? "0"} ambientes libres titulada`,
      severity: "baja" as const,
    },
  ];
}

export function getCoordinatorSiteData(siteId?: string, filters?: string[] | string) {
  if (isCoordinatorArticulationContext(siteId)) {
    const site = coordinatorArticulationContextOption;
    const activeFilters = resolveCoordinatorFilters(filters);
    const dependencyFilters = activeFilters.filter(
      (filter): filter is CoordinatorOperationalDependency =>
        filter === "Articulacion" || filter === "Titulada" || filter === "Complementaria",
    );
    const onlyFree = activeFilters.includes("Solo libres");
    const allowsArticulation =
      dependencyFilters.length === 0 || dependencyFilters.includes("Articulacion");
    const instructors = allowsArticulation
      ? coordinatorOperationalInstructors.filter((item) => {
          const dependencyMatch = item.dependency === "Articulacion";
          const availabilityMatch = !onlyFree || item.status === "Disponible";

          return dependencyMatch && availabilityMatch;
        })
      : [];
    const fichas = allowsArticulation
      ? coordinatorOperationalFichas.filter((item) => {
          const dependencyMatch = item.dependency === "Articulacion";
          const freeMatch = !onlyFree || item.status === "Sin asignar";

          return dependencyMatch && freeMatch;
        })
      : [];
    const coverage = coordinatorArticulationCoverage;
    const schoolNames = new Set(coverage.map((item) => item.school));
    const schools = coordinatorOperationalSchools.filter((item) => schoolNames.has(item.name));
    const pending = fichas.filter((item) => item.status === "Sin asignar").length;
    const readySchools = schools.filter((item) => item.status !== "Critico").length;
    const visibleModalities = Array.from(
      new Set(fichas.map((item) => item.articulationMode).filter((mode) => mode !== "No aplica")),
    ).length;
    const filterLabel = activeFilters.length ? activeFilters.join(" · ") : "Sin filtros rapidos";

    return {
      site,
      activeFilters,
      instructors,
      fichas,
      coverage,
      schools,
      environments: [],
      metrics: [
        { label: "Total instructores", value: `${instructors.length}`, tone: "neutral" as const },
        { label: "Colegios visibles", value: `${schools.length}`, tone: "neutral" as const },
        { label: "Fichas sin asignar", value: `${pending}`, tone: "warning" as const },
        { label: "Colegios criticos", value: `${schools.filter((item) => item.status === "Critico").length}`, tone: "warning" as const },
        { label: "Coberturas parciales", value: `${schools.filter((item) => item.status === "Parcial").length}`, tone: "neutral" as const },
      ],
      environmentMetrics: [
        {
          label: "Colegios listos",
          value: `${readySchools}`,
          tone: "neutral" as const,
        },
        { label: "Contexto activo", value: site.label, tone: "neutral" as const },
        {
          label: "Modalidades visibles",
          value: `${visibleModalities}`,
          tone: "neutral" as const,
        },
        { label: "Coberturas pendientes", value: `${coverage.filter((item) => item.status === "Pendiente").length}`, tone: "warning" as const },
      ],
      notes: [
        `Articulacion consolida ${instructors.length} instructores visibles y ${fichas.length} fichas bajo ${filterLabel}.`,
        `La lectura prioriza colegios, coberturas y modalidades; no usa ambientes del centro.`,
        `Hay ${schools.length} colegios visibles y ${pending} fichas pendientes de cobertura en el contexto actual.`,
      ],
    };
  }

  const site = resolveCoordinatorSite(siteId);
  const activeFilters = resolveCoordinatorFilters(filters);
  const dependencyFilters = activeFilters.filter(
    (filter): filter is CoordinatorOperationalDependency =>
      filter === "Articulacion" || filter === "Titulada" || filter === "Complementaria",
  );
  const onlyFree = activeFilters.includes("Solo libres");
  const hasDependencyFilter = dependencyFilters.length > 0;

  const instructors = coordinatorOperationalInstructors.filter((item) => {
    const siteMatch = item.site === site.label;
    const dependencyMatch = !hasDependencyFilter || dependencyFilters.includes(item.dependency);
    const freeMatch = !onlyFree || item.status === "Disponible";

    return siteMatch && dependencyMatch && freeMatch;
  });
  const fichas = coordinatorOperationalFichas.filter((item) => {
    const siteMatch = item.site === site.label;
    const dependencyMatch = !hasDependencyFilter || dependencyFilters.includes(item.dependency);
    const freeMatch = !onlyFree || item.status === "Sin asignar";

    return siteMatch && dependencyMatch && freeMatch;
  });
  const coverage = coordinatorArticulationCoverage.filter((item) => {
    const siteMatch = item.site === site.label;
    const dependencyMatch = !hasDependencyFilter || dependencyFilters.includes("Articulacion");

    return siteMatch && dependencyMatch;
  });
  const schoolNames = new Set(coverage.map((item) => item.school));
  const schools = coordinatorOperationalSchools.filter((item) => schoolNames.has(item.name));
  const environments = coordinatorEnvironmentMatrix.filter((item) => {
    const siteMatch = item.site === site.label;
    const dependencyMatch =
      !hasDependencyFilter ||
      dependencyFilters.includes("Titulada");
    const freeMatch = !onlyFree || item.cells.every((cell) => cell.state === "Libre");

    return siteMatch && dependencyMatch && freeMatch;
  });
  const totalArticulation = instructors.filter((item) => item.dependency === "Articulacion").length;
  const pending = fichas.filter((item) => item.status === "Sin asignar").length;
  const titledPending = fichas.filter((item) => item.dependency === "Titulada").length;
  const freeTitledEnvironments = environments.filter((item) => item.type === "Titulada").length;
  const filterLabel = activeFilters.length ? activeFilters.join(" · ") : "Sin filtros rapidos";

  return {
    site,
    activeFilters,
    instructors,
    fichas,
    coverage,
    schools,
    environments,
    metrics: [
      { label: "Total instructores", value: `${instructors.length}`, tone: "neutral" as const },
      { label: "Total articulacion", value: `${totalArticulation}`, tone: "neutral" as const },
      { label: "Fichas sin asignar", value: `${pending}`, tone: "warning" as const },
      { label: "Ambientes en conflicto", value: "0", tone: "neutral" as const },
      { label: "Asignaciones parciales", value: "0", tone: "neutral" as const },
    ],
    environmentMetrics: [
      {
        label: "Ambientes libres titulada",
        value: `${freeTitledEnvironments}`,
        tone: "neutral" as const,
      },
      { label: "Sede activa", value: site.label, tone: "neutral" as const },
      {
        label: "Bloques libres",
        value: `${environments.length * coordinatorEnvironmentBlocks.length}`,
        tone: "neutral" as const,
      },
      { label: "Fichas titulada", value: `${titledPending}`, tone: "warning" as const },
    ],
    notes: [
      `${site.label} arranca con ${instructors.length} instructores visibles bajo ${filterLabel}.`,
      `En ${site.label} hay ${pending} fichas pendientes y 0 conflictos activos bajo el filtro actual.`,
      `La configuracion por sede conserva la regla 4 articulacion, 1 titulada y 1 complementaria.`,
    ],
  };
}

export function getCoordinatorInstructorModuleData(
  siteId?: string,
  filters?: string[] | string,
) {
  const articulationContext = isCoordinatorArticulationContext(siteId);
  const site = articulationContext
    ? coordinatorArticulationContextOption
    : resolveCoordinatorSite(siteId);
  const activeFilters = resolveCoordinatorFilters(filters);
  const dependencyFilters = activeFilters.filter(
    (filter): filter is CoordinatorOperationalDependency =>
      filter === "Articulacion" || filter === "Titulada" || filter === "Complementaria",
  );
  const onlyFree = activeFilters.includes("Solo libres");

  const instructors = coordinatorOperationalInstructors.filter((item) => {
    const dependencyMatch =
      !dependencyFilters.length || dependencyFilters.includes(item.dependency);
    const availabilityMatch = !onlyFree || item.status === "Disponible";
    const siteMatch = articulationContext
      ? item.dependency === "Articulacion"
      : item.dependency !== "Articulacion" && item.site === site.label;

    return dependencyMatch && availabilityMatch && siteMatch;
  });

  return {
    site,
    activeFilters,
    instructors,
  };
}
