'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Users,
  Edit,
  Save,
  X,
  School,
  BookOpen,
  User,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { Ficha, Aprendiz, Colegio, Programa, User as UserType } from '@/types';
import { formatDate } from '@/lib/utils';

// ── Badges helpers ─────────────────────────────────────────────────────────────
function DependenciaBadge({ dependencia }: { dependencia?: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    ARTICULACION: { label: 'Articulación', variant: 'warning' },
    TITULADA: { label: 'Titulada', variant: 'default' },
    COMPLEMENTARIA: { label: 'Complementaria', variant: 'secondary' },
  };
  const d = dependencia ? (map[dependencia] ?? { label: dependencia, variant: 'outline' }) : { label: 'Sin definir', variant: 'outline' };
  return <Badge variant={d.variant}>{d.label}</Badge>;
}

function EstadoBadge({ estado }: { estado?: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    ACTIVA: { label: 'Activa', variant: 'success' },
    EN_CIERRE: { label: 'En cierre', variant: 'warning' },
    FINALIZADA: { label: 'Finalizada', variant: 'secondary' },
  };
  const s = estado ? (map[estado] ?? { label: estado, variant: 'outline' }) : { label: 'Sin estado', variant: 'outline' };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

function computeStateTags(ficha: Ficha, aprendicesCount: number): string[] {
  const tags: string[] = [];
  const cupo = ficha.cupoEsperado ?? 30;
  const needsAmbiente = ficha.dependencia !== 'ARTICULACION';

  if (aprendicesCount === 0) tags.push('Sin aprendices');
  else if (aprendicesCount < cupo) tags.push('Carga parcial');
  else tags.push('Completa');

  if (!ficha.instructorId) tags.push('Sin instructor');
  if (needsAmbiente && !ficha.ambiente) tags.push('Sin ambiente');
  if (aprendicesCount >= cupo && !!ficha.instructorId && (!needsAmbiente || !!ficha.ambiente)) {
    tags.push('Lista para operación');
  }
  return tags;
}

function StateTagBadge({ tag }: { tag: string }) {
  const variant =
    tag === 'Lista para operación' || tag === 'Completa' ? 'success'
    : tag === 'Carga parcial' ? 'warning'
    : 'danger';
  return <Badge variant={variant}>{tag}</Badge>;
}

function computeGeneralStatus(ficha: Ficha, aprendicesCount: number): { label: string; variant: any } {
  const cupo = ficha.cupoEsperado ?? 30;
  const hasInstructor = !!ficha.instructorId;
  const needsAmbiente = ficha.dependencia !== 'ARTICULACION';
  if (aprendicesCount === 0) return { label: 'Configuración inicial', variant: 'outline' };
  if (!hasInstructor || (needsAmbiente && !ficha.ambiente)) return { label: 'En alistamiento', variant: 'warning' };
  if (aprendicesCount < cupo) return { label: 'En alistamiento', variant: 'warning' };
  return { label: 'Lista para operación', variant: 'success' };
}

// ── Info row helper ────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 font-medium min-w-[140px]">{label}</span>
      <span className="text-sm text-gray-900 font-semibold text-right">{value ?? '—'}</span>
    </div>
  );
}

const MODALIDAD_LABELS: Record<string, string> = {
  COMPARTIDA: 'Compartida',
  UNICA: 'Única',
  COLEGIO_PRIVADO: 'Colegio privado',
};

