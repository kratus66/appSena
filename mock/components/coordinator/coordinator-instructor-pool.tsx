"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  OperationalDependencyBadge,
} from "@/components/coordinator/coordinator-badges";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { CoordinatorOperationalDependency, CoordinatorOperationalInstructor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";

type CoordinatorInstructorPoolProps = {
  instructors: CoordinatorOperationalInstructor[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  note?: string;
};

const dependencies: CoordinatorOperationalDependency[] = [
  "Articulacion",
  "Titulada",
  "Complementaria",
];

export function CoordinatorInstructorPool({
  instructors,
  selectedId,
  onSelect,
  note,
}: CoordinatorInstructorPoolProps) {
  const [siteFilter, setSiteFilter] = useState("Todas");
  const [areaFilter, setAreaFilter] = useState("Todas");

  const siteOptions = ["Todas", ...new Set(instructors.map((item) => item.site))];
  const areaOptions = ["Todas", ...new Set(instructors.map((item) => item.area))];

  const filtered = useMemo(() => {
    return instructors.filter((item) => {
      const siteMatch = siteFilter === "Todas" || item.site === siteFilter;
      const areaMatch = areaFilter === "Todas" || item.area === areaFilter;

      return siteMatch && areaMatch;
    });
  }, [areaFilter, instructors, siteFilter]);

  const totalsByDependency = dependencies.map((dependency) => ({
    dependency,
    total: instructors.filter((item) => item.dependency === dependency).length,
    visible: filtered.filter((item) => item.dependency === dependency).length,
  }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-4">
        <div>
          <CardTitle>Pool de instructores</CardTitle>
          <CardDescription>
            Pool separado por dependencia, con todo el personal disponible para asignacion.
          </CardDescription>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <Select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}>
            {siteOptions.map((option) => (
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
        </div>
        <div className="flex flex-wrap gap-2">
          {totalsByDependency.map((item) => (
            <div
              key={item.dependency}
              className="rounded-full border border-border/80 bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
            >
              {item.dependency} · {item.visible}/{item.total}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-5 xl:max-h-[calc(100vh-21rem)] xl:overflow-y-auto xl:pr-1">
          {dependencies.map((dependency) => {
            const items = filtered.filter((item) => item.dependency === dependency);

            return (
              <section key={dependency} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <OperationalDependencyBadge dependency={dependency} />
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {items.length} visibles
                    </span>
                  </div>
                </div>

                {items.length ? (
                  <div className="space-y-2">
                    {items.map((item) => {
                      const active = item.id === selectedId;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onSelect?.(item.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[1rem] border px-3 py-2.5 text-left transition-all",
                            active
                              ? "border-primary bg-primary/5"
                              : "border-border/70 bg-white hover:border-primary/30 hover:bg-secondary/60",
                          )}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-[0.85rem] bg-secondary text-sm font-semibold text-secondary-foreground">
                            {item.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <p className="truncate font-semibold text-foreground">{item.name}</p>
                              <Badge variant="success">
                                {item.status}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.area} · {item.programType}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span>{item.site}</span>
                              <span>•</span>
                              <span>{item.currentLoad}</span>
                              <span>•</span>
                              <span>{item.activeBlocks} bloques</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={UserRound}
                    title={`Sin instructores de ${dependency.toLowerCase()}`}
                    description="Ajusta los filtros para recuperar resultados en esta dependencia."
                  />
                )}
              </section>
            );
          })}
          {note ? (
            <p className="rounded-[1rem] border border-dashed border-border/70 bg-background/70 px-3 py-3 text-sm text-muted-foreground">
              {note}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
