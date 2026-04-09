import {
  CoordinatorOperationalMetric,
  CoordinatorSchoolCard,
  CoordinatorSchoolDetail,
  CoordinatorSchoolKind,
  CoordinatorSchoolOperationalStatus,
} from "@/lib/types";

import { coordinatorCenterName } from "@/lib/mocks/coordinator-console";

const operatingDays = [
  "Lunes a viernes",
  "Lunes a sabado",
  "Martes a sabado",
  "Lunes, miercoles y viernes",
];

const scheduleByKind: Record<CoordinatorSchoolKind, string[]> = {
  Publico: ["7:00 a. m. - 11:30 a. m.", "1:00 p. m. - 5:20 p. m."],
  Privado: ["7:30 a. m. - 11:45 a. m.", "1:15 p. m. - 5:00 p. m."],
  Tecnico: ["7:00 a. m. - 11:00 a. m.", "1:00 p. m. - 5:00 p. m."],
};

const schoolTemplates = {
  Chapinero: [
    ["Colegio San Jorge", "Carrera 13 # 54-22", "Chapinero", "Publico"],
    ["Colegio Nuevo Horizonte", "Calle 63 # 9-41", "Chapinero", "Privado"],
    ["Instituto Tecnico Metropolitano", "Carrera 7 # 58-12", "Chapinero", "Tecnico"],
    ["Colegio Distrital Palermo", "Calle 45 # 19-08", "Teusaquillo", "Publico"],
    ["Colegio Empresarial Andino", "Calle 57 # 11-44", "Chapinero", "Privado"],
    ["Liceo Tecnologico Central", "Carrera 15 # 61-18", "Chapinero", "Tecnico"],
  ],
  Corferias: [
    ["Institucion Educativa Corferias", "Carrera 37 # 24-19", "Corferias", "Publico"],
    ["Colegio Empresarial Occidente", "Calle 26 # 40-15", "Corferias", "Privado"],
    ["Colegio Integrado La Sabana", "Avenida Esperanza # 42-18", "Corferias", "Tecnico"],
    ["Colegio Distrital Gran Estacion", "Carrera 33 # 25-60", "Teusaquillo", "Publico"],
    ["Colegio Privado Horizonte", "Calle 24A # 39-11", "Corferias", "Privado"],
    ["Instituto Tecnico del Centro", "Carrera 38 # 23-41", "Corferias", "Tecnico"],
  ],
} as const;

function buildCoverageSummary(kind: CoordinatorSchoolKind, index: number) {
  if (kind === "Publico") {
    return index % 2 === 0
      ? "40h SENA / mes"
      : "20h + 20h compartida SENA";
  }

  if (kind === "Tecnico") {
    return "20h SENA + 20h colegio";
  }

  return "20h acompanamiento SENA";
}

function buildRule(kind: CoordinatorSchoolKind) {
  if (kind === "Publico") {
    return "En colegio publico el instructor SENA puede cubrir hasta 40 horas al mes.";
  }

  if (kind === "Tecnico") {
    return "En colegio tecnico la cobertura se divide 20 horas SENA y 20 horas del colegio.";
  }

  return "En colegio privado el SENA acompana 20 horas y el desarrollo principal recae en el colegio.";
}

function buildStatus(kind: CoordinatorSchoolKind, index: number): CoordinatorSchoolOperationalStatus {
  if (index % 5 === 0) {
    return "Pendiente horario";
  }

  if (kind === "Tecnico" || index % 2 === 0) {
    return "Listo para asignacion";
  }

  return "Con horario definido";
}

