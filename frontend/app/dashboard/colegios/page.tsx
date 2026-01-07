'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  Eye,
  School,
  MapPin,
  Phone,
  Mail,
  X,
  Trash2,
} from 'lucide-react';
import api from '@/lib/api';
import { Colegio } from '@/types';

export default function ColegiosPage() {
  const [colegios, setColegios] = React.useState<Colegio[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [selectedColegio, setSelectedColegio] = React.useState<Colegio | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    nombre: '',
    nit: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    telefono: '',
    email: '',
    rector: '',
    activo: true,
  });
  const [createFormData, setCreateFormData] = React.useState({
    nombre: '',
    nit: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    telefono: '',
    email: '',
    rector: '',
  });

  React.useEffect(() => {
    fetchColegios();
  }, []);

  const fetchColegios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/colegios');
      const colegiosData = Array.isArray(response.data) ? response.data : [];
      setColegios(colegiosData);
    } catch (error) {
      console.error('Error fetching colegios:', error);
      setColegios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (colegio: Colegio) => {
    setSelectedColegio(colegio);
    setIsViewModalOpen(true);
  };

  const handleEdit = (colegio: Colegio) => {
    setSelectedColegio(colegio);
    setEditFormData({
      nombre: colegio.nombre,
      nit: colegio.nit,
      direccion: colegio.direccion,
      ciudad: colegio.ciudad,
      departamento: colegio.departamento,
      telefono: colegio.telefono,
      email: colegio.email,
      rector: colegio.rector,
      activo: colegio.activo,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedColegio) return;
    try {
      setIsSaving(true);
      await api.patch(`/colegios/${selectedColegio.id}`, editFormData);
      alert('✅ Colegio actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedColegio(null);
      fetchColegios();
    } catch (error: any) {
      console.error('Error updating colegio:', error);
      const mensaje = error.response?.data?.message;
      if (Array.isArray(mensaje)) {
        alert('❌ Error: ' + mensaje.join(', '));
      } else {
        alert('❌ Error: ' + (mensaje || 'Error al actualizar el colegio'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateColegio = async () => {
    try {
      setIsSaving(true);
      await api.post('/colegios', createFormData);
      alert('✅ Colegio creado exitosamente');
      setIsCreateModalOpen(false);
      setCreateFormData({
        nombre: '',
        nit: '',
        direccion: '',
        ciudad: '',
        departamento: '',
        telefono: '',
        email: '',
        rector: '',
      });
      fetchColegios();
    } catch (error: any) {
      console.error('Error creating colegio:', error);
      const mensaje = error.response?.data?.message;
      if (Array.isArray(mensaje)) {
        alert('❌ Error: ' + mensaje.join(', '));
      } else {
        alert('❌ Error: ' + (mensaje || 'Error al crear el colegio'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedColegio) return;
    try {
      setIsSaving(true);
      await api.delete(`/colegios/${selectedColegio.id}`);
      alert('✅ Colegio eliminado exitosamente');
      setIsDeleteModalOpen(false);
      setSelectedColegio(null);
      fetchColegios();
    } catch (error: any) {
      console.error('Error deleting colegio:', error);
      const mensaje = error.response?.data?.message;
      if (Array.isArray(mensaje)) {
        alert('❌ Error: ' + mensaje.join(', '));
      } else {
        alert('❌ Error: ' + (mensaje || 'Error al eliminar el colegio'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar colegios
  const filteredColegios = React.useMemo(() => {
    let result = colegios;

    // Filtro por estado
    if (statusFilter === 'active') {
      result = result.filter(c => c.activo);
    } else if (statusFilter === 'inactive') {
      result = result.filter(c => !c.activo);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((colegio) => 
        colegio.nombre.toLowerCase().includes(term) ||
        colegio.ciudad.toLowerCase().includes(term) ||
        colegio.departamento.toLowerCase().includes(term) ||
        colegio.nit.toLowerCase().includes(term)
      );
    }

    return result;
  }, [colegios, searchTerm, statusFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Colegios</h1>
            <p className="text-gray-600 mt-1 font-medium">Gestiona las instituciones educativas</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
            <Plus size={20} />
            <span>Nuevo Colegio</span>
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="search"
                placeholder="Buscar colegio por nombre, ciudad o NIT..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('all')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Total Colegios</p>
                  <p className="text-2xl font-bold text-gray-900">{colegios.length}</p>
                </div>
                <School className="h-8 w-8 text-blue-500" />
              </div>
              {statusFilter === 'all' && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-600 font-medium">Filtro activo</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('active')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {colegios.filter((c) => c.activo).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
              {statusFilter === 'active' && (
                <div className="mt-2 pt-2 border-t border-green-200">
                  <p className="text-xs text-green-600 font-medium">Filtro activo</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('inactive')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Inactivos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {colegios.filter((c) => !c.activo).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">✕</span>
                </div>
              </div>
              {statusFilter === 'inactive' && (
                <div className="mt-2 pt-2 border-t border-red-200">
                  <p className="text-xs text-red-600 font-medium">Filtro activo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colegios Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Cargando...
            </div>
          ) : filteredColegios.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {searchTerm || statusFilter !== 'all' ? 'No se encontraron colegios que coincidan con los filtros' : 'No se encontraron colegios'}
            </div>
          ) : (
            filteredColegios.map((colegio) => (
              <Card key={colegio.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight text-gray-900 font-bold">
                        {colegio.nombre}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1 font-medium">NIT: {colegio.nit}</p>
                    </div>
                    <Badge variant={colegio.activo ? 'success' : 'danger'}>
                      {colegio.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">{colegio.ciudad}</p>
                        <p className="text-gray-700 font-medium">{colegio.departamento}</p>
                        <p className="text-gray-600 text-xs mt-1">{colegio.direccion}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-800 font-medium">{colegio.telefono}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-800 font-medium truncate">{colegio.email}</span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-sm">
                        <p className="text-gray-700 font-semibold">Rector/a:</p>
                        <p className="font-semibold text-gray-900">{colegio.rector}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-3">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleView(colegio)}>
                        <Eye size={16} className="mr-2" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(colegio)}>
                        <Edit size={16} className="mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Modal */}
        {isViewModalOpen && selectedColegio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Detalles del Colegio</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsViewModalOpen(false); setSelectedColegio(null); }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-6 border-b">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedColegio.nombre}</h2>
                      <p className="text-gray-600 mt-1">NIT: {selectedColegio.nit}</p>
                      <div className="mt-2">
                        <Badge variant={selectedColegio.activo ? 'success' : 'danger'}>
                          {selectedColegio.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Rector/a</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedColegio.rector}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Teléfono</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedColegio.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Email</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedColegio.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Ciudad</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedColegio.ciudad}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Departamento</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedColegio.departamento}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm font-semibold text-gray-700">Dirección</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedColegio.direccion}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={() => { setIsViewModalOpen(false); setSelectedColegio(null); }} className="w-full bg-green-600 hover:bg-green-700">
                      Cerrar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedColegio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8 bg-white">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Editar Colegio</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditModalOpen(false); setSelectedColegio(null); }} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-nombre" className="text-gray-700 font-semibold">Nombre del Colegio *</Label>
                      <Input id="edit-nombre" value={editFormData.nombre} onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-nit" className="text-gray-700 font-semibold">NIT *</Label>
                      <Input id="edit-nit" value={editFormData.nit} onChange={(e) => setEditFormData({ ...editFormData, nit: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-rector" className="text-gray-700 font-semibold">Rector/a *</Label>
                      <Input id="edit-rector" value={editFormData.rector} onChange={(e) => setEditFormData({ ...editFormData, rector: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-ciudad" className="text-gray-700 font-semibold">Ciudad *</Label>
                      <Input id="edit-ciudad" value={editFormData.ciudad} onChange={(e) => setEditFormData({ ...editFormData, ciudad: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-departamento" className="text-gray-700 font-semibold">Departamento *</Label>
                      <Input id="edit-departamento" value={editFormData.departamento} onChange={(e) => setEditFormData({ ...editFormData, departamento: e.target.value })} required className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-direccion" className="text-gray-700 font-semibold">Dirección *</Label>
                      <Input id="edit-direccion" value={editFormData.direccion} onChange={(e) => setEditFormData({ ...editFormData, direccion: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-telefono" className="text-gray-700 font-semibold">Teléfono *</Label>
                      <Input id="edit-telefono" value={editFormData.telefono} onChange={(e) => setEditFormData({ ...editFormData, telefono: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-email" className="text-gray-700 font-semibold">Email *</Label>
                      <Input id="edit-email" type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} required className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-activo" className="text-gray-700 font-semibold">Estado</Label>
                      <select id="edit-activo" value={editFormData.activo ? 'true' : 'false'} onChange={(e) => setEditFormData({ ...editFormData, activo: e.target.value === 'true' })} className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent mt-1">
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 border-t flex space-x-3 mt-6">
                    <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setSelectedColegio(null); }} className="flex-1">Cancelar</Button>
                    <Button type="submit" disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700">{isSaving ? 'Guardando...' : 'Guardar Cambios'}</Button>
                  </div>
                </form>
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
                  <CardTitle className="text-xl font-bold text-gray-900">Nuevo Colegio</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsCreateModalOpen(false); setCreateFormData({ nombre: '', nit: '', direccion: '', ciudad: '', departamento: '', telefono: '', email: '', rector: '' }); }} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => { e.preventDefault(); handleCreateColegio(); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="create-nombre" className="text-gray-700 font-semibold">Nombre del Colegio *</Label>
                      <Input id="create-nombre" value={createFormData.nombre} onChange={(e) => setCreateFormData({ ...createFormData, nombre: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-nit" className="text-gray-700 font-semibold">NIT *</Label>
                      <Input id="create-nit" value={createFormData.nit} onChange={(e) => setCreateFormData({ ...createFormData, nit: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-rector" className="text-gray-700 font-semibold">Rector/a *</Label>
                      <Input id="create-rector" value={createFormData.rector} onChange={(e) => setCreateFormData({ ...createFormData, rector: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-ciudad" className="text-gray-700 font-semibold">Ciudad *</Label>
                      <Input id="create-ciudad" value={createFormData.ciudad} onChange={(e) => setCreateFormData({ ...createFormData, ciudad: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-departamento" className="text-gray-700 font-semibold">Departamento *</Label>
                      <Input id="create-departamento" value={createFormData.departamento} onChange={(e) => setCreateFormData({ ...createFormData, departamento: e.target.value })} required className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="create-direccion" className="text-gray-700 font-semibold">Dirección *</Label>
                      <Input id="create-direccion" value={createFormData.direccion} onChange={(e) => setCreateFormData({ ...createFormData, direccion: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-telefono" className="text-gray-700 font-semibold">Teléfono *</Label>
                      <Input id="create-telefono" value={createFormData.telefono} onChange={(e) => setCreateFormData({ ...createFormData, telefono: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-email" className="text-gray-700 font-semibold">Email *</Label>
                      <Input id="create-email" type="email" value={createFormData.email} onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })} required className="mt-1" />
                    </div>
                  </div>
                  <div className="pt-4 border-t flex space-x-3 mt-6">
                    <Button type="button" variant="outline" onClick={() => { setIsCreateModalOpen(false); setCreateFormData({ nombre: '', nit: '', direccion: '', ciudad: '', departamento: '', telefono: '', email: '', rector: '' }); }} className="flex-1">Cancelar</Button>
                    <Button type="submit" disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700">{isSaving ? 'Creando...' : 'Crear Colegio'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
