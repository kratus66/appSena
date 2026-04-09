import { FileUp, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UploadZone() {
  return (
    <Card className="border-dashed border-primary/20 bg-gradient-to-br from-white via-white to-secondary/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Importacion guiada de Excel</CardTitle>
            <CardDescription>
              Espacio visual para futuras cargas masivas, validaciones y trazabilidad.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Preparado
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex min-h-40 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-primary/20 bg-background/70 p-6 text-center">
          <div className="rounded-3xl bg-primary/10 p-4 text-primary">
            <FileUp className="h-6 w-6" />
          </div>
          <p className="mt-4 text-base font-semibold text-foreground">Suelta el archivo o selecciona una plantilla</p>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            En esta fase dejamos lista la experiencia base para importar instructores, fichas o asignaciones.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
