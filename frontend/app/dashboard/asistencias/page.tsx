'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { ClaseSesion, PaginatedResponse, Ficha, AlertaRiesgo } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, AlertTriangle, BarChart3, ClipboardCheck } from 'lucide-react';

export default function AsistenciasPage() {
  const router = useRouter();
  const [sesiones, setSesiones] = useState<ClaseSesion[]>([]);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [alertas, setAlertas] = useState<AlertaRiesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFicha, setSelectedFicha] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchFichas();
  }, []);

  useEffect(() => {
    fetchSesiones();
    if (selectedFicha) {
      fetchAlertas();
    }
  }, [selectedFicha, page]);

  const fetchFichas = async () => {
    try {
      const response = await api.get<PaginatedResponse<Ficha>>('/fichas?limit=100');
      setFichas(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedFicha(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error al obtener fichas:', error);
    }
  };

  const fetchSesiones = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (selectedFicha) {
        params.append('fichaId', selectedFicha);
      }

      const response = await api.get<PaginatedResponse<ClaseSesion>>(
        `/asistencias/sesiones?${params}`
      );
      setSesiones(response.data.data);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertas = async () => {
    if (!selectedFicha) return;
    
    try {
      const mesActual = new Date().toISOString().slice(0, 7); // YYYY-MM
      const response = await api.get(
        `/asistencias/fichas/${selectedFicha}/alertas?month=${mesActual}`
      );
      setAlertas(response.data.alertas || []);
    } catch (error) {
      console.error('Error al obtener alertas:', error);
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCriterioBadge = (criterio: string) => {
    const colors = {
      '3_CONSECUTIVAS': 'bg-orange-100 text-orange-800',
      '5_MES': 'bg-red-100 text-red-800',
      'AMBAS': 'bg-purple-100 text-purple-800',
    };
    return colors[criterio as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Asistencias</h1>
            <p className="text-gray-600 mt-1">
              Control de sesiones, asistencias y alertas de deserción
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/asistencias/nueva-sesion')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Sesión
          </Button>
        </div>

      {/* Selector de Ficha */}
      <Card className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Ficha
        </label>
        <select
          value={selectedFicha}
          onChange={(e) => setSelectedFicha(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las fichas</option>
          {fichas.map((ficha) => (
            <option key={ficha.id} value={ficha.id}>
              {ficha.numeroFicha} - {ficha.programa?.nombre || 'Sin programa'}
            </option>
          ))}
        </select>
      </Card>

      {/* Alertas de Riesgo */}
      {alertas.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-4">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold text-red-800">
              ⚠️ Alertas de Riesgo de Deserción ({alertas.length})
            </h2>
          </div>
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div
                key={alerta.aprendizId}
                className="bg-white p-4 rounded-lg border border-red-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {alerta.nombres} {alerta.apellidos}
                    </h3>
                    <p className="text-sm text-gray-600">Doc: {alerta.documento}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-700">
                        🔴 Faltas consecutivas: <strong>{alerta.consecutivasNoJustificadas}</strong>
                      </p>
                      <p className="text-sm text-gray-700">
                        📅 Faltas del mes: <strong>{alerta.faltasMesNoJustificadas}</strong>
                      </p>
                    </div>
                  </div>
                  <Badge className={getCriterioBadge(alerta.criterio)}>
                    {alerta.criterio.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={() => router.push(`/dashboard/asistencias/alertas?fichaId=${selectedFicha}`)}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Ver Todas las Alertas
          </Button>
        </Card>
      )}

      {/* Lista de Sesiones */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sesiones de Clase</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando sesiones...</p>
          </div>
        ) : sesiones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No hay sesiones registradas</p>
            <Button
              onClick={() => router.push('/dashboard/asistencias/nueva-sesion')}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              Crear primera sesión
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {sesiones.map((sesion) => (
                <div
                  key={sesion.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                        {formatFecha(sesion.fecha)}
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {sesion.tema || 'Sin tema'}
                      </h3>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <span>Ficha: {sesion.ficha?.numeroFicha || sesion.fichaId}</span>
                      {sesion.resumen && (
                        <>
                          <span className="text-green-600">
                            ✓ {sesion.resumen.presentes} presentes
                          </span>
                          <span className="text-red-600">
                            ✗ {sesion.resumen.ausentes} ausentes
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        router.push(`/dashboard/asistencias/sesion/${sesion.id}`)
                      }
                      variant="outline"
                      size="sm"
                    >
                      Ver Detalle
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(`/dashboard/asistencias/registrar/${sesion.id}`)
                      }
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      Registrar Asistencia
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {total > 10 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant="outline"
                  size="sm"
                >
                  Anterior
                </Button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Página {page} de {Math.ceil(total / 10)}
                </span>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                  variant="outline"
                  size="sm"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Botón Ver Resumen */}
      {selectedFicha && (
        <Card className="p-4">
          <Button
            onClick={() => router.push(`/dashboard/asistencias/resumen?fichaId=${selectedFicha}`)}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            📊 Ver Resumen de Asistencias
          </Button>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}
