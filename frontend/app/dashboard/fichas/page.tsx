'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Eye,
  FileText,
  Users,
  BookOpen,
  School,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  DoorOpen,
  CalendarDays,
} from 'lucide-react';
import api from '@/lib/api';
import { Ficha, Colegio, Programa } from '@/types';
import { formatDate } from '@/lib/utils';

type DependenciaBadgeProps = { dependencia?: string };
function DependenciaBadge({ dependencia }: DependenciaBadgeProps) {
  if (!dependencia) return <Badge variant="outline">Sede: Por definir</Badge>;
  const map: Record<string, { label: string; variant: any }> = {
    ARTICULACION: { label: 'Articulación', variant: 'warning' },
    TITULADA: { label: 'Titulada', variant: 'default' },
    COMPLEMENTARIA: { label: 'Complementaria', variant: 'secondary' },
  };
  const d = map[dependencia] || { label: dependencia, variant: 'outline' };
  return <Badge variant={d.variant}>{d.label}</Badge>;
}

type EstadoGeneralBadgeProps = { ficha: Ficha };
function computeGeneralStatus(ficha: Ficha): { label: string; variant: any } {
  const aprendices = ficha.aprendicesCount ?? 0;
  const cupo = ficha.cupoEsperado ?? 30;

  if (aprendices === 0) return { label: 'Configuración inicial', variant: 'outline' };
  if (aprendices < cupo) return { label: 'En alistamiento', variant: 'warning' };
  return { label: 'Lista para operación', variant: 'success' };
}
function EstadoGeneralBadge({ ficha }: EstadoGeneralBadgeProps) {
  const s = computeGeneralStatus(ficha);
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

type StateTags = string[];
function computeStateTags(ficha: Ficha): StateTags {
  const tags: string[] = [];
  const aprendices = ficha.aprendicesCount ?? 0;
  const cupo = ficha.cupoEsperado ?? 30;

  if (aprendices === 0) tags.push('Sin aprendices');
  else if (aprendices < cupo) tags.push('Carga parcial');
  else tags.push('Completa');

  return tags;
}
function StateTagBadge({ tag }: { tag: string }) {
  const variant =
    tag === 'Lista para operación' || tag === 'Completa'
      ? 'success'
      : tag === 'Carga parcial'
      ? 'warning'
      : 'danger';
  return <Badge variant={variant}>{tag}</Badge>;
}

const JORNADA_LABELS: Record<string, string> = {
  MAÑANA: 'Mañana',
  TARDE: 'Tarde',
  NOCHE: 'Noche',
  MIXTA: 'Mixta',
};

export default function FichasPage() {
  const router = useRouter();
  const [fichas, setFichas] = React.useState<Ficha[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [depsearch, setDepSearch] = React.useState('');
  const [jornadaFilter, setJornadaFilter] = React.useState('');
  const [estadoFilter, setEstadoFilter] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const LIMIT = 30;

  // Rol del usuario actual
  const [currentUserRole, setCurrentUserRole] = React.useState<string>('');
  const [currentUserId, setCurrentUserId] = React.useState<string>('');

  // Planeacion por fichaId
  const [planeacionMap, setPlaneacionMap] = React.useState<Record<string, { instructorNombre: string; ambienteNombre: string; bloques: string[] }>>({});
  React.useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (userStr) {
      try { const u = JSON.parse(userStr); setCurrentUserRole(u.rol || ''); setCurrentUserId(u.id || u.sub || ''); } catch {}
    }
  }, []);

  // Eliminar ficha
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; numero: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleteLoading(true);
    try {
      const params: any = {};
      if (currentUserId) params.deletedById = currentUserId;
      await api.delete(`/fichas/${deleteConfirm.id}`, { params });
      setDeleteConfirm(null);
      fetchFichas();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al eliminar la ficha');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Importar aprendices Excel
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importingFichaId, setImportingFichaId] = React.useState<string | null>(null);
  const [importResult, setImportResult] = React.useState<{ fichaId: string; creados: number; omitidos: number; errores: string[] } | null>(null);
  const [importLoading, setImportLoading] = React.useState(false);

  const handleImportClick = (fichaId: string) => {
    setImportingFichaId(fichaId);
    setImportResult(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !importingFichaId) return;
    e.target.value = '';
    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post(`/fichas/${importingFichaId}/importar-aprendices`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImportResult({ fichaId: importingFichaId, ...res.data });
      fetchFichas();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error al importar el archivo');
    } finally {
      setImportLoading(false);
      setImportingFichaId(null);
    }
  };

  // Drawer create
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [programas, setProgramas] = React.useState<Programa[]>([]);
  const [colegios, setColegios] = React.useState<Colegio[]>([]);
  const [createLoading, setCreateLoading] = React.useState(false);
  const [createError, setCreateError] = React.useState('');
  const [createForm, setCreateForm] = React.useState({
    numeroFicha: '',
    jornada: 'MAÑANA',
    dependencia: 'TITULADA',
    tipoProgramaFormacion: '',
    cupoEsperado: '30',
    modalidadArticulacion: '',
    localidad: '',
    ambiente: '',
    observaciones: '',
    fechaInicio: '',
    fechaFin: '',
    colegioId: '',
    programaId: '',
  });

  React.useEffect(() => {
    fetchFichas();
  }, [currentPage, searchTerm, depsearch, jornadaFilter, estadoFilter]);

  const fetchFichas = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: LIMIT };
      if (searchTerm) params.search = searchTerm;
      if (depsearch) params.dependencia = depsearch;
      if (jornadaFilter) params.jornada = jornadaFilter;
      if (estadoFilter) params.estado = estadoFilter;
      const [fichasRes, planeacionRes] = await Promise.all([
        api.get('/fichas', { params }),
        api.get('/planeacion', { params: { limit: 200 } }),
      ]);
      setFichas(fichasRes.data.data || []);
      setTotalItems(fichasRes.data.total || 0);
      setTotalPages(Math.ceil((fichasRes.data.total || 0) / LIMIT));
      // Build planeacion lookup by fichaId (last active wins)
      const map: Record<string, { instructorNombre: string; ambienteNombre: string; bloques: string[] }> = {};
      for (const p of (planeacionRes.data.data || [])) {
        if (p.fichaId && p.estado === 'ACTIVA') {
          map[p.fichaId] = {
            instructorNombre: p.instructorNombre || '',
            ambienteNombre: p.ambienteNombre || '',
            bloques: p.bloques || [],
          };
        }
      }
      setPlaneacionMap(map);
    } catch (error) {
      console.error('Error fetching fichas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSelectData = async () => {
    try {
      const [progRes, colegRes] = await Promise.all([
        api.get('/programas', { params: { limit: 200 } }),
        api.get('/colegios', { params: { limit: 200 } }),
      ]);
      setProgramas(progRes.data.data || progRes.data || []);
      setColegios(colegRes.data.data || colegRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const openDrawer = () => {
    setCreateError('');
    setCreateForm({
      numeroFicha: '', jornada: 'MAÑANA', dependencia: 'TITULADA',
      tipoProgramaFormacion: '', cupoEsperado: '30', modalidadArticulacion: '',
      localidad: '', ambiente: '', observaciones: '',
      fechaInicio: '', fechaFin: '', colegioId: '', programaId: '',
    });
    loadSelectData();
    setDrawerOpen(true);
  };

  const handleCreate = async () => {
    setCreateLoading(true);
    setCreateError('');
    try {
      const payload: any = {
        numeroFicha: createForm.numeroFicha,
        jornada: createForm.jornada,
        dependencia: createForm.dependencia,
        cupoEsperado: parseInt(createForm.cupoEsperado) || 30,
      };
      if (createForm.tipoProgramaFormacion) payload.tipoProgramaFormacion = createForm.tipoProgramaFormacion;
      if (createForm.modalidadArticulacion) payload.modalidadArticulacion = createForm.modalidadArticulacion;
      if (createForm.localidad) payload.localidad = createForm.localidad;
      if (createForm.ambiente) payload.ambiente = createForm.ambiente;
      if (createForm.observaciones) payload.observaciones = createForm.observaciones;
      if (createForm.fechaInicio) payload.fechaInicio = createForm.fechaInicio;
      if (createForm.fechaFin) payload.fechaFin = createForm.fechaFin;
      if (createForm.colegioId) payload.colegioId = createForm.colegioId;
      if (createForm.programaId) payload.programaId = createForm.programaId;

      await api.post('/fichas', payload);
      setDrawerOpen(false);
      fetchFichas();
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || 'Error al crear la ficha');
    } finally {
      setCreateLoading(false);
    }
  };

  const stats = React.useMemo(() => ({
    total: totalItems,
    articulacion: fichas.filter((f) => f.dependencia === 'ARTICULACION').length,
    titulada: fichas.filter((f) => f.dependencia === 'TITULADA').length,
    complementaria: fichas.filter((f) => f.dependencia === 'COMPLEMENTARIA').length,
  }), [fichas, totalItems]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">Fichas</h1>
            <p className="text-gray-600 mt-1 font-medium">
              Gestión de fichas de formación · {totalItems} registros
            </p>
          </div>
          <Button
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            onClick={openDrawer}
          >
            <Plus size={18} />
            <span>Nueva Ficha</span>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: 'Total', value: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', filter: '' },
            { label: 'Articulación', value: stats.articulacion, icon: School, color: 'text-yellow-600', bg: 'bg-yellow-50', filter: 'ARTICULACION' },
            { label: 'Titulada', value: stats.titulada, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50', filter: 'TITULADA' },
            { label: 'Complementaria', value: stats.complementaria, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', filter: 'COMPLEMENTARIA' },
          ].map((s) => (
            <Card
              key={s.label}
              className={`cursor-pointer transition-all hover:shadow-md ${depsearch === s.filter ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setDepSearch(depsearch === s.filter ? '' : s.filter)}
            >
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                  <div className={`h-9 w-9 ${s.bg} rounded-lg flex items-center justify-center`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar por número de ficha..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800 text-sm font-medium"
                value={depsearch}
                onChange={(e) => { setDepSearch(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Todas las dependencias</option>
                <option value="ARTICULACION">Articulación</option>
                <option value="TITULADA">Titulada</option>
                <option value="COMPLEMENTARIA">Complementaria</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800 text-sm font-medium"
                value={jornadaFilter}
                onChange={(e) => { setJornadaFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Todas las jornadas</option>
                <option value="MAÑANA">Mañana</option>
                <option value="TARDE">Tarde</option>
                <option value="NOCHE">Noche</option>
                <option value="MIXTA">Mixta</option>
              </select>
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800 text-sm font-medium"
                value={estadoFilter}
                onChange={(e) => { setEstadoFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="">Todos los estados</option>
                <option value="ACTIVA">Activa</option>
                <option value="EN_CIERRE">En cierre</option>
                <option value="FINALIZADA">Finalizada</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando...</div>
        ) : fichas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="mx-auto h-10 w-10 mb-3 opacity-40" />
            <p className="font-medium">No se encontraron fichas</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {fichas.map((ficha) => {
              const tags = computeStateTags(ficha);
              const generalStatus = computeGeneralStatus(ficha);
              return (
                <Card key={ficha.id} className="hover:shadow-lg transition-shadow border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base font-bold text-gray-950 truncate">
                          Ficha {ficha.numeroFicha}
                        </CardTitle>
                        <p className="text-xs text-gray-500 mt-0.5 truncate font-medium">
                          {ficha.programa?.nombre || 'Programa no asignado'}
                        </p>
                      </div>
                      {currentUserRole === 'admin' && (
                        <button
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Eliminar ficha"
                          onClick={() => setDeleteConfirm({ id: ficha.id, numero: ficha.numeroFicha })}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Dependencia + Jornada */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <DependenciaBadge dependencia={ficha.dependencia} />
                      <Badge variant="info">{JORNADA_LABELS[ficha.jornada] || ficha.jornada}</Badge>
                    </div>

                    {/* State tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <StateTagBadge key={tag} tag={tag} />
                      ))}
                    </div>

                    {/* Info rows */}
                    <div className="space-y-1.5 text-sm pt-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500 font-medium">Aprendices</span>
                        <span className="font-semibold text-gray-900">
                          {ficha.aprendicesCount ?? 0} / {ficha.cupoEsperado ?? 30}
                        </span>
                      </div>
                      {ficha.dependencia === 'ARTICULACION' && (
                        <div className="flex justify-between">
                          <span className="text-gray-500 font-medium">Colegio</span>
                          <span className="font-semibold text-gray-900 text-right truncate max-w-[150px]">
                            {ficha.colegio?.nombre || 'Sin asignar'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Planeacion info */}
                    {(() => {
                      const plan = planeacionMap[ficha.id];
                      if (!plan) return (
                        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400">
                          Sin planeación asignada
                        </div>
                      );
                      return (
                        <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <UserCheck size={12} className="text-green-600 shrink-0" />
                            <span className="font-medium truncate">{plan.instructorNombre}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-700">
                            <DoorOpen size={12} className="text-green-600 shrink-0" />
                            <span className="truncate">{plan.ambienteNombre}</span>
                          </div>
                          {plan.bloques.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                              <CalendarDays size={12} className="text-green-600 shrink-0" />
                              <span className="truncate">{plan.bloques.join(' · ')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Actions */}
                    <div className="pt-2 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                        onClick={() => router.push(`/dashboard/fichas/${ficha.id}`)}
                      >
                        <Eye size={14} className="mr-1" />
                        Ver detalle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs border-green-600 text-green-700 hover:bg-green-50"
                        onClick={() => handleImportClick(ficha.id)}
                        disabled={importLoading && importingFichaId === ficha.id}
                      >
                        <FileSpreadsheet size={14} className="mr-1" />
                        {importLoading && importingFichaId === ficha.id ? 'Importando...' : 'Importar Excel'}
                      </Button>
                    </div>
                    {/* Resultado de importación */}
                    {importResult?.fichaId === ficha.id && (
                      <div className="mt-2 p-2 rounded-md bg-green-50 border border-green-200 text-xs">
                        <div className="flex items-center gap-1 text-green-700 font-semibold">
                          <CheckCircle2 size={13} />
                          {importResult.creados} creados · {importResult.omitidos} omitidos
                        </div>
                        {importResult.errores.length > 0 && (
                          <div className="mt-1 text-red-600">
                            {importResult.errores.slice(0, 3).map((e, i) => <div key={i}>{e}</div>)}
                            {importResult.errores.length > 3 && <div>...y {importResult.errores.length - 3} más</div>}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer: Nueva Ficha */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-950">Nueva Ficha</h2>
                <p className="text-sm text-gray-500 mt-0.5">Registra una nueva ficha de formación</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-1 rounded-md hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4 flex-1">
              {/* Número + Jornada */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Número de Ficha *</label>
                  <Input
                    placeholder="Ej: 2654321"
                    value={createForm.numeroFicha}
                    onChange={(e) => setCreateForm((f) => ({ ...f, numeroFicha: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Jornada *</label>
                  <select
                    value={createForm.jornada}
                    onChange={(e) => setCreateForm((f) => ({ ...f, jornada: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                  >
                    <option value="MAÑANA">Mañana</option>
                    <option value="TARDE">Tarde</option>
                    <option value="NOCHE">Noche</option>
                    <option value="MIXTA">Mixta</option>
                  </select>
                </div>
              </div>

              {/* Dependencia */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Dependencia *</label>
                <select
                  value={createForm.dependencia}
                  onChange={(e) => setCreateForm((f) => ({ ...f, dependencia: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                >
                  <option value="TITULADA">Titulada</option>
                  <option value="ARTICULACION">Articulación</option>
                  <option value="COMPLEMENTARIA">Complementaria</option>
                </select>
              </div>

              {/* Tipo programa + Cupo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Tipo de programa</label>
                  <Input
                    placeholder="Ej: Formación titulada"
                    value={createForm.tipoProgramaFormacion}
                    onChange={(e) => setCreateForm((f) => ({ ...f, tipoProgramaFormacion: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Cupo esperado</label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={createForm.cupoEsperado}
                    onChange={(e) => setCreateForm((f) => ({ ...f, cupoEsperado: e.target.value }))}
                  />
                </div>
              </div>

              {/* Articulación: modalidad + localidad */}
              {createForm.dependencia === 'ARTICULACION' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Modalidad articulación</label>
                    <select
                      value={createForm.modalidadArticulacion}
                      onChange={(e) => setCreateForm((f) => ({ ...f, modalidadArticulacion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                    >
                      <option value="">Sin definir</option>
                      <option value="COMPARTIDA">Compartida</option>
                      <option value="UNICA">Única</option>
                      <option value="COLEGIO_PRIVADO">Colegio privado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Localidad</label>
                    <Input
                      placeholder="Ej: Chapinero"
                      value={createForm.localidad}
                      onChange={(e) => setCreateForm((f) => ({ ...f, localidad: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {/* Ambiente (no articulación) */}
              {createForm.dependencia !== 'ARTICULACION' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Ambiente</label>
                  <Input
                    placeholder="Ej: Sala 201"
                    value={createForm.ambiente}
                    onChange={(e) => setCreateForm((f) => ({ ...f, ambiente: e.target.value }))}
                  />
                </div>
              )}

              {/* Programa */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Programa de formación</label>
                <select
                  value={createForm.programaId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, programaId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                >
                  <option value="">Sin asignar</option>
                  {programas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                  ))}
                </select>
              </div>

              {/* Colegio (articulación) */}
              {createForm.dependencia === 'ARTICULACION' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Colegio</label>
                  <select
                    value={createForm.colegioId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, colegioId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                  >
                    <option value="">Sin asignar</option>
                    {colegios.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Fecha inicio</label>
                  <Input type="date" value={createForm.fechaInicio} onChange={(e) => setCreateForm((f) => ({ ...f, fechaInicio: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">Fecha fin</label>
                  <Input type="date" value={createForm.fechaFin} onChange={(e) => setCreateForm((f) => ({ ...f, fechaFin: e.target.value }))} />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Observaciones adicionales..."
                  value={createForm.observaciones}
                  onChange={(e) => setCreateForm((f) => ({ ...f, observaciones: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900 resize-none"
                />
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                  {createError}
                </div>
              )}
            </div>

            <div className="p-5 border-t flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDrawerOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleCreate}
                disabled={createLoading || !createForm.numeroFicha}
              >
                {createLoading ? 'Guardando...' : 'Crear Ficha'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input oculto para importar Excel */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Modal confirmación eliminar ficha */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Eliminar ficha</h3>
                <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-5">
              ¿Estás seguro que deseas eliminar la{' '}
              <span className="font-semibold">Ficha {deleteConfirm.numero}</span>?
              Se realizará un borrado lógico y quedará registrado quién realizó la eliminación.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleteLoading}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
