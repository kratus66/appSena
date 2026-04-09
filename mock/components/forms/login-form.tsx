import Link from "next/link";
import {
  ArrowRight,
  Building2,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const accessOptions = [
  {
    title: "Administrador",
    description: "Gestion institucional, usuarios, sedes y auditoria.",
    href: "/admin/dashboard",
    variant: "outline" as const,
  },
  {
    title: "Coordinador",
    description: "Operacion academica, planeacion y cobertura diaria.",
    href: "/coordinador/dashboard",
    variant: "default" as const,
  },
  {
    title: "Instructor",
    description: "Agenda, asignaciones y seguimiento de fichas activas.",
    href: "/instructor/inicio",
    variant: "secondary" as const,
  },
];

const highlights = [
  "Acceso por rol con experiencia diferenciada para coordinacion e instructores.",
  "Base preparada para autenticacion real, permisos y trazabilidad institucional.",
  "Interfaz alineada con operacion academica, cobertura y programacion.",
];

export function LoginForm() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(57,169,0,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(47,85,212,0.12),transparent_26%),linear-gradient(180deg,#f7faf8_0%,#f4f7f5_52%,#eef3f0_100%)]">
      <div className="absolute inset-x-0 top-0 h-1 sena-top-strip" />
      <div className="absolute left-[-8rem] top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-5rem] right-[-4rem] h-72 w-72 rounded-full bg-secondary/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1380px] items-start px-4 py-10 sm:px-6 xl:px-10">
        <div className="grid w-full items-start gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="flex flex-col justify-between rounded-[2rem] border border-white/80 bg-[linear-gradient(155deg,rgba(255,255,255,0.88)_0%,rgba(247,251,249,0.8)_100%)] p-6 shadow-[0_30px_80px_-56px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-8 xl:min-h-[720px] xl:p-10">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    SENA
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    Centro de Gestion Financiera
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Acceso institucional seguro
                </div>

                <div className="space-y-3">
                  <h1 className="max-w-2xl text-4xl leading-tight text-foreground sm:text-5xl">
                    Portal de gestion academica para instructores y coordinacion.
                  </h1>
                  <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                    Accede a una plataforma operativa para cobertura, fichas, colegios,
                    ambientes y planeacion institucional en un solo flujo de trabajo.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[1.15rem] border border-border/70 bg-white/75 px-4 py-4"
                  >
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm leading-6 text-foreground/90">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 rounded-[1.4rem] border border-border/70 bg-white/75 p-5 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Cobertura
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">125</p>
                <p className="mt-1 text-sm text-muted-foreground">Instructores en base operativa</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Articulacion
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">60</p>
                <p className="mt-1 text-sm text-muted-foreground">Instructores con cobertura media</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Operacion
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">7</p>
                <p className="mt-1 text-sm text-muted-foreground">Modulos base listos para demo</p>
              </div>
            </div>
          </section>

          <div className="flex items-start xl:justify-end">
            <Card className="w-full max-w-[560px] rounded-[2rem] border border-white/85 bg-white/88 shadow-[0_32px_80px_-54px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <CardContent className="space-y-7 p-6 sm:p-8 xl:p-10">
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                    Inicio de sesion
                  </p>
                  <div className="space-y-2">
                    <h2 className="text-3xl text-foreground">Ingresa al sistema</h2>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Usa tus credenciales institucionales para continuar. Por ahora, los accesos
                      son mock para navegar los distintos roles del producto.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                    >
                      Correo institucional
                    </label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nombre.apellido@sena.edu.co"
                        className="h-12 rounded-[1rem] pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <label
                        htmlFor="password"
                        className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                      >
                        Contrasena
                      </label>
                      <button
                        type="button"
                        className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        Recuperar acceso
                      </button>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Ingresa tu contrasena"
                        className="h-12 rounded-[1rem] pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-border/70 bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Accesos de demostracion</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Selecciona el rol para recorrer la plataforma.
                      </p>
                    </div>
                    <div className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                      Demo
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {accessOptions.map((option) => (
                      <div
                        key={option.title}
                        className="flex flex-col gap-3 rounded-[1.1rem] border border-border/70 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{option.title}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <Button asChild variant={option.variant} className="sm:min-w-[170px]">
                          <Link href={option.href}>
                            Entrar
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
