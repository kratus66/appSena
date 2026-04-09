import {
  CoordinatorEnvironmentCatalogItem,
  CoordinatorEnvironmentMatrixCell,
  CoordinatorEnvironmentMatrixRow,
  CoordinatorOperationalDependency,
  CoordinatorOperationalMetric,
} from "@/lib/types";

import { resolveCoordinatorFilters, resolveCoordinatorSite } from "@/lib/mocks/coordinator-console";

export const coordinatorEnvironmentBoardBlocks = [
  "Lun Manana",
  "Lun Tarde",
  "Lun Noche",
  "Mar Manana",
  "Mar Tarde",
  "Mar Noche",
  "Mie Manana",
  "Mie Tarde",
  "Mie Noche",
  "Jue Manana",
  "Jue Tarde",
  "Jue Noche",
  "Vie Manana",
  "Vie Tarde",
  "Vie Noche",
  "Sab Manana",
  "Sab Tarde",
  "Sab Noche",
  "Dom Manana",
  "Dom Tarde",
  "Dom Noche",
];

const baseRowsBySite: Record<
  string,
  Array<{ name: string; type: CoordinatorOperationalDependency; capacity: number }>
> = {
  Chapinero: [
    { name: "Sala 4", type: "Titulada", capacity: 30 },
    { name: "Sala 5", type: "Titulada", capacity: 30 },
    { name: "Laboratorio 2", type: "Titulada", capacity: 28 },
    { name: "Ambiente B-12", type: "Complementaria", capacity: 24 },
    { name: "Ambiente C-08", type: "Complementaria", capacity: 25 },
    { name: "Sala TIC 1", type: "Titulada", capacity: 30 },
  ],
  Corferias: [
    { name: "Sala 2", type: "Titulada", capacity: 30 },
    { name: "Sala 3", type: "Titulada", capacity: 30 },
    { name: "Laboratorio 6", type: "Titulada", capacity: 28 },
    { name: "Ambiente F-03", type: "Complementaria", capacity: 24 },
    { name: "Ambiente G-09", type: "Complementaria", capacity: 25 },
    { name: "Sala TIC 3", type: "Titulada", capacity: 30 },
  ],
};

const pendingBySite: Record<
  string,
  Record<CoordinatorOperationalDependency, number>
> = {
  Chapinero: {
    Titulada: 14,
    Complementaria: 7,
    Articulacion: 0,
  },
  Corferias: {
    Titulada: 11,
    Complementaria: 8,
    Articulacion: 0,
  },
};

function buildCell(
  siteLabel: string,
  rowIndex: number,
  blockIndex: number,
): CoordinatorEnvironmentMatrixCell {
  void rowIndex;
  return {
    id: `${siteLabel}-${rowIndex}-${blockIndex}`,
    block: coordinatorEnvironmentBoardBlocks[blockIndex],
    state: "Libre",
  };
}

function buildRows(siteLabel: string) {
  return (baseRowsBySite[siteLabel] ?? []).map((row, rowIndex) => ({
    id: `${siteLabel}-${row.name}`,
    name: row.name,
    site: siteLabel,
    type: row.type,
    capacity: row.capacity,
    cells: coordinatorEnvironmentBoardBlocks.map((_, blockIndex) =>
      buildCell(siteLabel, rowIndex, blockIndex),
    ),
  })) satisfies CoordinatorEnvironmentMatrixRow[];
}

function buildCatalog(siteLabel: string) {
  return (baseRowsBySite[siteLabel] ?? []).map((row, index) => ({
    id: `CAT-${siteLabel}-${index + 1}`,
    code: row.name,
    site: siteLabel,
    capacity: row.capacity,
    type: row.type,
    status:
      index % 7 === 0
        ? "Mantenimiento"
        : index % 5 === 0
          ? "Inactivo"
          : "Activo",
  })) satisfies CoordinatorEnvironmentCatalogItem[];
}

export function getCoordinatorEnvironmentBoardData(
  siteId?: string,
  filters?: string[] | string,
) {
  const site = resolveCoordinatorSite(siteId);
  const activeFilters = resolveCoordinatorFilters(filters);
  const dependencyFilters = activeFilters.filter(
    (filter): filter is CoordinatorOperationalDependency =>
      filter === "Titulada" || filter === "Complementaria",
  );
  const onlyFree = activeFilters.includes("Solo libres");

  const rows = buildRows(site.label).filter((row) => {
    const dependencyMatch =
      !dependencyFilters.length || dependencyFilters.includes(row.type as CoordinatorOperationalDependency);
    const freeMatch = !onlyFree || row.cells.every((cell) => cell.state === "Libre");

    return dependencyMatch && freeMatch;
  });

  const freeEnvironments = rows.filter((row) =>
    row.cells.every((cell) => cell.state === "Libre"),
  ).length;
  const freeBlocks = rows.flatMap((row) => row.cells).filter((cell) => cell.state === "Libre").length;
  const pendingByType = pendingBySite[site.label] ?? pendingBySite.Chapinero;
  const pendingPlacement = dependencyFilters.length
    ? dependencyFilters.reduce((total, dependency) => total + pendingByType[dependency], 0)
    : Object.values(pendingByType).reduce((total, value) => total + value, 0);

  return {
    site,
    activeFilters,
    rows,
    catalog: buildCatalog(site.label),
    blocks: coordinatorEnvironmentBoardBlocks,
    metrics: [
      { label: "Ambientes libres", value: `${freeEnvironments}`, tone: "neutral" as const },
      { label: "Sede activa", value: site.label, tone: "neutral" as const },
      { label: "Bloques libres", value: `${freeBlocks}`, tone: "neutral" as const },
      { label: "Fichas por ubicar", value: `${pendingPlacement}`, tone: "warning" as const },
    ] satisfies CoordinatorOperationalMetric[],
  };
}
