import { BookOpen, Building2, CalendarRange, UsersRound } from "lucide-react";

import {
  DependencyBadge,
  FichaStatusBadge,
} from "@/components/coordinator/coordinator-badges";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CoordinatorFicha } from "@/lib/types";

type FichaBoardProps = {
  fichas: CoordinatorFicha[];
};

export function FichaBoard({ fichas }: FichaBoardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fichas activas y por cubrir</CardTitle>
        <CardDescription>
          Vista de planeacion para leer dependencia, jornada, cobertura y requerimientos.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {fichas.map((ficha) => (
          <div
            key={ficha.id}
            className="rounded-[1.75rem] border border-border/70 bg-background/80 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Ficha {ficha.code}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-foreground">{ficha.program}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {ficha.center} · {ficha.city}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <DependencyBadge dependency={ficha.dependency} />
                <FichaStatusBadge status={ficha.status} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarRange className="h-4 w-4 text-primary" />
                  Jornada
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {ficha.jornada} · {ficha.schedule}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <UsersRound className="h-4 w-4 text-primary" />
                  Aprendices
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ficha.apprentices} en etapa {ficha.stage}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Modalidad
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{ficha.modality}</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  Requerimientos
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {ficha.dependency === "colegio"
                    ? "Necesita colegio aliado confirmado"
                    : ficha.dependency === "virtual"
                      ? "No requiere ambiente fisico"
                      : "Opera en ambiente del centro"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ficha.requiresEnvironment ? "Ambiente requerido" : "Ambiente opcional"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
