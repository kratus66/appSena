import { CalendarClock, Clock3 } from "lucide-react";

import {
  AvailabilityBadge,
  InstructorStatusBadge,
} from "@/components/coordinator/coordinator-badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoordinatorInstructor } from "@/lib/types";

type InstructorPoolProps = {
  instructors: CoordinatorInstructor[];
};

export function InstructorPool({ instructors }: InstructorPoolProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool de instructores</CardTitle>
        <CardDescription>
          Disponibilidad, carga academica y compatibilidad operativa para nuevas asignaciones.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border/70">
              <th className="px-0 py-3 font-medium">Instructor</th>
              <th className="px-4 py-3 font-medium">Especialidad</th>
              <th className="px-4 py-3 font-medium">Disponibilidad</th>
              <th className="px-4 py-3 font-medium">Carga</th>
              <th className="px-4 py-3 font-medium">Ventana libre</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor.id} className="border-b border-border/50 align-top last:border-0">
                <td className="px-0 py-4">
                  <div>
                    <p className="font-semibold text-foreground">{instructor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {instructor.center} · {instructor.city}
                    </p>
                    <p className="mt-2 flex flex-wrap gap-2">
                      <InstructorStatusBadge status={instructor.status} />
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                        {instructor.contractType}
                      </span>
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-foreground">{instructor.specialty}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {instructor.programs.join(" · ")}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {instructor.modalities.join(" / ")}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <AvailabilityBadge availability={instructor.availability} />
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-foreground">
                      <Clock3 className="h-4 w-4 text-primary" />
                      {instructor.hoursAssigned}h asignadas
                    </div>
                    <div className="h-2.5 rounded-full bg-muted">
                      <div
                        className="h-2.5 rounded-full bg-primary"
                        style={{ width: `${instructor.loadPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{instructor.loadPercent}% de carga</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-accent/60 px-3 py-2 text-xs font-medium text-accent-foreground">
                    <CalendarClock className="h-4 w-4" />
                    {instructor.nextWindow}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
