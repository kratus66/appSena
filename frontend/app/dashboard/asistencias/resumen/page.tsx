'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { ResumenAsistencia } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function ResumenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fichaId = searchParams.get('fichaId') || '';

  const [resumen, setResumen] = useState<ResumenAsistencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    if (fichaId) {
      fetchResumen();
    }
  }, [fichaId, desde, hasta]);

  const fetchResumen = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (desde) params.append('desde', desde);
      if (hasta) params.append('hasta', hasta);

      const response = await api.get(
        `/asistencias/fichas/${fichaId}/resumen?${params}`
      );
      setResumen(response.data);
    } catch (error) {
      console.error('Error al obtener resumen:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColorAsistencia = (porcentaje: number) => {
    if (porcentaje >= 90) return 'text-green-600';
    if (porcentaje >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600"></div>
            <p className="mt-4 text-gray-600">Cargando resumen...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button onClick={() => router.back()} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            <BarChart3 className="w-8 h-8 inline-block mr-2 text-purple-600" />
            Resumen de Asistencias
        </h1>
        <p className="text-gray-600 mt-1">Ficha: {resumen?.numeroFicha}</p>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        <Button
          onClick={() => {
            setDesde('');
            setHasta('');
          }}
          variant="outline"
          className="mt-3"
        >
          Limpiar Filtros
        </Button>
      </Card>

      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Sesiones</div>
          <div className="text-4xl font-bold text-blue-600">
            {resumen?.totalSesiones || 0}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Total Aprendices</div>
          <div className="text-4xl font-bold text-gray-900">
            {resumen?.totalAprendices || 0}
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Asistencia Promedio</div>
          <div
            className={`text-4xl font-bold ${getColorAsistencia(
              resumen?.porcentajeAsistenciaPromedio || 0
            )}`}
          >
            {resumen?.porcentajeAsistenciaPromedio.toFixed(1) || 0}%
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600 mb-1">Con Ausencias</div>
          <div className="text-4xl font-bold text-orange-600">
            {resumen?.topAusencias.length || 0}
          </div>
        </Card>
      </div>

      {/* Gráfico de Asistencia (visual simple) */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Nivel de Asistencia
        </h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block text-purple-600">
                Porcentaje de Asistencia
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-purple-600">
                {resumen?.porcentajeAsistenciaPromedio.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-gray-200">
            <div
              style={{ width: `${resumen?.porcentajeAsistenciaPromedio}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                (resumen?.porcentajeAsistenciaPromedio || 0) >= 90
                  ? 'bg-green-500'
                  : (resumen?.porcentajeAsistenciaPromedio || 0) >= 75
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            ></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>0%</span>
          <span className="text-red-600">75% (Mínimo)</span>
          <span className="text-green-600">90% (Excelente)</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Top Ausencias */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Top 10 Aprendices con Más Ausencias
        </h2>
        {resumen && resumen.topAusencias.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-gray-600">
              ¡Excelente! No hay aprendices con ausencias sin justificar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ausencias
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resumen?.topAusencias.map((item, idx) => {
                  const porcentajeAusencias =
                    (item.totalAusencias / (resumen.totalSesiones || 1)) * 100;
                  return (
                    <tr key={item.aprendizId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.nombres} {item.apellidos}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.documento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-red-600">
                          {item.totalAusencias}
                        </div>
                        <div className="text-xs text-gray-500">
                          {porcentajeAusencias.toFixed(1)}% de ausencias
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {porcentajeAusencias > 25 ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            ⚠️ Alto Riesgo
                          </span>
                        ) : porcentajeAusencias > 10 ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ⚠️ Riesgo Medio
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Info adicional */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">ℹ️ Información</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Este resumen muestra las estadísticas de asistencia de la ficha.
          </li>
          <li>
            • Las ausencias mostradas son únicamente las <strong>no justificadas</strong>.
          </li>
          <li>
            • Se recomienda mantener un porcentaje de asistencia superior al 90%.
          </li>
          <li>
            • Para ver detalles de aprendices en riesgo, consulta la sección de Alertas.
          </li>
        </ul>
      </Card>
      </div>
    </DashboardLayout>
  );
}
