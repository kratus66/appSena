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
      numeroFicha: string;
      programa?: {
        nombre: string;
      };
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
      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg text-gray-900">Información del Aprendiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <div>
            <p className="text-sm font-semibold text-gray-700">Nombre Completo</p>
            <p className="text-base text-gray-900">{ptc.aprendiz.nombres} {ptc.aprendiz.apellidos}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Documento</p>
            <p className="text-base text-gray-900">{ptc.aprendiz.documento}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Ficha</p>
            <p className="text-base text-gray-900">{ptc.ficha.numeroFicha}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Programa</p>
            <p className="text-base text-gray-900">{ptc.ficha.programa?.nombre || 'Sin programa'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg text-gray-900">Fechas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          <div>
            <p className="text-sm font-semibold text-gray-700">Fecha de Inicio</p>
            <p className="text-base text-gray-900">{formatDate(ptc.fechaInicio)}</p>
          </div>
          {ptc.fechaCierre && (
            <div>
              <p className="text-sm font-semibold text-gray-700">Fecha de Cierre</p>
              <p className="text-base text-gray-900">{formatDate(ptc.fechaCierre)}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-700">Creado</p>
            <p className="text-base text-gray-900">{formatDate(ptc.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Última Actualización</p>
            <p className="text-base text-gray-900">{formatDate(ptc.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 border-gray-200">
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle className="text-lg text-gray-900">Detalles del PTC</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Motivo</p>
            <p className="text-base text-gray-900">{ptc.motivo}</p>
          </div>
          {ptc.descripcion && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Descripción</p>
              <p className="text-base text-gray-900 whitespace-pre-wrap">{ptc.descripcion}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
