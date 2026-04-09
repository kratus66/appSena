import { CalendarRange, Layers3, School } from "lucide-react";

import {
  InstructorArticulationBadge,
  InstructorDependencyBadge,
} from "@/components/instructor/instructor-badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorAgendaEntry } from "@/lib/types";

type InstructorWeekCalendarProps = {
  entries: InstructorAgendaEntry[];
};

const dayOrder = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
];

export function InstructorWeekCalendar({
  entries,
}: InstructorWeekCalendarProps) {
  const days = dayOrder.map((dayName) => ({
    dayName,
    items: entries.filter((entry) => entry.dayName === dayName),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario semanal</CardTitle>
        <CardDescription>
          Vista mas densa para leer la semana completa por dia, dependencia y modalidad.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-5">
        {days.map((day) => (
          <div
            key={day.dayName}
            className="rounded-[1.75rem] border border-border/70 bg-background/80 p-4"
          >
            <div className="border-b border-border/70 pb-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Semana activa
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground">{day.dayName}</p>
            </div>
            <div className="mt-4 space-y-3">
              {day.items.length ? (
                day.items.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[1.35rem] border border-white/70 bg-white/85 p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {entry.startTime} - {entry.endTime}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{entry.programa}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <InstructorDependencyBadge dependency={entry.dependencia} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground">{entry.title}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{entry.sede}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <InstructorArticulationBadge articulation={entry.articulacion} />
                    </div>
                    <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Layers3 className="h-3.5 w-3.5 text-primary" />
                        {entry.ambiente}
                      </div>
                      <div className="flex items-center gap-2">
                        <School className="h-3.5 w-3.5 text-primary" />
                        {entry.colegio ?? "Sin colegio"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-border/80 bg-white/72 p-5 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CalendarRange className="h-5 w-5" />
                  </div>
                  <p className="mt-3 font-semibold text-foreground">Sin sesiones</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    No tienes bloques programados este dia.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
