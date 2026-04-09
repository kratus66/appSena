import { CheckCircle2, FileText, UserRoundPlus } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function CoordinadorNuevoInstructorPage() {
  return (
    <div className="space-y-8">
      <PageIntro
        eyebrow="Alta asistida"
        title="Nuevo instructor"
        description="Vista base para el futuro flujo de creacion, validacion documental y asignacion inicial."
        highlight="Todavia no hay persistencia: dejamos la estructura visual del formulario y el paso a paso."
      />
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Datos iniciales</CardTitle>
            <CardDescription>
              Bloque pensado para formularios con validacion, secciones y adjuntos.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre completo</label>
              <Input placeholder="Laura Martinez" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Correo</label>
              <Input placeholder="laura.martinez@institucion.edu.co" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Programa principal</label>
              <Input placeholder="Analisis y Desarrollo de Software" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Centro asignado</label>
              <Input placeholder="Centro Norte" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Observaciones iniciales</label>
              <Input placeholder="Disponibilidad, modalidad, observaciones de ingreso..." />
            </div>
            <div className="flex flex-wrap gap-3 pt-2 md:col-span-2">
              <Button>Guardar borrador</Button>
              <Button variant="outline">Validar documentos</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Secuencia sugerida</CardTitle>
            <CardDescription>Hoja de ruta de la experiencia para este modulo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-3">
                <UserRoundPlus className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">1. Datos basicos</p>
                  <p className="text-sm text-muted-foreground">Identidad, contacto y centro base.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">2. Soportes y perfil</p>
                  <p className="text-sm text-muted-foreground">Documentos, experticia y disponibilidad.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">3. Activacion operativa</p>
                  <p className="text-sm text-muted-foreground">Asignacion inicial, agenda y seguimiento.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
