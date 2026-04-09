import { Building2, CalendarDays, Mail, MapPinned } from "lucide-react";

import { SchoolStatusBadge } from "@/components/coordinator/coordinator-badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoordinatorSchool } from "@/lib/types";

type SchoolGridProps = {
  schools: CoordinatorSchool[];
};

export function SchoolGrid({ schools }: SchoolGridProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {schools.map((school) => (
        <Card key={school.id}>
          <CardHeader className="gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {school.id}
                </p>
                <CardTitle className="mt-2">{school.name}</CardTitle>
                <CardDescription className="mt-2">{school.coordinator}</CardDescription>
              </div>
              <SchoolStatusBadge status={school.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-background/80 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <MapPinned className="h-4 w-4 text-primary" />
                  Ciudad
                </div>
                <p className="mt-2">{school.city}</p>
              </div>
              <div className="rounded-2xl bg-background/80 p-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  Grupos activos
                </div>
                <p className="mt-2">{school.activeGroups} grupos</p>
              </div>
            </div>
            <div className="rounded-2xl bg-background/80 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Mail className="h-4 w-4 text-primary" />
                Contacto
              </div>
              <p className="mt-2">{school.contact}</p>
            </div>
            <div className="rounded-2xl bg-background/80 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Proxima visita
              </div>
              <p className="mt-2">{school.nextVisit}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {school.priorityPrograms.map((program) => (
                <span
                  key={program}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {program}
                </span>
              ))}
            </div>
            <div className="rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
              Ambientes reportados: {school.environments.join(" · ")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
