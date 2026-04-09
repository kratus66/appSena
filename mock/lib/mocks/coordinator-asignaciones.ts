import {
  CoordinatorAssignmentHistoryEntry,
  CoordinatorAssignmentRecord,
  CoordinatorOperationalDependency,
  CoordinatorOperationalInstructor,
  CoordinatorOperationalMetric,
} from "@/lib/types";

import {
  coordinatorArticulationContextOption,
  coordinatorOperationalInstructors,
  isCoordinatorArticulationContext,
  resolveCoordinatorSite,
} from "@/lib/mocks/coordinator-console";
import {
  CoordinatorArticulationShift,
  CoordinatorFichaSummary,
  CoordinatorSchoolCard,
} from "@/lib/types";
import { getCoordinatorEnvironmentBoardData } from "@/lib/mocks/coordinator-ambientes";
import { coordinatorFichaSummaries } from "@/lib/mocks/coordinator-fichas";
import { getCoordinatorSchoolsData } from "@/lib/mocks/coordinator-colegios";

export type CoordinatorAssignmentModuleData = {
  site: ReturnType<typeof resolveCoordinatorSite> | typeof coordinatorArticulationContextOption;
  metrics: CoordinatorOperationalMetric[];
  fichas: {
    articulacion: CoordinatorFichaSummary[];
    titulada: CoordinatorFichaSummary[];
    complementaria: CoordinatorFichaSummary[];
  };
  instructors: {
    articulacion: CoordinatorOperationalInstructor[];
    titulada: CoordinatorOperationalInstructor[];
    complementaria: CoordinatorOperationalInstructor[];
  };
  schools: CoordinatorSchoolCard[];
  environmentRows: ReturnType<typeof getCoordinatorEnvironmentBoardData>["rows"];
  environmentBlocks: ReturnType<typeof getCoordinatorEnvironmentBoardData>["blocks"];
  activeAssignments: CoordinatorAssignmentRecord[];
  history: CoordinatorAssignmentHistoryEntry[];
};

function formatTimestamp(day: number, hour: number, minute = 0) {
  return `2026-03-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(
    minute,
  ).padStart(2, "0")}`;
}

