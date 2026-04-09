"use client";

import { useMemo, useState } from "react";
import { Layers3 } from "lucide-react";

import {
  ArticulationModeBadge,
  OperationalDependencyBadge,
  OperationalFichaStatusBadge,
} from "@/components/coordinator/coordinator-badges";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { CoordinatorOperationalFicha } from "@/lib/types";
import { cn } from "@/lib/utils";

type CoordinatorFichaQueueProps = {
  fichas: CoordinatorOperationalFicha[];
  selectedId?: string;
  onSelect?: (id: string) => void;
};

export function CoordinatorFichaQueue({
  fichas,
  selectedId,
  onSelect,
}: CoordinatorFichaQueueProps) {
  const [siteFilter, setSiteFilter] = useState("Todas");
  const [dependencyFilter, setDependencyFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todas");

  const siteOptions = ["Todas", ...new Set(fichas.map((item) => item.site))];
  const dependencyOptions = ["Todas", ...new Set(fichas.map((item) => item.dependency))];
  const statusOptions = ["Todas", ...new Set(fichas.map((item) => item.status))];

  const filtered = useMemo(() => {
    return fichas.filter((item) => {
      const siteMatch = siteFilter === "Todas" || item.site === siteFilter;
      const dependencyMatch =
        dependencyFilter === "Todas" || item.dependency === dependencyFilter;
      const statusMatch = statusFilter === "Todas" || item.status === statusFilter;

      return siteMatch && dependencyMatch && statusMatch;
    });
  }, [dependencyFilter, fichas, siteFilter, statusFilter]);

  const statusSummary = statusOptions
    .filter((option) => option !== "Todas")
    .map((status) => ({
      status,
      count: filtered.filter((item) => item.status === status).length,
    }));

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="gap-4">
        <div>
          <CardTitle>Fichas pendientes y disponibles</CardTitle>
          <CardDescription>
            Cola operativa para seleccionar bloque, modalidad y estado sin perder ritmo.
          </CardDescription>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <Select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}>
            {siteOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            value={dependencyFilter}
            onChange={(event) => setDependencyFilter(event.target.value)}
          >
            {dependencyOptions.map((option) => (
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
          {statusSummary.map((item) => (
            <div
              key={item.status}
              className="rounded-full border border-border/80 bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
            >
              {item.status} · {item.count}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <div className="space-y-2 xl:max-h-[calc(100vh-21rem)] xl:overflow-y-auto xl:pr-1">
          {filtered.length ? (
            filtered.map((item) => {
              const active = item.id === selectedId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect?.(item.id)}
                  className={cn(
                    "w-full rounded-[1rem] border px-3 py-2.5 text-left transition-all",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border/70 bg-white hover:border-primary/30 hover:bg-secondary/60",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.number} · {item.program}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.site} · {item.block}
                      </p>
                    </div>
                    <OperationalFichaStatusBadge status={item.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <OperationalDependencyBadge dependency={item.dependency} />
                    <ArticulationModeBadge mode={item.articulationMode} />
                    <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {item.shift}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <EmptyState
              icon={Layers3}
              title="Sin fichas visibles"
              description="Ajusta los filtros para recuperar fichas disponibles o pendientes."
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
