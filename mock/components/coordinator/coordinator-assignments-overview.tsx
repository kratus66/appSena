"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  CalendarRange,
  ClipboardList,
  Clock3,
  School,
  Search,
  UserRound,
  X,
} from "lucide-react";

import {
  ArticulationModeBadge,
  OperationalDependencyBadge,
} from "@/components/coordinator/coordinator-badges";
import { CoordinatorMetricStrip } from "@/components/coordinator/coordinator-metric-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CoordinatorAssignmentModuleData } from "@/lib/mocks/coordinator-asignaciones";
import {
  CoordinatorAssignmentRecord,
  CoordinatorAssignmentRecordStatus,
  CoordinatorOperationalDependency,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type CoordinatorAssignmentsOverviewProps = Pick<
  CoordinatorAssignmentModuleData,
  "site" | "activeAssignments" | "fichas"
>;

type EnvironmentFilter = "all" | "with" | "without";
type SchoolFilter = "all" | "with" | "without";

function assignmentStatusVariant(status: CoordinatorAssignmentRecordStatus) {
  if (status === "Activa") {
    return "success";
  }

  if (status === "Pendiente" || status === "Parcial" || status === "Reasignada") {
    return "warning";
  }

  if (status === "Cerrada") {
    return "outline";
  }

  return "secondary";
}

function assignmentRowTone(status: CoordinatorAssignmentRecordStatus) {
  if (status === "Activa") {
    return "border-primary/20 bg-primary/[0.03]";
  }

  if (status === "Pendiente" || status === "Parcial" || status === "Reasignada") {
    return "border-warning/25 bg-warning/[0.045]";
  }

  if (status === "Cerrada") {
    return "border-border/80 bg-slate-50";
  }

  return "border-border/70 bg-white";
}

function assignmentStatusLabel(status: CoordinatorAssignmentRecordStatus) {
  return status === "Borrador" ? "Pendiente" : status;
}

const statusFilterOptions: CoordinatorAssignmentRecordStatus[] = [
  "Activa",
  "Pendiente",
  "Parcial",
  "Reasignada",
  "Cerrada",
];

export function CoordinatorAssignmentsOverview({
  site,
  activeAssignments,
  fichas,
}: CoordinatorAssignmentsOverviewProps) {
  const [query, setQuery] = useState("");
  const [dependencyFilter, setDependencyFilter] = useState<"all" | CoordinatorOperationalDependency>(
    "all",
  );
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [fichaFilter, setFichaFilter] = useState("all");
  const [shiftFilter, setShiftFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | CoordinatorAssignmentRecordStatus>("all");
  const [environmentFilter, setEnvironmentFilter] = useState<EnvironmentFilter>("all");
  const [schoolFilter, setSchoolFilter] = useState<SchoolFilter>("all");
  const [selectedAssignment, setSelectedAssignment] = useState<CoordinatorAssignmentRecord | null>(
    null,
  );

  const instructorOptions = useMemo(
    () =>
      Array.from(
        new Map(
          activeAssignments.map((assignment) => [assignment.instructorId, assignment.instructorName]),
        ),
      ).map(([id, name]) => ({ id, name })),
    [activeAssignments],
  );
  const fichaOptions = useMemo(
    () =>
      Array.from(
        new Map(
          activeAssignments.map((assignment) => [
            assignment.fichaId,
            `${assignment.fichaNumber} · ${assignment.program}`,
          ]),
        ),
      ).map(([id, label]) => ({ id, label })),
    [activeAssignments],
  );
  const shiftOptions = useMemo(
    () => Array.from(new Set(activeAssignments.map((assignment) => assignment.shift))),
    [activeAssignments],
  );
  const filteredAssignments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return activeAssignments.filter((assignment) => {
      if (dependencyFilter !== "all" && assignment.dependency !== dependencyFilter) {
        return false;
      }

      if (instructorFilter !== "all" && assignment.instructorId !== instructorFilter) {
        return false;
      }

      if (fichaFilter !== "all" && assignment.fichaId !== fichaFilter) {
        return false;
      }

      if (shiftFilter !== "all" && assignment.shift !== shiftFilter) {
        return false;
      }

      if (statusFilter !== "all" && assignment.status !== statusFilter) {
        return false;
      }

      if (environmentFilter === "with" && !assignment.environmentName) {
        return false;
      }

      if (environmentFilter === "without" && assignment.environmentName) {
        return false;
      }

      if (schoolFilter === "with" && !assignment.schoolName) {
        return false;
      }

      if (schoolFilter === "without" && assignment.schoolName) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchTarget = [
        assignment.instructorName,
        assignment.fichaNumber,
        assignment.program,
        assignment.environmentName,
        assignment.schoolName,
        assignment.siteContext,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTarget.includes(normalizedQuery);
    });
  }, [
    activeAssignments,
    dependencyFilter,
    environmentFilter,
    fichaFilter,
    instructorFilter,
    query,
    schoolFilter,
    shiftFilter,
    statusFilter,
  ]);

  const kpis = useMemo(() => {
    const assignedFichaCount = new Set(filteredAssignments.map((assignment) => assignment.fichaId)).size;
    const occupiedEnvironments = new Set(
      filteredAssignments
        .filter((assignment) => assignment.environmentName)
        .map((assignment) => assignment.environmentName),
    ).size;
    const coveredSchools = new Set(
      filteredAssignments
        .filter((assignment) => assignment.schoolId)
        .map((assignment) => assignment.schoolId),
    ).size;
    const totalFichasUniverse =
      site.id === "articulacion"
        ? fichas.articulacion.length
        : fichas.titulada.length + fichas.complementaria.length + fichas.articulacion.length;
    const pendingCount = Math.max(totalFichasUniverse - assignedFichaCount, 0);
    const activeCount = filteredAssignments.filter(
      (assignment) => assignment.status !== "Cerrada",
    ).length;

    return [
      {
        label: "Asignaciones activas",
        value: `${activeCount}`,
        tone: "neutral" as const,
      },
      {
        label: "Fichas asignadas",
        value: `${assignedFichaCount}`,
        tone: "neutral" as const,
      },
      {
        label: "Ambientes ocupados",
        value: `${occupiedEnvironments}`,
        tone: "neutral" as const,
      },
      {
        label: "Colegios con cobertura",
        value: `${coveredSchools}`,
        tone: "neutral" as const,
      },
      {
        label: "Pendientes",
        value: `${pendingCount}`,
        tone: pendingCount > 0 ? ("warning" as const) : ("neutral" as const),
      },
    ];
  }, [fichas, filteredAssignments, site.id]);

  return (
    <div className="space-y-5">
      <CoordinatorMetricStrip metrics={kpis} />

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <CardTitle>Vista consolidada</CardTitle>
              <CardDescription>
                Cruza instructores, fichas, ambientes y colegios en una sola lectura operativa.
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit">
              {site.id === "articulacion"
                ? "Contexto articulacion"
                : `Sede administrativa ${site.label}`}
            </Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.2fr_repeat(6,minmax(0,1fr))]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-10"
                placeholder="Buscar instructor, ficha, colegio o ambiente"
              />
            </div>
            <Select
              value={dependencyFilter}
              onChange={(event) =>
                setDependencyFilter(
                  event.target.value as "all" | CoordinatorOperationalDependency,
                )
              }
            >
              <option value="all">Todas las dependencias</option>
              <option value="Titulada">Titulada</option>
              <option value="Complementaria">Complementaria</option>
              <option value="Articulacion">Articulacion</option>
            </Select>
            <Select value={instructorFilter} onChange={(event) => setInstructorFilter(event.target.value)}>
              <option value="all">Todos los instructores</option>
              {instructorOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
            <Select value={fichaFilter} onChange={(event) => setFichaFilter(event.target.value)}>
              <option value="all">Todas las fichas</option>
              {fichaOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select value={shiftFilter} onChange={(event) => setShiftFilter(event.target.value)}>
              <option value="all">Todas las jornadas</option>
              {shiftOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | CoordinatorAssignmentRecordStatus)
              }
            >
              <option value="all">Todos los estados</option>
              {statusFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {assignmentStatusLabel(option)}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={environmentFilter}
                onChange={(event) => setEnvironmentFilter(event.target.value as EnvironmentFilter)}
              >
                <option value="all">Ambiente: todos</option>
                <option value="with">Con ambiente</option>
                <option value="without">Sin ambiente</option>
              </Select>
              <Select
                value={schoolFilter}
                onChange={(event) => setSchoolFilter(event.target.value as SchoolFilter)}
              >
                <option value="all">Colegio: todos</option>
                <option value="with">Con colegio</option>
                <option value="without">Sin colegio</option>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Asignaciones consolidadas</CardTitle>
          <CardDescription>
            Lectura global del sistema para ubicar rapidamente quien tiene cada ficha y bajo que
            contexto opera.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="hidden rounded-[1rem] border border-border/70 bg-background/70 px-4 py-3 xl:grid xl:grid-cols-[1.2fr_1.25fr_0.9fr_0.85fr_1fr_1.15fr_0.8fr_auto] xl:items-center xl:gap-4">
            {[
              "Instructor",
              "Ficha",
              "Dependencia y estado",
              "Jornada",
              "Sede admin",
              "Contexto operativo",
              "Lectura",
              "Accion",
            ].map((label) => (
              <p
                key={label}
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
              >
                {label}
              </p>
            ))}
          </div>

          {filteredAssignments.length ? (
            filteredAssignments.map((assignment) => {
              const isArticulation = assignment.dependency === "Articulacion";
              const contextLabel = isArticulation
                ? assignment.schoolName ?? "Colegio pendiente"
                : assignment.environmentName ?? "Ambiente pendiente";
              const secondaryContext = isArticulation
                ? assignment.modality
                  ? `${assignment.modality} · ${assignment.hoursAssigned}h SENA`
                  : `${assignment.hoursAssigned}h SENA`
                : `${assignment.selectedBlocks.length} bloques`;
              const quickReading = isArticulation
                ? `${contextLabel} · ${assignment.shift}`
                : `${contextLabel} · ${assignment.shift}`;

              return (
                <button
                  key={assignment.id}
                  type="button"
                  onClick={() => setSelectedAssignment(assignment)}
                  className={cn(
                    "w-full rounded-[1.15rem] border px-4 py-4 text-left transition-all hover:border-primary/25 hover:bg-primary/5",
                    assignmentRowTone(assignment.status),
                  )}
                >
                  <div className="grid gap-4 xl:grid-cols-[1.2fr_1.25fr_0.9fr_0.85fr_1fr_1.15fr_0.8fr_auto] xl:items-center">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{assignment.instructorName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{assignment.instructorArea}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">Ficha {assignment.fichaNumber}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{assignment.program}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <OperationalDependencyBadge dependency={assignment.dependency} />
                      <Badge variant={assignmentStatusVariant(assignment.status)}>
                        {assignmentStatusLabel(assignment.status)}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{assignment.shift}</p>
                      <p className="text-xs text-muted-foreground">
                        {isArticulation ? "Jornada colegio" : "Jornada operativa"}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-foreground">{assignment.siteContext}</p>
                      <p className="text-xs text-muted-foreground">
                        {isArticulation ? "Contexto administrativo" : "Sede de referencia"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">{contextLabel}</p>
                      <div className="flex flex-wrap gap-2">
                        {assignment.dependency === "Articulacion" && assignment.modality ? (
                          <ArticulationModeBadge mode={assignment.modality} />
                        ) : null}
                        <Badge variant="outline">{secondaryContext}</Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{quickReading}</p>
                      <p className="text-xs text-muted-foreground">
                        {isArticulation
                          ? `Instructor · colegio · modalidad`
                          : `Instructor · ambiente · jornada`}
                      </p>
                    </div>

                    <div className="flex justify-start xl:justify-end">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Ver detalle
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <EmptyState
              icon={ClipboardList}
              title="Sin registros para esta combinacion"
              description="Ajusta filtros o buscador para encontrar otra asignacion activa."
            />
          )}
        </CardContent>
      </Card>

      {selectedAssignment ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-950/20"
            onClick={() => setSelectedAssignment(null)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[460px] flex-col border-l border-border/70 bg-white shadow-[0_28px_64px_-40px_rgba(15,23,42,0.4)]">
            <div className="flex items-start justify-between gap-3 border-b border-border/70 px-6 py-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Detalle de asignacion
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">
                  Ficha {selectedAssignment.fichaNumber}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{selectedAssignment.program}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedAssignment(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="rounded-[1.15rem] border border-border/70 bg-background/70 p-5">
                <div className="flex flex-wrap gap-2">
                  <OperationalDependencyBadge dependency={selectedAssignment.dependency} />
                  <Badge variant={assignmentStatusVariant(selectedAssignment.status)}>
                    {assignmentStatusLabel(selectedAssignment.status)}
                  </Badge>
                  {selectedAssignment.dependency === "Articulacion" && selectedAssignment.modality ? (
                    <ArticulationModeBadge mode={selectedAssignment.modality} />
                  ) : null}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[1rem] border border-white/70 bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <UserRound className="h-4 w-4 text-primary" />
                      Instructor
                    </div>
                    <p className="mt-3 font-semibold text-foreground">
                      {selectedAssignment.instructorName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedAssignment.instructorArea}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-white/70 bg-white px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ClipboardList className="h-4 w-4 text-primary" />
                      Ficha
                    </div>
                    <p className="mt-3 font-semibold text-foreground">
                      {selectedAssignment.fichaNumber}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedAssignment.program}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Jornada
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {selectedAssignment.shift}
                  </p>
                </div>
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Sede administrativa
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {selectedAssignment.siteContext}
                  </p>
                </div>
              </div>

              {selectedAssignment.dependency === "Articulacion" ? (
                <div className="rounded-[1rem] border border-amber-200/70 bg-amber-50/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <School className="h-4 w-4 text-primary" />
                    Contexto operativo
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[0.95rem] border border-white/70 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Colegio
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {selectedAssignment.schoolName ?? "Pendiente"}
                      </p>
                    </div>
                    <div className="rounded-[0.95rem] border border-white/70 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Modalidad
                      </p>
                      <div className="mt-2">
                        {selectedAssignment.modality ? (
                          <ArticulationModeBadge mode={selectedAssignment.modality} />
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </div>
                    </div>
                    <div className="rounded-[0.95rem] border border-white/70 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Horas SENA
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {selectedAssignment.hoursAssigned} horas
                      </p>
                    </div>
                    <div className="rounded-[0.95rem] border border-white/70 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Localidad
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {selectedAssignment.locality ?? "Pendiente"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Building2 className="h-4 w-4 text-primary" />
                    Contexto operativo
                  </div>
                  <div className="mt-3 grid gap-3">
                    <div className="rounded-[0.95rem] border border-white/70 bg-white px-4 py-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Ambiente
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {selectedAssignment.environmentName ?? "Pendiente"}
                      </p>
                    </div>
                    <div className="rounded-[0.95rem] border border-white/70 bg-white px-4 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Clock3 className="h-4 w-4 text-primary" />
                        Bloques programados
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedAssignment.selectedBlocks.map((block) => (
                          <Badge key={block} variant="outline">
                            {block}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarRange className="h-4 w-4 text-primary" />
                  Estado y trazabilidad breve
                </div>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={assignmentStatusVariant(selectedAssignment.status)}>
                      {assignmentStatusLabel(selectedAssignment.status)}
                    </Badge>
                    <OperationalDependencyBadge dependency={selectedAssignment.dependency} />
                  </div>
                  <p>
                    <span className="font-medium text-foreground">Creada:</span>{" "}
                    {selectedAssignment.createdAt}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Actualizada:</span>{" "}
                    {selectedAssignment.updatedAt}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Observacion:</span>{" "}
                    {selectedAssignment.notes}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border/70 px-6 py-4">
              <Button asChild className="w-full">
                <Link
                  href={`/coordinador/programas?site=${
                    selectedAssignment.dependency === "Articulacion"
                      ? "articulacion"
                      : site.id === "articulacion"
                        ? "chapinero"
                        : site.id
                  }&edit=${selectedAssignment.id}`}
                >
                  Editar en Planeacion
                </Link>
              </Button>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
