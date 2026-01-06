'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { Ficha, PaginatedResponse, CreateSesionDto } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft } from 'lucide-react';

export default function NuevaSesionPage() {
  const router = useRouter();
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSesionDto>({
    fichaId: '',
    fecha: new Date().toISOString().split('T')[0],
    tema: '',
    observaciones: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFichas();
  }, []);

  const fetchFichas = async () => {
    try {
      const response = await api.get<PaginatedResponse<Ficha>>('/fichas?limit=100');
      setFichas(response.data.data);
      if (response.data.data.length > 0) {
        setFormData((prev) => ({ ...prev, fichaId: response.data.data[0].id }));
      }
    } catch (error) {
      console.error('Error al obtener fichas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/asistencias/sesiones', formData);
      router.push('/dashboard/asistencias');
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          'Error al crear la sesión. Verifica que no exista una sesión para esta ficha en la misma fecha.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Sesión de Clase</h1>
          <p className="text-gray-600 mt-1">
            Crea una nueva sesión y registra la asistencia de los aprendices
          </p>
        </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Ficha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ficha <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.fichaId}
              onChange={(e) =>
                setFormData({ ...formData, fichaId: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una ficha</option>
              {fichas.map((ficha) => (
                <option key={ficha.id} value={ficha.id}>
                  {ficha.numeroFicha} - {ficha.programa?.nombre || 'Sin programa'} (
                  {ficha.jornada})
                </option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              required
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500 mt-1">
              No puedes crear sesiones para fechas futuras
            </p>
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema de la Sesión
            </label>
            <Input
              type="text"
              value={formData.tema}
              onChange={(e) =>
                setFormData({ ...formData, tema: e.target.value })
              }
              placeholder="Ej: Introducción a TypeORM y NestJS"
              maxLength={300}
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData({ ...formData, observaciones: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Agrega observaciones sobre la sesión (opcional)"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.fichaId}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Creando...' : 'Crear Sesión'}
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Al crear la sesión, se generarán registros de asistencia para todos los aprendices de la ficha.</li>
            <li>• Por defecto, todos los aprendices estarán marcados como ausentes.</li>
            <li>• Después de crear la sesión, podrás registrar la asistencia real.</li>
          </ul>
        </div>
      </Card>
      </div>
    </DashboardLayout>
  );
}
