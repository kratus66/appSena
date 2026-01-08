'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { AlertasResponse } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

function AlertasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fichaId = searchParams.get('fichaId') || '';

  const [alertas, setAlertas] = useState<AlertasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    if (fichaId) {
      fetchAlertas();
    }
  }, [fichaId, month]);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/asistencias/fichas/${fichaId}/alertas?month=${month}&includeDetails=true`
      );
      setAlertas(response.data);
    } catch (error) {
      console.error('Error al obtener alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCriterioBadge = (criterio: string) => {
    const config = {
      '3_CONSECUTIVAS': { color: 'bg-orange-100 text-orange-800', label: '3 Consecutivas' },
      '5_MES': { color: 'bg-red-100 text-red-800', label: '5 en el Mes' },
      'AMBAS': { color: 'bg-purple-100 text-purple-800', label: 'Ambos Criterios' },
    };
    return config[criterio as keyof typeof config] || { color: 'bg-gray-100 text-gray-800', label: criterio };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"></div>
            <p className="mt-4 text-gray-600">Cargando alertas...</p>
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
            <AlertTriangle className="w-8 h-8 inline-block mr-2 text-red-600" />
            Alertas de Riesgo de Deserción
          </h1>
          <div className="mt-2 text-gray-600">
            <p>Ficha: {alertas?.numeroFicha}</p>
            <p>Mes: {alertas?.mes}</p>
          </div>
        </div>

      {/* Selector de mes */}
      <Card className="p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Mes
        </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </Card>

      {/* Estadística */}
      <Card className="p-6 mb-6 bg-red-50 border-red-200">
        <div className="text-center">
          <div className="text-5xl font-bold text-red-600">
            {alertas?.alertas.length || 0}
          </div>
          <div className="text-gray-700 mt-2">
            Aprendices en riesgo de deserción
          </div>
        </div>
      </Card>

      {/* Lista de alertas */}
      {alertas && alertas.alertas.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No hay alertas activas
          </h2>
          <p className="text-gray-600">
            Todos los aprendices están cumpliendo con la asistencia mínima requerida.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {alertas?.alertas.map((alerta) => {
            const badge = getCriterioBadge(alerta.criterio);
            return (
              <Card key={alerta.aprendizId} className="p-6 border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {alerta.nombres} {alerta.apellidos}
                    </h3>
                    <p className="text-gray-600">Documento: {alerta.documento}</p>
                  </div>
                  <Badge className={badge.color}>{badge.label}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-700 mb-1">
                      Faltas Consecutivas
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {alerta.consecutivasNoJustificadas}
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-sm text-red-700 mb-1">
                      Faltas en el Mes
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {alerta.faltasMesNoJustificadas}
                    </div>
                  </div>
                </div>

                {alerta.sesionesDetalle && alerta.sesionesDetalle.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Historial reciente de asistencias:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {alerta.sesionesDetalle.slice(0, 8).map((sesion, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded text-center text-sm ${
                            sesion.presente
                              ? 'bg-green-100 text-green-800'
                              : sesion.justificada
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          <div className="font-semibold">
                            {new Date(sesion.fecha).toLocaleDateString('es-CO', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </div>
                          <div className="text-xs">
                            {sesion.presente
                              ? '✓ Presente'
                              : sesion.justificada
                              ? '⚠ Justificada'
                              : '✗ Ausente'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    📞 Acción Recomendada
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Contactar al aprendiz y/o acudiente para conocer la situación y
                    ofrecer apoyo. Considerar citar a reunión con coordinación.
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <Card className="p-6 mt-6 bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">ℹ️ Criterios de Alerta</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <Badge className="bg-orange-100 text-orange-800 mt-0.5">
              3 Consecutivas
            </Badge>
            <span>
              El aprendiz tiene 3 o más faltas consecutivas sin justificar
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="bg-red-100 text-red-800 mt-0.5">5 en el Mes</Badge>
            <span>
              El aprendiz tiene 5 o más faltas en el mes sin justificar
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Badge className="bg-purple-100 text-purple-800 mt-0.5">
              Ambos Criterios
            </Badge>
            <span>
              El aprendiz cumple ambos criterios (situación crítica)
            </span>
          </div>
        </div>
      </Card>
      </div>
    </DashboardLayout>
  );
}

export default function AlertasPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <AlertasContent />
    </Suspense>
  );
}
