'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PtcInfoTabProps {
  ptc: {
    motivo: string;
    descripcion: string;
    fechaInicio: string;
    fechaCierre?: string;
    createdAt: string;
    updatedAt: string;
    ficha: {
      numero: string;
      nombrePrograma: string;
    };
    aprendiz: {
      nombres: string;
      apellidos: string;
      documento: string;
    };
  };
  onUpdate: () => void;
}

export default function PtcInfoTab({ ptc }: PtcInfoTabProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información del Aprendiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nombre Completo</p>
            <p className="text-base">{ptc.aprendiz.nombres} {ptc.aprendiz.apellidos}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Documento</p>
            <p className="text-base">{ptc.aprendiz.documento}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Ficha</p>
            <p className="text-base">{ptc.ficha.numero}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Programa</p>
            <p className="text-base">{ptc.ficha.nombrePrograma}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fechas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fecha de Inicio</p>
            <p className="text-base">{formatDate(ptc.fechaInicio)}</p>
          </div>
          {ptc.fechaCierre && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fecha de Cierre</p>
              <p className="text-base">{formatDate(ptc.fechaCierre)}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Creado</p>
            <p className="text-base">{formatDate(ptc.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Última Actualización</p>
            <p className="text-base">{formatDate(ptc.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Detalles del PTC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Motivo</p>
            <p className="text-base">{ptc.motivo}</p>
          </div>
          {ptc.descripcion && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Descripción</p>
              <p className="text-base whitespace-pre-wrap">{ptc.descripcion}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
