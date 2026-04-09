import { PageFilter } from "@/components/filters/page-filter";
import { InstructorAgendaBoard } from "@/components/instructor/instructor-agenda-board";
import { InstructorWeekCalendar } from "@/components/instructor/instructor-week-calendar";
import { PageIntro } from "@/components/layout/page-intro";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { instructorAgenda } from "@/lib/mocks/instructor";

export default function InstructorAgendaPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Planeacion personal"
        title="Agenda simple"
        description="Lectura clara de tus bloques semanales con ficha, lugar, dependencia y notas operativas."
        highlight="Cuando una clase es articulada o de colegio, la agenda tambien muestra colegio y modalidad correspondiente."
      />

      <PageFilter
        title="Vista de agenda"
        chips={["Semana actual", "Centro", "Colegio", "Virtual"]}
      />

      <div className="grid gap-6">
        <InstructorWeekCalendar entries={instructorAgenda} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        <InstructorAgendaBoard
          entries={instructorAgenda}
          title="Detalle expandido de sesiones"
          description="Lectura completa por bloque con dependencia, ambiente y observaciones."
        />
        <Card>
          <CardHeader>
            <CardTitle>Preparacion sugerida</CardTitle>
            <CardDescription>Checklist simple para tus proximas jornadas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
              Verificar ambiente o enlace virtual antes del primer bloque del dia.
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
              Revisar si la dependencia es colegio para anticipar ingreso, lista y coordinacion local.
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
              Confirmar modalidad de articulacion cuando la sesion involucre aliados externos.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
