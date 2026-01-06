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
  School,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import api from '@/lib/api';
import { Colegio } from '@/types';

export default function ColegiosPage() {
  const [colegios, setColegios] = React.useState<Colegio[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  React.useEffect(() => {
    fetchColegios();
  }, [currentPage, searchTerm]);

  const fetchColegios = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 12 };
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/colegios', { params });
      setColegios(response.data.data);
      setTotalPages(Math.ceil(response.data.total / response.data.limit));
    } catch (error) {
      console.error('Error fetching colegios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Colegios</h1>
            <p className="text-gray-500 mt-1">Gestiona las instituciones educativas</p>
          </div>
          <Button className="flex items-center space-x-2">
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
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Colegios</p>
                  <p className="text-2xl font-bold">{colegios.length}</p>
                </div>
                <School className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {colegios.filter((c) => c.activo).length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departamentos</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {new Set(colegios.map((c) => c.departamento)).size}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ciudades</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {new Set(colegios.map((c) => c.ciudad)).size}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colegios Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Cargando...
            </div>
          ) : colegios.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No se encontraron colegios
            </div>
          ) : (
            colegios.map((colegio) => (
              <Card key={colegio.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight">
                        {colegio.nombre}
                      </CardTitle>
                      <p className="text-xs text-gray-500 mt-1">NIT: {colegio.nit}</p>
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
                        <p className="font-medium">{colegio.ciudad}</p>
                        <p className="text-gray-500">{colegio.departamento}</p>
                        <p className="text-gray-500 text-xs mt-1">{colegio.direccion}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{colegio.telefono}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{colegio.email}</span>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="text-sm">
                        <p className="text-gray-600">Rector/a:</p>
                        <p className="font-medium">{colegio.rector}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-3">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye size={16} className="mr-2" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
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
        {!loading && colegios.length > 0 && (
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
      </div>
    </DashboardLayout>
  );
}
