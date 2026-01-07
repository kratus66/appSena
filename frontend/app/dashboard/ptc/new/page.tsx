'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Ficha } from '@/types';

interface Aprendiz {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  fichaId: string;
}

interface CasoDisciplinario {
  id: string;
  aprendizId: string;
  fichaId: string;
  asunto: string;
  descripcion: string;
  tipo: string;
}

export default function NewPtcPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [aprendices, setAprendices] = useState<Aprendiz[]>([]);
  const [casos, setCasos] = useState<CasoDisciplinario[]>([]);
  const [tabValue, setTabValue] = useState('manual');

  // Formulario manual
  const [formData, setFormData] = useState({
    fichaId: '',
    aprendizId: '',
    motivo: '',
    descripcion: '',
    fechaInicio: new Date().toISOString().split('T')[0],
  });

  // Formulario desde caso
  const [caseFormData, setCaseFormData] = useState({
    casoId: '',
    motivo: '',
    descripcion: '',
    fechaInicio: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchFichas();
    fetchCasos();
  }, []);

  useEffect(() => {
    if (formData.fichaId) {
      fetchAprendices(formData.fichaId);
    }
  }, [formData.fichaId]);

  const fetchFichas = async () => {
    try {
      const response = await api.get('/fichas', { params: { limit: 100 } });
      console.log('Fichas response:', response.data);
      const fichasData = response.data.data || response.data;
      setFichas(Array.isArray(fichasData) ? fichasData : []);
      console.log('Fichas cargadas:', fichasData);
    } catch (error: any) {
      console.error('Error al cargar fichas:', error);
      toast.error(error.response?.data?.message || 'Error al cargar fichas');
    }
  };

  const fetchAprendices = async (fichaId: string) => {
    try {
      const response = await api.get(`/aprendices/ficha/${fichaId}/aprendices`);
      setAprendices(response.data);
    } catch (error) {
      toast.error('Error al cargar aprendices');
    }
  };

  const fetchCasos = async () => {
    try {
      // Buscar casos ABIERTOS y en SEGUIMIENTO (no cerrados ni borradores)
      const [abiertos, seguimiento] = await Promise.all([
        api.get('/disciplinario/casos', { params: { estado: 'ABIERTO' } }),
        api.get('/disciplinario/casos', { params: { estado: 'SEGUIMIENTO' } })
      ]);
      
      const casosAbiertos = abiertos.data.data || abiertos.data || [];
      const casosSeguimiento = seguimiento.data.data || seguimiento.data || [];
      const todosCasos = [...casosAbiertos, ...casosSeguimiento];
      
      setCasos(todosCasos);
      console.log('Casos cargados:', todosCasos);
    } catch (error: any) {
      console.error('Error al cargar casos:', error);
      toast.error(error.response?.data?.message || 'Error al cargar casos disciplinarios');
    }
  };

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fichaId || !formData.aprendizId || !formData.motivo) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setLoading(true);
      await api.post('/ptc', formData);
      toast.success('PTC creado exitosamente');
      router.push('/dashboard/ptc');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear PTC');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFromCase = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseFormData.casoId) {
      toast.error('Debes seleccionar un caso disciplinario');
      return;
    }

    try {
      setLoading(true);
      await api.post('/ptc/desde-caso', caseFormData);
      toast.success('PTC creado desde caso disciplinario exitosamente');
      router.push('/dashboard/ptc');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear PTC desde caso');
    } finally {
      setLoading(false);
    }
  };

  const selectedCaso = casos.find(c => c.id === caseFormData.casoId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Crear Nuevo PTC</h1>
            <p className="text-gray-600 mt-1 font-medium">
              Plan de Trabajo Concertado para aprendiz
            </p>
          </div>
        </div>

        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100">
            <TabsTrigger value="manual" className="data-[state=active]:bg-white">
              Creación Manual
            </TabsTrigger>
            <TabsTrigger value="caso" className="data-[state=active]:bg-white">
              Desde Caso Disciplinario
            </TabsTrigger>
          </TabsList>

        {/* CREACIÓN MANUAL */}
        <TabsContent value="manual">
          <Card className="border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl text-gray-900">Datos del PTC</CardTitle>
              <CardDescription className="text-gray-600">
                Completa la información para crear un nuevo Plan de Trabajo Concertado
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitManual} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fichaId" className="text-gray-900 font-semibold">
                      Ficha <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.fichaId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, fichaId: value, aprendizId: '' });
                        setAprendices([]);
                      }}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Selecciona una ficha" />
                      </SelectTrigger>
                      <SelectContent>
                        {fichas.map((ficha) => (
                          <SelectItem key={ficha.id} value={ficha.id}>
                            {ficha.numeroFicha} - {ficha.programa?.nombre || 'Sin programa'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aprendizId" className="text-gray-900 font-semibold">
                      Aprendiz <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.aprendizId}
                      onValueChange={(value) => setFormData({ ...formData, aprendizId: value })}
                      disabled={!formData.fichaId}
                    >
                      <SelectTrigger className="border-gray-300 disabled:bg-gray-50">
                        <SelectValue placeholder="Selecciona un aprendiz" />
                      </SelectTrigger>
                      <SelectContent>
                        {aprendices.map((aprendiz) => (
                          <SelectItem key={aprendiz.id} value={aprendiz.id}>
                            {aprendiz.nombres} {aprendiz.apellidos} - {aprendiz.documento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fechaInicio" className="text-gray-900 font-semibold">
                      Fecha de Inicio <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      className="border-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo" className="text-gray-900 font-semibold">
                    Motivo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Ejemplo: Bajo rendimiento académico"
                    className="border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="text-gray-900 font-semibold">
                    Descripción
                  </Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción detallada del PTC y objetivos..."
                    className="border-gray-300 bg-gray-50 text-gray-900"
                    rows={4}
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="border-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Creando...' : 'Crear PTC'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DESDE CASO DISCIPLINARIO */}
        <TabsContent value="caso">
          <Card className="border-gray-200">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="text-xl text-gray-900">Crear PTC desde Caso Disciplinario</CardTitle>
              <CardDescription className="text-gray-600">
                Selecciona un caso disciplinario activo para generar un PTC
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmitFromCase} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="casoId" className="text-gray-900 font-semibold">
                    Caso Disciplinario <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={caseFormData.casoId}
                    onValueChange={(value) => setCaseFormData({ ...caseFormData, casoId: value })}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Selecciona un caso disciplinario" />
                    </SelectTrigger>
                    <SelectContent>
                      {casos.map((caso) => (
                        <SelectItem key={caso.id} value={caso.id}>
                          {caso.tipo}: {caso.asunto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCaso && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-gray-900">Información del Caso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="text-gray-700">
                        <span className="font-semibold">Tipo: </span>
                        <span className="text-gray-900">{selectedCaso.tipo}</span>
                      </div>
                      <div className="text-gray-700">
                        <span className="font-semibold">Asunto: </span>
                        <span className="text-gray-900">{selectedCaso.asunto}</span>
                      </div>
                      <div className="text-gray-700">
                        <span className="font-semibold">Descripción: </span>
                        <span className="text-gray-900">{selectedCaso.descripcion}</span>
                      </div>
                      <div className="flex items-start gap-2 mt-3 p-3 bg-blue-100 rounded-md border border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-700 font-medium">
                          El PTC se creará automáticamente con la información del caso.
                          Puedes personalizar el motivo y descripción si lo deseas.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="case-motivo" className="text-gray-900 font-semibold">
                    Motivo Personalizado <span className="text-gray-500 font-normal">(Opcional)</span>
                  </Label>
                  <Input
                    id="case-motivo"
                    value={caseFormData.motivo}
                    onChange={(e) => setCaseFormData({ ...caseFormData, motivo: e.target.value })}
                    placeholder="Dejar vacío para usar el motivo del caso"
                    className="border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case-descripcion" className="text-gray-900 font-semibold">
                    Descripción Personalizada <span className="text-gray-500 font-normal">(Opcional)</span>
                  </Label>
                  <Textarea
                    id="case-descripcion"
                    value={caseFormData.descripcion}
                    onChange={(e) => setCaseFormData({ ...caseFormData, descripcion: e.target.value })}
                    placeholder="Dejar vacío para usar la descripción del caso"
                    className="border-gray-300 bg-gray-50 text-gray-900"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case-fecha" className="text-gray-900 font-semibold">
                    Fecha de Inicio
                  </Label>
                  <Input
                    id="case-fecha"
                    type="date"
                    value={caseFormData.fechaInicio}
                    onChange={(e) => setCaseFormData({ ...caseFormData, fechaInicio: e.target.value })}
                    className="border-gray-300"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="border-gray-300"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !caseFormData.casoId}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {loading ? 'Creando...' : 'Crear PTC desde Caso'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}
