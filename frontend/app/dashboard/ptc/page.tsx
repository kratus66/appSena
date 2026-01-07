'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, FileText, Calendar, User, AlertTriangle, Plus, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Ptc {
  id: string;
  fichaId: string;
  aprendizId: string;
  motivo: string;
  descripcion: string;
  fechaInicio: string;
  fechaCierre?: string;
  estado: 'BORRADOR' | 'VIGENTE' | 'CERRADO';
  ficha?: {
    numeroFicha: string;
    programa?: {
      nombre: string;
    };
  };
  aprendiz?: {
    nombres: string;
    apellidos: string;
    documento: string;
  };
  casoDisciplinario?: {
    id: string;
    asunto: string;
    tipo: string;
  };
  createdAt: string;
}

export default function PtcPage() {
  const router = useRouter();
  const [ptcs, setPtcs] = useState<Ptc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [fichaFilter, setFichaFilter] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPtcs();
  }, [estadoFilter, fichaFilter]);

  const fetchPtcs = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchTerm) params.search = searchTerm;
      if (estadoFilter && estadoFilter !== 'all') params.estado = estadoFilter;
      if (fichaFilter) params.fichaId = fichaFilter;

      const response = await api.get('/ptc', { params });
      setPtcs(response.data.data);
      setTotal(response.data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cargar PTCs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPtcs();
  };

  const getEstadoBadge = (estado: string) => {
    const variants: any = {
      BORRADOR: 'warning',
      VIGENTE: 'success',
      CERRADO: 'default',
    };
    
    return <Badge variant={variants[estado] || 'default'}>{estado}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Plan de Trabajo Concertado (PTC)</h1>
            <p className="text-gray-600 mt-1 font-medium">
              Gestión de planes de trabajo para aprendices
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard/ptc/new')}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo PTC</span>
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
                    placeholder="Buscar por aprendiz, ficha o motivo..."
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
                <option value="all">Todos los estados</option>
                <option value="BORRADOR">Borrador</option>
                <option value="VIGENTE">Vigente</option>
                <option value="CERRADO">Cerrado</option>
              </select>
              <Button
                onClick={fetchPtcs}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Search size={20} />
                <span>Buscar</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PTCs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Cargando PTCs...</p>
          </div>
        ) : ptcs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No hay PTCs registrados</h3>
              <p className="mt-2 text-sm text-gray-600">
                Comienza creando el primer Plan de Trabajo Concertado
              </p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700" 
                onClick={() => router.push('/dashboard/ptc/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer PTC
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ptcs.map((ptc) => (
                <Card
                  key={ptc.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-gray-200"
                  onClick={() => router.push(`/dashboard/ptc/${ptc.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg text-gray-900">
                          {ptc.aprendiz?.nombres} {ptc.aprendiz?.apellidos}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Doc: {ptc.aprendiz?.documento}
                        </CardDescription>
                      </div>
                      {getEstadoBadge(ptc.estado)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <FileText className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="font-medium">Ficha:</span>
                      <span className="ml-1">
                        {ptc.ficha?.numeroFicha || 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="font-medium">Inicio:</span>
                      <span className="ml-1">
                        {new Date(ptc.fechaInicio).toLocaleDateString('es-CO')}
                      </span>
                    </div>

                    {ptc.casoDisciplinario && (
                      <div className="flex items-center text-sm">
                        <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                        <span className="text-orange-600 font-medium text-xs">
                          Caso Disciplinario: {ptc.casoDisciplinario.asunto}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600 font-medium mb-1">Motivo:</p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {ptc.motivo}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Info */}
            {total > 0 && (
              <div className="flex justify-center mt-6">
                <p className="text-sm text-gray-600 font-medium">
                  Mostrando {ptcs.length} de {total} PTCs
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
