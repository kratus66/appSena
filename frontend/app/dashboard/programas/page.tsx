'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  Eye,
  BookOpen,
  Clock,
  Award,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { Programa } from '@/types';

export default function ProgramasPage() {
  const [programas, setProgramas] = React.useState<Programa[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all');
  const [nivelFilter, setNivelFilter] = React.useState('');
  const [selectedPrograma, setSelectedPrograma] = React.useState<Programa | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editFormData, setEditFormData] = React.useState({
    nombre: '',
    codigo: '',
    nivelFormacion: 'TECNICO',
    areaConocimiento: '',
    duracionMeses: 0,
    totalHoras: 0,
    descripcion: '',
    requisitos: '',
    activo: true,
  });
  const [createFormData, setCreateFormData] = React.useState({
    nombre: '',
    codigo: '',
    nivelFormacion: 'TECNICO',
    areaConocimiento: '',
    duracionMeses: 0,
    totalHoras: 0,
    descripcion: '',
    requisitos: '',
  });

  React.useEffect(() => {
    fetchProgramas();
  }, []);

  const fetchProgramas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/programas');
      const programasData = Array.isArray(response.data) ? response.data : [];
      setProgramas(programasData);
    } catch (error) {
      console.error('Error fetching programas:', error);
      setProgramas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (programa: Programa) => {
    setSelectedPrograma(programa);
    setIsViewModalOpen(true);
  };

  const handleEdit = (programa: Programa) => {
    setSelectedPrograma(programa);
    setEditFormData({
      nombre: programa.nombre,
      codigo: programa.codigo,
      nivelFormacion: programa.nivelFormacion,
      areaConocimiento: programa.areaConocimiento,
      duracionMeses: programa.duracionMeses,
      totalHoras: programa.totalHoras,
      descripcion: programa.descripcion || '',
      requisitos: programa.requisitos || '',
      activo: programa.activo,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedPrograma) return;
    try {
      setIsSaving(true);
      await api.patch(`/programas/${selectedPrograma.id}`, editFormData);
      alert('✅ Programa actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedPrograma(null);
      fetchProgramas();
    } catch (error: any) {
      console.error('Error updating programa:', error);
      const mensaje = error.response?.data?.message;
      if (Array.isArray(mensaje)) {
        alert('❌ Error: ' + mensaje.join(', '));
      } else {
        alert('❌ Error: ' + (mensaje || 'Error al actualizar el programa'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreatePrograma = async () => {
    try {
      setIsSaving(true);
      await api.post('/programas', createFormData);
      alert('✅ Programa creado exitosamente');
      setIsCreateModalOpen(false);
      setCreateFormData({
        nombre: '',
        codigo: '',
        nivelFormacion: 'TECNICO',
        areaConocimiento: '',
        duracionMeses: 0,
        totalHoras: 0,
        descripcion: '',
        requisitos: '',
      });
      fetchProgramas();
    } catch (error: any) {
      console.error('Error creating programa:', error);
      const mensaje = error.response?.data?.message;
      if (Array.isArray(mensaje)) {
        alert('❌ Error: ' + mensaje.join(', '));
      } else {
        alert('❌ Error: ' + (mensaje || 'Error al crear el programa'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrar programas
  const filteredProgramas = React.useMemo(() => {
    let result = programas;

    // Filtro por estado
    if (statusFilter === 'active') {
      result = result.filter(p => p.activo);
    } else if (statusFilter === 'inactive') {
      result = result.filter(p => !p.activo);
    }

    // Filtro por nivel
    if (nivelFilter) {
      result = result.filter(p => p.nivelFormacion === nivelFilter);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((programa) =>
        programa.nombre.toLowerCase().includes(term) ||
        programa.codigo.toLowerCase().includes(term) ||
        programa.areaConocimiento.toLowerCase().includes(term)
      );
    }

    return result;
  }, [programas, searchTerm, statusFilter, nivelFilter]);

  const getNivelBadge = (nivel: string) => {
    const colors: any = {
      TECNICO: 'info',
      TECNOLOGO: 'success',
      ESPECIALIZACION: 'warning',
    };
    return <Badge variant={colors[nivel] || 'default'}>{nivel}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Programas de Formación</h1>
            <p className="text-gray-600 mt-1 font-medium">Gestiona los programas académicos</p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
            <Plus size={20} />
            <span>Nuevo Programa</span>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="search"
                    placeholder="Buscar programa por nombre o código..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900 font-medium"
                value={nivelFilter}
                onChange={(e) => setNivelFilter(e.target.value)}
              >
                <option value="">Todos los niveles</option>
                <option value="TECNICO">Técnico</option>
                <option value="TECNOLOGO">Tecnólogo</option>
                <option value="ESPECIALIZACION">Especialización</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter('all')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-800 font-semibold">Total Programas</p>
                  <p className="text-2xl font-bold text-gray-900">{programas.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
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
                    {programas.filter((p) => p.activo).length}
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
                    {programas.filter((p) => !p.activo).length}
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
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Programas Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando programas...</p>
          </div>
        ) : filteredProgramas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || nivelFilter ? 'No se encontraron programas que coincidan con los filtros' : 'No se encontraron programas'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProgramas.map((programa) => (
              <Card key={programa.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 text-gray-900 font-bold">{programa.nombre}</CardTitle>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono text-gray-800 font-medium">{programa.codigo}</span>
                        {getNivelBadge(programa.nivelFormacion)}
                      </div>
                    </div>
                    <Badge variant={programa.activo ? 'success' : 'danger'}>
                      {programa.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-800 font-medium">
                      <BookOpen size={16} className="mr-2 text-gray-500" />
                      <span>{programa.areaConocimiento}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-800 font-medium">
                      <Clock size={16} className="mr-2 text-gray-500" />
                      <span>{programa.duracionMeses} meses ({programa.totalHoras} horas)</span>
                    </div>
                    {programa.descripcion && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {programa.descripcion}
                      </p>
                    )}
                    <div className="flex gap-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleView(programa)}>
                        <Eye size={16} className="mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(programa)}>
                        <Edit size={16} className="mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && selectedPrograma && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Detalles del Programa</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsViewModalOpen(false); setSelectedPrograma(null); }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="pb-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPrograma.nombre}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-gray-600 font-mono">{selectedPrograma.codigo}</span>
                      {getNivelBadge(selectedPrograma.nivelFormacion)}
                      <Badge variant={selectedPrograma.activo ? 'success' : 'danger'}>
                        {selectedPrograma.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Área de Conocimiento</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedPrograma.areaConocimiento}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Duración</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedPrograma.duracionMeses} meses</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Total Horas</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedPrograma.totalHoras} horas</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Nivel de Formación</p>
                      <p className="text-gray-900 font-medium mt-1">{selectedPrograma.nivelFormacion}</p>
                    </div>
                    {selectedPrograma.descripcion && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-gray-700">Descripción</p>
                        <p className="text-gray-900 font-medium mt-1">{selectedPrograma.descripcion}</p>
                      </div>
                    )}
                    {selectedPrograma.requisitos && (
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-gray-700">Requisitos</p>
                        <p className="text-gray-900 font-medium mt-1">{selectedPrograma.requisitos}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={() => { setIsViewModalOpen(false); setSelectedPrograma(null); }} className="w-full bg-green-600 hover:bg-green-700">
                      Cerrar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedPrograma && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-3xl my-8 bg-white max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Editar Programa</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditModalOpen(false); setSelectedPrograma(null); }} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-nombre" className="text-gray-700 font-semibold">Nombre del Programa *</Label>
                      <Input id="edit-nombre" value={editFormData.nombre} onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-codigo" className="text-gray-700 font-semibold">Código *</Label>
                      <Input id="edit-codigo" value={editFormData.codigo} onChange={(e) => setEditFormData({ ...editFormData, codigo: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-nivelFormacion" className="text-gray-700 font-semibold">Nivel de Formación *</Label>
                      <select id="edit-nivelFormacion" value={editFormData.nivelFormacion} onChange={(e) => setEditFormData({ ...editFormData, nivelFormacion: e.target.value })} className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent mt-1" required>
                        <option value="TECNICO">Técnico</option>
                        <option value="TECNOLOGO">Tecnólogo</option>
                        <option value="ESPECIALIZACION">Especialización</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-areaConocimiento" className="text-gray-700 font-semibold">Área de Conocimiento *</Label>
                      <Input id="edit-areaConocimiento" value={editFormData.areaConocimiento} onChange={(e) => setEditFormData({ ...editFormData, areaConocimiento: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-duracionMeses" className="text-gray-700 font-semibold">Duración (meses) *</Label>
                      <Input id="edit-duracionMeses" type="number" min="1" value={editFormData.duracionMeses} onChange={(e) => setEditFormData({ ...editFormData, duracionMeses: parseInt(e.target.value) || 0 })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="edit-totalHoras" className="text-gray-700 font-semibold">Total Horas *</Label>
                      <Input id="edit-totalHoras" type="number" min="1" value={editFormData.totalHoras} onChange={(e) => setEditFormData({ ...editFormData, totalHoras: parseInt(e.target.value) || 0 })} required className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-descripcion" className="text-gray-700 font-semibold">Descripción</Label>
                      <Textarea id="edit-descripcion" value={editFormData.descripcion} onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })} rows={3} className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="edit-requisitos" className="text-gray-700 font-semibold">Requisitos</Label>
                      <Textarea id="edit-requisitos" value={editFormData.requisitos} onChange={(e) => setEditFormData({ ...editFormData, requisitos: e.target.value })} rows={2} className="mt-1" />
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
                    <Button type="button" variant="outline" onClick={() => { setIsEditModalOpen(false); setSelectedPrograma(null); }} className="flex-1">Cancelar</Button>
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
            <Card className="w-full max-w-3xl my-8 bg-white max-h-[90vh] overflow-y-auto">
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900">Nuevo Programa</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsCreateModalOpen(false); setCreateFormData({ nombre: '', codigo: '', nivelFormacion: 'TECNICO', areaConocimiento: '', duracionMeses: 0, totalHoras: 0, descripcion: '', requisitos: '' }); }} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={(e) => { e.preventDefault(); handleCreatePrograma(); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="create-nombre" className="text-gray-700 font-semibold">Nombre del Programa *</Label>
                      <Input id="create-nombre" value={createFormData.nombre} onChange={(e) => setCreateFormData({ ...createFormData, nombre: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-codigo" className="text-gray-700 font-semibold">Código *</Label>
                      <Input id="create-codigo" value={createFormData.codigo} onChange={(e) => setCreateFormData({ ...createFormData, codigo: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-nivelFormacion" className="text-gray-700 font-semibold">Nivel de Formación *</Label>
                      <select id="create-nivelFormacion" value={createFormData.nivelFormacion} onChange={(e) => setCreateFormData({ ...createFormData, nivelFormacion: e.target.value })} className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent mt-1" required>
                        <option value="TECNICO">Técnico</option>
                        <option value="TECNOLOGO">Tecnólogo</option>
                        <option value="ESPECIALIZACION">Especialización</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="create-areaConocimiento" className="text-gray-700 font-semibold">Área de Conocimiento *</Label>
                      <Input id="create-areaConocimiento" value={createFormData.areaConocimiento} onChange={(e) => setCreateFormData({ ...createFormData, areaConocimiento: e.target.value })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-duracionMeses" className="text-gray-700 font-semibold">Duración (meses) *</Label>
                      <Input id="create-duracionMeses" type="number" min="1" value={createFormData.duracionMeses || ''} onChange={(e) => setCreateFormData({ ...createFormData, duracionMeses: parseInt(e.target.value) || 0 })} required className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="create-totalHoras" className="text-gray-700 font-semibold">Total Horas *</Label>
                      <Input id="create-totalHoras" type="number" min="1" value={createFormData.totalHoras || ''} onChange={(e) => setCreateFormData({ ...createFormData, totalHoras: parseInt(e.target.value) || 0 })} required className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="create-descripcion" className="text-gray-700 font-semibold">Descripción</Label>
                      <Textarea id="create-descripcion" value={createFormData.descripcion} onChange={(e) => setCreateFormData({ ...createFormData, descripcion: e.target.value })} rows={3} className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="create-requisitos" className="text-gray-700 font-semibold">Requisitos</Label>
                      <Textarea id="create-requisitos" value={createFormData.requisitos} onChange={(e) => setCreateFormData({ ...createFormData, requisitos: e.target.value })} rows={2} className="mt-1" />
                    </div>
                  </div>
                  <div className="pt-4 border-t flex space-x-3 mt-6">
                    <Button type="button" variant="outline" onClick={() => { setIsCreateModalOpen(false); setCreateFormData({ nombre: '', codigo: '', nivelFormacion: 'TECNICO', areaConocimiento: '', duracionMeses: 0, totalHoras: 0, descripcion: '', requisitos: '' }); }} className="flex-1">Cancelar</Button>
                    <Button type="submit" disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-700">{isSaving ? 'Creando...' : 'Crear Programa'}</Button>
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
