import Link from "next/link";
import { ArrowLeft, BookOpenCheck, Building2, School } from "lucide-react";

import {
  InstructorArticulationBadge,
  InstructorDependencyBadge,
  InstructorStateBadge,
} from "@/components/instructor/instructor-badges";
import { PageIntro } from "@/components/layout/page-intro";
import { ActivityTable } from "@/components/tables/activity-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { instructorActivity, instructorAssignments } from "@/lib/mocks/instructor";

type InstructorDetalleFichaPageProps = {
  params: {
    id: string;
  };
};

export default function InstructorDetalleFichaPage({
  params,
}: InstructorDetalleFichaPageProps) {
  const assignment = instructorAssignments.find((item) => item.ficha === params.id);

  if (!assignment) {
    return (
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href="/instructor/mis-asignaciones">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">
            No encontramos una ficha activa con el id {params.id}.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline">
          <Link href="/instructor/mis-asignaciones">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
        <Badge variant="secondary">Ficha {assignment.ficha}</Badge>
      </div>

      <PageIntro
        eyebrow="Detalle operativo"
        title={`Ficha ${assignment.ficha}`}
        description="Resumen extendido de la asignacion del instructor con lugar, dependencia y condiciones de ejecucion."
        highlight="Esta vista ya refleja la misma informacion visible en el portal del instructor para mantener consistencia."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.95fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-3xl bg-primary/10 p-3 text-primary">
                <BookOpenCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle>Resumen de ficha</CardTitle>
                <CardDescription>Contexto academico y logistico de la asignacion.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <InstructorDependencyBadge dependency={assignment.dependencia} />
              <InstructorArticulationBadge articulation={assignment.articulacion} />
              <InstructorStateBadge state={assignment.estado} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Programa</p>
                <p className="mt-2 font-semibold text-foreground">{assignment.programa}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Modalidad y jornada</p>
                <p className="mt-2 font-semibold text-foreground">
                  {assignment.modalidad} · {assignment.jornada}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Sede</p>
                <p className="mt-2 font-semibold text-foreground">{assignment.sede}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Ambiente</p>
                <p className="mt-2 font-semibold text-foreground">{assignment.ambiente}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Horario</p>
                <p className="mt-2 font-semibold text-foreground">{assignment.horario}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-sm text-muted-foreground">Aprendices</p>
                <p className="mt-2 font-semibold text-foreground">{assignment.aprendices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Condiciones de ejecucion</CardTitle>
            <CardDescription>Detalles utiles antes de impartir la sesion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Building2 className="h-4 w-4 text-primary" />
                Dependencia
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{assignment.dependencia}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <School className="h-4 w-4 text-primary" />
                Colegio / articulacion
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {assignment.colegio
                  ? `${assignment.colegio} · ${assignment.articulacion}`
                  : assignment.articulacion}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
              {assignment.novedades}
            </div>
          </CardContent>
        </Card>
      </div>

      <ActivityTable
        rows={instructorActivity}
        title="Novedades relacionadas"
        description="Referencias de operacion que pueden impactar la ficha o la jornada."
      />
    </div>
  );
}
