'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, FileText, Calendar, Users, Edit, Trash2, Lock, Eye, Download, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';

interface ActaAsistente {
  id?: string;
  nombre: string;
  rol: 'APRENDIZ' | 'INSTRUCTOR' | 'COORDINADOR' | 'ACUDIENTE' | 'OTRO';
  email?: string;
  telefono?: string;
}

interface Acta {
  id: string;
  ptcId: string;
  fichaId: string;
  aprendizId: string;
  fechaReunion: string;
  lugar?: string;
  asunto: string;
  desarrollo: string;
  acuerdos: string;
  estado: 'BORRADOR' | 'FIRMABLE' | 'CERRADA';
  pdfUrl?: string;
  hash?: string;
  cierreResumen?: string;
  asistentes: ActaAsistente[];
  createdAt: string;
}

interface PtcActasTabProps {
  ptcId: string;
  fichaId?: string;
  aprendizId?: string;
}

export default function PtcActasTab({ ptcId, fichaId, aprendizId }: PtcActasTabProps) {
  const [actas, setActas] = useState<Acta[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedActa, setSelectedActa] = useState<Acta | null>(null);
  const [editingActa, setEditingActa] = useState<Acta | null>(null);
  const [formData, setFormData] = useState<{
    fechaReunion: string;
    lugar: string;
    asunto: string;
    desarrollo: string;
    acuerdos: string;
    asistentes: ActaAsistente[];
  }>({
    fechaReunion: new Date().toISOString(),
    lugar: '',
    asunto: '',
    desarrollo: '',
    acuerdos: '',
    asistentes: [
      { nombre: '', rol: 'APRENDIZ', email: '', telefono: '' }
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

    if (!fichaId || !aprendizId) {
      toast.error('Faltan datos del PTC');
      return;
    }

    try {
      if (editingActa) {
        // Para edición solo enviamos campos actualizables
        const updatePayload = {
          fechaReunion: formData.fechaReunion,
          lugar: formData.lugar,
          asunto: formData.asunto,
          desarrollo: formData.desarrollo,
          acuerdos: formData.acuerdos,
          asistentes: formData.asistentes.filter(a => a.nombre.trim() !== ''),
        };
        await api.patch(`/ptc/actas/${editingActa.id}`, updatePayload);
        toast.success('Acta actualizada');
      } else {
        // Para creación enviamos todos los campos incluyendo IDs
        const createPayload = {
          ...formData,
          ptcId,
          fichaId,
          aprendizId,
          asistentes: formData.asistentes.filter(a => a.nombre.trim() !== ''),
        };
        await api.post(`/ptc/actas`, createPayload);
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
      fechaReunion: new Date().toISOString(),
      lugar: '',
      asunto: '',
      desarrollo: '',
      acuerdos: '',
      asistentes: [{ nombre: '', rol: 'APRENDIZ', email: '', telefono: '' }],
    });
    setEditingActa(null);
  };

  const openEditDialog = (acta: Acta) => {
    setEditingActa(acta);
    setFormData({
      fechaReunion: acta.fechaReunion,
      lugar: acta.lugar || '',
      asunto: acta.asunto,
      desarrollo: acta.desarrollo,
      acuerdos: acta.acuerdos,
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

  const generatePDF = (acta: Acta, shouldDownload: boolean = true) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ACTA DE REUNIÓN', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Información básica
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha de Reunión:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(acta.fechaReunion), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }), margin + 45, yPos);
    yPos += 8;

    if (acta.lugar) {
      doc.setFont('helvetica', 'bold');
      doc.text('Lugar:', margin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(acta.lugar, margin + 45, yPos);
      yPos += 8;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(acta.estado, margin + 45, yPos);
    yPos += 12;

    // Asunto
    doc.setFont('helvetica', 'bold');
    doc.text('ASUNTO:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const asuntoLines = doc.splitTextToSize(acta.asunto, pageWidth - 2 * margin);
    doc.text(asuntoLines, margin, yPos);
    yPos += asuntoLines.length * 6 + 8;

    // Desarrollo
    doc.setFont('helvetica', 'bold');
    doc.text('DESARROLLO:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const desarrolloLines = doc.splitTextToSize(acta.desarrollo, pageWidth - 2 * margin);
    doc.text(desarrolloLines, margin, yPos);
    yPos += desarrolloLines.length * 6 + 8;

    // Acuerdos
    doc.setFont('helvetica', 'bold');
    doc.text('ACUERDOS:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const acuerdosLines = doc.splitTextToSize(acta.acuerdos, pageWidth - 2 * margin);
    doc.text(acuerdosLines, margin, yPos);
    yPos += acuerdosLines.length * 6 + 12;

    // Verificar si necesitamos nueva página para los asistentes
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    // Asistentes - Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Asistentes:', margin, yPos);
    yPos += 15;

    // Configuración para las firmas en 2 columnas
    const columnWidth = (pageWidth - 2 * margin - 10) / 2; // Ancho de cada columna
    const rowHeight = 35; // Altura de cada fila
    const leftColumnX = margin;
    const rightColumnX = margin + columnWidth + 10;

    // Calcular número de filas necesarias según cantidad de asistentes
    const totalRows = Math.ceil(acta.asistentes.length / 2);

    // Generar espacios para firmas según los asistentes agregados
    for (let row = 0; row < totalRows; row++) {
      const currentY = yPos + (row * rowHeight);
      
      // Columna izquierda
      const leftIndex = row * 2;
      if (leftIndex < acta.asistentes.length) {
        const asistente = acta.asistentes[leftIndex];
        // Línea para la firma
        doc.setLineWidth(0.5);
        doc.line(leftColumnX, currentY + 15, leftColumnX + columnWidth - 5, currentY + 15);
        
        // Información del asistente
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(asistente.nombre, leftColumnX, currentY + 20);
        doc.text(asistente.rol, leftColumnX, currentY + 25);
        if (asistente.email || asistente.telefono) {
          doc.setFontSize(8);
          doc.text(`${asistente.email || ''} ${asistente.telefono || ''}`, leftColumnX, currentY + 29);
        }
      }
      
      // Columna derecha
      const rightIndex = row * 2 + 1;
      if (rightIndex < acta.asistentes.length) {
        const asistente = acta.asistentes[rightIndex];
        // Línea para la firma
        doc.setLineWidth(0.5);
        doc.line(rightColumnX, currentY + 15, rightColumnX + columnWidth - 5, currentY + 15);
        
        // Información del asistente
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(asistente.nombre, rightColumnX, currentY + 20);
        doc.text(asistente.rol, rightColumnX, currentY + 25);
        if (asistente.email || asistente.telefono) {
          doc.setFontSize(8);
          doc.text(`${asistente.email || ''} ${asistente.telefono || ''}`, rightColumnX, currentY + 29);
        }
      }
    }

    // Descargar o mostrar el PDF
    if (shouldDownload) {
      const fileName = `Acta_${format(new Date(acta.fechaReunion), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      toast.success('PDF generado exitosamente');
    } else {
      // Abrir en nueva pestaña para visualizar
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    }
  };

  const viewPDF = (acta: Acta) => {
    generatePDF(acta, false);
  };

  const handleUploadSignedPdf = async (actaId: string, file: File) => {
    if (!file) {
      toast.error('Selecciona un archivo PDF');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/ptc/actas/${actaId}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('PDF firmado subido exitosamente');
      fetchActas();
      setDetailDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir el PDF');
    }
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {editingActa ? 'Editar Acta' : 'Nueva Acta de Reunión'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingActa ? 'Modifica los detalles del acta de reunión' : 'Completa la información para crear un acta de reunión'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-700">Fecha de Reunión *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.fechaReunion.slice(0, 16)}
                    onChange={(e) => setFormData({ ...formData, fechaReunion: e.target.value })}
                    className="bg-gray-50 border-gray-300 text-gray-900"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Lugar</Label>
                  <Input
                    value={formData.lugar}
                    onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                    placeholder="Sala de juntas - Edificio A"
                    className="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Asunto *</Label>
                <Input
                  value={formData.asunto}
                  onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                  placeholder="Asunto de la reunión"
                  className="bg-gray-50 border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Desarrollo *</Label>
                <Textarea
                  value={formData.desarrollo}
                  onChange={(e) => setFormData({ ...formData, desarrollo: e.target.value })}
                  placeholder="Desarrollo de la reunión..."
                  rows={3}
                  className="bg-gray-50 border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Acuerdos *</Label>
                <Textarea
                  value={formData.acuerdos}
                  onChange={(e) => setFormData({ ...formData, acuerdos: e.target.value })}
                  placeholder="Acuerdos y compromisos resultantes..."
                  rows={3}
                  className="bg-gray-50 border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-700 font-semibold">Asistentes</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addAsistente} className="border-gray-300 text-gray-900">
                    <PlusCircle className="mr-2 h-3 w-3" />
                    Agregar Asistente
                  </Button>
                </div>

                {formData.asistentes.map((asistente, index) => (
                  <Card key={index} className="p-4 border-gray-200">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-700">Nombre *</Label>
                        <Input
                          value={asistente.nombre}
                          onChange={(e) => updateAsistente(index, 'nombre', e.target.value)}
                          placeholder="Nombre completo"
                          className="bg-gray-50 border-gray-300 text-gray-900"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-700">Rol *</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900"
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
                        <Label className="text-xs text-gray-700">Email</Label>
                        <Input
                          type="email"
                          value={asistente.email}
                          onChange={(e) => updateAsistente(index, 'email', e.target.value)}
                          placeholder="email@ejemplo.com"
                          className="bg-gray-50 border-gray-300 text-gray-900"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-700">Teléfono</Label>
                        <Input
                          value={asistente.telefono}
                          onChange={(e) => updateAsistente(index, 'telefono', e.target.value)}
                          placeholder="300 123 4567"
                          className="bg-gray-50 border-gray-300 text-gray-900"
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
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-300 text-gray-900">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingActa ? 'Actualizar' : 'Crear Acta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {actas.length === 0 ? (
        <Card className="border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No hay actas registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {actas.map((acta) => (
            <Card key={acta.id} className="border-gray-200">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(acta.fechaReunion), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    </div>
                    {getEstadoBadge(acta.estado)}
                  </div>
                  {acta.estado === 'BORRADOR' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditDialog(acta)} className="text-gray-700">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(acta.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-gray-700 font-semibold">Asunto:</p>
                  <p className="text-sm text-gray-900">{acta.asunto}</p>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{acta.desarrollo}</p>
                
                {acta.pdfUrl && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">PDF Firmado Disponible</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
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
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Detalle del Acta</DialogTitle>
            <DialogDescription className="text-gray-600">
              Información completa del acta de reunión
            </DialogDescription>
          </DialogHeader>
          {selectedActa && (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => viewPDF(selectedActa)}
                  className="border-gray-400 text-gray-900"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Acta
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generatePDF(selectedActa)}
                  className="border-gray-400 text-gray-900"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                {(selectedActa.estado === 'FIRMABLE' || selectedActa.estado === 'CERRADA') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-900"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'application/pdf';
                      input.onchange = (e: any) => {
                        const file = e.target.files[0];
                        if (file) handleUploadSignedPdf(selectedActa.id, file);
                      };
                      input.click();
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir PDF Firmado
                  </Button>
                )}
              </div>
              
              {selectedActa.pdfUrl && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">PDF Firmado Disponible</p>
                        <p className="text-xs text-gray-600">Hash: {selectedActa.hash?.slice(0, 20)}...</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => window.open(selectedActa.pdfUrl, '_blank')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Ver PDF
                    </Button>
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-xs text-gray-700">Fecha de Reunión</Label>
                <p className="text-sm text-gray-900">{format(new Date(selectedActa.fechaReunion), "d 'de' MMMM, yyyy", { locale: es })}</p>
              </div>
              {selectedActa.lugar && (
                <div>
                  <Label className="text-xs text-gray-700">Lugar</Label>
                  <p className="text-sm text-gray-900">{selectedActa.lugar}</p>
                </div>
              )}
              <div>
                <Label className="text-xs text-gray-700">Estado</Label>
                <div className="mt-1">{getEstadoBadge(selectedActa.estado)}</div>
              </div>
              <div>
                <Label className="text-xs text-gray-700">Asunto</Label>
                <p className="text-sm text-gray-900">{selectedActa.asunto}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-700">Desarrollo</Label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedActa.desarrollo}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-700">Acuerdos</Label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedActa.acuerdos}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-700">Asistentes ({selectedActa.asistentes.length})</Label>
                <div className="mt-2 space-y-2">
                  {selectedActa.asistentes.map((asistente, i) => (
                    <Card key={i} className="p-3 border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">{asistente.nombre}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{asistente.rol}</Badge>
                        </div>
                        <div className="text-xs text-gray-600">
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
