import { ArrowRight } from "lucide-react";

import { KpiCard } from "@/components/cards/kpi-card";
import { PageFilter } from "@/components/filters/page-filter";
import { PageIntro } from "@/components/layout/page-intro";
import { ActivityTable } from "@/components/tables/activity-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityRow, Metric } from "@/lib/types";

type ModulePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  highlight: string;
  filters: string[];
  metrics: Metric[];
  activity: ActivityRow[];
  nextStep: string;
};

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  highlight,
  filters,
  metrics,
  activity,
  nextStep,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-8">
      <PageIntro eyebrow={eyebrow} title={title} description={description} highlight={highlight} />
      <PageFilter title="Filtros de referencia" chips={filters} />
      <section className="grid gap-5 xl:grid-cols-3">
        {metrics.map((metric) => (
          <KpiCard key={metric.label} metric={metric} />
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <ActivityTable rows={activity} />
        <Card>
          <CardContent className="flex h-full flex-col justify-between gap-6 p-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Siguiente fase</p>
              <h2 className="text-2xl font-semibold text-foreground">Modulo listo para crecer</h2>
              <p className="text-sm leading-6 text-muted-foreground">{nextStep}</p>
            </div>
            <Button variant="outline" className="justify-between">
              Definir reglas de negocio
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
