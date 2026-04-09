import { CheckCircle2, ClipboardCheck, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorAttendanceEntry } from "@/lib/types";

type InstructorAttendancePanelProps = {
  entries: InstructorAttendanceEntry[];
};

function attendanceVariant(state: InstructorAttendanceEntry["state"]) {
  if (state === "Registrada") {
    return "success";
  }

  if (state === "Pendiente cierre") {
    return "warning";
  }

  return "secondary";
}

export function InstructorAttendancePanel({
  entries,
}: InstructorAttendancePanelProps) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Sin asistencia pendiente"
        description="Cuando haya sesiones por registrar, apareceran aqui con su porcentaje de avance."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asistencia</CardTitle>
        <CardDescription>Registro rapido de grupos activos y cierres pendientes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => {
          const progress = Math.round((entry.attended / entry.expected) * 100);

          return (
            <div
              key={entry.id}
              className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{entry.programa}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ficha {entry.ficha} · {entry.dateLabel}
                  </p>
                </div>
                <Badge variant={attendanceVariant(entry.state)}>{entry.state}</Badge>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ClipboardCheck className="h-4 w-4 text-primary" />
                    Esperados
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{entry.expected}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    Asisten
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{entry.attended}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <TimerReset className="h-4 w-4 text-warning-foreground" />
                    Pendientes
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{entry.pending}</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Avance del registro</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-muted">
                  <div
                    className="h-2.5 rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
