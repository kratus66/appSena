"use client";

import { useState } from "react";
import {
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  Laptop2,
  School,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  AssignmentStatusBadge,
  AvailabilityBadge,
  DependencyBadge,
  EnvironmentStatusBadge,
  FichaStatusBadge,
  InstructorStatusBadge,
} from "@/components/coordinator/coordinator-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CoordinatorAssignmentDraft,
  CoordinatorEnvironment,
  CoordinatorFicha,
  CoordinatorInstructor,
  CoordinatorSchool,
} from "@/lib/types";

type AssignmentPlannerProps = {
  instructors: CoordinatorInstructor[];
  fichas: CoordinatorFicha[];
  schools: CoordinatorSchool[];
  environments: CoordinatorEnvironment[];
  assignments: CoordinatorAssignmentDraft[];
};

export function AssignmentPlanner({
  instructors,
  fichas,
  schools,
  environments,
  assignments,
}: AssignmentPlannerProps) {
  const initialFichaId =
    fichas.find((ficha) => ficha.status !== "En curso")?.id ?? fichas[0]?.id ?? "";
  const initialInstructorId =
    instructors.find((instructor) => instructor.status !== "No disponible")?.id ??
    instructors[0]?.id ??
    "";

  const [selectedFichaId, setSelectedFichaId] = useState(initialFichaId);
  const [selectedInstructorId, setSelectedInstructorId] = useState(initialInstructorId);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState("");
  const [notes, setNotes] = useState(
    "Priorizar cobertura continua y validar disponibilidad antes de confirmar.",
  );

  const selectedFicha = fichas.find((ficha) => ficha.id === selectedFichaId);
  const selectedInstructor = instructors.find(
    (instructor) => instructor.id === selectedInstructorId,
  );
  const suggestedInstructors = instructors.filter((instructor) => {
    if (!selectedFicha) {
      return true;
    }

    const matchesProgram = instructor.programs.some(
      (program) =>
        program.toLowerCase() === selectedFicha.program.toLowerCase() ||
        selectedFicha.program.toLowerCase().includes(program.toLowerCase()) ||
        program.toLowerCase().includes(selectedFicha.program.toLowerCase()),
    );

    const canHandleDependency =
      selectedFicha.dependency === "virtual"
        ? instructor.modalities.some((modality) => modality.toLowerCase() === "virtual")
        : instructor.modalities.some((modality) => modality.toLowerCase() !== "virtual");

    return matchesProgram && canHandleDependency && instructor.status !== "No disponible";
  });

  const availableSchools =
    selectedFicha?.dependency === "colegio"
      ? schools.filter((school) =>
          selectedFicha.suggestedCollegeId
            ? school.id === selectedFicha.suggestedCollegeId || school.status !== "Pendiente cupo"
            : true,
        )
      : [];

  const effectiveSchoolId =
    selectedFicha?.dependency !== "colegio"
      ? ""
      : availableSchools.some((school) => school.id === selectedSchoolId)
        ? selectedSchoolId
        : (
            availableSchools.find((school) => school.id === selectedFicha.suggestedCollegeId) ??
            availableSchools[0]
          )?.id ?? "";

  const selectedSchool = schools.find((school) => school.id === effectiveSchoolId);

  const availableEnvironments = environments.filter((environment) => {
    if (!selectedFicha || !selectedFicha.requiresEnvironment) {
      return false;
    }

    if (selectedFicha.dependency === "centro") {
      return (
        environment.dependency === "centro" &&
        environment.siteName === selectedFicha.center
      );
    }

    if (selectedFicha.dependency === "colegio") {
      return (
        environment.dependency === "colegio" &&
        (!selectedSchool || environment.siteName === selectedSchool.name)
      );
    }

    return false;
  });

  const effectiveEnvironmentId = availableEnvironments.some(
    (environment) => environment.id === selectedEnvironmentId,
  )
    ? selectedEnvironmentId
    : availableEnvironments[0]?.id ?? "";

  const selectedEnvironment = availableEnvironments.find(
    (environment) => environment.id === effectiveEnvironmentId,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Asignacion integral</CardTitle>
            <CardDescription>
              Selecciona instructor, ficha y dependencias fisicas solo cuando la operacion lo exija.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Ficha</label>
                <Select
                  value={selectedFichaId}
                  onChange={(event) => setSelectedFichaId(event.target.value)}
                >
                  {fichas.map((ficha) => (
                    <option key={ficha.id} value={ficha.id}>
                      {ficha.code} · {ficha.program} · {ficha.dependency}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Instructor</label>
                <Select
                  value={selectedInstructorId}
                  onChange={(event) => setSelectedInstructorId(event.target.value)}
                >
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name} · {instructor.specialty}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {selectedFicha?.dependency === "colegio" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Colegio aliado</label>
                <Select
                  value={effectiveSchoolId}
                  onChange={(event) => setSelectedSchoolId(event.target.value)}
                >
                  {availableSchools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name} · {school.city}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}

            {selectedFicha?.requiresEnvironment ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {selectedFicha.dependency === "colegio"
                    ? "Ambiente del colegio"
                    : "Ambiente del centro"}
                </label>
                <Select
                  value={effectiveEnvironmentId}
                  onChange={(event) => setSelectedEnvironmentId(event.target.value)}
                >
                  {availableEnvironments.length ? (
                    availableEnvironments.map((environment) => (
                      <option key={environment.id} value={environment.id}>
                        {environment.name} · {environment.siteName}
                      </option>
                    ))
                  ) : (
                    <option value="">Sin ambientes disponibles</option>
                  )}
                </Select>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-primary/20 bg-primary/5 p-4 text-sm text-primary">
                La ficha seleccionada opera en modalidad virtual. No se solicita colegio ni ambiente fisico.
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Horario objetivo</p>
                <p className="mt-2 font-semibold text-foreground">
                  {selectedFicha?.schedule ?? "Selecciona una ficha"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Carga actual del instructor</p>
                <p className="mt-2 font-semibold text-foreground">
                  {selectedInstructor
                    ? `${selectedInstructor.hoursAssigned}h · ${selectedInstructor.loadPercent}%`
                    : "Selecciona un instructor"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Notas operativas</label>
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button">
                <CheckCircle2 className="h-4 w-4" />
                Guardar propuesta
              </Button>
              <Button type="button" variant="outline">
                <ArrowRightLeft className="h-4 w-4" />
                Simular reasignacion
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la seleccion</CardTitle>
              <CardDescription>Lectura rapida del encaje operativo antes de confirmar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedFicha ? (
                <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                  <div className="flex flex-wrap gap-2">
                    <DependencyBadge dependency={selectedFicha.dependency} />
                    <FichaStatusBadge status={selectedFicha.status} />
                  </div>
                  <p className="mt-3 text-lg font-semibold text-foreground">
                    Ficha {selectedFicha.code} · {selectedFicha.program}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedFicha.center} · {selectedFicha.jornada} · {selectedFicha.apprentices} aprendices
                  </p>
                </div>
              ) : null}

              {selectedInstructor ? (
                <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                  <div className="flex flex-wrap gap-2">
                    <AvailabilityBadge availability={selectedInstructor.availability} />
                    <InstructorStatusBadge status={selectedInstructor.status} />
                  </div>
                  <p className="mt-3 text-lg font-semibold text-foreground">{selectedInstructor.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedInstructor.specialty} · {selectedInstructor.center}
                  </p>
                </div>
              ) : null}

              <div className="grid gap-3">
                {selectedFicha?.dependency === "colegio" ? (
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <School className="h-4 w-4 text-primary" />
                      Colegio requerido
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedSchool
                        ? `${selectedSchool.name} · ${selectedSchool.city}`
                        : "Selecciona un colegio disponible"}
                    </p>
                  </div>
                ) : null}

                {selectedFicha?.requiresEnvironment ? (
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Building2 className="h-4 w-4 text-primary" />
                      Ambiente asociado
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedEnvironment ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {selectedEnvironment.name} · {selectedEnvironment.siteName}
                          </p>
                          <EnvironmentStatusBadge status={selectedEnvironment.availability} />
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay ambiente confirmado aun.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Laptop2 className="h-4 w-4 text-primary" />
                      Operacion virtual
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      La ejecucion se resuelve sin ambiente fisico y prioriza conectividad.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Instructores recomendados</CardTitle>
                  <CardDescription>Compatibilidad por programa y modalidad.</CardDescription>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedInstructors.slice(0, 3).map((instructor) => (
                <div
                  key={instructor.id}
                  className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{instructor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {instructor.specialty} · {instructor.nextWindow}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AvailabilityBadge availability={instructor.availability} />
                      <InstructorStatusBadge status={instructor.status} />
                    </div>
                  </div>
                </div>
              ))}
              {!suggestedInstructors.length ? (
                <p className="text-sm text-muted-foreground">
                  No hay instructores compatibles inmediatos para la ficha actual.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asignaciones recientes</CardTitle>
          <CardDescription>
            Historial mock para validar cobertura, ajustes y dependencias ya resueltas.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border/70">
                <th className="px-0 py-3 font-medium">Ficha</th>
                <th className="px-4 py-3 font-medium">Instructor</th>
                <th className="px-4 py-3 font-medium">Dependencia</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => {
                const ficha = fichas.find((item) => item.id === assignment.fichaId);
                const instructor = instructors.find(
                  (item) => item.id === assignment.instructorId,
                );
                const school = schools.find((item) => item.id === assignment.schoolId);
                const environment = environments.find(
                  (item) => item.id === assignment.environmentId,
                );

                return (
                  <tr
                    key={assignment.id}
                    className="border-b border-border/50 align-top last:border-0"
                  >
                    <td className="px-0 py-4">
                      <p className="font-semibold text-foreground">
                        {ficha?.code} · {ficha?.program}
                      </p>
                      <p className="text-sm text-muted-foreground">{assignment.scheduleLabel}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <UserRound className="h-4 w-4 text-primary" />
                        {instructor?.name}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {school ? `${school.name} · ` : ""}
                      {environment ? environment.name : ficha?.dependency === "virtual" ? "Virtual" : "Sin ambiente"}
                    </td>
                    <td className="px-4 py-4">
                      <AssignmentStatusBadge status={assignment.status} />
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{assignment.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
