'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditarCasoPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    tipo: 'CONVIVENCIA',
    gravedad: 'LEVE',
    asunto: '',
    descripcion: '',
    fechaIncidente: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchCaso();
    }
  }, [params.id]);

  const fetchCaso = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/disciplinario/casos/${params.id}`);
      const caso = response.data;
      
      setFormData({
        tipo: caso.tipo,
        gravedad: caso.gravedad,
        asunto: caso.asunto,
        descripcion: caso.descripcion,
        fechaIncidente: caso.fechaIncidente.split('T')[0],
      });
    } catch (error) {
      console.error('Error al obtener caso:', error);
      alert('Error al cargar los datos del caso');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Solo enviar los campos permitidos por el backend
      const payload = {
        tipo: formData.tipo,
        gravedad: formData.gravedad,
        asunto: formData.asunto,
        descripcion: formData.descripcion,
        fechaIncidente: new Date(formData.fechaIncidente).toISOString(),
      };
      
      await api.patch(`/disciplinario/casos/${params.id}`, payload);
      alert('Caso actualizado exitosamente');
      router.push(`/dashboard/disciplinario/${params.id}`);
    } catch (error: any) {
      console.error('Error al actualizar caso:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el caso';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-700 font-medium">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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
            <h1 className="text-3xl font-bold text-gray-900">Editar Caso Disciplinario</h1>
            <p className="text-gray-700 mt-1 font-medium">Modifica la información del caso</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900 font-bold">Información del Caso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo" className="text-gray-900 font-semibold">Tipo de Caso *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONVIVENCIA">Convivencia</SelectItem>
                      <SelectItem value="ACADEMICO">Académico</SelectItem>
                      <SelectItem value="ASISTENCIA">Asistencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gravedad" className="text-gray-900 font-semibold">Gravedad *</Label>
                  <Select value={formData.gravedad} onValueChange={(value) => handleChange('gravedad', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEVE">Leve</SelectItem>
                      <SelectItem value="MEDIA">Media</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaIncidente" className="text-gray-900 font-semibold">Fecha del Incidente *</Label>
                  <Input
                    id="fechaIncidente"
                    type="date"
                    value={formData.fechaIncidente}
                    onChange={(e) => handleChange('fechaIncidente', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2"></div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="asunto" className="text-gray-900 font-semibold">Asunto *</Label>
                  <Input
                    id="asunto"
                    value={formData.asunto}
                    onChange={(e) => handleChange('asunto', e.target.value)}
                    placeholder="Resumen breve del caso"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="descripcion" className="text-gray-900 font-semibold">Descripción *</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    placeholder="Descripción detallada del caso"
                    rows={6}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
