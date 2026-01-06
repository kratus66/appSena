'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { Aprendiz, RegistrarAsistenciaDto } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Users, CheckCircle, XCircle } from 'lucide-react';

interface AsistenciaState {
  aprendizId: string;
  presente: boolean;
  nombres: string;
  apellidos: string;
  documento: string;
}

export default function RegistrarAsistenciaPage() {
  const router = useRouter();
  const params = useParams();
  const sesionId = params.id as string;

  const [sesion, setSesion] = useState<any>(null);
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [asistencias, setAsistencias] = useState<AsistenciaState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSesion();
  }, [sesionId]);

  const fetchSesion = async () => {
    try {
      setLoading(true);
      const sesionResponse = await api.get(`/asistencias/sesiones/${sesionId}`);
      setSesion(sesionResponse.data);

      const aprendicesResponse = await api.get(
        `/aprendices?fichaId=${sesionResponse.data.fichaId}&limit=100`
      );
      const aprendicesData = aprendicesResponse.data.data;
      setAprendices(aprendicesData);

      // Inicializar todos como ausentes
      setAsistencias(
        aprendicesData.map((a: Aprendiz) => ({
          aprendizId: a.id,
          presente: false,
          nombres: a.nombres,
          apellidos: a.apellidos,
          documento: a.documento,
        }))
      );
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAsistencia = (aprendizId: string) => {
    setAsistencias((prev) =>
      prev.map((a) =>
        a.aprendizId === aprendizId ? { ...a, presente: !a.presente } : a
      )
    );
  };

  const marcarTodos = (presente: boolean) => {
    setAsistencias((prev) => prev.map((a) => ({ ...a, presente })));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const dto: RegistrarAsistenciaDto = {
        asistencias: asistencias.map((a) => ({
          aprendizId: a.aprendizId,
          presente: a.presente,
        })),
      };

      await api.post(`/asistencias/sesiones/${sesionId}/registrar`, dto);
      router.push('/dashboard/asistencias');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar asistencias');
    } finally {
      setSaving(false);
    }
  };

  const filteredAsistencias = asistencias.filter(
    (a) =>
      a.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.documento.includes(searchTerm)
  );

  const presentes = asistencias.filter((a) => a.presente).length;
  const ausentes = asistencias.length - presentes;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600"></div>
            <p className="mt-4 text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button onClick={() => router.back()} variant="outline" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
          ← Volver
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Registrar Asistencia</h1>
        <div className="mt-2 text-gray-600">
          <p>Fecha: {new Date(sesion?.fecha).toLocaleDateString('es-CO')}</p>
          <p>Tema: {sesion?.tema || 'Sin tema'}</p>
          <p>Ficha: {sesion?.ficha?.numeroFicha}</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total Aprendices</div>
          <div className="text-3xl font-bold text-gray-900">{asistencias.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Presentes</div>
          <div className="text-3xl font-bold text-green-600">{presentes}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Ausentes</div>
          <div className="text-3xl font-bold text-red-600">{ausentes}</div>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar por nombre o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            onClick={() => marcarTodos(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            ✓ Marcar Todos Presentes
          </Button>
          <Button
            onClick={() => marcarTodos(false)}
            className="bg-red-600 hover:bg-red-700"
          >
            ✗ Marcar Todos Ausentes
          </Button>
        </div>
      </Card>

      {/* Lista de asistencias */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Lista de Aprendices ({filteredAsistencias.length})
        </h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredAsistencias.map((asistencia) => (
            <div
              key={asistencia.aprendizId}
              onClick={() => toggleAsistencia(asistencia.aprendizId)}
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                asistencia.presente
                  ? 'bg-green-50 border-green-500'
                  : 'bg-gray-50 border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    asistencia.presente
                      ? 'bg-green-500 border-green-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {asistencia.presente && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {asistencia.nombres} {asistencia.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600">Doc: {asistencia.documento}</p>
                </div>
              </div>
              <div>
                {asistencia.presente ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Presente
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    Ausente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Botón guardar */}
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={() => router.back()} variant="outline" disabled={saving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Asistencias'}
        </Button>
      </div>
      </div>
    </DashboardLayout>
  );
}
