"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CoordinatorFichaShift, CoordinatorSchoolCard } from "@/lib/types";

const articulationModes = ["Compartida", "Unica", "Colegio privado"] as const;
const articulationShifts: Array<Extract<CoordinatorFichaShift, "Manana" | "Tarde">> = [
  "Manana",
  "Tarde",
];

type CoordinatorArticulationPlanningPanelProps = {
  schools: CoordinatorSchoolCard[];
  selectedSchoolId: string;
  onSchoolSelect: (schoolId: string) => void;
  selectedModality: (typeof articulationModes)[number];
  onModalityChange: (mode: (typeof articulationModes)[number]) => void;
  selectedShift: Extract<CoordinatorFichaShift, "Manana" | "Tarde">;
  onShiftChange: (shift: Extract<CoordinatorFichaShift, "Manana" | "Tarde">) => void;
  senaHours: number;
  stateLabel: string;
  ready: boolean;
};

export function CoordinatorArticulationPlanningPanel({
  schools,
  selectedSchoolId,
  onSchoolSelect,
  selectedModality,
  onModalityChange,
  selectedShift,
  onShiftChange,
  senaHours,
  stateLabel,
  ready,
}: CoordinatorArticulationPlanningPanelProps) {
  return (
    <Card className="border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,251,235,0.92)_0%,rgba(255,255,255,0.98)_100%)]">
      <CardHeader>
        <CardTitle>3. Planeacion articulacion por colegio</CardTitle>
        <CardDescription>
          Aqui se asignan instructores y fichas a colegios. Define el colegio, la modalidad y la jornada de cobertura sin usar ambientes del centro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-2">
          {schools.slice(0, 8).map((school) => {
            const selected = school.id === selectedSchoolId;

            return (
              <button
                key={school.id}
                type="button"
                onClick={() => onSchoolSelect(school.id)}
                className={cn(
                  "rounded-[1rem] border p-4 text-left transition-all",
                  selected
                    ? "border-primary bg-white shadow-[0_12px_24px_-20px_rgba(22,163,74,0.45)]"
                    : "border-amber-200/70 bg-white/80 hover:border-primary/20",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{school.name}</p>
                    <p className="text-sm text-muted-foreground">{school.address}</p>
                  </div>
                  <Badge variant="outline">{school.kind}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  <p>{school.city}</p>
                  <p>{school.scheduleLabel}</p>
                  <p>{school.senaCoverageSummary}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_280px]">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Modalidad</p>
            <div className="flex flex-wrap gap-2">
              {articulationModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onModalityChange(mode)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm font-semibold transition-all",
                    selectedModality === mode
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:text-foreground",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Jornada</p>
            <div className="flex flex-wrap gap-2">
              {articulationShifts.map((shift) => (
                <button
                  key={shift}
                  type="button"
                  onClick={() => onShiftChange(shift)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm font-semibold transition-all",
                    selectedShift === shift
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-white text-muted-foreground hover:border-primary/20 hover:text-foreground",
                  )}
                >
                  {shift}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1rem] border border-amber-200/70 bg-white/85 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Cobertura SENA
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{senaHours}h</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={ready ? "success" : "warning"}>{stateLabel}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
