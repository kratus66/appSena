'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, FileText, Calendar, User, AlertTriangle } from 'lucide-react';
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
    numero: string;
    nombrePrograma: string;
  };
  aprendiz?: {
    nombres: string;
    apellidos: string;
    documento: string;
  };
  casoDisciplinario?: {
    numeroConsecutivo: string;
    motivo: string;
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
      if (estadoFilter) params.estado = estadoFilter;
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
      BORRADOR: 'secondary',
      VIGENTE: 'default',
      CERRADO: 'outline',
    };
    
    const colors: any = {
      BORRADOR: 'bg-yellow-100 text-yellow-800',
      VIGENTE: 'bg-green-100 text-green-800',
      CERRADO: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[estado]}>
        {estado}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Plan de Trabajo Concertado (PTC)
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestión de planes de trabajo para aprendices
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/ptc/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo PTC
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros de búsqueda</CardTitle>
          <CardDescription>Busca y filtra los PTCs</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por aprendiz, ficha o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="BORRADOR">Borrador</SelectItem>
                <SelectItem value="VIGENTE">Vigente</SelectItem>
                <SelectItem value="CERRADO">Cerrado</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando PTCs...</p>
        </div>
      ) : ptcs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No hay PTCs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Crea el primer PTC para comenzar
            </p>
            <Button className="mt-4" onClick={() => router.push('/dashboard/ptc/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear PTC
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ptcs.map((ptc) => (
            <Card
              key={ptc.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(`/dashboard/ptc/${ptc.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {ptc.aprendiz?.nombres} {ptc.aprendiz?.apellidos}
                    </CardTitle>
                    <CardDescription>
                      {ptc.aprendiz?.documento}
                    </CardDescription>
                  </div>
                  {getEstadoBadge(ptc.estado)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Ficha:</span>
                  <span className="ml-1 text-muted-foreground">
                    {ptc.ficha?.numero}
                  </span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Inicio:</span>
                  <span className="ml-1 text-muted-foreground">
                    {new Date(ptc.fechaInicio).toLocaleDateString()}
                  </span>
                </div>

                {ptc.casoDisciplinario && (
                  <div className="flex items-center text-sm">
                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                    <span className="text-orange-600 text-xs">
                      Caso #{ptc.casoDisciplinario.numeroConsecutivo}
                    </span>
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ptc.motivo}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && total > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {ptcs.length} de {total} PTCs
        </div>
      )}
    </div>
  );
}
