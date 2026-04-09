import { AgendaPreview } from "@/components/calendar/agenda-preview";
import { AssignmentOverview } from "@/components/assignment/assignment-overview";
import { KpiCard } from "@/components/cards/kpi-card";
import { PageIntro } from "@/components/layout/page-intro";
import { ActivityTable } from "@/components/tables/activity-table";
import { dashboardByRole } from "@/lib/mocks/dashboard";

const data = dashboardByRole.admin;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Administrador"
        title={data.title}
        description={data.description}
        highlight="La experiencia ya separa navegacion, header superior y secciones listas para politicas y permisos reales."
      />
      <section className="grid gap-5 xl:grid-cols-3">
        {data.metrics.map((metric) => (
          <KpiCard key={metric.label} metric={metric} />
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <ActivityTable rows={data.activity} />
        <AgendaPreview items={data.agenda} />
      </div>
      <AssignmentOverview
        items={data.assignments}
        title="Comites y acciones clave"
        description="Bloque util para iniciativas institucionales, auditorias o aprobaciones transversales."
      />
    </div>
  );
}
