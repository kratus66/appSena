'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface Ficha {
  id: string;
  numero: string;
  nombrePrograma: string;
}

interface Aprendiz {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  fichaId: string;
}

interface CasoDisciplinario {
  id: string;
  numeroConsecutivo: string;
  aprendizId: string;
  fichaId: string;
  motivo: string;
  descripcion: string;
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
      const response = await api.get('/fichas');
      setFichas(response.data.data || response.data);
    } catch (error) {
      toast.error('Error al cargar fichas');
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
      const response = await api.get('/disciplinario/casos', {
        params: { estado: 'EN_PROCESO' }
      });
      setCasos(response.data.data || response.data);
    } catch (error) {
      console.error('Error al cargar casos:', error);
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo PTC</h1>
          <p className="text-muted-foreground mt-1">
            Plan de Trabajo Concertado para aprendiz
          </p>
        </div>
      </div>

      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Creación Manual</TabsTrigger>
          <TabsTrigger value="caso">Desde Caso Disciplinario</TabsTrigger>
        </TabsList>

        {/* CREACIÓN MANUAL */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Datos del PTC</CardTitle>
              <CardDescription>
                Completa la información para crear un nuevo Plan de Trabajo Concertado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitManual} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fichaId">Ficha *</Label>
                    <Select
                      value={formData.fichaId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, fichaId: value, aprendizId: '' });
                        setAprendices([]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una ficha" />
                      </SelectTrigger>
                      <SelectContent>
                        {fichas.map((ficha) => (
                          <SelectItem key={ficha.id} value={ficha.id}>
                            {ficha.numero} - {ficha.nombrePrograma}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aprendizId">Aprendiz *</Label>
                    <Select
                      value={formData.aprendizId}
                      onValueChange={(value) => setFormData({ ...formData, aprendizId: value })}
                      disabled={!formData.fichaId}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="fechaInicio">Fecha de Inicio *</Label>
                    <Input
                      id="fechaInicio"
                      type="date"
                      value={formData.fechaInicio}
                      onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo *</Label>
                  <Input
                    id="motivo"
                    value={formData.motivo}
                    onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                    placeholder="Ejemplo: Bajo rendimiento académico"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción detallada del PTC y objetivos..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
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
          <Card>
            <CardHeader>
              <CardTitle>Crear PTC desde Caso Disciplinario</CardTitle>
              <CardDescription>
                Selecciona un caso disciplinario activo para generar un PTC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFromCase} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="casoId">Caso Disciplinario *</Label>
                  <Select
                    value={caseFormData.casoId}
                    onValueChange={(value) => setCaseFormData({ ...caseFormData, casoId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un caso disciplinario" />
                    </SelectTrigger>
                    <SelectContent>
                      {casos.map((caso) => (
                        <SelectItem key={caso.id} value={caso.id}>
                          Caso #{caso.numeroConsecutivo} - {caso.motivo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCaso && (
                  <Card className="bg-muted">
                    <CardHeader>
                      <CardTitle className="text-sm">Información del Caso</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold">Caso: </span>
                        #{selectedCaso.numeroConsecutivo}
                      </div>
                      <div>
                        <span className="font-semibold">Motivo: </span>
                        {selectedCaso.motivo}
                      </div>
                      <div>
                        <span className="font-semibold">Descripción: </span>
                        {selectedCaso.descripcion}
                      </div>
                      <div className="flex items-start gap-2 mt-3 p-2 bg-blue-50 rounded">
                        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                        <p className="text-xs text-blue-700">
                          El PTC se creará automáticamente con la información del caso.
                          Puedes personalizar el motivo y descripción si lo deseas.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="case-motivo">
                    Motivo Personalizado <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <Input
                    id="case-motivo"
                    value={caseFormData.motivo}
                    onChange={(e) => setCaseFormData({ ...caseFormData, motivo: e.target.value })}
                    placeholder="Dejar vacío para usar el motivo del caso"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case-descripcion">
                    Descripción Personalizada <span className="text-muted-foreground">(Opcional)</span>
                  </Label>
                  <Textarea
                    id="case-descripcion"
                    value={caseFormData.descripcion}
                    onChange={(e) => setCaseFormData({ ...caseFormData, descripcion: e.target.value })}
                    placeholder="Dejar vacío para usar la descripción del caso"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case-fecha">Fecha de Inicio</Label>
                  <Input
                    id="case-fecha"
                    type="date"
                    value={caseFormData.fechaInicio}
                    onChange={(e) => setCaseFormData({ ...caseFormData, fechaInicio: e.target.value })}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading || !caseFormData.casoId}>
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
  );
}
