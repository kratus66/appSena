import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  School,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CoordinatorSchoolDetail, CoordinatorSchoolKind, CoordinatorSchoolOperationalStatus } from "@/lib/types";

type CoordinatorSchoolDetailViewProps = {
  school: CoordinatorSchoolDetail;
};

function buildBackHref() {
  return "/coordinador/colegios";
}

function kindBadgeVariant(kind: CoordinatorSchoolKind) {
  if (kind === "Publico") {
    return "default";
  }

  if (kind === "Privado") {
    return "secondary";
  }

  return "warning";
}

function statusBadgeVariant(status: CoordinatorSchoolOperationalStatus) {
  if (status === "Listo para asignacion") {
    return "success";
  }

  if (status === "Con horario definido") {
    return "secondary";
  }

  return "warning";
}

export function CoordinatorSchoolDetailView({
  school,
}: CoordinatorSchoolDetailViewProps) {
  const hasOperationalCondition = Boolean(
    school.senaCoverageSummary && school.participationMode && school.monthlyRule,
  );
  const hasAssociatedFichas = school.associatedFichas.length > 0;
  const isReady = school.hasSchedule && hasOperationalCondition && hasAssociatedFichas;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-primary/25 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <Link href={buildBackHref()}>
            <ArrowLeft className="h-4 w-4" />
            Volver a colegios
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={kindBadgeVariant(school.kind)}>{school.kind}</Badge>
                <Badge variant={statusBadgeVariant(school.operationalStatus)}>
                  {school.operationalStatus}
                </Badge>
              </div>
              <div>
                <CardTitle className="text-[1.55rem]">{school.name}</CardTitle>
                <CardDescription>
                  {school.address} · {school.city}
                </CardDescription>
              </div>
            </div>

            <div className="grid min-w-[260px] gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Tipo
                </p>
                <p className="mt-1 font-semibold text-foreground">{school.kind}</p>
              </div>
              <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Estado
                </p>
                <p className="mt-1 font-semibold text-foreground">{school.operationalStatus}</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_340px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Horario</CardTitle>
              <CardDescription>
                Configuracion de dias, jornadas y franjas activas del colegio para articulacion.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Dias de operacion</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{school.operatingDays}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-foreground">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">Jornadas habilitadas</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{school.journeys}</p>
              </div>
              <div className="sm:col-span-2 rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Franjas configuradas
                </p>
                {school.scheduleWindows.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {school.scheduleWindows.map((window) => (
                      <Badge key={window} variant="outline" className="bg-white">
                        {window}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aun no se han definido franjas operativas para este colegio.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Condicion operativa</CardTitle>
              <CardDescription>
                Lectura de la participacion del SENA y del tipo de acompanamiento esperado.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Tipo de colegio
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{school.kind}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Cobertura SENA
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {school.senaCoverageSummary}
                </p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Modalidad de participacion
                </p>
                <p className="mt-1 text-sm text-foreground">{school.participationMode}</p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Regla operativa
                </p>
                <p className="mt-1 text-sm text-foreground">{school.monthlyRule}</p>
              </div>
              <div className="sm:col-span-2 rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Observaciones
                </p>
                <p className="mt-1 text-sm text-foreground">{school.observations}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fichas asociadas</CardTitle>
              <CardDescription>
                Base de trabajo del colegio para futura asignacion de instructores de articulacion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!hasAssociatedFichas ? (
                <EmptyState
                  icon={GraduationCap}
                  title="Sin fichas asociadas"
                  description="Todavia no hay fichas relacionadas con este colegio. Mas adelante esta seccion servira para preparar la asignacion por ficha."
                />
              ) : (
                <div className="space-y-3">
                  {school.associatedFichas.map((ficha) => (
                    <div
                      key={ficha.id}
                      className="rounded-[1rem] border border-border/70 bg-white px-4 py-3"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">Ficha {ficha.number}</p>
                          <p className="text-sm text-muted-foreground">{ficha.program}</p>
                        </div>
                        <Badge
                          variant={
                            ficha.status === "Lista"
                              ? "success"
                              : ficha.status === "Parcial"
                                ? "warning"
                                : "outline"
                          }
                        >
                          {ficha.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Preparacion para asignacion</CardTitle>
              <CardDescription>
                Chequeo rapido del colegio antes de pasar a la logica de cobertura por ficha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Horario definido</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {school.hasSchedule
                      ? "El colegio ya tiene jornadas y franjas configuradas."
                      : "Falta definir el horario de operacion del colegio."}
                  </p>
                  <Badge variant={school.hasSchedule ? "success" : "warning"}>
                    {school.hasSchedule ? "Definido" : "Pendiente"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Condicion operativa definida
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {hasOperationalCondition
                      ? "Ya existe una lectura clara de cobertura y modalidad de participacion."
                      : "Aun falta completar la condicion operativa del colegio."}
                  </p>
                  <Badge variant={hasOperationalCondition ? "success" : "warning"}>
                    {hasOperationalCondition ? "Definida" : "Pendiente"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Fichas asociadas</p>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    {hasAssociatedFichas
                      ? `${school.associatedFichas.length} fichas ya estan relacionadas con este colegio.`
                      : "Todavia no se han asociado fichas a este colegio."}
                  </p>
                  <Badge variant={hasAssociatedFichas ? "success" : "warning"}>
                    {hasAssociatedFichas ? "Cargadas" : "Pendiente"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado final</CardTitle>
              <CardDescription>
                Resumen operativo del colegio para avanzar hacia la futura asignacion.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    {isReady ? "Listo para asignacion" : "Pendiente de alistamiento"}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isReady
                    ? "El colegio ya cuenta con horario, condicion operativa y fichas asociadas para iniciar cobertura."
                    : "Aun faltan definiciones basicas antes de usar este colegio en el flujo de asignacion."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={isReady ? "success" : "warning"}>
                    {isReady ? "Listo" : "Pendiente"}
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    {school.site}
                  </Badge>
                  <Badge variant="outline" className="bg-white">
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    {school.city}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
