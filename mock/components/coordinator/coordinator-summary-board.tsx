import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, Layers3, Users } from "lucide-react";

import {
  ArticulationModeBadge,
  OperationalDependencyBadge,
  OperationalFichaStatusBadge,
} from "@/components/coordinator/coordinator-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CoordinatorOperationalDependency,
  CoordinatorOperationalFicha,
  CoordinatorOperationalInstructor,
} from "@/lib/types";

type CoordinatorSummaryBoardProps = {
  siteId: string;
  filters: string[];
  instructors: CoordinatorOperationalInstructor[];
  fichas: CoordinatorOperationalFicha[];
};

const dependencies: CoordinatorOperationalDependency[] = [
  "Articulacion",
  "Titulada",
  "Complementaria",
];

export function CoordinatorSummaryBoard({
  siteId,
  filters,
  instructors,
  fichas,
}: CoordinatorSummaryBoardProps) {
  const articulationContext = siteId === "articulacion";
  const pendingFichas = fichas.filter((item) => item.status === "Sin asignar");
  const highlightedFichas = pendingFichas.slice(0, 6);
  const shiftStats = [
    {
      label: "AM",
      count: fichas.filter((item) => item.shift === "AM").length,
    },
    {
      label: "PM",
      count: fichas.filter((item) => item.shift === "PM").length,
    },
  ];
  const modalityStats = Array.from(
    fichas.reduce((acc, item) => {
      const current = acc.get(item.articulationMode) ?? 0;
      acc.set(item.articulationMode, current + 1);
      return acc;
    }, new Map<string, number>()),
  )
    .filter(([mode]) => mode !== "No aplica")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const programStats = Array.from(
    pendingFichas.reduce((acc, item) => {
      const current = acc.get(item.program) ?? 0;
      acc.set(item.program, current + 1);
      return acc;
    }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const dependencyRows = dependencies.map((dependency) => ({
    dependency,
    instructors: instructors.filter((item) => item.dependency === dependency).length,
    pending: pendingFichas.filter((item) => item.dependency === dependency).length,
  }));
  const suggestedFicha = highlightedFichas[0];
  const suggestedInstructor = suggestedFicha
    ? instructors.find((item) => item.area === suggestedFicha.program)
    : undefined;
  const params = new URLSearchParams();

  params.set("site", siteId);
  filters.forEach((filter) => params.append("filter", filter));

  const query = params.toString();
  const fichasHref = `/coordinador/fichas?${query}`;
  const instructorsHref = `/coordinador/instructores?${query}`;
  const assignmentsHref = `/coordinador/asignaciones?${query}`;

  return (
    <div className="grid gap-4 2xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Pendientes prioritarios</CardTitle>
          <CardDescription>
            {articulationContext
              ? "Vista corta de las fichas de articulacion que requieren cobertura primero. No se cargan listas completas aqui."
              : "Vista corta de las fichas que requieren atencion primero. No se cargan listas completas aqui."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {highlightedFichas.map((ficha) => (
            <div
              key={ficha.id}
              className="rounded-[1rem] border border-border/70 bg-background/70 px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">
                    {ficha.number} · {ficha.program}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {articulationContext
                      ? `${ficha.schoolOptions[0] ?? "Colegio pendiente"} · ${ficha.block}`
                      : `${ficha.site} · ${ficha.block}`}
                  </p>
                </div>
                <OperationalFichaStatusBadge status={ficha.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <OperationalDependencyBadge dependency={ficha.dependency} />
                <ArticulationModeBadge mode={ficha.articulationMode} />
                <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {ficha.shift}
                </span>
              </div>
            </div>
          ))}
          <Button asChild variant="outline" className="w-full justify-between">
            <Link href={fichasHref}>
              Abrir cola completa de fichas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card>
        <CardHeader>
          <CardTitle>Estadisticas rapidas</CardTitle>
          <CardDescription>
            {articulationContext
              ? "Lectura corta de volumen, jornada y modalidades visibles en articulacion."
              : "Lectura corta de volumen, jornada y concentracion de la carga visible."}
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {shiftStats.map((shift) => (
                <div
                  key={shift.label}
                  className="rounded-[1rem] border border-border/70 bg-background/70 p-4"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Jornada {shift.label}
                  </div>
                  <p className="mt-2 text-[1.35rem] font-semibold text-foreground">
                    {shift.count}
                  </p>
                  <p className="text-sm text-muted-foreground">fichas visibles</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <BarChart3 className="h-4 w-4 text-primary" />
                Modalidades visibles
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {modalityStats.length ? (
                  modalityStats.map(([mode, count]) => (
                    <span
                      key={mode}
                      className="rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      {mode} · {count}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Sin modalidades visibles</span>
                )}
              </div>
            </div>

            <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Layers3 className="h-4 w-4 text-primary" />
                Programas con mas pendiente
              </div>
              <div className="mt-3 space-y-2">
                {programStats.length ? (
                  programStats.map(([program, count]) => (
                    <div
                      key={program}
                      className="flex items-center justify-between gap-3 rounded-[0.9rem] border border-border/70 bg-white px-3 py-2"
                    >
                      <p className="text-sm text-foreground">{program}</p>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        {count} fichas
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay programas pendientes con el filtro actual.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
        <CardHeader>
          <CardTitle>Lectura por dependencia</CardTitle>
          <CardDescription>
            {articulationContext
              ? "Resumen corto para saber si la carga visible sigue centrada en articulacion o si los filtros dejaron el tablero vacio."
              : "Resumen corto para saber donde vale la pena entrar a detalle."}
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-3">
            {dependencyRows.map((row) => (
              <div
                key={row.dependency}
                className="flex items-center justify-between gap-3 rounded-[1rem] border border-border/70 bg-background/70 px-4 py-3"
              >
                <div className="space-y-1">
                  <OperationalDependencyBadge dependency={row.dependency} />
                  <p className="text-sm text-muted-foreground">
                    {row.instructors} instructores · {row.pending} fichas sin asignar
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={row.dependency === "Titulada" || row.dependency === "Complementaria" ? fichasHref : instructorsHref}>
                    Ver
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
        <CardHeader>
          <CardTitle>Siguiente paso sugerido</CardTitle>
          <CardDescription>
            {articulationContext
              ? "Recomendacion corta para pasar de cobertura visible a planeacion con colegios."
              : "Recomendacion corta para entrar al flujo de asignacion sin ver todo el universo."}
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Layers3 className="h-4 w-4 text-primary" />
                  Ficha sugerida
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {suggestedFicha
                    ? `${suggestedFicha.number} · ${suggestedFicha.program}`
                    : "Sin fichas pendientes"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {suggestedFicha
                    ? articulationContext
                      ? `${suggestedFicha.schoolOptions[0] ?? "Colegio pendiente"} · ${suggestedFicha.shift}`
                      : `${suggestedFicha.block} · ${suggestedFicha.shift}`
                    : "Todo al dia"}
                </p>
              </div>
              <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Instructor sugerido
                </div>
                <p className="mt-2 text-sm text-foreground">
                  {suggestedInstructor ? suggestedInstructor.name : "Sin coincidencia rapida"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {suggestedInstructor ? suggestedInstructor.area : "Revisar manualmente"}
                </p>
              </div>
            </div>

            <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                Flujo recomendado
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {articulationContext
                  ? "Revisa la ficha sugerida, valida colegio e instructor compatible y entra a planeacion cuando ya tengas una decision clara."
                  : "Revisa la ficha sugerida, valida el instructor compatible y entra al modulo de asignaciones solo cuando ya tengas una decision clara."}
              </p>
            </div>

            <Button asChild className="w-full justify-between">
              <Link href={assignmentsHref}>
                Abrir modulo de asignaciones
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