function buildActiveAssignments(
  siteLabel: string,
  titulada: CoordinatorFichaSummary[],
  complementaria: CoordinatorFichaSummary[],
  articulacion: CoordinatorFichaSummary[],
  titledInstructors: CoordinatorOperationalInstructor[],
  complementaryInstructors: CoordinatorOperationalInstructor[],
  articulationInstructors: CoordinatorOperationalInstructor[],
  schools: CoordinatorSchoolCard[],
): CoordinatorAssignmentRecord[] {
  const records: CoordinatorAssignmentRecord[] = [];

  const tituladaPairs = [
    {
      ficha: titulada[1],
      instructor: titledInstructors[2],
      environmentName: "Sala 4",
      blocks: ["Lun Manana", "Mie Manana", "Vie Manana"],
      status: "Activa" as const,
    },
    {
      ficha: titulada[2],
      instructor: titledInstructors[4],
      environmentName: "Sala TIC 1",
      blocks: ["Mar Noche", "Jue Noche", "Sab Noche"],
      status: "Reasignada" as const,
    },
  ];

  tituladaPairs.forEach((item, index) => {
    if (!item.ficha || !item.instructor) {
      return;
    }

    records.push({
      id: `ASG-T-${index + 1}`,
      dependency: "Titulada",
      fichaId: item.ficha.id,
      fichaNumber: item.ficha.number,
      program: item.ficha.program,
      siteContext: siteLabel,
      shift: item.ficha.shift,
      instructorId: item.instructor.id,
      instructorName: item.instructor.name,
      instructorArea: item.instructor.area,
      environmentName: item.environmentName,
      selectedBlocks: item.blocks,
      hoursAssigned: item.blocks.length * 4,
      status: item.status,
      notes:
        index === 0
          ? "Asignacion base de laboratorio para iniciar programacion semanal."
          : "Se movio de ambiente para priorizar disponibilidad nocturna.",
      createdAt: formatTimestamp(22 + index, 8, 30),
      updatedAt: formatTimestamp(24 + index, 10, 15),
    });
  });

  const complementariaPair = {
    ficha: complementaria[1],
    instructor: complementaryInstructors[1],
    environmentName: "Ambiente B-12",
    blocks: ["Mar Tarde", "Jue Tarde"],
    status: "Parcial" as const,
  };

  if (complementariaPair.ficha && complementariaPair.instructor) {
    records.push({
      id: "ASG-C-1",
      dependency: "Complementaria",
      fichaId: complementariaPair.ficha.id,
      fichaNumber: complementariaPair.ficha.number,
      program: complementariaPair.ficha.program,
      siteContext: siteLabel,
      shift: complementariaPair.ficha.shift,
      instructorId: complementariaPair.instructor.id,
      instructorName: complementariaPair.instructor.name,
      instructorArea: complementariaPair.instructor.area,
      environmentName: complementariaPair.environmentName,
      selectedBlocks: complementariaPair.blocks,
      hoursAssigned: complementariaPair.blocks.length * 4,
      status: complementariaPair.status,
      notes: "Cobertura parcial mientras se define segundo bloque operativo de la oferta.",
      createdAt: formatTimestamp(25, 7, 50),
      updatedAt: formatTimestamp(26, 11, 5),
    });
  }

  const articulationPairs = [
    {
      ficha: articulacion[0],
      instructor: articulationInstructors[0],
      school: schools[0],
      modality: "Compartida" as const,
      shift: "Manana" as CoordinatorArticulationShift,
      status: "Pendiente" as const,
    },
    {
      ficha: articulacion[5],
      instructor: articulationInstructors[8],
      school: schools[2],
      modality: "Colegio privado" as const,
      shift: "Tarde" as CoordinatorArticulationShift,
      status: "Reasignada" as const,
    },
  ];

  articulationPairs.forEach((item, index) => {
    if (!item.ficha || !item.instructor || !item.school) {
      return;
    }

    records.push({
      id: `ASG-A-${index + 1}`,
      dependency: "Articulacion",
      fichaId: item.ficha.id,
      fichaNumber: item.ficha.number,
      program: item.ficha.program,
      siteContext: "Cobertura colegios",
      shift: item.shift,
      instructorId: item.instructor.id,
      instructorName: item.instructor.name,
      instructorArea: item.instructor.area,
      schoolId: item.school.id,
      schoolName: item.school.name,
      locality: item.school.city,
      modality: item.modality,
      selectedBlocks: item.shift === "Manana" ? ["Lun Manana", "Mie Manana"] : ["Mar Tarde", "Jue Tarde"],
      hoursAssigned: item.modality === "Compartida" ? 20 : 20,
      status: item.status,
      notes:
        index === 0
          ? "Cobertura en validacion mientras el colegio confirma ventana final de la jornada."
          : "Reasignacion por ajuste de colegio y ventana operativa.",
      createdAt: formatTimestamp(21 + index, 9, 0),
      updatedAt: formatTimestamp(27 + index, 14, 20),
    });
  });

  return records;
}

