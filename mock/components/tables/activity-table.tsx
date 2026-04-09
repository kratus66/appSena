import { ActivityRow } from "@/lib/types";

import { StatusPill } from "@/components/status/status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";

type ActivityTableProps = {
  rows: ActivityRow[];
  title?: string;
  description?: string;
};

export function ActivityTable({
  rows,
  title = "Actividad reciente",
  description = "Eventos operativos y decisiones visibles para el equipo.",
}: ActivityTableProps) {
  if (!rows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Inbox}
            title="Sin actividad reciente"
            description="Cuando existan movimientos o alertas del modulo, apareceran aqui."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border/70">
              <th className="px-0 py-3 text-xs font-semibold uppercase tracking-[0.18em]">Item</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]">Responsable</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]">Estado</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em]">Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/50 transition-colors hover:bg-white/60 last:border-0"
              >
                <td className="px-0 py-4">
                  <div>
                    <p className="font-medium leading-6 text-foreground">{row.item}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{row.id}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-muted-foreground">{row.owner}</td>
                <td className="px-4 py-4">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-4 py-4 text-muted-foreground">{row.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
