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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api';
import type { CreateEventDto, Ficha, Aprendiz } from '@/types';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onSuccess }: CreateEventDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [fichas, setFichas] = React.useState<Ficha[]>([]);
  const [aprendices, setAprendices] = React.useState<Aprendiz[]>([]);
  const [formData, setFormData] = React.useState<CreateEventDto>({
    titulo: '',
    descripcion: '',
    tipo: 'REUNION',
    fechaInicio: '',
    fechaFin: '',
    allDay: false,
    prioridad: 'MEDIA',
  });

  React.useEffect(() => {
    if (open) {
      fetchFichas();
    }
  }, [open]);

  React.useEffect(() => {
    if (formData.fichaId) {
      fetchAprendices(formData.fichaId);
    }
  }, [formData.fichaId]);

  const fetchFichas = async () => {
    try {
      const response = await api.get('/fichas?limit=100');
      setFichas(response.data.data || []);
    } catch (error) {
      console.error('Error fetching fichas:', error);
    }
  };

  const fetchAprendices = async (fichaId: string) => {
    try {
      const response = await api.get(`/aprendices?fichaId=${fichaId}&limit=100`);
      setAprendices(response.data.data || []);
    } catch (error) {
      console.error('Error fetching aprendices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/agenda/eventos', formData);
      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert(error.response?.data?.message || 'Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'REUNION',
      fechaInicio: '',
      fechaFin: '',
      allDay: false,
      prioridad: 'MEDIA',
    });
    setAprendices([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Crear Nuevo Evento</DialogTitle>
          <DialogDescription className="text-gray-600">
            Completa los datos del evento para agregarlo a la agenda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Título */}
            <div className="col-span-2">
              <Label htmlFor="titulo" className="text-gray-700 font-semibold">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ej: Reunión de seguimiento"
                required
                className="mt-1"
              />
            </div>

            {/* Descripción */}
            <div className="col-span-2">
              <Label htmlFor="descripcion" className="text-gray-700 font-semibold">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Detalles del evento..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="tipo" className="text-gray-700 font-semibold">Tipo de Evento *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLASE">Clase</SelectItem>
                  <SelectItem value="REUNION">Reunión</SelectItem>
                  <SelectItem value="CITACION">Citación</SelectItem>
                  <SelectItem value="COMPROMISO">Compromiso</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridad */}
            <div>
              <Label htmlFor="prioridad" className="text-gray-700 font-semibold">Prioridad *</Label>
              <Select
                value={formData.prioridad}
                onValueChange={(value: any) => setFormData({ ...formData, prioridad: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha Inicio */}
            <div>
              <Label htmlFor="fechaInicio" className="text-gray-700 font-semibold">Fecha y Hora Inicio *</Label>
              <Input
                id="fechaInicio"
                type="datetime-local"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <Label htmlFor="fechaFin" className="text-gray-700 font-semibold">Fecha y Hora Fin</Label>
              <Input
                id="fechaFin"
                type="datetime-local"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Todo el día */}
            <div className="col-span-2 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => setFormData({ ...formData, allDay: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
              />
              <Label htmlFor="allDay" className="cursor-pointer text-gray-700">
                Evento de todo el día
              </Label>
            </div>

            {/* Ficha */}
            <div>
              <Label htmlFor="fichaId" className="text-gray-700 font-semibold">Ficha (opcional)</Label>
              <Select
                value={formData.fichaId || "none"}
                onValueChange={(value) => setFormData({ ...formData, fichaId: value === "none" ? undefined : value, aprendizId: undefined })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una ficha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna</SelectItem>
                  {fichas.map((ficha) => (
                    <SelectItem key={ficha.id} value={ficha.id}>
                      {ficha.numeroFicha}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Aprendiz */}
            <div>
              <Label htmlFor="aprendizId" className="text-gray-700 font-semibold">Aprendiz (opcional)</Label>
              <Select
                value={formData.aprendizId || "none"}
                onValueChange={(value) => setFormData({ ...formData, aprendizId: value === "none" ? undefined : value })}
                disabled={!formData.fichaId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un aprendiz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  {aprendices.map((aprendiz) => (
                    <SelectItem key={aprendiz.id} value={aprendiz.id}>
                      {aprendiz.nombres} {aprendiz.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 px-6"
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