function buildHistory(activeAssignments: CoordinatorAssignmentRecord[]) {
  const history: CoordinatorAssignmentHistoryEntry[] = activeAssignments.flatMap((assignment, index) => {
    const createEntry: CoordinatorAssignmentHistoryEntry = {
      id: `HST-${assignment.id}-1`,
      assignmentId: assignment.id,
      action: "Creada",
      dependency: assignment.dependency,
      fichaNumber: assignment.fichaNumber,
      instructorName: assignment.instructorName,
      summary:
        assignment.dependency === "Articulacion"
          ? `Se creo cobertura inicial para ${assignment.schoolName}.`
          : `Se programo ${assignment.environmentName} con ${assignment.selectedBlocks.length} bloques.`,
      actor: "Natalia Barbosa",
      happenedAt: assignment.createdAt,
    };

    const editEntry: CoordinatorAssignmentHistoryEntry = {
      id: `HST-${assignment.id}-2`,
      assignmentId: assignment.id,
      action: assignment.status === "Reasignada" ? "Reasignada" : "Editada",
      dependency: assignment.dependency,
      fichaNumber: assignment.fichaNumber,
      instructorName: assignment.instructorName,
      summary:
        assignment.status === "Reasignada"
          ? "Se ajusto la asignacion por disponibilidad operativa."
          : "Se actualizo la programacion y se confirmo continuidad.",
      actor: index % 2 === 0 ? "Coordinacion academica" : "Natalia Barbosa",
      happenedAt: assignment.updatedAt,
    };

    return [createEntry, editEntry];
  });

  return history.sort((left, right) => right.happenedAt.localeCompare(left.happenedAt));
}

export function getCoordinatorAssignmentModuleData(siteId?: string): CoordinatorAssignmentModuleData {
  const articulationContext = isCoordinatorArticulationContext(siteId);
  const site = articulationContext
    ? coordinatorArticulationContextOption
    : resolveCoordinatorSite(siteId);
  const environmentBoard = getCoordinatorEnvironmentBoardData(
    articulationContext ? resolveCoordinatorSite().id : site.id,
  );
  const schoolData = getCoordinatorSchoolsData();

  const tituladaFichas = coordinatorFichaSummaries.filter(
    (item) => item.dependency === "Titulada" && item.site === site.label,
  );
  const complementariaFichas = coordinatorFichaSummaries.filter(
    (item) => item.dependency === "Complementaria" && item.site === site.label,
  );
  const articulacionFichas = coordinatorFichaSummaries.filter(
    (item) => item.dependency === "Articulacion",
  );

  const tituladaInstructors = coordinatorOperationalInstructors.filter(
    (item) => item.dependency === "Titulada" && item.site === site.label,
  );
  const complementariaInstructors = coordinatorOperationalInstructors.filter(
    (item) => item.dependency === "Complementaria" && item.site === site.label,
  );
  const articulacionInstructors = coordinatorOperationalInstructors.filter(
    (item) => item.dependency === "Articulacion",
  );

  const activeAssignments = buildActiveAssignments(
    articulationContext ? "Cobertura colegios" : site.label,
    tituladaFichas,
    complementariaFichas,
    articulacionFichas,
    tituladaInstructors,
    complementariaInstructors,
    articulacionInstructors,
    schoolData.schools,
  );

  const history = buildHistory(activeAssignments);

  const metrics: CoordinatorOperationalMetric[] = [
    {
      label: "Activas",
      value: `${activeAssignments.length}`,
      tone: "neutral",
    },
    {
      label: articulationContext ? "Colegios listos" : "Bloques libres sede",
      value: articulationContext
        ? `${schoolData.schools.filter((item) => item.readyForAssignment).length}`
        : `${environmentBoard.rows.flatMap((row) => row.cells).filter((cell) => cell.state === "Libre").length}`,
      tone: "neutral",
    },
    {
      label: "Fichas articulacion",
      value: `${articulacionFichas.length}`,
      tone: "warning",
    },
    {
      label: "Historial reciente",
      value: `${history.length}`,
      tone: "neutral",
    },
  ];
  return {
    site,
    metrics,
    fichas: {
      articulacion: articulacionFichas,
      titulada: tituladaFichas,
      complementaria: complementariaFichas,
    },
    instructors: {
      articulacion: articulacionInstructors,
      titulada: tituladaInstructors,
      complementaria: complementariaInstructors,
    },
    schools: schoolData.schools,
    environmentRows: environmentBoard.rows,
    environmentBlocks: environmentBoard.blocks,
    activeAssignments,
    history,
  };
}