// ── Main component ─────────────────────────────────────────────────────────────
export default function FichaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ficha, setFicha] = React.useState<Ficha | null>(null);
  const [aprendices, setAprendices] = React.useState<Aprendiz[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Edit state
  const [editing, setEditing] = React.useState(false);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [programas, setProgramas] = React.useState<Programa[]>([]);
  const [colegios, setColegios] = React.useState<Colegio[]>([]);
  const [instructores, setInstructores] = React.useState<UserType[]>([]);
  const [editForm, setEditForm] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [fichaRes, aprendicesRes] = await Promise.all([
        api.get(`/fichas/${id}`),
        api.get(`/aprendices/ficha/${id}/aprendices`).catch(() => ({ data: [] })),
      ]);
      setFicha(fichaRes.data);
      setAprendices(Array.isArray(aprendicesRes.data) ? aprendicesRes.data : aprendicesRes.data?.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Error al cargar la ficha');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = async () => {
    if (!ficha) return;
    try {
      const [progRes, colegRes, usersRes] = await Promise.all([
        api.get('/programas', { params: { limit: 200 } }),
        api.get('/colegios', { params: { limit: 200 } }),
        api.get('/users', { params: { limit: 200 } }),
      ]);
      setProgramas(progRes.data.data || progRes.data || []);
      setColegios(colegRes.data.data || colegRes.data || []);
      setInstructores((usersRes.data.data || usersRes.data || []).filter((u: UserType) => u.rol === 'instructor'));
    } catch (e) { /* ok */ }

    setEditForm({
      numeroFicha: ficha.numeroFicha,
      jornada: ficha.jornada,
      dependencia: ficha.dependencia,
      tipoProgramaFormacion: ficha.tipoProgramaFormacion || '',
      cupoEsperado: String(ficha.cupoEsperado ?? 30),
      modalidadArticulacion: ficha.modalidadArticulacion || '',
      localidad: ficha.localidad || '',
      ambiente: ficha.ambiente || '',
      observaciones: ficha.observaciones || '',
      fechaInicio: ficha.fechaInicio ? ficha.fechaInicio.split('T')[0] : '',
      fechaFin: ficha.fechaFin ? ficha.fechaFin.split('T')[0] : '',
      colegioId: ficha.colegioId || '',
      programaId: ficha.programaId || '',
      instructorId: ficha.instructorId || '',
    });
    setSaveError('');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveError('');
    try {
      const payload: any = {
        numeroFicha: editForm.numeroFicha,
        jornada: editForm.jornada,
        dependencia: editForm.dependencia,
        cupoEsperado: parseInt(editForm.cupoEsperado) || 30,
      };
      if (editForm.tipoProgramaFormacion) payload.tipoProgramaFormacion = editForm.tipoProgramaFormacion;
      if (editForm.modalidadArticulacion) payload.modalidadArticulacion = editForm.modalidadArticulacion;
      if (editForm.localidad) payload.localidad = editForm.localidad;
      if (editForm.ambiente) payload.ambiente = editForm.ambiente;
      if (editForm.observaciones) payload.observaciones = editForm.observaciones;
      if (editForm.fechaInicio) payload.fechaInicio = editForm.fechaInicio;
      if (editForm.fechaFin) payload.fechaFin = editForm.fechaFin;
      if (editForm.colegioId) payload.colegioId = editForm.colegioId;
      if (editForm.programaId) payload.programaId = editForm.programaId;
      if (editForm.instructorId) payload.instructorId = editForm.instructorId;

      await api.patch(`/fichas/${id}`, payload);
      setEditing(false);
      fetchData();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-gray-400">Cargando...</div>
      </DashboardLayout>
    );
  }

  if (error || !ficha) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-gray-600 font-medium">{error || 'Ficha no encontrada'}</p>
          <Button className="mt-4" variant="outline" onClick={() => router.push('/dashboard/fichas')}>
            <ArrowLeft size={16} className="mr-2" />
            Volver
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const aprendicesCount = aprendices.length;
  const generalStatus = computeGeneralStatus(ficha, aprendicesCount);
  const stateTags = computeStateTags(ficha, aprendicesCount);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back + header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => router.push('/dashboard/fichas')}
              className="mt-1 p-1.5 rounded-md hover:bg-gray-100 text-gray-500"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-950">Ficha {ficha.numeroFicha}</h1>
                <DependenciaBadge dependencia={ficha.dependencia} />
                <EstadoBadge estado={ficha.estado} />
                <Badge variant={generalStatus.variant}>{generalStatus.label}</Badge>
              </div>
              <p className="text-gray-500 mt-0.5 text-sm font-medium">
                {ficha.programa?.nombre || 'Programa no asignado'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <Button
                className="bg-green-600 hover:bg-green-700"
                size="sm"
                onClick={openEdit}
              >
                <Edit size={15} className="mr-1.5" />
                Editar
              </Button>
            ) : (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                  <X size={15} className="mr-1.5" />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSave}
                  disabled={saveLoading}
                >
                  <Save size={15} className="mr-1.5" />
                  {saveLoading ? 'Guardando...' : 'Guardar'}
                </Button>
              </>
            )}
          </div>
        </div>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
            {saveError}
          </div>
        )}

        {/* State tags */}
        <div className="flex flex-wrap gap-2">
          {stateTags.map((tag) => (
            <StateTagBadge key={tag} tag={tag} />
          ))}
        </div>

        {/* Main content */}
        {!editing ? (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Datos generales */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={16} />
                  Datos generales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow label="Número de ficha" value={ficha.numeroFicha} />
                <InfoRow label="Jornada" value={ficha.jornada} />
                <InfoRow label="Dependencia" value={<DependenciaBadge dependencia={ficha.dependencia} />} />
                <InfoRow label="Tipo de programa" value={ficha.tipoProgramaFormacion} />
                <InfoRow label="Cupo esperado" value={ficha.cupoEsperado ?? 30} />
                <InfoRow label="Ambiente" value={ficha.ambiente} />
                <InfoRow label="Fecha inicio" value={ficha.fechaInicio ? formatDate(ficha.fechaInicio) : undefined} />
                <InfoRow label="Fecha fin" value={ficha.fechaFin ? formatDate(ficha.fechaFin) : undefined} />
              </CardContent>
            </Card>

            {/* Asignación */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <User size={16} />
                  Asignación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InfoRow
                  label="Instructor"
                  value={
                    ficha.instructor ? (
                      <span className="text-green-700 font-semibold">{ficha.instructor.nombre}</span>
                    ) : (
                      <Badge variant="danger">Sin asignar</Badge>
                    )
                  }
                />
                <InfoRow
                  label="Programa"
                  value={ficha.programa?.nombre}
                />
                {ficha.dependencia === 'ARTICULACION' ? (
                  <>
                    <InfoRow label="Colegio" value={ficha.colegio?.nombre} />
                    <InfoRow
                      label="Modalidad"
                      value={ficha.modalidadArticulacion ? MODALIDAD_LABELS[ficha.modalidadArticulacion] : undefined}
                    />
                    <InfoRow label="Localidad" value={ficha.localidad} />
                  </>
                ) : (
                  <InfoRow label="Ambiente" value={ficha.ambiente || <Badge variant="danger">Sin asignar</Badge>} />
                )}
              </CardContent>
            </Card>

            {/* Aprendices */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <Users size={16} />
                    Aprendices
                    <span className="text-gray-400 font-normal text-sm">
                      {aprendicesCount} / {ficha.cupoEsperado ?? 30}
                    </span>
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {aprendicesCount === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p className="text-sm font-medium">Sin aprendices registrados</p>
                    <p className="text-xs mt-1">Los aprendices se gestionan desde el módulo de Aprendices</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 pr-4 text-xs text-gray-500 font-semibold uppercase tracking-wide">Nombre</th>
                          <th className="text-left py-2 pr-4 text-xs text-gray-500 font-semibold uppercase tracking-wide">Documento</th>
                          <th className="text-left py-2 pr-4 text-xs text-gray-500 font-semibold uppercase tracking-wide">Email</th>
                          <th className="text-left py-2 text-xs text-gray-500 font-semibold uppercase tracking-wide">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aprendices.map((ap) => (
                          <tr key={ap.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-2 pr-4 font-medium text-gray-900">
                              {ap.nombres} {ap.apellidos}
                            </td>
                            <td className="py-2 pr-4 text-gray-600">
                              {ap.tipoDocumento} {ap.documento}
                            </td>
                            <td className="py-2 pr-4 text-gray-600">{ap.email || '—'}</td>
                            <td className="py-2">
                              <Badge
                                variant={
                                  ap.estadoAcademico === 'ACTIVO' ? 'success'
                                  : ap.estadoAcademico === 'DESERTOR' ? 'danger'
                                  : 'warning'
                                }
                              >
                                {ap.estadoAcademico}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trazabilidad */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Clock size={16} />
                  Trazabilidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Creada</p>
                    <p className="text-sm text-gray-900 font-medium">{ficha.createdAt ? formatDate(ficha.createdAt) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Actualizada</p>
                    <p className="text-sm text-gray-900 font-medium">{ficha.updatedAt ? formatDate(ficha.updatedAt) : '—'}</p>
                  </div>
                  {ficha.observaciones && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Observaciones</p>
                      <p className="text-sm text-gray-700">{ficha.observaciones}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Edit form */
          <div className="grid gap-5 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-800">Editar Ficha</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Número de Ficha</label>
                    <Input value={editForm.numeroFicha} onChange={(e) => setEditForm((f) => ({ ...f, numeroFicha: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Jornada</label>
                    <select
                      value={editForm.jornada}
                      onChange={(e) => setEditForm((f) => ({ ...f, jornada: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                    >
                      <option value="MAÑANA">Mañana</option>
                      <option value="TARDE">Tarde</option>
                      <option value="NOCHE">Noche</option>
                      <option value="MIXTA">Mixta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Dependencia</label>
                    <select
                      value={editForm.dependencia}
                      onChange={(e) => setEditForm((f) => ({ ...f, dependencia: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                    >
                      <option value="TITULADA">Titulada</option>
                      <option value="ARTICULACION">Articulación</option>
                      <option value="COMPLEMENTARIA">Complementaria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Cupo esperado</label>
                    <Input
                      type="number"
                      value={editForm.cupoEsperado}
                      onChange={(e) => setEditForm((f) => ({ ...f, cupoEsperado: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Tipo de programa</label>
                    <Input
                      placeholder="Ej: Formación titulada"
                      value={editForm.tipoProgramaFormacion}
                      onChange={(e) => setEditForm((f) => ({ ...f, tipoProgramaFormacion: e.target.value }))}
                    />
                  </div>
                  {editForm.dependencia !== 'ARTICULACION' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-1.5">Ambiente</label>
                      <Input
                        placeholder="Ej: Sala 201"
                        value={editForm.ambiente}
                        onChange={(e) => setEditForm((f) => ({ ...f, ambiente: e.target.value }))}
                      />
                    </div>
                  )}
                  {editForm.dependencia === 'ARTICULACION' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Modalidad articulación</label>
                        <select
                          value={editForm.modalidadArticulacion}
                          onChange={(e) => setEditForm((f) => ({ ...f, modalidadArticulacion: e.target.value }))}
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
                          value={editForm.localidad}
                          onChange={(e) => setEditForm((f) => ({ ...f, localidad: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">Colegio</label>
                        <select
                          value={editForm.colegioId}
                          onChange={(e) => setEditForm((f) => ({ ...f, colegioId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                        >
                          <option value="">Sin asignar</option>
                          {colegios.map((c) => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Programa</label>
                    <select
                      value={editForm.programaId}
                      onChange={(e) => setEditForm((f) => ({ ...f, programaId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                    >
                      <option value="">Sin asignar</option>
                      {programas.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Instructor</label>
                    <select
                      value={editForm.instructorId}
                      onChange={(e) => setEditForm((f) => ({ ...f, instructorId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                    >
                      <option value="">Sin asignar</option>
                      {instructores.map((i) => (
                        <option key={i.id} value={i.id}>{i.nombre}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Fecha inicio</label>
                    <Input type="date" value={editForm.fechaInicio} onChange={(e) => setEditForm((f) => ({ ...f, fechaInicio: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Fecha fin</label>
                    <Input type="date" value={editForm.fechaFin} onChange={(e) => setEditForm((f) => ({ ...f, fechaFin: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Observaciones</label>
                    <textarea
                      rows={3}
                      value={editForm.observaciones}
                      onChange={(e) => setEditForm((f) => ({ ...f, observaciones: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
