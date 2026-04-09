import { AgendaItem } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AgendaPreviewProps = {
  items: AgendaItem[];
};

export function AgendaPreview({ items }: AgendaPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda proxima</CardTitle>
        <CardDescription>Vista previa del calendario operativo por rol.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[72px_1fr] gap-4 rounded-3xl border border-border/70 bg-white/80 p-4"
          >
            <div className="rounded-2xl bg-secondary px-3 py-4 text-center text-sm font-semibold text-secondary-foreground">
              {item.day}
            </div>
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.time}</p>
              <p className="text-sm text-muted-foreground">{item.place}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
