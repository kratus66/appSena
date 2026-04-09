'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function NuevoCasoPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aprendices, setAprendices] = useState<any[]>([]);
  const [aprendicesFiltrados, setAprendicesFiltrados] = useState<any[]>([]);
  const [documentoSearch, setDocumentoSearch] = useState('');
  const [aprendizSeleccionado, setAprendizSeleccionado] = useState<any>(null);
  // Fichas en las que el aprendiz seleccionado está activo
  const [fichasAprendiz, setFichasAprendiz] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fichaId: '',
    aprendizId: '',
    tipo: 'CONVIVENCIA',
    gravedad: 'LEVE',
    asunto: '',
    descripcion: '',
    fechaIncidente: '',
  });

  useEffect(() => {
    setMounted(true);
    fetchAprendices();
  }, []);

  // Filtrar aprendices según lo que escribe el usuario
  useEffect(() => {
    if (documentoSearch.length > 0) {
      const filtrados = aprendices.filter(a =>
        a.documento.includes(documentoSearch) ||
        `${a.nombres} ${a.apellidos}`.toLowerCase().includes(documentoSearch.toLowerCase())
      );
      setAprendicesFiltrados(filtrados);
    } else {
      setAprendicesFiltrados([]);
    }
  }, [documentoSearch, aprendices]);

  const fetchAprendices = async () => {
    try {
      const response = await api.get('/aprendices?limit=1000');
      setAprendices(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener aprendices:', error);
    }
  };

  const handleSelectAprendiz = (aprendiz: any) => {
    setAprendizSeleccionado(aprendiz);
    setDocumentoSearch(aprendiz.documento);
    setAprendicesFiltrados([]);

    // Construir la lista de fichas usando la relación que ya viene en el objeto
    const fichas: any[] = [];
    if (aprendiz.ficha) {
      fichas.push(aprendiz.ficha);
    } else if (aprendiz.fichaId) {
      fichas.push({ id: aprendiz.fichaId, numeroFicha: aprendiz.fichaId, programa: null });
    }
    setFichasAprendiz(fichas);

    // Preseleccionar automáticamente si solo hay una ficha
    const fichaId = fichas.length === 1 ? fichas[0].id : '';
    setFormData(prev => ({ ...prev, aprendizId: aprendiz.id, fichaId }));
  };

  const handleClearAprendiz = () => {
    setAprendizSeleccionado(null);
    setDocumentoSearch('');
    setFichasAprendiz([]);
    setFormData(prev => ({ ...prev, aprendizId: '', fichaId: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.aprendizId) {
      alert('Debe seleccionar un aprendiz válido del listado');
      return;
    }
    if (!formData.fichaId) {
      alert('Debe seleccionar una ficha');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        fechaIncidente: formData.fechaIncidente,
      };
      await api.post('/disciplinario/casos', payload);
      alert('Caso creado exitosamente');
      router.push('/dashboard/disciplinario');
    } catch (error: any) {
      console.error('Error al crear caso:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el caso';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!mounted) return null;

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
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Caso Disciplinario</h1>
            <p className="text-gray-700 mt-1 font-medium">Registra un nuevo caso disciplinario</p>
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

                {/* Buscar Aprendiz por documento */}
                <div className="space-y-2">
                  <Label htmlFor="aprendizId" className="text-gray-900 font-semibold">Documento del Aprendiz *</Label>
                  <div className="relative">
                    <Input
                      id="aprendizId"
                      value={documentoSearch}
                      onChange={(e) => {
                        setDocumentoSearch(e.target.value);
                        if (aprendizSeleccionado) handleClearAprendiz();
                      }}
                      placeholder="Buscar por documento o nombre"
                      autoComplete="off"
                    />
                    {aprendizSeleccionado && (
                      <div className="mt-1 px-3 py-2 bg-green-50 border border-green-300 rounded-md flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-green-800">
                            {aprendizSeleccionado.nombres} {aprendizSeleccionado.apellidos}
                          </p>
                          <p className="text-xs text-green-700">Doc: {aprendizSeleccionado.documento}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearAprendiz}
                          className="text-xs text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕ Cambiar
                        </button>
                      </div>
                    )}
                    {aprendicesFiltrados.length > 0 && !aprendizSeleccionado && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {aprendicesFiltrados.map((aprendiz) => (
                          <div
                            key={aprendiz.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onMouseDown={() => handleSelectAprendiz(aprendiz)}
                          >
                            <p className="font-semibold text-gray-900">{aprendiz.nombres} {aprendiz.apellidos}</p>
                            <p className="text-sm text-gray-600">Doc: {aprendiz.documento}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {documentoSearch.length > 0 && aprendicesFiltrados.length === 0 && !aprendizSeleccionado && (
                      <p className="text-xs text-gray-500 mt-1">No se encontraron aprendices</p>
                    )}
                  </div>
                </div>

                {/* Ficha - Select desplegable según fichas del aprendiz */}
                <div className="space-y-2">
                  <Label htmlFor="fichaId" className="text-gray-900 font-semibold">Número de Ficha *</Label>
                  {!aprendizSeleccionado ? (
                    <div className="flex h-10 w-full items-center rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
                      Seleccione primero un aprendiz
                    </div>
                  ) : fichasAprendiz.length === 0 ? (
                    <div className="flex h-10 w-full items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-500">
                      El aprendiz no tiene fichas asignadas
                    </div>
                  ) : (
                    <Select
                      value={formData.fichaId}
                      onValueChange={(value) => handleChange('fichaId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una ficha" />
                      </SelectTrigger>
                      <SelectContent>
                        {fichasAprendiz.map((ficha) => (
                          <SelectItem key={ficha.id} value={ficha.id}>
                            {ficha.numeroFicha}
                            {ficha.programa?.nombre ? ` — ${ficha.programa.nombre}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

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
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Guardando...' : 'Guardar Caso'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
