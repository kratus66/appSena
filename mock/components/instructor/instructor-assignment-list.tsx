import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ClipboardList,
  GraduationCap,
  MapPin,
  School,
  Users,
} from "lucide-react";

import {
  InstructorArticulationBadge,
  InstructorDependencyBadge,
  InstructorStateBadge,
} from "@/components/instructor/instructor-badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorAssignmentDetail } from "@/lib/types";

type InstructorAssignmentListProps = {
  assignments: InstructorAssignmentDetail[];
  title?: string;
  description?: string;
};

export function InstructorAssignmentList({
  assignments,
  title = "Mis asignaciones",
  description = "Detalle completo de fichas, dependencias y lugar de ejecucion.",
}: InstructorAssignmentListProps) {
  if (!assignments.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Sin asignaciones activas"
        description="Cuando existan fichas asignadas, aqui veras lugar, dependencia y modalidad completa."
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
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Ficha {assignment.ficha}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  {assignment.programa}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {assignment.modalidad} · Jornada {assignment.jornada}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <InstructorDependencyBadge dependency={assignment.dependencia} />
                <InstructorArticulationBadge articulation={assignment.articulacion} />
                <InstructorStateBadge state={assignment.estado} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Horario
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{assignment.horario}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  Sede
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{assignment.sede}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Ambiente
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{assignment.ambiente}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Aprendices
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{assignment.aprendices} en grupo</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 md:col-span-2 xl:col-span-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <School className="h-4 w-4 text-primary" />
                  Colegio / articulacion
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {assignment.colegio
                    ? `${assignment.colegio} · ${assignment.articulacion}`
                    : assignment.articulacion}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-dashed border-border/80 bg-white/70 p-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-muted-foreground">{assignment.novedades}</p>
              <Button asChild variant="outline">
                <Link href={`/instructor/detalle-ficha/${assignment.ficha}`}>
                  Ver ficha
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
