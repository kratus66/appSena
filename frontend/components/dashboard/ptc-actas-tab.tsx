'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, FileText, Calendar, Users, Edit, Trash2, Lock, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActaAsistente {
  id?: string;
  nombre: string;
  rol: 'APRENDIZ' | 'INSTRUCTOR' | 'COORDINADOR' | 'ACUDIENTE' | 'OTRO';
  email?: string;
  telefono?: string;
}

interface Acta {
  id: string;
  fecha: string;
  descripcion: string;
  estado: 'BORRADOR' | 'FIRMABLE' | 'CERRADA';
  pdfUrl?: string;
  hash?: string;
  cierreResumen?: string;
  asistentes: ActaAsistente[];
  createdAt: string;
}

interface PtcActasTabProps {
  ptcId: string;
}

export default function PtcActasTab({ ptcId }: PtcActasTabProps) {
  const [actas, setActas] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedActa, setSelectedActa] = useState<Acta | null>(null);
  const [editingActa, setEditingActa] = useState<Acta | null>(null);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    asistentes: [
      { nombre: '', rol: 'APRENDIZ' as const, email: '', telefono: '' }
    ],
  });

  useEffect(() => {
    fetchActas();
  }, [ptcId]);

  const fetchActas = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/ptc/actas`, { params: { ptcId } });
      setActas(response.data.data || response.data);
    } catch (error) {
      toast.error('Error al cargar actas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      ptcId,
      asistentes: formData.asistentes.filter(a => a.nombre.trim() !== ''),
    };

    try {
      if (editingActa) {
        await api.patch(`/ptc/actas/${editingActa.id}`, payload);
        toast.success('Acta actualizada');
      } else {
        await api.post(`/ptc/actas`, payload);
        toast.success('Acta creada');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchActas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar acta');
    }
  };

  const handleChangeEstado = async (actaId: string, nuevoEstado: string) => {
    const messages = {
      FIRMABLE: '¿Marcar acta como firmable? Será visible para firmas.',
      CERRADA: '¿Cerrar acta? Esta acción no se puede deshacer.',
    };

    if (!confirm(messages[nuevoEstado as keyof typeof messages])) return;

    try {
      await api.patch(`/ptc/actas/${actaId}/estado`, { estado: nuevoEstado });
      toast.success(`Acta actualizada a ${nuevoEstado}`);
      fetchActas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (actaId: string) => {
    if (!confirm('¿Eliminar esta acta?')) return;

    try {
      await api.delete(`/ptc/actas/${actaId}`);
      toast.success('Acta eliminada');
      fetchActas();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      descripcion: '',
      asistentes: [{ nombre: '', rol: 'APRENDIZ', email: '', telefono: '' }],
    });
    setEditingActa(null);
  };

  const openEditDialog = (acta: Acta) => {
    setEditingActa(acta);
    setFormData({
      fecha: acta.fecha.split('T')[0],
      descripcion: acta.descripcion,
      asistentes: acta.asistentes.length > 0 ? acta.asistentes : [{ nombre: '', rol: 'APRENDIZ', email: '', telefono: '' }],
    });
    setDialogOpen(true);
  };

  const addAsistente = () => {
    setFormData({
      ...formData,
      asistentes: [...formData.asistentes, { nombre: '', rol: 'APRENDIZ', email: '', telefono: '' }],
    });
  };

  const removeAsistente = (index: number) => {
    setFormData({
      ...formData,
      asistentes: formData.asistentes.filter((_, i) => i !== index),
    });
  };

  const updateAsistente = (index: number, field: string, value: string) => {
    const updated = [...formData.asistentes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, asistentes: updated });
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      BORRADOR: 'secondary' as const,
      FIRMABLE: 'default' as const,
      CERRADA: 'outline' as const,
    };
    return <Badge variant={variants[estado as keyof typeof variants]}>{estado}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Acta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingActa ? 'Editar Acta' : 'Nueva Acta de Reunión'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Fecha de Reunión *</Label>
                <Input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Descripción / Agenda *</Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de los temas tratados en la reunión..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Asistentes</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addAsistente}>
                    <PlusCircle className="mr-2 h-3 w-3" />
                    Agregar Asistente
                  </Button>
                </div>

                {formData.asistentes.map((asistente, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Nombre *</Label>
                        <Input
                          value={asistente.nombre}
                          onChange={(e) => updateAsistente(index, 'nombre', e.target.value)}
                          placeholder="Nombre completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Rol *</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={asistente.rol}
                          onChange={(e) => updateAsistente(index, 'rol', e.target.value)}
                        >
                          <option value="APRENDIZ">Aprendiz</option>
                          <option value="INSTRUCTOR">Instructor</option>
                          <option value="COORDINADOR">Coordinador</option>
                          <option value="ACUDIENTE">Acudiente</option>
                          <option value="OTRO">Otro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          value={asistente.email}
                          onChange={(e) => updateAsistente(index, 'email', e.target.value)}
                          placeholder="email@ejemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Teléfono</Label>
                        <Input
                          value={asistente.telefono}
                          onChange={(e) => updateAsistente(index, 'telefono', e.target.value)}
                          placeholder="300 123 4567"
                        />
                      </div>
                    </div>
                    {formData.asistentes.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="mt-2 text-destructive"
                        onClick={() => removeAsistente(index)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Eliminar
                      </Button>
                    )}
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingActa ? 'Actualizar' : 'Crear Acta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {actas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay actas registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {actas.map((acta) => (
            <Card key={acta.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(new Date(acta.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    </div>
                    {getEstadoBadge(acta.estado)}
                  </div>
                  {acta.estado === 'BORRADOR' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(acta)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(acta.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-3">{acta.descripcion}</p>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{acta.asistentes.length} asistente(s)</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedActa(acta);
                      setDetailDialogOpen(true);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Detalle
                  </Button>
                  
                  {acta.estado === 'BORRADOR' && (
                    <Button
                      size="sm"
                      onClick={() => handleChangeEstado(acta.id, 'FIRMABLE')}
                    >
                      Publicar
                    </Button>
                  )}
                  
                  {acta.estado === 'FIRMABLE' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleChangeEstado(acta.id, 'CERRADA')}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Cerrar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Acta</DialogTitle>
          </DialogHeader>
          {selectedActa && (
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Fecha</Label>
                <p className="text-sm">{format(new Date(selectedActa.fecha), "d 'de' MMMM, yyyy", { locale: es })}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Estado</Label>
                <div className="mt-1">{getEstadoBadge(selectedActa.estado)}</div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Descripción</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedActa.descripcion}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Asistentes ({selectedActa.asistentes.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedActa.asistentes.map((asistente, i) => (
                    <Card key={i} className="p-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">{asistente.nombre}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{asistente.rol}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {asistente.email && <div>{asistente.email}</div>}
                          {asistente.telefono && <div>{asistente.telefono}</div>}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
