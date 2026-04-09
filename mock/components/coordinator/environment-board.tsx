import { Cpu, MapPinned, Users } from "lucide-react";

import { EnvironmentStatusBadge } from "@/components/coordinator/coordinator-badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoordinatorEnvironment } from "@/lib/types";

type EnvironmentBoardProps = {
  environments: CoordinatorEnvironment[];
};

export function EnvironmentBoard({ environments }: EnvironmentBoardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Disponibilidad de ambientes</CardTitle>
        <CardDescription>
          Capacidad, dependencia y equipamiento para soportar la asignacion semanal.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {environments.map((environment) => (
          <div
            key={environment.id}
            className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {environment.id}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{environment.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{environment.siteName}</p>
              </div>
              <EnvironmentStatusBadge status={environment.availability} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <MapPinned className="h-4 w-4 text-primary" />
                  Ubicacion
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {environment.city} · {environment.dependency}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Capacidad
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{environment.capacity} aprendices</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-white/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Cpu className="h-4 w-4 text-primary" />
                Equipamiento
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {environment.type} · {environment.equipment.join(" · ")}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
