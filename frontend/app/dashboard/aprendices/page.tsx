'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  GraduationCap,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { Aprendiz } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AprendicesPage() {
  const [aprendices, setAprendices] = React.useState<Aprendiz[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [estadoFilter, setEstadoFilter] = React.useState('');
  const [selectedAprendiz, setSelectedAprendiz] = React.useState<Aprendiz | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    estadoAcademico: 'ACTIVO',
  });
  const [createFormData, setCreateFormData] = React.useState({
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC',
    documento: '',
    email: '',
    telefono: '',
    direccion: '',
    estadoAcademico: 'ACTIVO',
    fichaId: '',
    password: '',
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [fichas, setFichas] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchAprendices();
  }, [currentPage, searchTerm]);

  React.useEffect(() => {
    if (isCreateModalOpen) {
      fetchFichas();
    }
  }, [isCreateModalOpen]);

  const fetchFichas = async () => {
    try {
      const response = await api.get('/fichas?limit=100');
      setFichas(response.data.data || []);
    } catch (error) {
      console.error('Error fetching fichas:', error);
    }
  };

  const fetchAprendices = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 100 };
      if (searchTerm) params.search = searchTerm;
      // No enviar estadoFilter al backend, filtraremos localmente

      const response = await api.get('/aprendices', { params });
      setAprendices(response.data.data);
      setTotalPages(Math.ceil(response.data.total / response.data.limit));
    } catch (error) {
      console.error('Error fetching aprendices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar aprendices localmente
  const filteredAprendices = React.useMemo(() => {
    if (!aprendices) return [];
    if (!estadoFilter) return aprendices;
    return aprendices.filter((aprendiz) => aprendiz.estadoAcademico === estadoFilter);
  }, [aprendices, estadoFilter]);

  const handleViewAprendiz = (aprendiz: Aprendiz) => {
    setSelectedAprendiz(aprendiz);
    setIsViewModalOpen(true);
  };

  const handleEditAprendiz = (aprendiz: Aprendiz) => {
    setSelectedAprendiz(aprendiz);
    setEditFormData({
      nombres: aprendiz.nombres,
      apellidos: aprendiz.apellidos,
      tipoDocumento: aprendiz.tipoDocumento,
      documento: aprendiz.documento,
      email: aprendiz.email || '',
      telefono: aprendiz.telefono || '',
      direccion: aprendiz.direccion || '',
      estadoAcademico: aprendiz.estadoAcademico,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAprendiz) return;
    
    try {
      setIsSaving(true);
      // No enviar documento ni tipoDocumento (campos no editables)
      const { documento, tipoDocumento, ...dataToUpdate } = editFormData;
      await api.patch(`/aprendices/${selectedAprendiz.id}`, dataToUpdate);
      alert('✅ Aprendiz actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedAprendiz(null);
      fetchAprendices();
    } catch (error: any) {
      console.error('Error updating aprendiz:', error);
      const mensaje = error.response?.data?.message || 'Error al actualizar el aprendiz';
      alert('❌ Error: ' + mensaje);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAprendiz = (aprendiz: Aprendiz) => {
    setSelectedAprendiz(aprendiz);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAprendiz = async () => {
    if (!selectedAprendiz) return;
    try {
      await api.delete(`/aprendices/${selectedAprendiz.id}`);
      alert('✅ Aprendiz eliminado exitosamente');
      setIsDeleteModalOpen(false);
      setSelectedAprendiz(null);
      fetchAprendices();
    } catch (error: any) {
      console.error('Error deleting aprendiz:', error);
      const mensaje = error.response?.data?.message || 'Error al eliminar el aprendiz';
      alert('❌ Error: ' + mensaje);
    }
  };

  const handleExportToCSV = () => {
    try {
      // Preparar los datos para exportar
      const dataToExport = filteredAprendices.map((aprendiz) => ({
        'Nombres': aprendiz.nombres,
        'Apellidos': aprendiz.apellidos,
        'Tipo Documento': aprendiz.tipoDocumento,
        'Documento': aprendiz.documento,
        'Email': aprendiz.email || '',
        'Teléfono': aprendiz.telefono || '',
        'Dirección': aprendiz.direccion || '',
        'Estado Académico': aprendiz.estadoAcademico,
        'Ficha': aprendiz.ficha?.numeroFicha || 'N/A',
        'Fecha Creación': aprendiz.createdAt ? new Date(aprendiz.createdAt).toLocaleDateString('es-CO') : 'N/A',
      }));

      // Convertir a CSV
      const headers = Object.keys(dataToExport[0]);
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            // Escapar valores que contengan comas o comillas
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
              ? `"${value.replace(/"/g, '""')}"`
              : value;
          }).join(',')
        )
      ].join('\n');

      // Crear y descargar el archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `aprendices_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('✅ Datos exportados exitosamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('❌ Error al exportar los datos');
    }
  };

  const handleCreateAprendiz = async () => {
    try {
      setIsSaving(true);

      // Validar que todos los campos requeridos estén llenos
      if (!createFormData.password || createFormData.password.length < 6) {
        alert('❌ La contraseña debe tener al menos 6 caracteres');
        setIsSaving(false);
        return;
      }

      if (!createFormData.email) {
        alert('❌ El email es requerido');
        setIsSaving(false);
        return;
      }

      // Paso 1: Crear el usuario primero
      const userPayload = {
        nombre: `${createFormData.nombres} ${createFormData.apellidos}`,
        email: createFormData.email,
        password: createFormData.password,
        documento: createFormData.documento,
        telefono: createFormData.telefono || '',
        rol: 'aprendiz',
      };

      const userResponse = await api.post('/users', userPayload);
      const userId = userResponse.data.id;

      // Paso 2: Crear el aprendiz con el userId obtenido
      const aprendizPayload = {
        nombres: createFormData.nombres,
        apellidos: createFormData.apellidos,
        tipoDocumento: createFormData.tipoDocumento,
        documento: createFormData.documento,
        email: createFormData.email,
        telefono: createFormData.telefono,
        direccion: createFormData.direccion,
        estadoAcademico: createFormData.estadoAcademico,
        userId: userId,
        fichaId: createFormData.fichaId,
      };

      await api.post('/aprendices', aprendizPayload);
      
      alert('✅ Aprendiz creado exitosamente');
      setIsCreateModalOpen(false);
      setCreateFormData({
        nombres: '',
        apellidos: '',
        tipoDocumento: 'CC',
        documento: '',
        email: '',
        telefono: '',
        direccion: '',
        estadoAcademico: 'ACTIVO',
        fichaId: '',
        password: '',
      });
      fetchAprendices();
    } catch (error: any) {
      console.error('Error creating aprendiz:', error);
      const mensaje = error.response?.data?.message;
      if (Array.isArray(mensaje)) {
        alert('❌ Error: ' + mensaje.join(', '));
      } else {
        alert('❌ Error: ' + (mensaje || 'Error al crear el aprendiz'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants: any = {
      ACTIVO: 'success',
      SUSPENDIDO: 'warning',
      RETIRADO: 'danger',
      DESERTOR: 'danger',
    };
    return <Badge variant={variants[estado] || 'default'}>{estado}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Aprendices</h1>
            <p className="text-gray-600 mt-1 font-medium">Gestiona los aprendices del sistema</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2">
            <Plus size={20} />
            <span>Nuevo Aprendiz</span>
          </Button>
        </div>

        {/* View Modal - Matching Users Design */}
        {isViewModalOpen && selectedAprendiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Detalles del Aprendiz</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsViewModalOpen(false); setSelectedAprendiz(null); }}>
                    <Eye size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar y nombre */}
                  <div className="flex items-center space-x-4 pb-6 border-b">
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-3xl font-bold text-green-700">
                        {selectedAprendiz.nombres.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedAprendiz.nombres} {selectedAprendiz.apellidos}</h2>
                      <p className="text-gray-500">{selectedAprendiz.email}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="info">Aprendiz</Badge>
                        {getEstadoBadge(selectedAprendiz.estadoAcademico)}
                      </div>
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Personal</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <GraduationCap className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Documento</p>
                            <p className="font-medium">{selectedAprendiz.tipoDocumento} - {selectedAprendiz.documento}</p>
                          </div>
                        </div>
                        {selectedAprendiz.telefono && (
                          <div className="flex items-center text-gray-600">
                            <Search className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-500">Teléfono</p>
                              <p className="font-medium">{selectedAprendiz.telefono}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <Filter className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium">{selectedAprendiz.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Información del Sistema</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <Download className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Ficha</p>
                            <p className="font-medium">{selectedAprendiz.ficha?.numeroFicha || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <AlertCircle className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Fecha de Creación</p>
                            <p className="font-medium">
                              {selectedAprendiz.createdAt ? new Date(selectedAprendiz.createdAt).toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Plus className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Última Actualización</p>
                            <p className="font-medium">
                              {selectedAprendiz.updatedAt ? new Date(selectedAprendiz.updatedAt).toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={() => { setIsViewModalOpen(false); setSelectedAprendiz(null); }} className="w-full bg-green-600 hover:bg-green-700">
                      Cerrar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8 bg-white">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Nuevo Aprendiz</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { 
                      setIsCreateModalOpen(false);
                      setCreateFormData({
                        nombres: '',
                        apellidos: '',
                        tipoDocumento: 'CC',
                        documento: '',
                        email: '',
                        telefono: '',
                        direccion: '',
                        estadoAcademico: 'ACTIVO',
                        fichaId: '',
                        password: '',
                      });
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => { e.preventDefault(); handleCreateAprendiz(); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Nombres */}
                    <div>
                      <Label htmlFor="create-nombres" className="text-gray-700 font-semibold">Nombres *</Label>
                      <Input
                        id="create-nombres"
                        value={createFormData.nombres}
                        onChange={(e) => setCreateFormData({ ...createFormData, nombres: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Apellidos */}
                    <div>
                      <Label htmlFor="create-apellidos" className="text-gray-700 font-semibold">Apellidos *</Label>
                      <Input
                        id="create-apellidos"
                        value={createFormData.apellidos}
                        onChange={(e) => setCreateFormData({ ...createFormData, apellidos: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Tipo Documento */}
                    <div>
                      <Label htmlFor="create-tipoDocumento" className="text-gray-700 font-semibold">Tipo Documento *</Label>
                      <select
                        id="create-tipoDocumento"
                        value={createFormData.tipoDocumento}
                        onChange={(e) => setCreateFormData({ ...createFormData, tipoDocumento: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PP">Pasaporte</option>
                      </select>
                    </div>

                    {/* Documento */}
                    <div>
                      <Label htmlFor="create-documento" className="text-gray-700 font-semibold">Documento *</Label>
                      <Input
                        id="create-documento"
                        value={createFormData.documento}
                        onChange={(e) => setCreateFormData({ ...createFormData, documento: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="create-email" className="text-gray-700 font-semibold">Email *</Label>
                      <Input
                        id="create-email"
                        type="email"
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <Label htmlFor="create-telefono" className="text-gray-700 font-semibold">Teléfono</Label>
                      <Input
                        id="create-telefono"
                        value={createFormData.telefono}
                        onChange={(e) => setCreateFormData({ ...createFormData, telefono: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Contraseña Inicial */}
                    <div className="md:col-span-2">
                      <Label htmlFor="create-password" className="text-gray-700 font-semibold">Contraseña Inicial *</Label>
                      <Input
                        id="create-password"
                        type="password"
                        value={createFormData.password}
                        onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                        required
                        minLength={6}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">• La contraseña debe tener al menos 6 caracteres</p>
                      <p className="text-xs text-gray-500">• El usuario recibirá sus credenciales por email</p>
                      <p className="text-xs text-gray-500">• Podrá cambiar su contraseña después del primer login</p>
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2">
                      <Label htmlFor="create-direccion" className="text-gray-700 font-semibold">Dirección</Label>
                      <Input
                        id="create-direccion"
                        value={createFormData.direccion}
                        onChange={(e) => setCreateFormData({ ...createFormData, direccion: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Estado Académico */}
                    <div>
                      <Label htmlFor="create-estadoAcademico" className="text-gray-700 font-semibold">Estado Académico *</Label>
                      <select
                        id="create-estadoAcademico"
                        value={createFormData.estadoAcademico}
                        onChange={(e) => setCreateFormData({ ...createFormData, estadoAcademico: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      >
                        <option value="ACTIVO">Activo</option>
                        <option value="SUSPENDIDO">Suspendido</option>
                        <option value="RETIRADO">Retirado</option>
                      </select>
                    </div>

                    {/* Ficha */}
                    <div>
                      <Label htmlFor="create-fichaId" className="text-gray-700 font-semibold">Ficha *</Label>
                      <select
                        id="create-fichaId"
                        value={createFormData.fichaId}
                        onChange={(e) => setCreateFormData({ ...createFormData, fichaId: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                      >
                        <option value="">Seleccionar ficha</option>
                        {fichas.map((ficha: any) => (
                          <option key={ficha.id} value={ficha.id}>
                            {ficha.numeroFicha} - {ficha.programa?.nombre || 'Sin programa'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex space-x-3 mt-6">
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => { 
                        setIsCreateModalOpen(false);
                        setCreateFormData({
                          nombres: '',
                          apellidos: '',
                          tipoDocumento: 'CC',
                          documento: '',
                          email: '',
                          telefono: '',
                          direccion: '',
                          estadoAcademico: 'ACTIVO',
                          fichaId: '',
                          password: '',
                        });
                      }}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? 'Guardando...' : 'Crear Aprendiz'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedAprendiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8 bg-white">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Editar Aprendiz</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => { setIsEditModalOpen(false); setSelectedAprendiz(null); }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Nombres */}
                    <div>
                      <Label htmlFor="edit-nombres" className="text-gray-700 font-semibold">Nombres *</Label>
                      <Input
                        id="edit-nombres"
                        value={editFormData.nombres}
                        onChange={(e) => setEditFormData({ ...editFormData, nombres: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Apellidos */}
                    <div>
                      <Label htmlFor="edit-apellidos" className="text-gray-700 font-semibold">Apellidos *</Label>
                      <Input
                        id="edit-apellidos"
                        value={editFormData.apellidos}
                        onChange={(e) => setEditFormData({ ...editFormData, apellidos: e.target.value })}
                        required
                        className="mt-1"
                      />
                    </div>

                    {/* Tipo Documento */}
                    <div>
                      <Label htmlFor="edit-tipoDocumento" className="text-gray-700 font-semibold">
                        Tipo Documento * 
                        <span className="text-xs text-gray-500 ml-2">(No editable)</span>
                      </Label>
                      <select
                        id="edit-tipoDocumento"
                        value={editFormData.tipoDocumento}
                        disabled
                        className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed"
                        required
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PAS">Pasaporte</option>
                      </select>
                    </div>

                    {/* Documento */}
                    <div>
                      <Label htmlFor="edit-documento" className="text-gray-700 font-semibold">
                        Documento * 
                        <span className="text-xs text-gray-500 ml-2">(No editable)</span>
                      </Label>
                      <Input
                        id="edit-documento"
                        value={editFormData.documento}
                        disabled
                        className="mt-1 bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="edit-email" className="text-gray-700 font-semibold">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Teléfono */}
                    <div>
                      <Label htmlFor="edit-telefono" className="text-gray-700 font-semibold">Teléfono</Label>
                      <Input
                        id="edit-telefono"
                        value={editFormData.telefono}
                        onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-direccion" className="text-gray-700 font-semibold">Dirección</Label>
                      <Input
                        id="edit-direccion"
                        value={editFormData.direccion}
                        onChange={(e) => setEditFormData({ ...editFormData, direccion: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    {/* Estado Académico */}
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-estadoAcademico" className="text-gray-700 font-semibold">Estado Académico *</Label>
                      <select
                        id="edit-estadoAcademico"
                        value={editFormData.estadoAcademico}
                        onChange={(e) => setEditFormData({ ...editFormData, estadoAcademico: e.target.value as any })}
                        className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 ring-offset-white focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                        required
                      >
                        <option value="ACTIVO">Activo</option>
                        <option value="SUSPENDIDO">Suspendido</option>
                        <option value="RETIRADO">Retirado</option>
                        <option value="DESERTOR">Desertor</option>
                      </select>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setIsEditModalOpen(false); setSelectedAprendiz(null); }}
                      disabled={isSaving}
                      className="px-6"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 px-6"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && selectedAprendiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <AlertCircle className="mr-2" />
                  Confirmar Eliminación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas eliminar al aprendiz{' '}
                  <strong>{selectedAprendiz.nombres} {selectedAprendiz.apellidos}</strong>?
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setSelectedAprendiz(null);
                    }}
                    className="flex-1 font-bold text-gray-950"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmDeleteAprendiz}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="search"
                    placeholder="Buscar por nombre, documento..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900 font-medium"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="RETIRADO">Retirado</option>
              </select>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter size={20} />
                <span>Más Filtros</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2"
                onClick={handleExportToCSV}
                disabled={filteredAprendices.length === 0}
              >
                <Download size={20} />
                <span>Exportar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${estadoFilter === '' ? 'ring-2 ring-gray-400 shadow-md' : ''}`}
            onClick={() => setEstadoFilter('')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{aprendices.length}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${estadoFilter === 'ACTIVO' ? 'ring-2 ring-green-400 shadow-md' : ''}`}
            onClick={() => setEstadoFilter('ACTIVO')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {aprendices.filter((a) => a.estadoAcademico === 'ACTIVO').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${estadoFilter === 'SUSPENDIDO' ? 'ring-2 ring-orange-400 shadow-md' : ''}`}
            onClick={() => setEstadoFilter('SUSPENDIDO')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Suspendidos</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {aprendices.filter((a) => a.estadoAcademico === 'SUSPENDIDO').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold">⚠</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${estadoFilter === 'RETIRADO' ? 'ring-2 ring-red-400 shadow-md' : ''}`}
            onClick={() => setEstadoFilter('RETIRADO')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Retirados</p>
                  <p className="text-2xl font-bold text-red-600">
                    {aprendices.filter((a) => a.estadoAcademico === 'RETIRADO').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">✕</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-950 font-bold">Lista de Aprendices</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : filteredAprendices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {estadoFilter ? `No hay aprendices con estado ${estadoFilter}` : 'No se encontraron aprendices'}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Documento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ficha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAprendices.map((aprendiz) => (
                        <tr key={aprendiz.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {aprendiz.nombres} {aprendiz.apellidos}
                              </div>
                              <div className="text-sm text-gray-500">
                                {aprendiz.tipoDocumento} - {aprendiz.documento}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {aprendiz.documento}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {aprendiz.ficha?.numeroFicha || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getEstadoBadge(aprendiz.estadoAcademico)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{aprendiz.email}</div>
                            <div className="text-sm text-gray-500">{aprendiz.telefono}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => handleViewAprendiz(aprendiz)}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleEditAprendiz(aprendiz)}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteAprendiz(aprendiz)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
