"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ArrowRightLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  History,
  Layers3,
  School,
  UserRound,
} from "lucide-react";

import {
  ArticulationModeBadge,
  FichaStateTagBadge,
  InstructorStatusBadge,
  OperationalDependencyBadge,
} from "@/components/coordinator/coordinator-badges";
import { CoordinatorArticulationPlanningPanel } from "@/components/coordinator/coordinator-articulation-planning-panel";
import { CoordinatorMetricStrip } from "@/components/coordinator/coordinator-metric-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import type { CoordinatorAssignmentModuleData } from "@/lib/mocks/coordinator-asignaciones";
import {
  CoordinatorAssignmentFlowMode,
  CoordinatorAssignmentFlowTab,
  CoordinatorAssignmentHistoryEntry,
  CoordinatorAssignmentRecord,
  CoordinatorFichaShift,
  CoordinatorOperationalDependency,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type CoordinatorAssignmentWorkspaceProps = CoordinatorAssignmentModuleData & {
  initialEditAssignmentId?: string;
};

const assignmentTabs: Array<{ id: CoordinatorAssignmentFlowTab; label: string }> = [
  { id: "new", label: "Nueva planeacion" },
  { id: "active", label: "Planeaciones activas" },
  { id: "history", label: "Historial" },
];

const articulationModes = ["Compartida", "Unica", "Colegio privado"] as const;
const articulationShifts: Array<Extract<CoordinatorFichaShift, "Manana" | "Tarde">> = [
  "Manana",
  "Tarde",
];

function resolveArticulationSenaHours(
  schoolKind?: string,
  modality?: (typeof articulationModes)[number],
) {
  if (schoolKind === "Tecnico") {
    return 20;
  }

  if (schoolKind === "Privado") {
    return 20;
  }

  if (modality === "Compartida") {
    return 20;
  }

  if (modality === "Colegio privado") {
    return 20;
  }

  return 40;
}

export function CoordinatorAssignmentWorkspace({
  site,
  metrics,
  fichas,
  instructors,
  schools,
  environmentRows,
  environmentBlocks,
  activeAssignments: initialAssignments,
  history: initialHistory,
  initialEditAssignmentId,
}: CoordinatorAssignmentWorkspaceProps) {
  const prefilledAssignment = initialEditAssignmentId
    ? initialAssignments.find((item) => item.id === initialEditAssignmentId)
    : undefined;
  const initialProgrammingDay =
    prefilledAssignment?.selectedBlocks[0]?.split(" ")[0] ??
    environmentBlocks[0]?.split(" ")[0] ??
    "Lun";
  const [currentTab, setCurrentTab] = useState<CoordinatorAssignmentFlowTab>("new");
  const [flowMode, setFlowMode] = useState<CoordinatorAssignmentFlowMode>(
    prefilledAssignment ? "edit" : "create",
  );
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(
    prefilledAssignment?.id ?? null,
  );
  const [selectedDependency, setSelectedDependency] = useState<CoordinatorOperationalDependency>(
    prefilledAssignment?.dependency ?? (site.id === "articulacion" ? "Articulacion" : "Titulada"),
  );
  const [selectedFichaId, setSelectedFichaId] = useState(prefilledAssignment?.fichaId ?? "");
  const [selectedInstructorId, setSelectedInstructorId] = useState(
    prefilledAssignment?.instructorId ?? "",
  );
  const [selectedSchoolId, setSelectedSchoolId] = useState(prefilledAssignment?.schoolId ?? "");
  const [selectedShift, setSelectedShift] = useState<CoordinatorFichaShift>(
    prefilledAssignment?.shift ?? "Manana",
  );
  const [selectedModality, setSelectedModality] =
    useState<(typeof articulationModes)[number]>(prefilledAssignment?.modality ?? "Compartida");
  const initialEnvironmentRow = prefilledAssignment?.environmentName
    ? environmentRows.find((row) => row.name === prefilledAssignment.environmentName)
    : undefined;
  const [selectedEnvironmentCells, setSelectedEnvironmentCells] = useState<string[]>(
    prefilledAssignment && initialEnvironmentRow
      ? initialEnvironmentRow.cells
          .filter((cell) => prefilledAssignment.selectedBlocks.includes(cell.block))
          .map((cell) => cell.id)
      : [],
  );
  const [selectedProgrammingDay, setSelectedProgrammingDay] = useState(initialProgrammingDay);
  const [notes, setNotes] = useState(
    prefilledAssignment?.notes ??
      "Validar cobertura antes de confirmar y dejar trazabilidad de la decision operativa.",
  );
  const [activeAssignments, setActiveAssignments] =
    useState<CoordinatorAssignmentRecord[]>(initialAssignments);
  const [historyEntries, setHistoryEntries] =
    useState<CoordinatorAssignmentHistoryEntry[]>(initialHistory);
  const effectiveDependency =
    site.id === "articulacion" ? "Articulacion" : selectedDependency;
  const reservedAssignments = activeAssignments.filter((item) => item.id !== editingAssignmentId);
  const reservedFichaIds = new Set(reservedAssignments.map((item) => item.fichaId));
  const reservedInstructorIds = new Set(reservedAssignments.map((item) => item.instructorId));
  const reservedEnvironmentCells = new Set(
    reservedAssignments
      .filter(
        (item): item is CoordinatorAssignmentRecord & { environmentName: string } =>
          item.dependency !== "Articulacion" && Boolean(item.environmentName),
      )
      .flatMap((assignment) => {
        const row = environmentRows.find((item) => item.name === assignment.environmentName);

        if (!row) {
          return [];
        }

        return row.cells
          .filter((cell) => assignment.selectedBlocks.includes(cell.block))
          .map((cell) => cell.id);
      }),
  );

  const dependencyFichas =
    effectiveDependency === "Articulacion"
      ? fichas.articulacion
      : effectiveDependency === "Titulada"
        ? fichas.titulada
        : fichas.complementaria;
  const dependencyInstructors =
    effectiveDependency === "Articulacion"
      ? instructors.articulacion
      : effectiveDependency === "Titulada"
        ? instructors.titulada
        : instructors.complementaria;
  const visibleEnvironmentRows = environmentRows.filter((row) => row.type === effectiveDependency);

  const selectedFicha = dependencyFichas.find((item) => item.id === selectedFichaId);
  const selectedInstructor = dependencyInstructors.find(
    (item) => item.id === selectedInstructorId,
  );
  const selectedSchool = schools.find((item) => item.id === selectedSchoolId);
  const selectedEnvironmentRow = environmentRows.find((row) =>
    row.cells.some((cell) => selectedEnvironmentCells.includes(cell.id)),
  );
  const selectedEnvironmentName = selectedEnvironmentRow?.name;
  const selectedBlockLabels = selectedEnvironmentRow
    ? selectedEnvironmentRow.cells
        .filter((cell) => selectedEnvironmentCells.includes(cell.id))
        .map((cell) => cell.block)
    : [];
  const selectedDays = Array.from(
    new Set(selectedBlockLabels.map((block) => block.split(" ")[0])),
  );
  const selectedJourneys = Array.from(
    new Set(selectedBlockLabels.map((block) => block.split(" ").slice(1).join(" "))),
  );
  const programmingDays = Array.from(
    new Set(environmentBlocks.map((block) => block.split(" ")[0])),
  );
  const visibleProgrammingBlocks = environmentBlocks.filter((block) =>
    block.startsWith(`${selectedProgrammingDay} `),
  );

  const hasFicha = Boolean(selectedFicha);
  const hasInstructor = Boolean(selectedInstructor);
  const hasProgramming =
    effectiveDependency === "Articulacion"
      ? Boolean(selectedSchool && selectedShift && selectedModality)
      : selectedEnvironmentCells.length > 0;
  const isReadyToConfirm = hasFicha && hasInstructor && hasProgramming;
  const canOpenEnvironmentProgramming =
    effectiveDependency !== "Articulacion" && hasFicha && hasInstructor;
  const articulationSenaHours = resolveArticulationSenaHours(
    selectedSchool?.kind,
    selectedModality,
  );
  const articulationFlowState =
    hasFicha && hasInstructor && selectedSchool
      ? isReadyToConfirm
        ? "Lista para confirmar"
        : "Pendiente modalidad o jornada"
      : "Pendiente informacion base";

  function resetFlow(nextDependency = effectiveDependency) {
    setSelectedDependency(nextDependency);
    setSelectedFichaId("");
    setSelectedInstructorId("");
    setSelectedSchoolId("");
    setSelectedShift("Manana");
    setSelectedModality("Compartida");
    setSelectedEnvironmentCells([]);
    setSelectedProgrammingDay(initialProgrammingDay);
    setNotes(
      "Validar cobertura antes de confirmar y dejar trazabilidad de la decision operativa.",
    );
    setFlowMode("create");
    setEditingAssignmentId(null);
  }

  function handleDependencyChange(nextDependency: CoordinatorOperationalDependency) {
    resetFlow(nextDependency);
  }

  function handleCellToggle(rowId: string, cellId: string) {
    setSelectedEnvironmentCells((current) => {
      const currentRow = environmentRows.find((item) =>
        item.cells.some((cell) => current.includes(cell.id)),
      );

      if (currentRow && currentRow.id !== rowId) {
        return [cellId];
      }

      return current.includes(cellId)
        ? current.filter((item) => item !== cellId)
        : [...current, cellId];
    });
  }

  function loadAssignmentIntoFlow(
    assignment: CoordinatorAssignmentRecord,
    mode: CoordinatorAssignmentFlowMode,
  ) {
    setCurrentTab("new");
    setFlowMode(mode);
    setEditingAssignmentId(assignment.id);
    setSelectedDependency(assignment.dependency);
    setSelectedFichaId(assignment.fichaId);
    setSelectedInstructorId(assignment.instructorId);
    setSelectedSchoolId(assignment.schoolId ?? "");
    setSelectedShift(assignment.shift);
    setSelectedModality(assignment.modality ?? "Compartida");
    setNotes(assignment.notes);

    if (assignment.dependency === "Articulacion") {
      setSelectedEnvironmentCells([]);
      return;
    }

    const row = environmentRows.find((item) => item.name === assignment.environmentName);

    if (!row) {
      setSelectedEnvironmentCells([]);
      return;
    }

    setSelectedEnvironmentCells(
      row.cells
        .filter((cell) => assignment.selectedBlocks.includes(cell.block))
        .map((cell) => cell.id),
    );
    setSelectedProgrammingDay(assignment.selectedBlocks[0]?.split(" ")[0] ?? initialProgrammingDay);
  }

  function handleConfirmAssignment() {
    if (!selectedFicha || !selectedInstructor) {
      return;
    }

    if (effectiveDependency === "Articulacion" && !selectedSchool) {
      return;
    }

    if (effectiveDependency !== "Articulacion" && !selectedEnvironmentName) {
      return;
    }

    const now = `2026-03-31 ${String(9 + activeAssignments.length).padStart(2, "0")}:20`;
    const nextRecord: CoordinatorAssignmentRecord = {
      id: editingAssignmentId ?? `ASG-NEW-${String(activeAssignments.length + 1).padStart(3, "0")}`,
      dependency: effectiveDependency,
      fichaId: selectedFicha.id,
      fichaNumber: selectedFicha.number,
      program: selectedFicha.program,
      siteContext: effectiveDependency === "Articulacion" ? "Cobertura colegios" : site.label,
      shift: effectiveDependency === "Articulacion" ? selectedShift : selectedFicha.shift,
      instructorId: selectedInstructor.id,
      instructorName: selectedInstructor.name,
      instructorArea: selectedInstructor.area,
      schoolId: effectiveDependency === "Articulacion" ? selectedSchool?.id : undefined,
      schoolName: effectiveDependency === "Articulacion" ? selectedSchool?.name : undefined,
      locality:
        effectiveDependency === "Articulacion"
          ? selectedSchool?.city ?? selectedFicha.locality
          : undefined,
      modality: effectiveDependency === "Articulacion" ? selectedModality : undefined,
      environmentName: effectiveDependency === "Articulacion" ? undefined : selectedEnvironmentName,
      selectedBlocks:
        effectiveDependency === "Articulacion"
          ? selectedShift === "Manana"
            ? ["Lun Manana", "Mie Manana"]
            : ["Mar Tarde", "Jue Tarde"]
          : selectedBlockLabels,
      hoursAssigned:
        effectiveDependency === "Articulacion"
          ? articulationSenaHours
          : Math.max(selectedBlockLabels.length, 1) * 4,
      status: flowMode === "reassign" ? "Reasignada" : "Activa",
      notes,
      createdAt:
        flowMode === "create"
          ? now
          : activeAssignments.find((item) => item.id === editingAssignmentId)?.createdAt ?? now,
      updatedAt: now,
    };

    setActiveAssignments((current) => {
      const exists = current.some((item) => item.id === nextRecord.id);

      if (!exists) {
        return [nextRecord, ...current];
      }

      return current.map((item) => (item.id === nextRecord.id ? nextRecord : item));
    });

    const historyAction =
      flowMode === "create" ? "Creada" : flowMode === "reassign" ? "Reasignada" : "Editada";
    const historyEntry: CoordinatorAssignmentHistoryEntry = {
      id: `HST-${nextRecord.id}-${historyEntries.length + 1}`,
      assignmentId: nextRecord.id,
      action: historyAction,
      dependency: nextRecord.dependency,
      fichaNumber: nextRecord.fichaNumber,
      instructorName: nextRecord.instructorName,
      summary:
        nextRecord.dependency === "Articulacion"
          ? `Se confirmo cobertura con ${nextRecord.schoolName} en modalidad ${nextRecord.modality?.toLowerCase()}.`
          : `Se programo ${nextRecord.environmentName} en ${nextRecord.selectedBlocks.length} bloques.`,
      actor: "Natalia Barbosa",
      happenedAt: now,
    };

    setHistoryEntries((current) => [historyEntry, ...current]);
    resetFlow(effectiveDependency);
    setCurrentTab("active");
  }

  const flowSteps =
    effectiveDependency === "Articulacion"
      ? [
          { label: "Selecciona ficha", complete: hasFicha },
          { label: "Selecciona instructor", complete: hasInstructor },
          { label: "Selecciona colegio", complete: Boolean(selectedSchool) },
          { label: "Define modalidad", complete: Boolean(selectedModality) },
          { label: "Define jornada", complete: Boolean(selectedShift) },
          { label: "Confirma asignacion", complete: isReadyToConfirm },
        ]
      : [
          { label: "Selecciona ficha", complete: hasFicha },
          { label: "Selecciona instructor", complete: hasInstructor },
          { label: "Programa ambientes", complete: selectedEnvironmentCells.length > 0 },
          { label: "Confirma asignacion", complete: isReadyToConfirm },
        ];

  return (
    <div className="space-y-5">
      <CoordinatorMetricStrip metrics={metrics} />

      <div className="rounded-[1rem] border border-border/70 bg-white/80 px-4 py-4 backdrop-blur">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Flujo transaccional
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {site.id === "articulacion"
                ? "Crea, ajusta y reasigna cobertura de articulacion con colegios desde un mismo workspace."
                : `Crea, ajusta y reasigna desde un mismo workspace. ${site.label} sigue siendo el contexto administrativo para titulada y complementaria.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {assignmentTabs.map((tab) => {
              const active = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentTab(tab.id)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_20px_-16px_rgba(22,163,74,0.65)]"
                      : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:text-foreground",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {currentTab === "new" ? (
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <Card>
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>
                      {flowMode === "create"
                        ? "Nueva planeacion"
                        : flowMode === "edit"
                          ? "Editar planeacion"
                          : "Reasignar cobertura"}
                    </CardTitle>
                    <CardDescription>
                      La ruta cambia segun la dependencia: ambientes para titulada y complementaria, colegios para articulacion.
                    </CardDescription>
                  </div>
                  {flowMode !== "create" ? (
                    <Badge variant="secondary">
                      {flowMode === "edit" ? "Edicion en curso" : "Reasignacion en curso"}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(site.id === "articulacion"
                    ? (["Articulacion"] as CoordinatorOperationalDependency[])
                    : (["Titulada", "Complementaria", "Articulacion"] as CoordinatorOperationalDependency[])).map(
                    (dependency) => {
                      const active = effectiveDependency === dependency;

                      return (
                        <button
                          key={dependency}
                          type="button"
                          onClick={() => handleDependencyChange(dependency)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:text-foreground",
                          )}
                        >
                          {dependency}
                        </button>
                      );
                    },
                  )}
                </div>

                <div
                  className={cn(
                    "grid gap-2 md:grid-cols-2",
                    effectiveDependency === "Articulacion"
                      ? "xl:grid-cols-3"
                      : "xl:grid-cols-4",
                  )}
                >
                  {flowSteps.map((step, index) => (
                    <div
                      key={step.label}
                      className={cn(
                        "rounded-[1rem] border px-3 py-3",
                        step.complete
                          ? effectiveDependency === "Articulacion"
                            ? "border-amber-300/60 bg-amber-50"
                            : "border-primary/30 bg-primary/5"
                          : effectiveDependency === "Articulacion"
                            ? "border-amber-200/70 bg-amber-50/40"
                            : "border-border/80 bg-background/70",
                      )}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Paso {index + 1}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground">{step.label}</p>
                    </div>
                  ))}
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>1. Selecciona ficha</CardTitle>
                <CardDescription>
                  {effectiveDependency === "Articulacion"
                    ? "Pool general de fichas de articulacion. Aqui el contexto principal es colegio, modalidad y jornada."
                    : `Pool de fichas de ${effectiveDependency.toLowerCase()} dentro del contexto de ${site.label}.`}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-2">
                {dependencyFichas.slice(0, 10).map((ficha) => {
                  const selected = ficha.id === selectedFichaId;
                  const reserved = reservedFichaIds.has(ficha.id);

                  return (
                    <button
                      key={ficha.id}
                      type="button"
                      onClick={() => {
                        if (!reserved) {
                          setSelectedFichaId(ficha.id);
                        }
                      }}
                      disabled={reserved}
                      className={cn(
                        "rounded-[1rem] border p-4 text-left transition-all disabled:cursor-not-allowed",
                        selected
                          ? "border-primary bg-primary/5 shadow-[0_12px_24px_-20px_rgba(22,163,74,0.6)]"
                          : reserved
                            ? "border-border bg-slate-50 text-muted-foreground opacity-70"
                            : "border-border bg-white hover:border-primary/20",
                      )}
                    >
                      <div className="flex flex-wrap gap-2">
                        <OperationalDependencyBadge dependency={ficha.dependency} />
                        {ficha.stateTags.slice(0, 2).map((tag) => (
                          <FichaStateTagBadge key={tag} state={tag} />
                        ))}
                        {reserved ? <Badge variant="outline">Ya asignada</Badge> : null}
                      </div>
                      <p className="mt-3 text-base font-semibold text-foreground">
                        Ficha {ficha.number}
                      </p>
                      <p className="text-sm text-muted-foreground">{ficha.program}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {effectiveDependency === "Articulacion"
                          ? `${ficha.articulationSchool ?? "Colegio por definir"} · ${ficha.articulationMode ?? "Modalidad pendiente"} · ${ficha.shift}`
                          : `${ficha.site} · ${ficha.shift} · ${ficha.programType}`}
                      </p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Selecciona instructor</CardTitle>
                <CardDescription>
                  Directorio operativo de instructores compatible con la dependencia actual.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-2">
                {dependencyInstructors.slice(0, 10).map((instructor) => {
                  const selected = instructor.id === selectedInstructorId;
                  const reserved = reservedInstructorIds.has(instructor.id);

                  return (
                    <button
                      key={instructor.id}
                      type="button"
                      onClick={() => {
                        if (!reserved) {
                          setSelectedInstructorId(instructor.id);
                        }
                      }}
                      disabled={reserved}
                      className={cn(
                        "rounded-[1rem] border p-4 text-left transition-all disabled:cursor-not-allowed",
                        selected
                          ? "border-primary bg-primary/5 shadow-[0_12px_24px_-20px_rgba(22,163,74,0.6)]"
                          : reserved
                            ? "border-border bg-slate-50 text-muted-foreground opacity-70"
                            : "border-border bg-white hover:border-primary/20",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Image
                          src={instructor.photoUrl}
                          alt={instructor.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-2xl border border-border/70 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{instructor.name}</p>
                            <OperationalDependencyBadge dependency={instructor.dependency} />
                            {reserved ? <Badge variant="outline">Ya asignado</Badge> : null}
                          </div>
                          <p className="text-sm text-muted-foreground">{instructor.area}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {effectiveDependency === "Articulacion"
                              ? `${instructor.articulationSchool ?? "Cobertura pendiente"} · ${instructor.locality ?? "Localidad pendiente"}`
                              : `${instructor.site} · ${instructor.programType}`}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {effectiveDependency === "Articulacion" ? (
              <CoordinatorArticulationPlanningPanel
                schools={schools}
                selectedSchoolId={selectedSchoolId}
                onSchoolSelect={setSelectedSchoolId}
                selectedModality={selectedModality}
                onModalityChange={setSelectedModality}
                selectedShift={selectedShift as Extract<CoordinatorFichaShift, "Manana" | "Tarde">}
                onShiftChange={(shift) => setSelectedShift(shift)}
                senaHours={articulationSenaHours}
                stateLabel={articulationFlowState}
                ready={isReadyToConfirm}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>3. Programacion operativa por ambientes</CardTitle>
                  <CardDescription>
                    La parrilla se habilita cuando ya definiste ficha e instructor para esta asignacion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!canOpenEnvironmentProgramming ? (
                    <div className="rounded-[1rem] border border-dashed border-border/80 bg-background/60 p-5">
                      <p className="text-sm font-medium text-foreground">
                        Define primero ficha e instructor
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Cuando completes esos pasos, aqui se activara la misma parrilla operativa de ambientes para seleccionar dias, jornadas y bloques disponibles.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="rounded-[1rem] border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
                        Reutiliza la parrilla operativa para construir la planeacion. Navega por dia, revisa bloques libres y selecciona jornadas sobre un solo ambiente principal.
                      </div>
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {programmingDays.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setSelectedProgrammingDay(day)}
                              className={cn(
                                "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                                selectedProgrammingDay === day
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:text-foreground",
                              )}
                            >
                              {day}
                            </button>
                          ))}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Dia visible
                            </p>
                            <p className="mt-1 text-sm text-foreground">{selectedProgrammingDay}</p>
                          </div>
                          <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Jornadas del dia
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {visibleProgrammingBlocks
                                .map((block) => block.split(" ").slice(1).join(" "))
                                .join(" · ")}
                            </p>
                          </div>
                          <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Seleccion actual
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {selectedEnvironmentName
                                ? `${selectedEnvironmentName} · ${selectedBlockLabels.length} bloques`
                                : "Sin ambiente seleccionado"}
                            </p>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <div className="min-w-[720px] space-y-2">
                            <div
                              className="grid gap-2"
                              style={{
                                gridTemplateColumns: `220px repeat(${visibleProgrammingBlocks.length}, minmax(120px, 1fr))`,
                              }}
                            >
                              <div className="rounded-[0.9rem] border border-border/70 bg-background/70 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Ambiente
                              </div>
                              {visibleProgrammingBlocks.map((block) => (
                                <div
                                  key={block}
                                  className="rounded-[0.9rem] border border-border/70 bg-background/70 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                                >
                                  {block}
                                </div>
                              ))}
                            </div>

                            {visibleEnvironmentRows.map((row) => (
                              <div
                                key={row.id}
                                className="grid gap-2"
                                style={{
                                  gridTemplateColumns: `220px repeat(${visibleProgrammingBlocks.length}, minmax(120px, 1fr))`,
                                }}
                              >
                                <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                                  <p className="font-semibold text-foreground">{row.name}</p>
                                  <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                                    {row.type} · {row.capacity} cupos
                                  </p>
                                </div>
                                {row.cells
                                  .filter((cell) => cell.block.startsWith(`${selectedProgrammingDay} `))
                                  .map((cell) => {
                                    const selected = selectedEnvironmentCells.includes(cell.id);
                                    const reserved = reservedEnvironmentCells.has(cell.id);

                                    return (
                                      <button
                                        key={cell.id}
                                        type="button"
                                        onClick={() => {
                                          if (!reserved) {
                                            handleCellToggle(row.id, cell.id);
                                          }
                                        }}
                                        disabled={reserved}
                                        className={cn(
                                          "rounded-[0.95rem] border px-3 py-4 text-center transition-all disabled:cursor-not-allowed",
                                          selected
                                            ? "border-primary bg-primary text-primary-foreground shadow-[0_12px_24px_-20px_rgba(22,163,74,0.7)]"
                                            : reserved
                                              ? "border-warning/30 bg-warning/5 text-foreground"
                                              : "border-border/70 bg-white hover:border-primary/25 hover:bg-primary/5",
                                        )}
                                      >
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                                          {selected ? "Seleccionado" : reserved ? "Ocupado" : "Libre"}
                                        </p>
                                        <p className="mt-2 text-sm font-medium">
                                          {cell.block.split(" ").slice(1).join(" ")}
                                        </p>
                                        <p className="mt-1 text-xs">
                                          {selected
                                            ? "Incluido"
                                            : reserved
                                              ? "No disponible"
                                              : "Disponible"}
                                        </p>
                                      </button>
                                    );
                                  })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>4. Confirmacion</CardTitle>
                <CardDescription>
                  Deja trazabilidad breve y confirma la asignacion para enviarla al tablero activo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleConfirmAssignment} disabled={!isReadyToConfirm}>
                    <CheckCircle2 className="h-4 w-4" />
                    {flowMode === "create"
                      ? "Confirmar asignacion"
                      : flowMode === "edit"
                        ? "Guardar cambios"
                        : "Confirmar reasignacion"}
                  </Button>
                  {(flowMode !== "create" || hasFicha || hasInstructor || selectedEnvironmentCells.length) ? (
                    <Button variant="outline" onClick={() => resetFlow(effectiveDependency)}>
                      Limpiar flujo
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="xl:sticky xl:top-[8.5rem]">
              <CardHeader>
                <CardTitle>Resumen operativo</CardTitle>
                <CardDescription>
                  Lectura rapida de consistencia antes de guardar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Layers3 className="h-4 w-4 text-primary" />
                    Ficha
                  </div>
                  {selectedFicha ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <OperationalDependencyBadge dependency={selectedFicha.dependency} />
                        {selectedFicha.articulationMode ? (
                          <ArticulationModeBadge mode={selectedFicha.articulationMode} />
                        ) : null}
                      </div>
                      <p className="font-semibold text-foreground">
                        {selectedFicha.number} · {selectedFicha.program}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {effectiveDependency === "Articulacion"
                          ? `${selectedFicha.articulationSchool ?? "Colegio pendiente"} · ${selectedFicha.shift}`
                          : `${selectedFicha.site} · ${selectedFicha.shift}`}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Aun no has seleccionado una ficha.
                    </p>
                  )}
                </div>
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <UserRound className="h-4 w-4 text-primary" />
                    Instructor
                  </div>
                  {selectedInstructor ? (
                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <OperationalDependencyBadge dependency={selectedInstructor.dependency} />
                        <InstructorStatusBadge status={selectedInstructor.status} />
                      </div>
                      <p className="font-semibold text-foreground">{selectedInstructor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {effectiveDependency === "Articulacion"
                          ? `${selectedInstructor.articulationSchool ?? "Cobertura pendiente"} · ${selectedInstructor.locality ?? "Localidad pendiente"}`
                          : `${selectedInstructor.site} · ${selectedInstructor.area}`}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      Selecciona un instructor para continuar.
                    </p>
                  )}
                </div>

                {effectiveDependency === "Articulacion" ? (
                  <div className="rounded-[1rem] border border-amber-200/70 bg-amber-50/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <School className="h-4 w-4 text-primary" />
                      Resumen articulacion
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[0.95rem] border border-amber-200/70 bg-white/85 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Colegio
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {selectedSchool
                            ? `${selectedSchool.name} · ${selectedSchool.city}`
                            : "Pendiente"}
                        </p>
                      </div>
                      <div className="rounded-[0.95rem] border border-amber-200/70 bg-white/85 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Modalidad
                        </p>
                        <div className="mt-1">
                          <ArticulationModeBadge mode={selectedModality} />
                        </div>
                      </div>
                      <div className="rounded-[0.95rem] border border-amber-200/70 bg-white/85 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Jornada
                        </p>
                        <p className="mt-1 text-sm text-foreground">{selectedShift}</p>
                      </div>
                      <div className="rounded-[0.95rem] border border-amber-200/70 bg-white/85 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Horas SENA
                        </p>
                        <p className="mt-1 text-sm text-foreground">{articulationSenaHours}h</p>
                      </div>
                      <div className="rounded-[0.95rem] border border-amber-200/70 bg-white/85 px-3 py-3 sm:col-span-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Estado
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Badge variant={isReadyToConfirm ? "success" : "warning"}>
                            {articulationFlowState}
                          </Badge>
                          {selectedSchool ? <Badge variant="outline">{selectedSchool.kind}</Badge> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      Programacion ambientes
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p>
                        {selectedEnvironmentName
                          ? `${selectedEnvironmentName} · ${selectedBlockLabels.length} bloques`
                          : "Selecciona ambiente y bloques para completar la programacion."}
                      </p>
                      {selectedEnvironmentName ? (
                        <div className="grid gap-3 pt-1 sm:grid-cols-3">
                          <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Ambiente
                            </p>
                            <p className="mt-1 text-sm text-foreground">{selectedEnvironmentName}</p>
                          </div>
                          <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Dias
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {selectedDays.join(" · ") || "Pendiente"}
                            </p>
                          </div>
                          <div className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Jornadas
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {selectedJourneys.join(" · ") || "Pendiente"}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {selectedBlockLabels.length ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {selectedBlockLabels.map((block) => (
                            <Badge key={block} variant="secondary">
                              {block}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                <div className="rounded-[1rem] border border-dashed border-border/80 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    Regla aplicada
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {effectiveDependency === "Articulacion"
                      ? "La asignacion se define contra colegio, modalidad y jornada. No requiere ambiente del centro."
                      : "La asignacion exige seleccionar ambiente y bloques operativos dentro de la sede activa."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {currentTab === "active" ? (
        <div className="space-y-4">
          {activeAssignments.length ? (
            activeAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="flex flex-col gap-4 pt-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <OperationalDependencyBadge dependency={assignment.dependency} />
                      <Badge
                        variant={assignment.status === "Reasignada" ? "warning" : "success"}
                      >
                        {assignment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        Ficha {assignment.fichaNumber} · {assignment.program}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.instructorName} · {assignment.instructorArea}
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-[0.95rem] border border-border/70 bg-background/70 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Contexto
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {assignment.dependency === "Articulacion"
                            ? `${assignment.schoolName} · ${assignment.modality} · ${assignment.shift}`
                            : `${assignment.environmentName} · ${assignment.siteContext}`}
                        </p>
                      </div>
                      <div className="rounded-[0.95rem] border border-border/70 bg-background/70 px-3 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Bloques / horas
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {assignment.selectedBlocks.join(" · ")}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {assignment.hoursAssigned} horas registradas
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{assignment.notes}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => loadAssignmentIntoFlow(assignment, "edit")}
                    >
                      Editar
                    </Button>
                    <Button onClick={() => loadAssignmentIntoFlow(assignment, "reassign")}>
                      <ArrowRightLeft className="h-4 w-4" />
                      Reasignar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Sin asignaciones activas"
              description="Crea la primera asignacion desde el flujo guiado para empezar a mover la operacion."
            />
          )}
        </div>
      ) : null}

      {currentTab === "history" ? (
        <div className="space-y-4">
          {historyEntries.length ? (
            historyEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="flex flex-col gap-3 pt-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <OperationalDependencyBadge dependency={entry.dependency} />
                      <Badge
                        variant={
                          entry.action === "Reasignada"
                            ? "warning"
                            : entry.action === "Cerrada"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {entry.action}
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground">
                      Ficha {entry.fichaNumber} · {entry.instructorName}
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.summary}</p>
                  </div>
                  <div className="rounded-[0.95rem] border border-border/70 bg-background/70 px-3 py-3 text-sm text-muted-foreground">
                    <p>{entry.actor}</p>
                    <p className="mt-1">{entry.happenedAt}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={History}
              title="Sin historial todavia"
              description="Cada creacion, edicion o reasignacion quedara trazada aqui."
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
