import {
  Clock3,
  MapPin,
  School,
} from "lucide-react";

import {
  InstructorArticulationBadge,
  InstructorDependencyBadge,
} from "@/components/instructor/instructor-badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { InstructorAgendaEntry } from "@/lib/types";

type InstructorAgendaBoardProps = {
  entries: InstructorAgendaEntry[];
  title?: string;
  description?: string;
};

export function InstructorAgendaBoard({
  entries,
  title = "Agenda simple",
  description = "Bloques visibles de la semana con contexto completo de ejecucion.",
}: InstructorAgendaBoardProps) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={Clock3}
        title="Sin sesiones programadas"
        description="Cuando existan bloques activos en tu agenda, apareceran aqui con su contexto completo."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="grid gap-4 rounded-[1.9rem] border border-border/70 bg-background/80 p-5 lg:grid-cols-[132px_1fr]"
          >
            <div className="rounded-[1.35rem] bg-gradient-to-br from-secondary to-white px-4 py-5 text-center text-secondary-foreground">
              <p className="text-xs uppercase tracking-[0.2em]">{entry.dayName}</p>
              <p className="mt-2 text-2xl font-semibold">{entry.dateLabel}</p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{entry.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ficha {entry.ficha} · {entry.programa}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <InstructorDependencyBadge dependency={entry.dependencia} />
                  <InstructorArticulationBadge articulation={entry.articulacion} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Horario
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.startTime} - {entry.endTime}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{entry.modalidad}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    Lugar
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{entry.sede}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{entry.ambiente}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-border/80 bg-white/70 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <School className="h-4 w-4 text-primary" />
                  {entry.colegio ? `Colegio: ${entry.colegio}` : "Sin colegio asociado"}
                </div>
                <p className="mt-2">{entry.note}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
