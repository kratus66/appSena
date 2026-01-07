'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Bell, Plus, X, CheckCircle2, XCircle } from 'lucide-react';
import api from '@/lib/api';
import type { CalendarEvent, Reminder } from '@/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface EventDetailsDialogProps {
  event: CalendarEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EventDetailsDialog({ event, open, onOpenChange, onSuccess }: EventDetailsDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [recordatorios, setRecordatorios] = React.useState<Reminder[]>([]);
  const [showReminderForm, setShowReminderForm] = React.useState(false);
  const [reminderData, setReminderData] = React.useState({
    remindAt: '',
    mensaje: '',
  });

  React.useEffect(() => {
    if (open && event.id) {
      fetchRecordatorios();
    }
  }, [open, event.id]);

  const fetchRecordatorios = async () => {
    try {
      const response = await api.get(`/agenda/eventos/${event.id}/recordatorios`);
      setRecordatorios(response.data || []);
    } catch (error) {
      console.error('Error fetching recordatorios:', error);
    }
  };

  const handleChangeEstado = async (nuevoEstado: string) => {
    if (!confirm(`¿Cambiar estado del evento a ${nuevoEstado}?`)) return;

    setLoading(true);
    try {
      await api.patch(`/agenda/eventos/${event.id}/estado`, { estado: nuevoEstado });
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/agenda/eventos/${event.id}/recordatorios`, {
        ...reminderData,
        canal: 'IN_APP',
      });
      setReminderData({ remindAt: '', mensaje: '' });
      setShowReminderForm(false);
      fetchRecordatorios();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al crear recordatorio');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReminder = async (reminderId: string) => {
    if (!confirm('¿Cancelar este recordatorio?')) return;

    try {
      await api.patch(`/agenda/recordatorios/${reminderId}/cancelar`);
      fetchRecordatorios();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cancelar recordatorio');
    }
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, React.ReactElement> = {
      PENDIENTE: <Badge variant="default" className="bg-yellow-600">Pendiente</Badge>,
      ENVIADO: <Badge variant="default" className="bg-green-600">Enviado</Badge>,
      CANCELADO: <Badge variant="default" className="bg-red-600">Cancelado</Badge>,
    };
    return badges[estado] || <Badge variant="secondary">{estado}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event.titulo}</DialogTitle>
          <DialogDescription>
            Detalles del evento y recordatorios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info del Evento */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="default" className={
                  event.estado === 'PROGRAMADO' ? 'bg-blue-600' :
                  event.estado === 'COMPLETADO' ? 'bg-green-600' : 'bg-red-600'
                }>
                  {event.estado}
                </Badge>
                <Badge variant="default" className={
                  event.prioridad === 'ALTA' ? 'bg-red-500' :
                  event.prioridad === 'MEDIA' ? 'bg-yellow-500' : 'bg-gray-500'
                }>
                  {event.prioridad}
                </Badge>
                <Badge variant="secondary">{event.tipo}</Badge>
              </div>

              {event.descripcion && (
                <p className="text-gray-700">{event.descripcion}</p>
              )}

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{format(parseISO(event.fechaInicio), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>

              {!event.allDay && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(parseISO(event.fechaInicio), 'HH:mm', { locale: es })}
                    {event.fechaFin && ` - ${format(parseISO(event.fechaFin), 'HH:mm', { locale: es })}`}
                  </span>
                </div>
              )}

              {event.ficha && (
                <div className="text-sm text-gray-600">
                  <strong>Ficha:</strong> {event.ficha.numeroFicha}
                </div>
              )}

              {event.aprendiz && (
                <div className="text-sm text-gray-600">
                  <strong>Aprendiz:</strong> {event.aprendiz.nombres} {event.aprendiz.apellidos}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recordatorios */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recordatorios ({recordatorios.length})
              </h3>
              {!showReminderForm && event.estado === 'PROGRAMADO' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowReminderForm(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              )}
            </div>

            {showReminderForm && (
              <Card className="mb-3 border-green-200 bg-green-50">
                <CardContent className="pt-4">
                  <form onSubmit={handleCreateReminder} className="space-y-3">
                    <div>
                      <Label htmlFor="remindAt">Fecha y Hora del Recordatorio</Label>
                      <Input
                        id="remindAt"
                        type="datetime-local"
                        value={reminderData.remindAt}
                        onChange={(e) => setReminderData({ ...reminderData, remindAt: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="mensaje">Mensaje (opcional)</Label>
                      <Input
                        id="mensaje"
                        value={reminderData.mensaje}
                        onChange={(e) => setReminderData({ ...reminderData, mensaje: e.target.value })}
                        placeholder="Mensaje personalizado del recordatorio"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={loading} className="bg-green-600 hover:bg-green-700">
                        Crear
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowReminderForm(false);
                          setReminderData({ remindAt: '', mensaje: '' });
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {recordatorios.length === 0 ? (
              <p className="text-sm text-gray-500">No hay recordatorios para este evento</p>
            ) : (
              <div className="space-y-2">
                {recordatorios.map((recordatorio) => (
                  <Card key={recordatorio.id} className="border-gray-200">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getEstadoBadge(recordatorio.estado)}
                            <Badge variant="outline">{recordatorio.canal}</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {format(parseISO(recordatorio.remindAt), "d 'de' MMMM, HH:mm", { locale: es })}
                          </div>
                          {recordatorio.mensaje && (
                            <p className="text-sm text-gray-700 mt-1">{recordatorio.mensaje}</p>
                          )}
                          {recordatorio.sentAt && (
                            <p className="text-xs text-green-600 mt-1">
                              <CheckCircle2 className="h-3 w-3 inline mr-1" />
                              Enviado: {format(parseISO(recordatorio.sentAt), "d 'de' MMMM, HH:mm", { locale: es })}
                            </p>
                          )}
                        </div>
                        {recordatorio.estado === 'PENDIENTE' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelReminder(recordatorio.id)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-2 pt-4 border-t">
            {event.estado === 'PROGRAMADO' && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleChangeEstado('COMPLETADO')}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Completar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleChangeEstado('CANCELADO')}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Cancelar Evento
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="ml-auto"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
