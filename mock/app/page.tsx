import Link from "next/link";
import { ArrowRight, Building2, GraduationCap, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const portals = [
  {
    href: "/admin/dashboard",
    title: "Portal administrador",
    description: "Gobierno de datos, sedes, usuarios y auditoria institucional.",
    icon: ShieldCheck,
  },
  {
    href: "/coordinador/dashboard",
    title: "Portal coordinador",
    description: "Operacion academica, asignaciones, fichas y seguimiento.",
    icon: Building2,
  },
  {
    href: "/instructor/inicio",
    title: "Portal instructor",
    description: "Agenda personal, fichas activas y seguimiento de jornada.",
    icon: GraduationCap,
  },
];

export default function HomePage() {
  return (
    <main className="container flex min-h-screen flex-col justify-center py-12">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.95fr]">
        <section className="space-y-6">
          <Badge variant="secondary" className="px-4 py-2 text-sm">
            Base SaaS con App Router
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold text-foreground sm:text-6xl">
              Gestion de instructores con una base clara, moderna y preparada para escalar.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              Este punto de partida organiza el proyecto por roles, layouts y componentes para que los
              modulos futuros compartan la misma experiencia institucional.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">
                Ir al acceso mock
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/coordinador/dashboard">Explorar dashboard coordinador</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4">
          {portals.map((portal) => {
            const Icon = portal.icon;

            return (
              <Card key={portal.href} className="glass-panel">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle>{portal.title}</CardTitle>
                    <CardDescription className="mt-2 max-w-md text-base">
                      {portal.description}
                    </CardDescription>
                  </div>
                  <div className="rounded-3xl bg-primary/10 p-4 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href={portal.href}>
                      Abrir espacio
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}
