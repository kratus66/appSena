'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  React.useEffect(() => {
    fetchAprendices();
  }, [currentPage, searchTerm]);

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
    setIsEditModalOpen(true);
  };

  const handleDeleteAprendiz = (aprendiz: Aprendiz) => {
    setSelectedAprendiz(aprendiz);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteAprendiz = async () => {
    if (!selectedAprendiz) return;
    try {
      await api.delete(`/aprendices/${selectedAprendiz.id}`);
      setIsDeleteModalOpen(false);
      setSelectedAprendiz(null);
      fetchAprendices();
    } catch (error: any) {
      console.error('Error deleting aprendiz:', error);
      alert(error.response?.data?.message || 'Error al eliminar el aprendiz');
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
          <Button className="flex items-center space-x-2">
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

        {/* Edit Modal - Placeholder */}
        {isEditModalOpen && selectedAprendiz && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-gray-950 font-bold">Editar Aprendiz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Funcionalidad de edición próximamente.</p>
                <Button onClick={() => { setIsEditModalOpen(false); setSelectedAprendiz(null); }} className="w-full">
                  Cerrar
                </Button>
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
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="RETIRADO">Retirado</option>
                <option value="DESERTOR">Desertor</option>
              </select>
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter size={20} />
                <span>Más Filtros</span>
              </Button>
              <Button variant="outline" className="flex items-center space-x-2">
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
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold">{aprendices.length}</p>
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
                  <p className="text-sm text-gray-600">Activos</p>
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
                  <p className="text-sm text-gray-600">Suspendidos</p>
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
            className={`cursor-pointer transition-all hover:shadow-lg ${estadoFilter === 'DESERTOR' ? 'ring-2 ring-red-400 shadow-md' : ''}`}
            onClick={() => setEstadoFilter('DESERTOR')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Desertores</p>
                  <p className="text-2xl font-bold text-red-600">
                    {aprendices.filter((a) => a.estadoAcademico === 'DESERTOR').length}
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
