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
  const [loading, setLoading] = useState(false);
  const [fichas, setFichas] = useState<any[]>([]);
  const [fichasFiltradas, setFichasFiltradas] = useState<any[]>([]);
  const [aprendices, setAprendices] = useState<any[]>([]);
  const [aprendicesFiltrados, setAprendicesFiltrados] = useState<any[]>([]);
  const [fichaSearch, setFichaSearch] = useState('');
  const [documentoSearch, setDocumentoSearch] = useState('');
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
    fetchFichas();
    fetchAprendices();
  }, []);

  useEffect(() => {
    if (fichaSearch) {
      const filtradas = fichas.filter(f => 
        f.numeroFicha.includes(fichaSearch)
      );
      setFichasFiltradas(filtradas);
    } else {
      setFichasFiltradas([]);
    }
  }, [fichaSearch, fichas]);

  useEffect(() => {
    if (documentoSearch) {
      const filtrados = aprendices.filter(a => 
        a.documento.includes(documentoSearch)
      );
      setAprendicesFiltrados(filtrados);
    } else {
      setAprendicesFiltrados([]);
    }
  }, [documentoSearch, aprendices]);

  const fetchFichas = async () => {
    try {
      const response = await api.get('/fichas?limit=1000');
      setFichas(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener fichas:', error);
    }
  };

  const fetchAprendices = async () => {
    try {
      const response = await api.get('/aprendices?limit=1000');
      setAprendices(response.data.data || []);
    } catch (error) {
      console.error('Error al obtener aprendices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Formatear la fecha al formato ISO
      const payload = {
        ...formData,
        fechaIncidente: new Date(formData.fechaIncidente).toISOString(),
      };
      
      const response = await api.post('/disciplinario/casos', payload);
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

  const handleSelectFicha = (ficha: any) => {
    setFormData(prev => ({ ...prev, fichaId: ficha.id }));
    setFichaSearch(ficha.numeroFicha);
    setFichasFiltradas([]);
  };

  const handleSelectAprendiz = (aprendiz: any) => {
    setFormData(prev => ({ ...prev, aprendizId: aprendiz.id }));
    setDocumentoSearch(aprendiz.documento);
    setAprendicesFiltrados([]);
  };

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

                <div className="space-y-2">
                  <Label htmlFor="fichaId" className="text-gray-900 font-semibold">Número de Ficha *</Label>
                  <div className="relative">
                    <Input
                      id="fichaId"
                      value={fichaSearch}
                      onChange={(e) => setFichaSearch(e.target.value)}
                      placeholder="Ingrese el número de ficha"
                      required
                    />
                    {fichasFiltradas.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {fichasFiltradas.map((ficha) => (
                          <div
                            key={ficha.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectFicha(ficha)}
                          >
                            <p className="font-semibold text-gray-900">{ficha.numeroFicha}</p>
                            <p className="text-sm text-gray-600">{ficha.programa?.nombre || 'Sin programa'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aprendizId" className="text-gray-900 font-semibold">Documento del Aprendiz *</Label>
                  <div className="relative">
                    <Input
                      id="aprendizId"
                      value={documentoSearch}
                      onChange={(e) => setDocumentoSearch(e.target.value)}
                      placeholder="Ingrese el documento del aprendiz"
                      required
                    />
                    {aprendicesFiltrados.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {aprendicesFiltrados.map((aprendiz) => (
                          <div
                            key={aprendiz.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectAprendiz(aprendiz)}
                          >
                            <p className="font-semibold text-gray-900">{aprendiz.nombres} {aprendiz.apellidos}</p>
                            <p className="text-sm text-gray-600">Doc: {aprendiz.documento}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
