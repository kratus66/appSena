"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Mail, Phone, UserRound } from "lucide-react";

import {
  InstructorStatusBadge,
  OperationalDependencyBadge,
} from "@/components/coordinator/coordinator-badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  CoordinatorOperationalDependency,
  CoordinatorOperationalInstructor,
  CoordinatorOperationalMetric,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type CoordinatorInstructorDirectoryProps = {
  instructors: CoordinatorOperationalInstructor[];
  metrics: CoordinatorOperationalMetric[];
};

const dependencies: CoordinatorOperationalDependency[] = [
  "Titulada",
  "Articulacion",
  "Complementaria",
];

export function CoordinatorInstructorDirectory({
  instructors,
  metrics,
}: CoordinatorInstructorDirectoryProps) {
  const [search, setSearch] = useState("");
  const [dependencyFilter, setDependencyFilter] = useState<"Todas" | CoordinatorOperationalDependency>(
    "Todas",
  );
  const [areaFilter, setAreaFilter] = useState("Todas");
  const [programFilter, setProgramFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedInstructorId, setSelectedInstructorId] = useState(instructors[0]?.id ?? "");

  const dependencyOptions = ["Todas", ...dependencies] as const;
  const areaOptions = ["Todas", ...new Set(instructors.map((item) => item.area))];
  const programOptions = ["Todos", ...new Set(instructors.map((item) => item.programType))];
  const statusOptions = ["Todos", ...new Set(instructors.map((item) => item.status))];

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return instructors.filter((item) => {
      const matchesSearch =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.phone.includes(normalized) ||
        item.personalEmail.toLowerCase().includes(normalized);
      const matchesDependency =
        dependencyFilter === "Todas" || item.dependency === dependencyFilter;
      const matchesArea = areaFilter === "Todas" || item.area === areaFilter;
      const matchesProgram = programFilter === "Todos" || item.programType === programFilter;
      const matchesStatus = statusFilter === "Todos" || item.status === statusFilter;

      return (
        matchesSearch &&
        matchesDependency &&
        matchesArea &&
        matchesProgram &&
        matchesStatus
      );
    });
  }, [areaFilter, dependencyFilter, instructors, programFilter, search, statusFilter]);

  const selectedInstructor = useMemo(
    () => filtered.find((item) => item.id === selectedInstructorId) ?? filtered[0],
    [filtered, selectedInstructorId],
  );

  const counters = dependencies.map((dependency) => ({
    dependency,
    count: filtered.filter((item) => item.dependency === dependency).length,
  }));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 xl:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[1rem] border border-border/80 bg-white px-4 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-1 text-[1.35rem] font-semibold leading-none text-foreground">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <Card className="overflow-visible">
        <CardHeader className="gap-4">
          <div>
            <CardTitle>Directorio de instructores</CardTitle>
            <CardDescription>
              Vista humana del equipo docente con acceso rapido al perfil. La sede activa sigue siendo administrativa; articulacion se lee por colegio y cobertura.
            </CardDescription>
          </div>
          <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_180px_220px_220px_170px]">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, telefono o correo"
              className="flex h-10 w-full rounded-[0.95rem] border border-input bg-white px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Select
              value={dependencyFilter}
              onChange={(event) =>
                setDependencyFilter(
                  event.target.value as "Todas" | CoordinatorOperationalDependency,
                )
              }
            >
              {dependencyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
              {areaOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select value={programFilter} onChange={(event) => setProgramFilter(event.target.value)}>
              {programOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            {counters.map((item) => (
              <div
                key={item.dependency}
                className="rounded-full border border-border/80 bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                {item.dependency} · {item.count}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {!filtered.length ? (
            <EmptyState
              icon={UserRound}
              title="Sin instructores visibles"
              description="Ajusta los filtros para recuperar perfiles dentro de la sede seleccionada."
            />
          ) : (
            <div className="grid items-start gap-4 xl:grid-cols-[1.4fr_0.6fr]">
              <div className="space-y-5">
                {dependencies.map((dependency) => {
                  const items = filtered.filter((item) => item.dependency === dependency);

                  if (!items.length) {
                    return null;
                  }

                  return (
                    <section key={dependency} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <OperationalDependencyBadge dependency={dependency} />
                        <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {items.length} perfiles
                        </span>
                      </div>

                      <div className="grid gap-3 xl:grid-cols-2">
                        {items.map((item) => {
                          const active = item.id === selectedInstructor?.id;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedInstructorId(item.id)}
                              className={cn(
                                "flex items-center gap-4 rounded-[1rem] border px-4 py-4 text-left transition-all",
                                active
                                  ? "border-primary bg-primary/5"
                                  : "border-border/70 bg-white hover:border-primary/30 hover:bg-secondary/60",
                              )}
                            >
                              <Image
                                src={item.photoUrl}
                                alt={`Foto de ${item.name}`}
                                width={64}
                                height={64}
                                unoptimized
                                className="h-16 w-16 rounded-[1rem] border border-border/70 object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate font-semibold text-foreground">{item.name}</p>
                                  <OperationalDependencyBadge dependency={item.dependency} />
                                </div>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                  <p className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    {item.phone}
                                  </p>
                                  <p className="flex items-center gap-2 truncate">
                                    <Mail className="h-3.5 w-3.5" />
                                    {item.personalEmail}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                                Ver perfil
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="xl:sticky xl:top-[8.25rem] xl:self-start">
                <Card className="border-border/80">
                <CardHeader>
                  <CardTitle>Perfil rapido</CardTitle>
                  <CardDescription>
                    Detalle operativo del instructor seleccionado sin salir de la pantalla.
                  </CardDescription>
                </CardHeader>
                <CardContent className="xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto">
                  {selectedInstructor ? (
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <Image
                          src={selectedInstructor.photoUrl}
                          alt={`Foto de ${selectedInstructor.name}`}
                          width={80}
                          height={80}
                          unoptimized
                          className="h-20 w-20 rounded-[1.1rem] border border-border/70 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-lg font-semibold text-foreground">
                            {selectedInstructor.name}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedInstructor.phone}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedInstructor.personalEmail}
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {selectedInstructor.dependency === "Articulacion" ? (
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-[1rem] border border-primary/15 bg-primary/5 p-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                                Colegio base
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {selectedInstructor.articulationSchool ?? "Pendiente"}
                              </p>
                            </div>
                            <div className="rounded-[1rem] border border-primary/15 bg-primary/5 p-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                                Modalidad
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {selectedInstructor.articulationMode ?? "Pendiente"}
                              </p>
                            </div>
                            <div className="rounded-[1rem] border border-primary/15 bg-primary/5 p-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                                Jornada
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {selectedInstructor.articulationShift ?? "Pendiente"}
                              </p>
                            </div>
                            <div className="rounded-[1rem] border border-primary/15 bg-primary/5 p-4">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                                Localidad
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {selectedInstructor.locality ?? selectedInstructor.site}
                              </p>
                            </div>
                          </div>
                        ) : null}
                        <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Profesion
                          </p>
                          <p className="mt-1 text-sm text-foreground">
                            {selectedInstructor.profession}
                          </p>
                        </div>
                        <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Area
                          </p>
                          <p className="mt-1 text-sm text-foreground">{selectedInstructor.area}</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Dependencia
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {selectedInstructor.dependency}
                            </p>
                          </div>
                          <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Tipo de programa
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {selectedInstructor.programType}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Estado
                          </p>
                          <div className="mt-2">
                            <InstructorStatusBadge status={selectedInstructor.status} />
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Inicio de contrato
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {selectedInstructor.contractStartDate}
                            </p>
                          </div>
                          <div className="rounded-[1rem] border border-border/70 bg-background/70 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              Fin de contrato
                            </p>
                            <p className="mt-1 text-sm text-foreground">
                              {selectedInstructor.contractEndDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={UserRound}
                      title="Sin perfil seleccionado"
                      description="Elige una tarjeta del directorio para abrir el detalle rapido del instructor."
                    />
                  )}
                </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
