import {
  CoordinatorFichaDetail,
  CoordinatorFichaGeneralStatus,
  CoordinatorFichaImportMock,
  CoordinatorFichaLearner,
  CoordinatorFichaShift,
  CoordinatorFichaStateTag,
  CoordinatorFichaSummary,
  CoordinatorOperationalDependency,
} from "@/lib/types";

import {
  coordinatorOperationalInstructors,
  coordinatorArticulationContextOption,
  isCoordinatorArticulationContext,
  resolveCoordinatorFilters,
  resolveCoordinatorSite,
} from "@/lib/mocks/coordinator-console";

const fichaPrograms = {
  Articulacion: [
    "Programacion de software",
    "Asistencia administrativa",
    "Bilinguismo aplicado",
    "Emprendimiento y plan de negocio",
    "Diseño e integracion multimedia",
  ],
  Titulada: [
    "ADSO",
    "Gestion de redes de datos",
    "Contabilizacion de operaciones comerciales",
    "Mantenimiento de equipos de computo",
    "Analitica y visualizacion de datos",
  ],
  Complementaria: [
    "Excel aplicado a procesos administrativos",
    "Servicio al cliente omnicanal",
    "Fundamentos de soporte TI",
    "Logistica y almacenamiento",
    "Marketing digital para unidades productivas",
  ],
} satisfies Record<CoordinatorOperationalDependency, string[]>;

const learnerFirstNames = [
  "Sofia",
  "Mateo",
  "Valentina",
  "Samuel",
  "Camila",
  "Juan Jose",
  "Gabriela",
  "Santiago",
  "Mariana",
  "Daniel",
  "Luciana",
  "Nicolas",
  "Isabella",
  "Sebastian",
  "Juliana",
  "Miguel",
  "Sara",
  "Emmanuel",
];

const learnerLastNames = [
  "Gomez",
  "Rodriguez",
  "Torres",
  "Diaz",
  "Ramirez",
  "Suarez",
  "Cardenas",
  "Benitez",
  "Gonzalez",
  "Morales",
  "Luna",
  "Acosta",
];

const mockUsers = [
  "Natalia Barbosa",
  "Coord. Laura Herrera",
  "Mesa academica SENA",
  "Daniela Lopez",
];

