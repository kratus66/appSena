import { KpiCard } from "@/components/cards/kpi-card";
import { InstructorAttendancePanel } from "@/components/instructor/instructor-attendance-panel";
import { InstructorAgendaBoard } from "@/components/instructor/instructor-agenda-board";
import { InstructorAssignmentList } from "@/components/instructor/instructor-assignment-list";
import { InstructorEvidencePanel } from "@/components/instructor/instructor-evidence-panel";
import { InstructorSummaryPanel } from "@/components/instructor/instructor-summary-panel";
import { PageIntro } from "@/components/layout/page-intro";
import { ActivityTable } from "@/components/tables/activity-table";
import {
  instructorActivity,
  instructorAgenda,
  instructorAssignments,
  instructorAttendance,
  instructorEvidence,
  instructorMetrics,
} from "@/lib/mocks/instructor";

export default function InstructorInicioPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Instructor"
        title="Mi jornada formativa"
        description="Resumen personal de tus fichas, clases programadas y dependencias activas para la semana."
        highlight="Las asignaciones ya muestran ficha, programa, sede, ambiente, colegio y modalidad de articulacion cuando aplica."
      />

      <section className="grid gap-5 xl:grid-cols-3">
        {instructorMetrics.map((metric) => (
          <KpiCard key={metric.label} metric={metric} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <InstructorAssignmentList
          assignments={instructorAssignments.slice(0, 2)}
          title="Asignaciones destacadas"
          description="Las mas cercanas o con mayor dependencia operativa."
        />
        <InstructorSummaryPanel
          assignments={instructorAssignments}
          nextEntry={instructorAgenda[0]}
        />
      </div>

      <InstructorAgendaBoard
        entries={instructorAgenda.slice(0, 2)}
        title="Proximas sesiones"
        description="Agenda inmediata para preparar clase, ingreso o soporte virtual."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <InstructorAttendancePanel entries={instructorAttendance} />
        <InstructorEvidencePanel entries={instructorEvidence} />
      </div>

      <ActivityTable
        rows={instructorActivity}
        title="Pendientes y novedades"
        description="Alertas y ajustes recientes que impactan tu operacion."
      />
    </div>
  );
}
