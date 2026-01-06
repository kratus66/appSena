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
  BookOpen,
  Clock,
  Award,
} from 'lucide-react';
import api from '@/lib/api';
import { Programa } from '@/types';

export default function ProgramasPage() {
  const [programas, setProgramas] = React.useState<Programa[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [nivelFilter, setNivelFilter] = React.useState('');

  React.useEffect(() => {
    fetchProgramas();
  }, [currentPage, searchTerm, nivelFilter]);

  const fetchProgramas = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 12 };
      if (searchTerm) params.search = searchTerm;
      if (nivelFilter) params.nivelFormacion = nivelFilter;

      const response = await api.get('/programas', { params });
      setProgramas(response.data.data);
      setTotalPages(Math.ceil(response.data.total / response.data.limit));
    } catch (error) {
      console.error('Error fetching programas:', error);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Programas de Formación</h1>
            <p className="text-gray-500 mt-1">Gestiona los programas académicos</p>
          </div>
          <Button className="flex items-center space-x-2">
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
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
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
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Programas</p>
                  <p className="text-2xl font-bold">{programas.length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Técnicos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {programas.filter((p) => p.nivelFormacion === 'TECNICO').length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tecnólogos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {programas.filter((p) => p.nivelFormacion === 'TECNOLOGO').length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {programas.filter((p) => p.activo).length}
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
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {programas.map((programa) => (
              <Card key={programa.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{programa.nombre}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="font-mono">{programa.codigo}</span>
                        {getNivelBadge(programa.nivelFormacion)}
                      </div>
                    </div>
                    <Badge variant={programa.activo ? 'success' : 'default'}>
                      {programa.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <BookOpen size={16} className="mr-2" />
                      <span>{programa.areaConocimiento}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <span>{programa.duracionMeses} meses ({programa.totalHoras} horas)</span>
                    </div>
                    {programa.descripcion && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {programa.descripcion}
                      </p>
                    )}
                    <div className="flex gap-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye size={16} className="mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
