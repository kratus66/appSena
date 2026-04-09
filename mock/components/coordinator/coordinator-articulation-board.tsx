"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  RotateCcw,
  MapPin,
  School,
  UserRound,
} from "lucide-react";

import {
  ArticulationModeBadge,
  ConflictBadge,
  OperationalFichaStatusBadge,
} from "@/components/coordinator/coordinator-badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CoordinatorArticulationFichaUnit,
  CoordinatorArticulationInstructor,
  CoordinatorArticulationSchoolUnit,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type CoordinatorArticulationBoardProps = {
  instructors: CoordinatorArticulationInstructor[];
  schools: CoordinatorArticulationSchoolUnit[];
};

function buildSchoolCoverage(fichas: CoordinatorArticulationFichaUnit[]) {
  const complete = fichas.filter((item) => item.coverageStatus === "Completa").length;
  const partial = fichas.filter((item) => item.coverageStatus === "Parcial").length;
  const pending = fichas.filter((item) => item.coverageStatus === "Sin asignar").length;

  return `${complete} completas · ${partial} parciales · ${pending} pendientes`;
}

export function CoordinatorArticulationBoard({
  instructors,
  schools,
}: CoordinatorArticulationBoardProps) {
  const [liveInstructors, setLiveInstructors] = useState(instructors);
  const [liveSchools, setLiveSchools] = useState(schools);
  const [feedback, setFeedback] = useState("");
  const firstSchool = liveSchools[0];
  const firstFicha = firstSchool?.fichas[0];
  const [selectedSchoolId, setSelectedSchoolId] = useState(firstSchool?.id ?? "");
  const [expandedSchoolId, setExpandedSchoolId] = useState(firstSchool?.id ?? "");
  const [selectedFichaId, setSelectedFichaId] = useState(firstFicha?.id ?? "");
  const [selectedInstructorId, setSelectedInstructorId] = useState(liveInstructors[0]?.id ?? "");

  const selectedSchool = useMemo(
    () => liveSchools.find((item) => item.id === selectedSchoolId) ?? liveSchools[0],
    [liveSchools, selectedSchoolId],
  );
  const selectedFicha = useMemo(
    () =>
      liveSchools
        .flatMap((school) => school.fichas)
        .find((item) => item.id === selectedFichaId) ?? selectedSchool?.fichas[0],
    [liveSchools, selectedFichaId, selectedSchool],
  );
  const selectedInstructor = useMemo(
    () => liveInstructors.find((item) => item.id === selectedInstructorId),
    [liveInstructors, selectedInstructorId],
  );

  const compatibleInstructorIds = useMemo(() => {
    if (!selectedFicha) {
      return new Set<string>();
    }

    return new Set(
      liveInstructors
        .filter((item) => item.area === selectedFicha.program)
        .map((item) => item.id),
    );
  }, [liveInstructors, selectedFicha]);

  const isCompatible =
    selectedInstructor && selectedFicha
      ? compatibleInstructorIds.has(selectedInstructor.id)
      : false;

  const selectedInstructorAssigned =
    !!selectedInstructor && !!selectedFicha?.assignedInstructors.includes(selectedInstructor.name);

  if (!liveInstructors.length || !liveSchools.length) {
    return (
      <EmptyState
        icon={School}
        title="Sin datos de articulacion visibles"
        description="Ajusta la sede o los filtros rapidos para recuperar instructores, colegios y fichas activas."
      />
    );
  }

  function handleSelectSchool(school: CoordinatorArticulationSchoolUnit) {
    setSelectedSchoolId(school.id);
    setExpandedSchoolId((current) => (current === school.id ? "" : school.id));
    setFeedback("");

    if (!school.fichas.find((item) => item.id === selectedFichaId)) {
      setSelectedFichaId(school.fichas[0]?.id ?? "");
    }
  }

  function handleSelectFicha(school: CoordinatorArticulationSchoolUnit, fichaId: string) {
    setSelectedSchoolId(school.id);
    setExpandedSchoolId(school.id);
    setSelectedFichaId(fichaId);
    setFeedback("");
  }

  function updateInstructorHours(name: string, delta: number) {
    setLiveInstructors((current) =>
      current.map((item) => {
        if (item.name !== name) {
          return item;
        }

        const nextHours = Math.max(0, item.hoursAssigned + delta);

        return {
          ...item,
          hoursAssigned: nextHours,
          status: nextHours === 0 ? "Libre" : nextHours >= 16 ? "Cubierto" : "Parcial",
        };
      }),
    );
  }

  function handleAssign() {
    if (!selectedInstructor || !selectedFicha || !selectedSchool || !isCompatible) {
      return;
    }

    if (selectedFicha.assignedInstructors.includes(selectedInstructor.name)) {
      setFeedback("Este instructor ya esta asignado a la ficha seleccionada.");
      return;
    }

    const hoursChunk =
      selectedFicha.coverageStatus === "Sin asignar"
        ? Math.ceil(selectedFicha.hoursRequired / 2)
        : selectedFicha.hoursRequired - Math.ceil(selectedFicha.hoursRequired / 2);

    setLiveSchools((current) =>
      current.map((school) => {
        if (school.id !== selectedSchool.id) {
          return school;
        }

        const fichas = school.fichas.map((ficha) => {
          if (ficha.id !== selectedFicha.id) {
            return ficha;
          }

          const assignedInstructors = [...ficha.assignedInstructors, selectedInstructor.name];
          const coverageStatus: CoordinatorArticulationFichaUnit["coverageStatus"] =
            assignedInstructors.length >= 2 ? "Completa" : "Parcial";

          return {
            ...ficha,
            assignedInstructors,
            coverageStatus,
          };
        });

        return {
          ...school,
          fichas,
          generalCoverage: buildSchoolCoverage(fichas),
        };
      }),
    );

    updateInstructorHours(selectedInstructor.name, hoursChunk);
    setFeedback(`Asignacion guardada para la ficha ${selectedFicha.number}.`);
  }

  function handleUnassign(instructorName?: string) {
    if (!selectedFicha || !selectedSchool) {
      return;
    }

    const targetInstructorName =
      instructorName ??
      (selectedInstructorAssigned ? selectedInstructor?.name : selectedFicha.assignedInstructors[0]);

    if (!targetInstructorName) {
      setFeedback("No hay una asignacion para devolver en la ficha seleccionada.");
      return;
    }

    if (!selectedFicha.assignedInstructors.includes(targetInstructorName)) {
      setFeedback("El instructor seleccionado no esta asignado a esta ficha.");
      return;
    }

    const hoursChunk = Math.ceil(selectedFicha.hoursRequired / 2);

    setLiveSchools((current) =>
      current.map((school) => {
        if (school.id !== selectedSchool.id) {
          return school;
        }

        const fichas = school.fichas.map((ficha) => {
          if (ficha.id !== selectedFicha.id) {
            return ficha;
          }

          const assignedInstructors = ficha.assignedInstructors.filter(
            (item) => item !== targetInstructorName,
          );
          const coverageStatus: CoordinatorArticulationFichaUnit["coverageStatus"] =
            assignedInstructors.length === 0
              ? "Sin asignar"
              : assignedInstructors.length === 1
                ? "Parcial"
                : "Completa";

          return {
            ...ficha,
            assignedInstructors,
            coverageStatus,
          };
        });

        return {
          ...school,
          fichas,
          generalCoverage: buildSchoolCoverage(fichas),
        };
      }),
    );

    updateInstructorHours(targetInstructorName, -hoursChunk);
    setFeedback(`Asignacion devuelta para ${targetInstructorName} en la ficha ${selectedFicha.number}.`);
  }

  return (
    <div className="grid gap-4 2xl:grid-cols-[0.92fr_1.12fr_0.96fr]">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Instructores de articulacion</CardTitle>
          <CardDescription>
            Lista compacta para escoger instructor compatible por programa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 xl:max-h-[calc(100vh-18rem)] xl:overflow-y-auto xl:pr-1">
          {liveInstructors.map((item) => {
            const active = item.id === selectedInstructorId;
            const compatible = selectedFicha ? compatibleInstructorIds.has(item.id) : false;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedInstructorId(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[1rem] border px-3 py-3 text-left transition-all",
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border/70 bg-white hover:border-primary/30 hover:bg-secondary/60",
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-secondary text-sm font-semibold text-secondary-foreground">
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="truncate font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.area} · {item.site}
                      </p>
                    </div>
                    <Badge variant={item.status === "Libre" ? "success" : item.status === "Parcial" ? "warning" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.hoursAssigned}h asignadas</span>
                    <span>•</span>
                    <span>{compatible ? "Compatible" : "Ver detalle"}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Colegios y fichas activas</CardTitle>
          <CardDescription>
            El colegio organiza la operacion; la ficha es la unidad real de trabajo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 xl:max-h-[calc(100vh-18rem)] xl:overflow-y-auto xl:pr-1">
          {liveSchools.map((school) => {
            const active = school.id === selectedSchoolId;
            const expanded = school.id === expandedSchoolId;

            return (
              <section
                key={school.id}
                className={cn(
                  "rounded-[1rem] border bg-white",
                  active ? "border-primary/50" : "border-border/70",
                )}
              >
                <button
                  type="button"
                  onClick={() => handleSelectSchool(school)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{school.name}</p>
                    <p className="text-sm text-muted-foreground">{school.address}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{school.city}</span>
                      <span>•</span>
                      <span>{school.totalFichas} fichas</span>
                    </div>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      {school.generalCoverage}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ConflictBadge
                      severity={
                        school.generalCoverage.includes("pendientes")
                          ? "alta"
                          : school.generalCoverage.includes("parciales")
                            ? "media"
                            : "baja"
                      }
                    />
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {expanded ? (
                  <div className="space-y-2 border-t border-border/70 px-3 py-3">
                    {school.fichas.map((ficha) => {
                      const fichaActive = ficha.id === selectedFichaId;

                      return (
                        <button
                          key={ficha.id}
                          type="button"
                          onClick={() => handleSelectFicha(school, ficha.id)}
                          className={cn(
                            "w-full rounded-[0.95rem] border px-3 py-3 text-left transition-all",
                            fichaActive
                              ? "border-primary bg-primary/5"
                              : ficha.coverageStatus === "Sin asignar"
                                ? "border-danger/30 bg-danger/5 hover:border-danger/50"
                                : "border-border/70 bg-background/60 hover:border-primary/30",
                          )}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-foreground">{ficha.number}</p>
                              <p className="text-sm text-muted-foreground">{ficha.program}</p>
                            </div>
                            <OperationalFichaStatusBadge status={ficha.coverageStatus} />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <ArticulationModeBadge mode={ficha.modality} />
                            <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {ficha.shift}
                            </span>
                            <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {ficha.hoursRequired}h
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {ficha.assignedInstructors.length
                              ? ficha.assignedInstructors.join(", ")
                              : "Sin instructor asignado"}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
        </CardContent>
      </Card>

      <Card className="h-full xl:sticky xl:top-[8.75rem]">
        <CardHeader>
          <CardTitle>Panel de asignacion</CardTitle>
          <CardDescription>
            Asigna instructor a la ficha seleccionada, no al colegio completo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <UserRound className="h-4 w-4 text-primary" />
              Instructor seleccionado
            </div>
            {selectedInstructor ? (
              <div className="mt-3 space-y-2">
                <p className="font-semibold text-foreground">{selectedInstructor.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedInstructor.area} · {selectedInstructor.site}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedInstructor.hoursAssigned}h asignadas
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Selecciona un instructor de articulacion.
              </p>
            )}
          </div>

          <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <School className="h-4 w-4 text-primary" />
              Ficha seleccionada
            </div>
            {selectedFicha && selectedSchool ? (
              <div className="mt-3 space-y-3">
                <p className="font-semibold text-foreground">{selectedFicha.number}</p>
                <p className="text-sm text-muted-foreground">{selectedSchool.name}</p>
                <div className="flex flex-wrap gap-2">
                  <ArticulationModeBadge mode={selectedFicha.modality} />
                  <OperationalFichaStatusBadge status={selectedFicha.coverageStatus} />
                  <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {selectedFicha.shift}
                  </span>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Selecciona un colegio y luego una ficha activa.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                Jornada
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedFicha ? selectedFicha.shift : "Sin seleccionar"}
              </p>
            </div>
            <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                Horas requeridas
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedFicha ? `${selectedFicha.hoursRequired} horas` : "Sin seleccionar"}
              </p>
            </div>
          </div>

          <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
            <p className="text-sm font-medium text-foreground">Consistencia operativa</p>
            {selectedFicha && selectedInstructor ? (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={isCompatible ? "success" : "warning"}>
                    {isCompatible ? "Compatible" : "Revisar compatibilidad"}
                  </Badge>
                  <Badge variant="secondary">{selectedFicha.apprenticeCount} aprendices</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isCompatible
                    ? `El instructor ${selectedInstructor.name} puede cubrir ${selectedFicha.program} en jornada ${selectedFicha.shift.toLowerCase()}.`
                    : `El area de ${selectedInstructor.name} no coincide con ${selectedFicha.program}.`}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Completa la seleccion de instructor y ficha para validar la asignacion.
              </p>
            )}
          </div>

          <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Asignaciones actuales
            </div>
            {selectedFicha?.assignedInstructors.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedFicha.assignedInstructors.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleUnassign(name)}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-foreground transition-colors hover:border-danger/40 hover:bg-danger/5"
                  >
                    <span>{name}</span>
                    <RotateCcw className="h-3.5 w-3.5 text-danger" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Esta ficha aun no tiene instructores asignados.
              </p>
            )}
          </div>

          {feedback ? (
            <div className="rounded-[1rem] border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
              {feedback}
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              className="w-full justify-between"
              disabled={!selectedFicha || !selectedInstructor || !isCompatible}
              onClick={handleAssign}
            >
              <span>Guardar asignacion</span>
              <CheckCircle2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={!selectedFicha?.assignedInstructors.length}
              onClick={() => handleUnassign()}
            >
              <span>Devolver asignacion</span>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
