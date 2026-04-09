import { SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type PageFilterProps = {
  title: string;
  chips: string[];
};

export function PageFilter({ title, chips }: PageFilterProps) {
  return (
    <Card className="border-dashed border-border/80">
      <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-[0.9rem] bg-secondary p-2.5 text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">
              Segmentos listos para filtrar sin recargar la pantalla.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Badge key={chip} variant="outline">
              {chip}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
