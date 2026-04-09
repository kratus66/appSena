import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Metric } from "@/lib/types";

type KpiCardProps = {
  metric: Metric;
};

export function KpiCard({ metric }: KpiCardProps) {
  return (
    <Card className="animate-fade-up">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {metric.label}
            </p>
            <p className="mt-2 text-[1.75rem] font-semibold leading-none text-foreground">
              {metric.value}
            </p>
          </div>
          <Badge variant="secondary" className="gap-1 self-start normal-case tracking-[0.04em]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {metric.trend}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-px w-full bg-border/80" />
        <p className="text-sm text-muted-foreground">{metric.helper}</p>
      </CardContent>
    </Card>
  );
}
