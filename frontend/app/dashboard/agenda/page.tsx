'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  Bell,
  CheckCircle2,
  XCircle,
  Circle,
} from 'lucide-react';
import api from '@/lib/api';
import type { CalendarEvent, EventsResponse, EventStatus, EventPriority } from '@/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateEventDialog } from '@/components/dashboard/create-event-dialog';
import { EventDetailsDialog } from '@/components/dashboard/event-details-dialog';

export default function AgendaPage() {
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'PROGRAMADO' | 'COMPLETADO' | 'CANCELADO'>('all');

  React.useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const desde = new Date();
      desde.setMonth(desde.getMonth() - 1);
      const hasta = new Date();
      hasta.setMonth(hasta.getMonth() + 2);

      const params: any = {
        desde: desde.toISOString(),
        hasta: hasta.toISOString(),
        limit: 50,
      };

      if (filter !== 'all') {
        params.estado = filter;
      }

      const response = await api.get<EventsResponse>('/agenda/eventos', { params });
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const badges = {
      PROGRAMADO: <Badge variant="default" className="bg-blue-600"><Circle className="h-3 w-3 mr-1" />Programado</Badge>,
      COMPLETADO: <Badge variant="default" className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completado</Badge>,
      CANCELADO: <Badge variant="default" className="bg-red-600"><XCircle className="h-3 w-3 mr-1" />Cancelado</Badge>,
    };
    return badges[status];
  };

  const getPriorityBadge = (priority: EventPriority) => {
    const badges = {
      BAJA: <Badge variant="outline" className="border-gray-400 text-gray-700">Baja</Badge>,
      MEDIA: <Badge variant="outline" className="border-yellow-500 text-yellow-700">Media</Badge>,
      ALTA: <Badge variant="default" className="bg-red-500">Alta</Badge>,
    };
    return badges[priority];
  };

  const getEventTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      CLASE: 'Clase',
      REUNION: 'Reunión',
      CITACION: 'Citación',
      COMPROMISO: 'Compromiso',
      OTRO: 'Otro',
    };
    return labels[tipo] || tipo;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
            <p className="text-gray-600 mt-1">Gestiona tus eventos y recordatorios</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'PROGRAMADO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('PROGRAMADO')}
                className={filter === 'PROGRAMADO' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                Programados
              </Button>
              <Button
                variant={filter === 'COMPLETADO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('COMPLETADO')}
                className={filter === 'COMPLETADO' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                Completados
              </Button>
              <Button
                variant={filter === 'CANCELADO' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('CANCELADO')}
                className={filter === 'CANCELADO' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Cancelados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando eventos...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay eventos para mostrar
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{event.titulo}</h3>
                          {getStatusBadge(event.estado)}
                          {getPriorityBadge(event.prioridad)}
                          <Badge variant="secondary">{getEventTypeLabel(event.tipo)}</Badge>
                        </div>
                        {event.descripcion && (
                          <p className="text-sm text-gray-600 mb-2">{event.descripcion}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(event.fechaInicio), "d 'de' MMMM, yyyy", { locale: es })}
                          </div>
                          {!event.allDay && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(parseISO(event.fechaInicio), 'HH:mm', { locale: es })}
                              {event.fechaFin && ` - ${format(parseISO(event.fechaFin), 'HH:mm', { locale: es })}`}
                            </div>
                          )}
                          {event.recordatorios && event.recordatorios.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Bell className="h-4 w-4" />
                              {event.recordatorios.length} recordatorio(s)
                            </div>
                          )}
                        </div>
                        {event.ficha && (
                          <div className="text-sm text-gray-500 mt-1">
                            Ficha: {event.ficha.numeroFicha}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          fetchEvents();
          setShowCreateDialog(false);
        }}
      />

      {selectedEvent && (
        <EventDetailsDialog
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
          onSuccess={() => {
            fetchEvents();
            setSelectedEvent(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
