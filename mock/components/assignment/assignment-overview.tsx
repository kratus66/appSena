import { Clock3, MapPin } from "lucide-react";

import { StatusPill } from "@/components/status/status-pill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentItem } from "@/lib/types";

type AssignmentOverviewProps = {
  items: AssignmentItem[];
  title?: string;
  description?: string;
};

export function AssignmentOverview({
  items,
  title = "Asignaciones destacadas",
  description = "Resumen operativo para priorizar acciones inmediatas.",
}: AssignmentOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.id}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {item.location}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {item.time}
                  </span>
                </div>
              </div>
              <StatusPill status={item.status} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
