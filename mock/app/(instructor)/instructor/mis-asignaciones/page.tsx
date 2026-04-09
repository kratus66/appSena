import { PageFilter } from "@/components/filters/page-filter";
import { InstructorAssignmentList } from "@/components/instructor/instructor-assignment-list";
import { PageIntro } from "@/components/layout/page-intro";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { instructorAssignments } from "@/lib/mocks/instructor";

export default function InstructorAsignacionesPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Carga academica"
        title="Mis asignaciones"
        description="Vista completa de tus fichas activas con dependencia, sede, ambiente, colegio y modalidad asociada."
        highlight="Cada bloque te deja leer rapido si la sesion ocurre en centro, colegio o campus virtual."
      />

      <PageFilter
        title="Segmentos personales"
        chips={["Confirmadas", "Centro", "Colegio", "Virtual"]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <InstructorAssignmentList assignments={instructorAssignments} />
        <Card>
          <CardHeader>
            <CardTitle>Claves de lectura</CardTitle>
            <CardDescription>Ayudas visuales para interpretar tus asignaciones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <p className="font-semibold text-foreground">Dependencia</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Indica si la clase ocurre en un centro propio, un colegio articulado o en entorno virtual.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <p className="font-semibold text-foreground">Articulacion</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cuando veas modalidad de articulacion, el bloque incluye reglas logisticas con aliado externo.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <p className="font-semibold text-foreground">Novedades</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Sirven para anticipar cambios de ambiente, enlaces virtuales o requisitos de ingreso.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
