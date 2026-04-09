import { BookCopy, MapPinned, School2, Timer } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorAgendaEntry, InstructorAssignmentDetail } from "@/lib/types";

type InstructorSummaryPanelProps = {
  assignments: InstructorAssignmentDetail[];
  nextEntry?: InstructorAgendaEntry;
};

export function InstructorSummaryPanel({
  assignments,
  nextEntry,
}: InstructorSummaryPanelProps) {
  const collegeAssignments = assignments.filter((item) => item.dependencia === "Colegio").length;
  const virtualAssignments = assignments.filter((item) => item.dependencia === "Virtual").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen rapido</CardTitle>
        <CardDescription>Lectura personal de contexto antes de iniciar la jornada.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <BookCopy className="h-4 w-4 text-primary" />
            Fichas asignadas
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {assignments.length} activas, con {collegeAssignments} en colegio y {virtualAssignments} virtuales.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <MapPinned className="h-4 w-4 text-primary" />
            Sedes de la semana
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {[...new Set(assignments.map((item) => item.sede))].slice(0, 3).join(" · ")}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <School2 className="h-4 w-4 text-primary" />
            Articulacion
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {collegeAssignments
              ? "Tienes una jornada articulada con colegio que requiere control de ingreso."
              : "No tienes clases en colegio programadas por ahora."}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <Timer className="h-4 w-4 text-primary" />
            Proximo bloque
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {nextEntry
              ? `${nextEntry.dayName} ${nextEntry.dateLabel} · ${nextEntry.startTime} - ${nextEntry.endTime}`
              : "Sin bloques programados"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
