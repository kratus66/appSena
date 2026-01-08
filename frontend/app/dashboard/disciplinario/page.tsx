'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  AlertCircle, 
  Shield, 
  FileText, 
  Filter,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DisciplinaryCase {
  id: string;
  ficha: {
    id: string;
    numeroFicha: string;
  };
  aprendiz: {
    id: string;
    nombres: string;
    apellidos: string;
  };
  tipo: string;
  gravedad: string;
  asunto: string;
  descripcion: string;
  fechaIncidente: string;
  estado: string;
  acciones: any[];
  createdAt: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const tipoLabels: Record<string, string> = {
  CONVIVENCIA: 'Convivencia',
  ACADEMICO: 'Académico',
  ASISTENCIA: 'Asistencia',
};

const gravedadColors: Record<string, string> = {
  LEVE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  MEDIA: 'bg-orange-100 text-orange-800 border-orange-200',
  ALTA: 'bg-red-100 text-red-800 border-red-200',
};

const estadoColors: Record<string, string> = {
  BORRADOR: 'bg-gray-100 text-gray-800 border-gray-200',
  ABIERTO: 'bg-blue-100 text-blue-800 border-blue-200',
  SEGUIMIENTO: 'bg-purple-100 text-purple-800 border-purple-200',
  CERRADO: 'bg-green-100 text-green-800 border-green-200',
};

export default function DisciplinarioPage() {
  const router = useRouter();
  const [casos, setCasos] = useState<DisciplinaryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    estado: '',
    tipo: '',
    gravedad: '',
    search: '',
  });

  useEffect(() => {
    fetchCasos();
  }, [page, filters]);

  const fetchCasos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (filters.estado && filters.estado !== 'all') params.append('estado', filters.estado);
      if (filters.tipo && filters.tipo !== 'all') params.append('tipo', filters.tipo);
      if (filters.gravedad && filters.gravedad !== 'all') params.append('gravedad', filters.gravedad);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get<PaginatedResponse<DisciplinaryCase>>(
        `/disciplinario/casos?${params}`
      );
      setCasos(response.data.data);
      setTotal(response.data.meta.total);
    } catch (error) {
      console.error('Error al obtener casos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleCreateCase = () => {
    router.push('/dashboard/disciplinario/nuevo');
  };

  const handleViewCase = (id: string) => {
    router.push(`/dashboard/disciplinario/${id}`);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Módulo Disciplinario</h1>
            <p className="text-gray-700 mt-1 font-medium">Gestión de casos disciplinarios y seguimiento</p>
          </div>
          <Button
            onClick={handleCreateCase}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Caso
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleFilterChange('estado', 'all')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 font-semibold">Total Casos</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleFilterChange('estado', 'ABIERTO')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 font-semibold">Casos Abiertos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {casos.filter(c => c.estado === 'ABIERTO').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleFilterChange('estado', 'SEGUIMIENTO')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 font-semibold">En Seguimiento</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {casos.filter(c => c.estado === 'SEGUIMIENTO').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleFilterChange('estado', 'CERRADO')}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 font-semibold">Cerrados</p>
                  <p className="text-2xl font-bold text-green-600">
                    {casos.filter(c => c.estado === 'CERRADO').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-bold">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Buscar por asunto..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />

              <Select
                value={filters.estado}
                onValueChange={(value) => handleFilterChange('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="BORRADOR">Borrador</SelectItem>
                  <SelectItem value="ABIERTO">Abierto</SelectItem>
                  <SelectItem value="SEGUIMIENTO">Seguimiento</SelectItem>
                  <SelectItem value="CERRADO">Cerrado</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.tipo}
                onValueChange={(value) => handleFilterChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="CONVIVENCIA">Convivencia</SelectItem>
                  <SelectItem value="ACADEMICO">Académico</SelectItem>
                  <SelectItem value="ASISTENCIA">Asistencia</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.gravedad}
                onValueChange={(value) => handleFilterChange('gravedad', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Gravedad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las gravedades</SelectItem>
                  <SelectItem value="LEVE">Leve</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <Card>
          <CardHeader>
            <CardTitle>Casos Disciplinarios</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando casos...</p>
              </div>
            ) : casos.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron casos disciplinarios</p>
                <Button
                  onClick={handleCreateCase}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Caso
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {casos.map((caso) => (
                  <div
                    key={caso.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <Shield className="h-5 w-5 text-green-600 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{caso.asunto}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {caso.aprendiz.nombres} {caso.aprendiz.apellidos} - Ficha {caso.ficha.numeroFicha}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge className={estadoColors[caso.estado]}>
                            {caso.estado}
                          </Badge>
                          <Badge className={gravedadColors[caso.gravedad]}>
                            {caso.gravedad}
                          </Badge>
                          <Badge variant="outline">
                            {tipoLabels[caso.tipo] || caso.tipo}
                          </Badge>
                          <Badge variant="outline" className="bg-gray-50">
                            {caso.acciones?.length || 0} {(caso.acciones?.length || 0) === 1 ? 'acción' : 'acciones'}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          Incidente: {formatDate(caso.fechaIncidente)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCase(caso.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {total > 10 && (
                  <div className="flex justify-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Página {page} de {Math.ceil(total / 10)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= Math.ceil(total / 10)}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
