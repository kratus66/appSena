'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ArrowLeft, Edit, FileText, User, Calendar, AlertCircle } from 'lucide-react';

interface DisciplinaryCase {
  id: string;
  ficha: {
    id: string;
    numeroFicha: string;
    programa?: {
      nombre: string;
    };
  };
  aprendiz: {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
  };
  tipo: string;
  gravedad: string;
  asunto: string;
  descripcion: string;
  fechaIncidente: string;
  estado: string;
  acciones: any[];
  createdAt: string;
  updatedAt: string;
}

const tipoLabels: Record<string, string> = {
  CONVIVENCIA: 'Convivencia',
  ACADEMICO: 'Académico',
  ASISTENCIA: 'Asistencia',
};

const gravedadColors: Record<string, string> = {
  LEVE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  MEDIA: 'bg-orange-100 text-orange-800 border-orange-200',
  ALTA: 'bg-red-100 text-red-800 border-red-200',
};

const estadoColors: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-800 border-gray-200',
  ABIERTO: 'bg-blue-100 text-blue-800 border-blue-200',
  SEGUIMIENTO: 'bg-purple-100 text-purple-800 border-purple-200',
  CERRADO: 'bg-green-100 text-green-800 border-green-200',
};

export default function DetalleCasoPage() {
  const router = useRouter();
  const params = useParams();
  const [caso, setCaso] = useState<DisciplinaryCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCaso();
    }
  }, [params.id]);

  const fetchCaso = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/disciplinario/casos/${params.id}`);
      setCaso(response.data);
    } catch (error) {
      console.error('Error al obtener caso:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-700 font-medium">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!caso) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-700 font-medium">Caso no encontrado</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detalle del Caso</h1>
              <p className="text-gray-700 mt-1 font-medium">{caso.asunto}</p>
            </div>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push(`/dashboard/disciplinario/${params.id}/editar`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-900 font-bold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Estado del Caso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge className={estadoColors[caso.estado]}>{caso.estado}</Badge>
              <Badge className={gravedadColors[caso.gravedad]}>{caso.gravedad}</Badge>
              <Badge variant="outline">{tipoLabels[caso.tipo] || caso.tipo}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-900 font-bold flex items-center gap-2">
                <User className="h-5 w-5" />
                Aprendiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-semibold text-gray-900">{caso.aprendiz.nombres} {caso.aprendiz.apellidos}</p>
              <p className="text-sm text-gray-700">Doc: {caso.aprendiz.documento}</p>
              <p className="text-sm text-gray-700">Ficha: {caso.ficha.numeroFicha}</p>
              {caso.ficha.programa && (
                <p className="text-sm text-gray-700">{caso.ficha.programa.nombre}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base text-gray-900 font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-xs text-gray-600">Incidente</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(caso.fechaIncidente)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Creado</p>
                <p className="text-sm font-semibold text-gray-900">{formatDate(caso.createdAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold">Descripción del Caso</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 whitespace-pre-wrap">{caso.descripcion}</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900 font-bold">Acciones Tomadas</CardTitle>
          </CardHeader>
          <CardContent>
            {caso.acciones && caso.acciones.length > 0 ? (
              <div className="space-y-4">
                {caso.acciones.map((accion: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-semibold text-gray-900">{accion.tipo}</p>
                    <p className="text-sm text-gray-700">{accion.descripcion}</p>
                    <p className="text-xs text-gray-600 mt-1">{formatDate(accion.fecha)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No hay acciones registradas</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
