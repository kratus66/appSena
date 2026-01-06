'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, CheckCircle, XCircle, AlertCircle, Edit, Upload, X } from 'lucide-react';
import api from '@/lib/api';
import { ClaseSesion, Asistencia } from '@/types';

export default function SesionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sesion, setSesion] = useState<ClaseSesion | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState<Asistencia | null>(null);

  useEffect(() => {
    fetchSesion();
  }, [params.id]);

  const fetchSesion = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/asistencias/sesiones/${params.id}`);
      setSesion(response.data);
      setAsistencias(response.data.asistencias || []);
    } catch (error) {
      console.error('Error fetching sesion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJustify = (asistencia: Asistencia) => {
    setSelectedAsistencia(asistencia);
    setShowJustifyModal(true);
  };

  const stats = {
    presentes: asistencias.filter(a => a.presente).length,
    ausentes: asistencias.filter(a => !a.presente && !a.justificada).length,
    justificadas: asistencias.filter(a => a.justificada).length,
    total: asistencias.length,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-green-600 mb-4"></div>
            <p className="text-gray-500">Cargando sesión...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!sesion) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">Sesión no encontrada</p>
          <Button onClick={() => router.back()} className="mt-4" variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalle de Sesión
            </h1>
            <p className="text-gray-500">
              {new Date(sesion.fecha).toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/asistencias/registrar/${sesion.id}`)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar Asistencias
        </Button>
      </div>

      {/* Información de la Sesión */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Ficha</h3>
            <p className="text-lg font-semibold">{sesion.ficha?.numeroFicha}</p>
            <p className="text-sm text-gray-600">{sesion.ficha?.programa?.nombre}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Instructor</h3>
            <p className="text-lg font-semibold">
              {sesion.createdByUser?.nombre}
            </p>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tema</h3>
            <p className="text-gray-900">{sesion.tema}</p>
          </div>
          {sesion.observaciones && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Observaciones</h3>
              <p className="text-gray-700">{sesion.observaciones}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Presentes</p>
              <p className="text-2xl font-bold text-green-600">{stats.presentes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ausentes</p>
              <p className="text-2xl font-bold text-red-600">{stats.ausentes}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Justificadas</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.justificadas}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>
      </div>

      {/* Lista de Asistencias */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Lista de Asistencia</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Documento</th>
                <th className="text-left py-3 px-4">Aprendiz</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Motivo</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asistencias.map((asistencia, index) => (
                <tr key={asistencia.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{asistencia.aprendiz?.documento}</td>
                  <td className="py-3 px-4">
                    {asistencia.aprendiz?.nombres} {asistencia.aprendiz?.apellidos}
                  </td>
                  <td className="py-3 px-4">
                    {asistencia.presente ? (
                      <Badge className="bg-green-100 text-green-800">Presente</Badge>
                    ) : asistencia.justificada ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Justificada</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Ausente</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {asistencia.motivoJustificacion || '-'}
                  </td>
                  <td className="py-3 px-4">
                    {!asistencia.presente && !asistencia.justificada && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleJustify(asistencia)}
                      >
                        Justificar
                      </Button>
                    )}
                    {asistencia.evidenciaUrl && (
                      <a
                        href={asistencia.evidenciaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:underline text-sm"
                      >
                        Ver evidencia
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal para Justificar */}
      {showJustifyModal && selectedAsistencia && (
        <JustifyModal
          asistencia={selectedAsistencia}
          onClose={() => {
            setShowJustifyModal(false);
            setSelectedAsistencia(null);
          }}
          onSuccess={() => {
            setShowJustifyModal(false);
            setSelectedAsistencia(null);
            fetchSesion();
          }}
        />
      )}
      </div>
    </DashboardLayout>
  );
}

function JustifyModal({
  asistencia,
  onClose,
  onSuccess,
}: {
  asistencia: Asistencia;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [motivo, setMotivo] = useState('');
  const [evidenciaUrl, setEvidenciaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Use PDF, imágenes (JPG, PNG, WEBP) o documentos Word.');
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe superar 5MB');
      return;
    }

    setSelectedFile(file);
    setEvidenciaUrl(''); // Limpiar URL manual si selecciona archivo
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(30);

      const formData = new FormData();
      formData.append('file', selectedFile);

      setUploadProgress(60);
      const response = await api.post('/upload/evidencia', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadProgress(100);
      setEvidenciaUrl(response.data.url);
      alert('Archivo subido correctamente');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(error.response?.data?.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setEvidenciaUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!motivo.trim()) {
      alert('El motivo es obligatorio');
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/asistencias/asistencias/${asistencia.id}/justificar`, {
        justificada: true,
        motivoJustificacion: motivo,
        evidenciaUrl: evidenciaUrl.trim() || undefined,
      });
      alert('Asistencia justificada correctamente');
      onSuccess();
    } catch (error: any) {
      console.error('Error justifying:', error);
      alert(error.response?.data?.message || 'Error al justificar asistencia');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    return '📎';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Justificar Ausencia</h2>
        <p className="text-gray-600 mb-4">
          Aprendiz: {asistencia.aprendiz?.nombres} {asistencia.aprendiz?.apellidos}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
              placeholder="Describa el motivo de la ausencia..."
              required
              disabled={loading || uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidencia (opcional)
            </label>
            
            {/* Selector de archivo */}
            {!evidenciaUrl && (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={loading || uploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Haz clic para seleccionar un archivo
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, imágenes, Word (máx. 5MB)
                    </span>
                  </label>
                </div>

                {/* Archivo seleccionado */}
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleUpload}
                        disabled={uploading || loading}
                        className="text-xs"
                      >
                        {uploading ? 'Subiendo...' : 'Subir'}
                      </Button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={uploading || loading}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Barra de progreso */}
                {uploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Evidencia subida */}
            {evidenciaUrl && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Archivo subido correctamente
                    </p>
                    <a
                      href={evidenciaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 hover:underline"
                    >
                      Ver archivo
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading || uploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploading}>
              {loading ? 'Guardando...' : 'Justificar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
