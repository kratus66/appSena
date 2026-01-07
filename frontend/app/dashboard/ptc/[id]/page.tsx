'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Edit, Trash2, CheckCircle, Lock, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PtcInfoTab from '@/components/dashboard/ptc-info-tab';
import PtcItemsTab from '@/components/dashboard/ptc-items-tab';
import PtcActasTab from '@/components/dashboard/ptc-actas-tab';

interface Ptc {
  id: string;
  fichaId: string;
  aprendizId: string;
  motivo: string;
  descripcion: string;
  estado: 'BORRADOR' | 'VIGENTE' | 'CERRADO';
  fechaInicio: string;
  fechaCierre?: string;
  casoDisciplinarioId?: string;
  ficha: {
    id: string;
    numero: string;
    nombrePrograma: string;
  };
  aprendiz: {
    id: string;
    nombres: string;
    apellidos: string;
    documento: string;
  };
  casoDisciplinario?: {
    id: string;
    numeroConsecutivo: string;
    motivo: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PtcDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ptcId = params.id as string;

  const [ptc, setPtc] = useState<Ptc | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPtc();
  }, [ptcId]);

  const fetchPtc = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ptc/${ptcId}`);
      setPtc(response.data);
    } catch (error: any) {
      toast.error('Error al cargar el PTC');
      router.push('/dashboard/ptc');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEstado = async (nuevoEstado: string) => {
    if (!ptc) return;

    const confirmMessages = {
      VIGENTE: '¿Activar este PTC? Pasará a estado VIGENTE.',
      CERRADO: '¿Cerrar este PTC? Esta acción no se puede deshacer.',
    };

    if (!confirm(confirmMessages[nuevoEstado as keyof typeof confirmMessages])) return;

    try {
      setUpdating(true);
      await api.patch(`/ptc/${ptcId}/estado`, { estado: nuevoEstado });
      toast.success(`PTC actualizado a ${nuevoEstado}`);
      fetchPtc();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este PTC? Esta acción no se puede deshacer.')) return;

    try {
      setUpdating(true);
      await api.delete(`/ptc/${ptcId}`);
      toast.success('PTC eliminado');
      router.push('/dashboard/ptc');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    } finally {
      setUpdating(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      BORRADOR: 'secondary',
      VIGENTE: 'default',
      CERRADO: 'outline',
    };
    return <Badge variant={variants[estado] || 'default'}>{estado}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ptc) {
    return <div>PTC no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                PTC - {ptc.aprendiz.nombres} {ptc.aprendiz.apellidos}
              </h1>
              {getEstadoBadge(ptc.estado)}
            </div>
            <p className="text-muted-foreground mt-1">
              Ficha {ptc.ficha.numero} • {ptc.aprendiz.documento}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {ptc.estado === 'BORRADOR' && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/ptc/${ptcId}/edit`)}
                disabled={updating}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button
                onClick={() => handleChangeEstado('VIGENTE')}
                disabled={updating}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Activar PTC
              </Button>
            </>
          )}

          {ptc.estado === 'VIGENTE' && (
            <Button
              variant="secondary"
              onClick={() => handleChangeEstado('CERRADO')}
              disabled={updating}
            >
              <Lock className="mr-2 h-4 w-4" />
              Cerrar PTC
            </Button>
          )}

          {ptc.estado === 'BORRADOR' && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={updating}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Caso Disciplinario Alert */}
      {ptc.casoDisciplinario && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-sm">Vinculado a Caso Disciplinario</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <p>
              <span className="font-semibold">Caso #{ptc.casoDisciplinario.numeroConsecutivo}:</span>{' '}
              {ptc.casoDisciplinario.motivo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="items">Compromisos</TabsTrigger>
          <TabsTrigger value="actas">Actas</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <PtcInfoTab ptc={ptc} onUpdate={fetchPtc} />
        </TabsContent>

        <TabsContent value="items">
          <PtcItemsTab ptcId={ptcId} ptcEstado={ptc.estado} />
        </TabsContent>

        <TabsContent value="actas">
          <PtcActasTab ptcId={ptcId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
