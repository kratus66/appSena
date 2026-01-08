'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PtcItem {
  id: string;
  tipo: 'COMPROMISO_APRENDIZ' | 'COMPROMISO_INSTRUCTOR' | 'COMPROMISO_ACUDIENTE' | 'OTRO';
  descripcion: string;
  estado: 'PENDIENTE' | 'CUMPLIDO' | 'INCUMPLIDO';
  fechaCompromiso: string;
  responsableNombre: string;
  evidenciaUrl?: string;
  notas?: string;
  createdAt: string;
}

interface PtcItemsTabProps {
  ptcId: string;
  ptcEstado: string;
}

export default function PtcItemsTab({ ptcId, ptcEstado }: PtcItemsTabProps) {
  const [items, setItems] = useState<PtcItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PtcItem | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'COMPROMISO_APRENDIZ',
    descripcion: '',
    fechaCompromiso: new Date().toISOString().split('T')[0],
    responsableNombre: '',
    notas: '',
  });

  const canEdit = ptcEstado !== 'CERRADO';

  useEffect(() => {
    fetchItems();
  }, [ptcId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ptc/${ptcId}/items`);
      setItems(response.data);
    } catch (error) {
      toast.error('Error al cargar compromisos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await api.patch(`/ptc/${ptcId}/items/${editingItem.id}`, formData);
        toast.success('Compromiso actualizado');
      } else {
        await api.post(`/ptc/${ptcId}/items`, formData);
        toast.success('Compromiso agregado');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar compromiso');
    }
  };

  const handleChangeEstado = async (itemId: string, nuevoEstado: string) => {
    try {
      await api.patch(`/ptc/${ptcId}/items/${itemId}/estado`, { estado: nuevoEstado });
      toast.success('Estado actualizado');
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('¿Eliminar este compromiso?')) return;

    try {
      await api.delete(`/ptc/${ptcId}/items/${itemId}`);
      toast.success('Compromiso eliminado');
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'COMPROMISO_APRENDIZ',
      descripcion: '',
      fechaCompromiso: new Date().toISOString().split('T')[0],
      responsableNombre: '',
      notas: '',
    });
    setEditingItem(null);
  };

  const openEditDialog = (item: PtcItem) => {
    setEditingItem(item);
    setFormData({
      tipo: item.tipo,
      descripcion: item.descripcion,
      fechaCompromiso: item.fechaCompromiso.split('T')[0],
      responsableNombre: item.responsableNombre,
      notas: item.notas || '',
    });
    setDialogOpen(true);
  };

  const getTipoBadge = (tipo: string) => {
    const config = {
      COMPROMISO_APRENDIZ: { label: 'Aprendiz', variant: 'default' as const },
      COMPROMISO_INSTRUCTOR: { label: 'Instructor', variant: 'secondary' as const },
      COMPROMISO_ACUDIENTE: { label: 'Acudiente', variant: 'outline' as const },
      OTRO: { label: 'Otro', variant: 'outline' as const },
    };
    const { label, variant } = config[tipo as keyof typeof config] || config.OTRO;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getEstadoBadge = (estado: string) => {
    const icons = {
      PENDIENTE: <Clock className="h-3 w-3 mr-1" />,
      CUMPLIDO: <CheckCircle className="h-3 w-3 mr-1" />,
      INCUMPLIDO: <XCircle className="h-3 w-3 mr-1" />,
    };
    const variants = {
      PENDIENTE: 'secondary' as const,
      CUMPLIDO: 'default' as const,
      INCUMPLIDO: 'danger' as const,
    };
    
    return (
      <Badge variant={variants[estado as keyof typeof variants]}>
        <span className="flex items-center">
          {icons[estado as keyof typeof icons]}
          {estado}
        </span>
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {canEdit && (
        <div className="flex justify-end">
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Compromiso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">
                  {editingItem ? 'Editar Compromiso' : 'Nuevo Compromiso'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Tipo de Compromiso *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPROMISO_APRENDIZ">Compromiso Aprendiz</SelectItem>
                        <SelectItem value="COMPROMISO_INSTRUCTOR">Compromiso Instructor</SelectItem>
                        <SelectItem value="COMPROMISO_ACUDIENTE">Compromiso Acudiente</SelectItem>
                        <SelectItem value="OTRO">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">Fecha de Compromiso *</Label>
                    <Input
                      type="date"
                      value={formData.fechaCompromiso}
                      onChange={(e) => setFormData({ ...formData, fechaCompromiso: e.target.value })}
                      className="bg-gray-50 border-gray-300 text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Responsable *</Label>
                  <Input
                    value={formData.responsableNombre}
                    onChange={(e) => setFormData({ ...formData, responsableNombre: e.target.value })}
                    placeholder="Nombre del responsable"
                    className="bg-gray-50 border-gray-300 text-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Descripción *</Label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción del compromiso..."
                    rows={3}
                    className="bg-gray-50 border-gray-300 text-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Notas Adicionales</Label>
                  <Textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    placeholder="Notas opcionales..."
                    rows={2}
                    className="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-300">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingItem ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {items.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No hay compromisos registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="border-gray-200">
              <CardHeader className="pb-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      {getTipoBadge(item.tipo)}
                      {getEstadoBadge(item.estado)}
                    </div>
                    <CardTitle className="text-base text-gray-900">{item.descripcion}</CardTitle>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1">
                      {item.estado === 'PENDIENTE' && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangeEstado(item.id, 'CUMPLIDO')}
                                className="border-gray-300 hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como Cumplido</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleChangeEstado(item.id, 'INCUMPLIDO')}
                                className="border-gray-300 hover:bg-red-50 hover:border-red-500 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como Incumplido</p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                            className="border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                            className="hover:bg-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Eliminar</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid gap-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Responsable:</span>
                    <span>{item.responsableNombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">Fecha:</span>
                    <span>{format(new Date(item.fechaCompromiso), "d 'de' MMMM, yyyy", { locale: es })}</span>
                  </div>
                  {item.notas && (
                    <div className="mt-2 p-3 bg-gray-100 rounded text-sm text-gray-800">
                      <span className="font-semibold text-gray-900">Notas:</span> {item.notas}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