function makeFichaId(prefix: string, index: number) {
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

function makeFichaNumber(
  dependency: CoordinatorOperationalDependency,
  index: number,
) {
  if (dependency === "Titulada" && index === 0) {
    return "3410682";
  }

  if (dependency === "Articulacion") {
    return String(3348000 + index);
  }

  if (dependency === "Titulada") {
    return String(3410000 + index + 1);
  }

  return String(3275000 + index);
}

function makeShift(index: number): CoordinatorFichaShift {
  void index;
  return "Por definir";
}

export function resolveCoordinatorFichaState(
  apprenticeCount: number,
  expectedApprentices: number,
  assignedInstructor?: string,
  assignedEnvironment?: string,
  requiresEnvironment = true,
): CoordinatorFichaStateTag[] {
  const tags: CoordinatorFichaStateTag[] = [];

  if (apprenticeCount === 0) {
    tags.push("Sin aprendices");
  } else if (apprenticeCount < expectedApprentices) {
    tags.push("Carga parcial");
  } else {
    tags.push("Completa");
  }

  if (!assignedInstructor) {
    tags.push("Sin instructor");
  }

  if (requiresEnvironment && !assignedEnvironment) {
    tags.push("Sin ambiente");
  }

  if (
    apprenticeCount >= expectedApprentices &&
    assignedInstructor &&
    (requiresEnvironment ? assignedEnvironment : true)
  ) {
    tags.push("Lista para operacion");
  }

  return tags;
}

export function resolveCoordinatorFichaGeneralStatus(
  tags: CoordinatorFichaStateTag[],
): CoordinatorFichaGeneralStatus {
  if (tags.includes("Lista para operacion")) {
    return "Lista para operacion";
  }

  if (tags.includes("Carga parcial") || tags.includes("Completa")) {
    return "En alistamiento";
  }

  return "Configuracion inicial";
}

function makeObservation(
  dependency: CoordinatorOperationalDependency,
  shift: CoordinatorFichaShift,
  apprenticeCount: number,
) {
  if (!apprenticeCount) {
    return `Pendiente cargar aprendices y cerrar alistamiento de ${dependency.toLowerCase()} en jornada ${shift.toLowerCase()}.`;
  }

  if (apprenticeCount < 30) {
    return "Tiene novedades de carga y requiere consolidar grupo antes de iniciar operacion.";
  }

  return "Ficha lista para seguimiento academico y control operativo.";
}

function makeLearnerName(index: number) {
  const first = learnerFirstNames[index % learnerFirstNames.length];
  const last = learnerLastNames[Math.floor(index / learnerFirstNames.length) % learnerLastNames.length];

  return `${first} ${last}`;
}

function makeLearner(index: number, fichaNumber: string, source: "Excel" | "Manual") {
  const name = makeLearnerName(index);
  const normalized = name.toLowerCase().replaceAll(" ", ".");

  return {
    id: `${fichaNumber}-APR-${String(index + 1).padStart(3, "0")}`,
    documentType: "CC",
    documentNumber: `${1020000000 + index * 137}`,
    fullName: name,
    email: `${normalized}${index % 5}@mail.com`,
    phone: `3${String(100000000 + index * 419).slice(0, 9)}`,
    source,
    registeredAt: source === "Excel" ? "2026-03-28 08:40" : "2026-03-31 09:10",
  } satisfies CoordinatorFichaLearner;
}

function buildImportMock(ficha: CoordinatorFichaSummary): CoordinatorFichaImportMock {
  const fileName =
    ficha.number === "3410682"
      ? "Listados Ficha 3410682 Noche (1).xls"
      : `Aprendices_Ficha_${ficha.number}.xlsx`;

  const previewRows = [
    {
      id: "Fila 2",
      status: "Valido" as const,
      values: {
        documento: "1031457821",
        nombre_completo: "Daniela Suarez",
        correo: "daniela.suarez12@mail.com",
        telefono: "3104567123",
      },
    },
    {
      id: "Fila 3",
      status: "Valido" as const,
      values: {
        documento: "1029987412",
        nombre_completo: "Kevin Morales",
        correo: "kevin.morales3@mail.com",
        telefono: "3104456712",
      },
    },
    {
      id: "Fila 4",
      status: "Con observaciones" as const,
      values: {
        documento: "1031156622",
        nombre_completo: "Luisa Cardenas",
        correo: "",
        telefono: "3107781234",
      },
    },
    {
      id: "Fila 5",
      status: "Con error" as const,
      values: {
        documento: "1023349912",
        nombre_completo: "Paula Gomez",
        correo: "paula.gomez@mail.com",
        telefono: "",
      },
    },
    {
      id: "Fila 6",
      status: "Valido" as const,
      values: {
        documento: "1024456734",
        nombre_completo: "Daniel Perez",
        correo: "daniel.perez21@mail.com",
        telefono: "3102224433",
      },
    },
  ];

  return {
    fileName,
    sheetName: "Aprendices",
    uploadedAt: "2026-03-30 09:00",
    columns: [
      {
        key: "documento",
        label: "Documento",
        mappedTo: "Numero de documento",
        status: "Valida",
        coverage: "100%",
        detail: "La columna coincide con el formato esperado para identificar aprendices.",
      },
      {
        key: "nombre",
        label: "Nombre completo",
        mappedTo: "Nombre del aprendiz",
        status: "Valida",
        coverage: "100%",
        detail: "Permite consolidar el directorio del grupo sin ajustes adicionales.",
      },
      {
        key: "correo",
        label: "Correo",
        mappedTo: "Correo personal",
        status: "Advertencia",
        coverage: "80%",
        detail: "Se detectan filas sin correo y puede requerirse ajuste manual antes de confirmar.",
      },
      {
        key: "telefono",
        label: "Telefono",
        mappedTo: "Celular",
        status: "Advertencia",
        coverage: "80%",
        detail: "Una fila no reporta telefono. Se conserva para correccion posterior.",
      },
    ],
    previewRows,
    issues: [
      {
        id: `${ficha.id}-ISS-1`,
        severity: "media",
        rowRef: "Fila 4",
        column: "Correo",
        message: "No se detecta correo del aprendiz.",
        recommendation: "Completar el dato o confirmar el registro con seguimiento posterior.",
      },
      {
        id: `${ficha.id}-ISS-2`,
        severity: "alta",
        rowRef: "Fila 5",
        column: "Telefono",
        message: "El telefono esta vacio y no permite contacto inicial.",
        recommendation: "Corregir el telefono antes de cerrar la importacion.",
      },
    ],
    validLearners: [
      makeLearner(301, ficha.number, "Excel"),
      makeLearner(302, ficha.number, "Excel"),
      makeLearner(303, ficha.number, "Excel"),
    ],
  };
}

function buildFichaSummary(
  dependency: CoordinatorOperationalDependency,
  instructorIndex: number,
  fichaIndex: number,
) {
  const instructorSet = coordinatorOperationalInstructors.filter(
    (item) => item.dependency === dependency,
  );
  const instructor = instructorSet[instructorIndex];
  const globalIndex = dependency === "Articulacion"
    ? instructorIndex * 4 + fichaIndex
    : instructorIndex;
  const shift =
    dependency === "Articulacion"
      ? globalIndex % 2 === 0
        ? "Manana"
        : "Tarde"
      : dependency === "Titulada" && globalIndex === 0
        ? "Noche"
        : makeShift(globalIndex);
  const program = fichaPrograms[dependency][globalIndex % fichaPrograms[dependency].length];
  const site = instructor.site;
  const articulationSchool =
    dependency === "Articulacion" ? instructor.articulationSchool : undefined;
  const articulationMode =
    dependency === "Articulacion" ? instructor.articulationMode : undefined;
  const locality = dependency === "Articulacion" ? instructor.locality : undefined;
  const assignedInstructor = undefined;
  const assignedEnvironment = undefined;
  const apprenticeCount = 0;
  const requiresEnvironment = dependency !== "Articulacion";
  const stateTags = resolveCoordinatorFichaState(
    apprenticeCount,
    30,
    assignedInstructor,
    assignedEnvironment,
    requiresEnvironment,
  );
  const summary = {
    id: makeFichaId(
      dependency === "Articulacion" ? "FIC-A" : dependency === "Titulada" ? "FIC-T" : "FIC-C",
      globalIndex,
    ),
    number: makeFichaNumber(dependency, globalIndex),
    program,
    dependency,
    programType:
      dependency === "Articulacion"
        ? "Media tecnica"
        : dependency === "Titulada"
          ? "Formacion titulada"
          : "Formacion complementaria",
    shift,
    site,
    expectedApprentices: 30,
    apprenticeCount,
    assignedInstructor,
    assignedEnvironment,
    articulationSchool,
    articulationMode,
    locality,
    requiresEnvironment,
    generalStatus: resolveCoordinatorFichaGeneralStatus(stateTags),
    stateTags,
    observations: makeObservation(dependency, shift, apprenticeCount),
    createdAt: "2026-01-30 08:00",
    updatedAt: `2026-03-${String((globalIndex % 28) + 1).padStart(2, "0")} 10:${String(
      (globalIndex % 5) * 10,
    ).padStart(2, "0")}`,
    lastImportAt:
      apprenticeCount > 0 ? `2026-03-${String((globalIndex % 20) + 5).padStart(2, "0")} 08:4${globalIndex % 6}` : undefined,
    updatedBy: mockUsers[globalIndex % mockUsers.length],
  } satisfies CoordinatorFichaSummary;

  if (summary.number === "3410682") {
    return {
      ...summary,
      program: "ADSO",
      shift: "Por definir" as const,
      site: "Chapinero",
      apprenticeCount: 0,
      assignedInstructor: undefined,
      assignedEnvironment: undefined,
      requiresEnvironment: true,
      stateTags: ["Sin aprendices", "Sin instructor", "Sin ambiente"],
      generalStatus: "Configuracion inicial" as const,
      observations: "Ficha prioritaria para demo. Aun esta en creacion y pendiente de cargar aprendices, jornada, instructor y ambiente.",
      lastImportAt: undefined,
      updatedBy: "Natalia Barbosa",
      updatedAt: "2026-03-30 09:15",
    } satisfies CoordinatorFichaSummary;
  }

  return summary;
}

export const coordinatorFichaSummaries: CoordinatorFichaSummary[] = [
  ...coordinatorOperationalInstructors
    .filter((item) => item.dependency === "Articulacion")
    .flatMap((_, instructorIndex) =>
      Array.from({ length: 4 }, (_, fichaIndex) =>
        buildFichaSummary("Articulacion", instructorIndex, fichaIndex),
      ),
    ),
  ...coordinatorOperationalInstructors
    .filter((item) => item.dependency === "Titulada")
    .map((_, instructorIndex) => buildFichaSummary("Titulada", instructorIndex, 0)),
  ...coordinatorOperationalInstructors
    .filter((item) => item.dependency === "Complementaria")
    .map((_, instructorIndex) => buildFichaSummary("Complementaria", instructorIndex, 0)),
];

function buildLearnersForFicha(ficha: CoordinatorFichaSummary) {
  return Array.from({ length: ficha.apprenticeCount }, (_, index) =>
    makeLearner(index + Number(ficha.number.slice(-2)), ficha.number, "Excel"),
  );
}

export function getCoordinatorFichaDetailById(id: string) {
  const ficha = coordinatorFichaSummaries.find((item) => item.id === id);

  if (!ficha) {
    return null;
  }

  const detail: CoordinatorFichaDetail = {
    ...ficha,
    apprentices: buildLearnersForFicha(ficha),
    traceability: {
      createdAt: ficha.createdAt,
      updatedAt: ficha.updatedAt,
      lastImportAt: ficha.lastImportAt,
      updatedBy: ficha.updatedBy,
      lastImportBy: ficha.lastImportAt ? "Natalia Barbosa" : undefined,
    },
    importMock: buildImportMock(ficha),
  };

  return detail;
}

export function getCoordinatorFichaModuleData(siteId?: string, filters?: string[] | string) {
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

  const fichas = coordinatorFichaSummaries.filter((item) => {
    const siteMatch = articulationContext
      ? item.dependency === "Articulacion"
      : item.dependency !== "Articulacion" && item.site === site.label;
    const dependencyMatch =
      !dependencyFilters.length || dependencyFilters.includes(item.dependency);
    const availabilityMatch =
      !onlyFree || !item.stateTags.includes("Lista para operacion");

    return siteMatch && dependencyMatch && availabilityMatch;
  });

  const readyCount = fichas.filter((item) => item.stateTags.includes("Lista para operacion")).length;
  const withoutInstructor = fichas.filter((item) => item.stateTags.includes("Sin instructor")).length;
  const withoutEnvironment = fichas.filter((item) => item.stateTags.includes("Sin ambiente")).length;

  return {
    site,
    activeFilters,
    fichas,
    metrics: [
      { label: "Fichas visibles", value: `${fichas.length}`, tone: "neutral" as const },
      { label: "Listas para operacion", value: `${readyCount}`, tone: "neutral" as const },
      { label: "Sin instructor", value: `${withoutInstructor}`, tone: "warning" as const },
      { label: "Sin ambiente", value: `${withoutEnvironment}`, tone: "warning" as const },
    ],
  };
}
