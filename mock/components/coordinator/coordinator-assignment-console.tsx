import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Layers3,
  School,
  UserRound,
} from "lucide-react";

import {
  ArticulationModeBadge,
  ConflictBadge,
  OperationalDependencyBadge,
  OperationalFichaStatusBadge,
} from "@/components/coordinator/coordinator-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  CoordinatorAssignmentConflict,
  CoordinatorOperationalFicha,
  CoordinatorOperationalInstructor,
} from "@/lib/types";

type CoordinatorAssignmentConsoleProps = {
  instructor?: CoordinatorOperationalInstructor;
  ficha?: CoordinatorOperationalFicha;
  school: string;
  onSchoolChange: (value: string) => void;
  environment: string;
  onEnvironmentChange: (value: string) => void;
  conflicts: CoordinatorAssignmentConflict[];
};

export function CoordinatorAssignmentConsole({
  instructor,
  ficha,
  school,
  onSchoolChange,
  environment,
  onEnvironmentChange,
  conflicts,
}: CoordinatorAssignmentConsoleProps) {
  const visibleConflicts = ficha?.dependency === "Articulacion" ? conflicts : conflicts.slice(0, 2);

  return (
    <Card className="h-full xl:sticky xl:top-[8.75rem]">
      <CardHeader>
        <CardTitle>Panel de asignacion integral</CardTitle>
        <CardDescription>
          Cruce final de instructor, ficha y recursos segun la dependencia.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <UserRound className="h-4 w-4 text-primary" />
            Instructor seleccionado
          </div>
          {instructor ? (
            <div className="mt-3 space-y-2">
              <p className="font-semibold text-foreground">{instructor.name}</p>
              <div className="flex flex-wrap gap-2">
                <OperationalDependencyBadge dependency={instructor.dependency} />
                <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {instructor.area}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {instructor.site} · {instructor.currentLoad}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Selecciona un instructor del pool izquierdo.
            </p>
          )}
        </div>

        <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Layers3 className="h-4 w-4 text-primary" />
            Ficha seleccionada
          </div>
          {ficha ? (
            <div className="mt-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                <OperationalDependencyBadge dependency={ficha.dependency} />
                <ArticulationModeBadge mode={ficha.articulationMode} />
                <OperationalFichaStatusBadge status={ficha.status} />
              </div>
              <p className="font-semibold text-foreground">
                {ficha.number} · {ficha.program}
              </p>
              <p className="text-sm text-muted-foreground">
                {ficha.site} · bloque {ficha.block}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Selecciona una ficha de la columna central.
            </p>
          )}
        </div>

        {ficha?.requiresSchool ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Colegio</label>
            <Select value={school} onChange={(event) => onSchoolChange(event.target.value)}>
              {ficha.schoolOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        {ficha?.requiresEnvironment ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ambiente</label>
            <Select
              value={environment}
              onChange={(event) => onEnvironmentChange(event.target.value)}
            >
              {ficha.environmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          ficha ? (
            <div className="rounded-[1rem] border border-dashed border-border/80 bg-background/70 p-4 text-sm text-muted-foreground">
              Esta ficha no requiere ambiente propio para guardar la asignacion.
            </div>
          ) : null
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              Bloque operativo
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {ficha ? ficha.block : "Selecciona ficha"}
            </p>
          </div>
          <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <School className="h-4 w-4 text-primary" />
              Resumen de consistencia
            </div>
            {instructor && ficha ? (
              <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                <p>Listo para guardar con revision de conflictos.</p>
                <ul className="space-y-1 text-xs uppercase tracking-[0.1em]">
                  <li>{ficha.requiresSchool ? `Colegio · ${school}` : "Colegio · No aplica"}</li>
                  <li>
                    {ficha.requiresEnvironment
                      ? `Ambiente · ${environment}`
                      : "Ambiente · No requerido"}
                  </li>
                </ul>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Faltan seleccion de instructor y ficha.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[1rem] border border-border/70 bg-background/80 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertTriangle className="h-4 w-4 text-warning-foreground" />
            Conflictos visibles
          </div>
          <div className="mt-3 space-y-3">
            {visibleConflicts.length ? (
              visibleConflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="rounded-[0.95rem] border border-border/70 bg-white px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-foreground">{conflict.message}</p>
                    <ConflictBadge severity={conflict.severity} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[0.95rem] border border-dashed border-border/70 bg-white px-3 py-3 text-sm text-muted-foreground">
                Sin conflictos operativos detectados. Todo el lote esta listo para iniciar asignacion.
              </div>
            )}
          </div>
        </div>

        <Button className="w-full justify-between">
          <span>Guardar asignacion</span>
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
