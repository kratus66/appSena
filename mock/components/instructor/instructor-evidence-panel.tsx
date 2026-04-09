import { CheckCheck, FileText, FolderClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorEvidenceEntry } from "@/lib/types";

type InstructorEvidencePanelProps = {
  entries: InstructorEvidenceEntry[];
};

function evidenceVariant(state: InstructorEvidenceEntry["state"]) {
  if (state === "Cargada") {
    return "success";
  }

  if (state === "Revisar") {
    return "warning";
  }

  return "secondary";
}

export function InstructorEvidencePanel({
  entries,
}: InstructorEvidencePanelProps) {
  if (!entries.length) {
    return (
      <EmptyState
        icon={FileText}
        title="Sin evidencias pendientes"
        description="Las evidencias de clase o soportes documentales apareceran aqui segun tus sesiones."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidencias de clase</CardTitle>
        <CardDescription>Cola de soportes por cargar, revisar o cerrar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{entry.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ficha {entry.ficha} · {entry.programa}
                </p>
              </div>
              <Badge variant={evidenceVariant(entry.state)}>{entry.state}</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FolderClock className="h-4 w-4 text-primary" />
                  Entrega
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{entry.dueLabel}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCheck className="h-4 w-4 text-primary" />
                  Canal
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{entry.channel}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{entry.type}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
