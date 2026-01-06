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
  Eye,
  Filter,
  FileText,
  Calendar,
  Users,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { Ficha } from '@/types';
import { formatDate } from '@/lib/utils';

export default function FichasPage() {
  const [fichas, setFichas] = React.useState<Ficha[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [estadoFilter, setEstadoFilter] = React.useState('');
  const [selectedFicha, setSelectedFicha] = React.useState<Ficha | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  React.useEffect(() => {
    fetchFichas();
  }, [currentPage, searchTerm]);

  const fetchFichas = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 100 };
      if (searchTerm) params.search = searchTerm;
      // No enviar estadoFilter al backend, filtraremos localmente

      const response = await api.get('/fichas', { params });
      setFichas(response.data.data);
      setTotalPages(Math.ceil(response.data.total / response.data.limit));
    } catch (error) {
      console.error('Error fetching fichas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar fichas localmente
  const filteredFichas = React.useMemo(() => {
    if (!fichas) return [];
    if (!estadoFilter) return fichas;
    return fichas.filter((ficha) => ficha.estado === estadoFilter);
  }, [fichas, estadoFilter]);

  const handleViewFicha = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsViewModalOpen(true);
  };

  const handleEditFicha = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsEditModalOpen(true);
  };

  const getEstadoBadge = (estado: string) => {
    const variants: any = {
      ACTIVA: 'success',
      INACTIVA: 'warning',
      FINALIZADA: 'default',
      CANCELADA: 'danger',
    };
    return <Badge variant={variants[estado] || 'default'}>{estado}</Badge>;
  };

  const getJornadaBadge = (jornada: string) => {
    const colors: any = {
      MADRUGADA: 'info',
      MAÑANA: 'success',
      TARDE: 'warning',
      NOCHE: 'default',
      MIXTA: 'default',
      FINES_SEMANA: 'info',
    };
    return <Badge variant={colors[jornada] || 'default'}>{jornada}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Fichas</h1>
            <p className="text-gray-600 mt-1 font-medium">Gestiona las fichas de formación</p>
          </div>
          <Button 
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={20} />
            <span>Nueva Ficha</span>
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
                    placeholder="Buscar por número de ficha..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800 font-medium"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
                <option value="FINALIZADA">Finalizada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
              <Button variant="outline" className="flex items-center space-x-2 font-semibold text-gray-800">
                <Filter size={20} />
                <span>Más Filtros</span>
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
                  <p className="text-sm text-gray-600">Total Fichas</p>
                  <p className="text-2xl font-bold">{fichas.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${estadoFilter === 'ACTIVA' ? 'ring-2 ring-green-400 shadow-md' : ''}`}
            onClick={() => setEstadoFilter('ACTIVA')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {fichas.filter((f) => f.estado === 'ACTIVA').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${estadoFilter === 'FINALIZADA' ? 'ring-2 ring-gray-400 shadow-md' : ''}`}
            onClick={() => setEstadoFilter('FINALIZADA')}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Finalizadas</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {fichas.filter((f) => f.estado === 'FINALIZADA').length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio Aprendices</p>
                  <p className="text-2xl font-bold text-purple-600">25</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fichas Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Cargando...
            </div>
          ) : filteredFichas.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {estadoFilter ? `No hay fichas con estado ${estadoFilter}` : 'No se encontraron fichas'}
            </div>
          ) : (
            filteredFichas.map((ficha) => (
              <Card key={ficha.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-950">Ficha {ficha.numeroFicha}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1 font-medium">
                        {ficha.programa?.nombre || 'Programa no asignado'}
                      </p>
                    </div>
                    {getEstadoBadge(ficha.estado)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-semibold">Jornada:</span>
                      {getJornadaBadge(ficha.jornada)}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-semibold">Instructor:</span>
                      <span className="font-semibold text-gray-900">
                        {ficha.instructor?.nombre || 'No asignado'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-semibold">Colegio:</span>
                      <span className="font-semibold text-gray-900 text-xs">
                        {ficha.colegio?.nombre || 'No asignado'}
                      </span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700 font-semibold">Inicio:</span>
                        <span className="font-semibold text-gray-900">{formatDate(ficha.fechaInicio)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-semibold">Fin:</span>
                        <span className="font-semibold text-gray-900">{formatDate(ficha.fechaFin)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold"
                        onClick={() => handleViewFicha(ficha)}
                      >
                        <Eye size={16} className="mr-2" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 font-semibold"
                        onClick={() => handleEditFicha(ficha)}
                      >
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

        {/* Pagination */}
        {!loading && fichas.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
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
            </CardContent>
          </Card>
        )}

        {/* Create Ficha Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-950 font-bold">Nueva Ficha</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Funcionalidad de creación próximamente.</p>
                <Button onClick={() => setIsCreateModalOpen(false)} className="w-full bg-green-600 hover:bg-green-700">
                  Cerrar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Ficha Modal */}
        {isViewModalOpen && selectedFicha && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-950">Detalles de la Ficha</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsViewModalOpen(false); setSelectedFicha(null); }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Header con número de ficha */}
                  <div className="flex items-center space-x-4 pb-6 border-b">
                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900">Ficha {selectedFicha.numeroFicha}</h2>
                      <p className="text-gray-600 font-medium">{selectedFicha.programa?.nombre || 'Programa no asignado'}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {getEstadoBadge(selectedFicha.estado)}
                        {getJornadaBadge(selectedFicha.jornada)}
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de la Ficha</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <FileText className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Número de Ficha</p>
                            <p className="font-semibold text-gray-900">{selectedFicha.numeroFicha}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Instructor</p>
                            <p className="font-semibold text-gray-900">{selectedFicha.instructor?.nombre || 'No asignado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Filter className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Colegio</p>
                            <p className="font-semibold text-gray-900">{selectedFicha.colegio?.nombre || 'No asignado'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Fechas y Horarios</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Fecha de Inicio</p>
                            <p className="font-semibold text-gray-900">{formatDate(selectedFicha.fechaInicio)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Fecha de Fin</p>
                            <p className="font-semibold text-gray-900">{formatDate(selectedFicha.fechaFin)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button onClick={() => { setIsViewModalOpen(false); setSelectedFicha(null); }} className="w-full bg-green-600 hover:bg-green-700">
                      Cerrar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Ficha Modal */}
        {isEditModalOpen && selectedFicha && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-950 font-bold">Editar Ficha</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditModalOpen(false); setSelectedFicha(null); }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Funcionalidad de edición próximamente.</p>
                <Button onClick={() => { setIsEditModalOpen(false); setSelectedFicha(null); }} className="w-full bg-green-600 hover:bg-green-700">
                  Cerrar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