function buildSchoolsBySite(siteLabel: string) {
  const templates = schoolTemplates[siteLabel as keyof typeof schoolTemplates] ?? [];

  return templates.map(([name, address, city, kind], index) => {
    const typedKind = kind as CoordinatorSchoolKind;
    const status = buildStatus(typedKind, index);
    const hasSchedule = status !== "Pendiente horario";
    const scheduleLabel = hasSchedule
      ? `${scheduleByKind[typedKind][index % scheduleByKind[typedKind].length]}`
      : "Pendiente configurar horario";

    return {
      id: `${siteLabel}-COL-${index + 1}`,
      name,
      kind: typedKind,
      address,
      city,
      site: siteLabel,
      scheduleLabel,
      operatingDays: hasSchedule ? operatingDays[index % operatingDays.length] : "Sin dias definidos",
      senaCoverageSummary: buildCoverageSummary(typedKind, index),
      monthlyRule: buildRule(typedKind),
      operationalStatus: status,
      hasSchedule,
      readyForAssignment: status === "Listo para asignacion",
    } satisfies CoordinatorSchoolCard;
  });
}

function buildSchools() {
  return Object.keys(schoolTemplates).flatMap((siteLabel) =>
    buildSchoolsBySite(siteLabel).map((school, index) => ({
      ...school,
      id: `${school.id}-${index + 1}`,
      site: coordinatorCenterName,
    })),
  );
}

function buildDetail(school: CoordinatorSchoolCard, index: number): CoordinatorSchoolDetail {
  const associatedFichas =
    school.readyForAssignment && index % 2 === 0
      ? [
          {
            id: `${school.id}-F1`,
            number: `34${String(1000 + index)}`,
            program: "Programacion de software",
            status: "Pendiente" as const,
          },
          {
            id: `${school.id}-F2`,
            number: `34${String(1100 + index)}`,
            program: "Asistencia administrativa",
            status: index % 3 === 0 ? ("Parcial" as const) : ("Lista" as const),
          },
        ]
      : [];

  return {
    ...school,
    journeys:
      school.kind === "Publico"
        ? "Manana y tarde"
        : school.kind === "Tecnico"
          ? "Manana y tarde"
          : "Manana",
    scheduleWindows: school.hasSchedule
      ? school.kind === "Privado"
        ? [school.scheduleLabel]
        : [school.scheduleLabel, "1:00 p. m. - 5:20 p. m."]
      : [],
    participationMode:
      school.kind === "Publico"
        ? "Cobertura directa SENA o ficha compartida."
        : school.kind === "Tecnico"
          ? "Participacion mixta entre SENA y el colegio."
          : "Acompanamiento parcial del instructor SENA.",
    observations:
      school.kind === "Publico"
        ? "El colegio permite cobertura mensual amplia y puede operar con ficha compartida."
        : school.kind === "Tecnico"
          ? "La participacion del colegio es estructural en el desarrollo de la formacion."
          : "El colegio asume el desarrollo principal y el SENA acompana segun franja definida.",
    associatedFichas,
  };
}

export function buildCoordinatorSchoolDetailFromCard(
  school: CoordinatorSchoolCard,
  index = 0,
) {
  return buildDetail(school, index);
}

export function getCoordinatorSchoolsData(_siteId?: string) {
  const schools = buildSchools();
  const metrics: CoordinatorOperationalMetric[] = [
    { label: "Colegios visibles", value: `${schools.length}`, tone: "neutral" },
    {
      label: "Con horario definido",
      value: `${schools.filter((item) => item.hasSchedule).length}`,
      tone: "neutral",
    },
    {
      label: "Listos para asignacion",
      value: `${schools.filter((item) => item.readyForAssignment).length}`,
      tone: "neutral",
    },
    {
      label: "Pendientes de horario",
      value: `${schools.filter((item) => !item.hasSchedule).length}`,
      tone: "warning",
    },
  ];

  return {
    schools,
    metrics,
  };
}

export function getCoordinatorSchoolDetailById(
  _siteId: string | undefined,
  schoolId: string,
) {
  const schools = buildSchools();
  const school = schools.find((item) => item.id === schoolId);

  if (!school) {
    return null;
  }

  const index = schools.findIndex((item) => item.id === schoolId);

  return buildDetail(school, index);
}
