import { CoordinatorOperationalMetric } from "@/lib/types";
import { cn } from "@/lib/utils";

type CoordinatorMetricStripProps = {
  metrics: CoordinatorOperationalMetric[];
};

export function CoordinatorMetricStrip({
  metrics,
}: CoordinatorMetricStripProps) {
  return (
    <section className="grid gap-3 xl:grid-cols-5">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-[1rem] border border-border/80 bg-white px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-1 text-[1.35rem] font-semibold leading-none text-foreground">
                {metric.value}
              </p>
            </div>
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                metric.tone === "danger"
                  ? "bg-danger"
                  : metric.tone === "warning"
                    ? "bg-warning"
                    : "bg-primary",
              )}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
