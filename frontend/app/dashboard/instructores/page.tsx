'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Mail, UserRound, Search, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { InstructorProfile, DependenciaInstructor } from '@/types';

// ── Constantes ─────────────────────────────────────────────────────────────

const DEPENDENCIAS: DependenciaInstructor[] = ['Titulada', 'Articulacion', 'Complementaria'];

// ── Badges de dependencia (iguales al mock) ────────────────────────────────

function DepBadge({ dep }: { dep: DependenciaInstructor }) {
  const styles: Record<DependenciaInstructor, string> = {
    Titulada: 'bg-green-100 text-green-800',
    Articulacion: 'bg-yellow-100 text-yellow-800',
    Complementaria: 'bg-gray-100 text-gray-700',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[dep]}`}
    >
      {dep}
    </span>
  );
}

function EstadoBadge({ estado }: { estado?: string | null }) {
  if (!estado) return null;
  const styles: Record<string, string> = {
    Disponible: 'bg-green-100 text-green-800',
    Parcial: 'bg-yellow-100 text-yellow-800',
    Saturado: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[estado] ?? 'bg-gray-100 text-gray-700'}`}
    >
      {estado}
    </span>
  );
}

// ── Avatar circular con iniciales ──────────────────────────────────────────

function Avatar({ instructor, size = 'md' }: { instructor: InstructorProfile; size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-12 w-12 text-base';
  if (instructor.fotoPerfil) {
    return (
      <img
        src={instructor.fotoPerfil}
        alt={instructor.nombre}
        className={`${dim} rounded-full object-cover border border-gray-200 flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-full bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0`}
    >
      <span className="font-semibold text-green-700">{instructor.initials}</span>
    </div>
  );
}

// ── Panel de detalle (perfil rápido) ──────────────────────────────────────

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-[1rem] border border-gray-100 bg-gray-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800">{value}</p>
    </div>
  );
}

function InstructorDetailPanel({ instructor }: { instructor: InstructorProfile }) {
  return (
    <div className="space-y-4">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <Avatar instructor={instructor} size="lg" />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{instructor.nombre}</p>
          <p className="mt-0.5 text-sm text-gray-500">{instructor.telefono ?? '—'}</p>
          <p className="text-sm text-gray-500 truncate">{instructor.email}</p>
        </div>
      </div>

      {/* Fichas count */}
      <div className="rounded-[1rem] border border-green-100 bg-green-50 p-3 flex items-center gap-3">
        <BookOpen className="h-4 w-4 text-green-600 flex-shrink-0" />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700">
            Fichas asignadas
          </p>
          <p className="text-xl font-bold text-green-800">{instructor.fichasCount}</p>
        </div>
      </div>

      {/* Estado */}
      {instructor.estadoDisponibilidad && (
        <div className="rounded-[1rem] border border-gray-100 bg-gray-50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            Estado
          </p>
          <div className="mt-1.5">
            <EstadoBadge estado={instructor.estadoDisponibilidad} />
          </div>
        </div>
      )}

      {/* Articulación */}
      {instructor.dependencia === 'Articulacion' && (
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-[1rem] border border-yellow-100 bg-yellow-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-yellow-700">Colegio base</p>
            <p className="mt-1 text-sm text-gray-800">{instructor.colegioArticulacion ?? 'Pendiente'}</p>
          </div>
          <div className="rounded-[1rem] border border-yellow-100 bg-yellow-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-yellow-700">Modalidad</p>
            <p className="mt-1 text-sm text-gray-800">{instructor.modalidadArticulacion ?? 'Pendiente'}</p>
          </div>
          <div className="rounded-[1rem] border border-yellow-100 bg-yellow-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-yellow-700">Jornada</p>
            <p className="mt-1 text-sm text-gray-800">{instructor.jornadaArticulacion ?? 'Pendiente'}</p>
          </div>
          <div className="rounded-[1rem] border border-yellow-100 bg-yellow-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-yellow-700">Localidad</p>
            <p className="mt-1 text-sm text-gray-800">{instructor.localidad ?? instructor.sede ?? 'Pendiente'}</p>
          </div>
        </div>
      )}

      {/* Perfil */}
      <div className="grid gap-2">
        <ProfileField label="Profesion" value={instructor.profesion} />
        <ProfileField label="Area" value={instructor.area} />
        <div className="grid gap-2 sm:grid-cols-2">
          <ProfileField label="Dependencia" value={instructor.dependencia} />
          <ProfileField label="Tipo de programa" value={instructor.tipoPrograma} />
          <ProfileField label="Sede" value={instructor.sede} />
          {instructor.dependencia !== 'Articulacion' && (
            <ProfileField label="Localidad" value={instructor.localidad} />
          )}
        </div>
        {(instructor.fechaInicioContrato || instructor.fechaFinContrato) && (
          <>
            <ProfileField label="Inicio de contrato" value={instructor.fechaInicioContrato} />
            <ProfileField label="Fin de contrato" value={instructor.fechaFinContrato} />
          </>
        )}
      </div>

      {/* Activo */}
      <div className="flex items-center gap-2 pt-1">
        <div className={`h-2 w-2 rounded-full ${instructor.activo ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-xs text-gray-500">
          {instructor.activo ? 'Activo en el sistema' : 'Inactivo'}
        </span>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────

export default function InstructoresPage() {
  const [instructors, setInstructors] = React.useState<InstructorProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [depFilter, setDepFilter] = React.useState<'Todas' | DependenciaInstructor>('Todas');
  const [areaFilter, setAreaFilter] = React.useState('Todas');
  const [estadoFilter, setEstadoFilter] = React.useState('Todos');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchInstructores();
  }, []);

  const fetchInstructores = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/instructores');
      const data: InstructorProfile[] = Array.isArray(res.data) ? res.data : [];
      setInstructors(data);
      if (data.length) setSelectedId(data[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const areas = React.useMemo(
    () => ['Todas', ...Array.from(new Set(instructors.map((i) => i.area).filter(Boolean) as string[]))],
    [instructors],
  );

  const estados = React.useMemo(
    () => ['Todos', ...Array.from(new Set(instructors.map((i) => i.estadoDisponibilidad).filter(Boolean) as string[]))],
    [instructors],
  );

  // Lista filtrada sin aplicar depFilter — usada para los contadores de chips y métricas
  const filteredWithoutDep = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return instructors.filter((i) => {
      if (q && !i.nombre.toLowerCase().includes(q) && !i.email.toLowerCase().includes(q) && !(i.telefono ?? '').includes(q)) return false;
      if (areaFilter !== 'Todas' && i.area !== areaFilter) return false;
      if (estadoFilter !== 'Todos' && i.estadoDisponibilidad !== estadoFilter) return false;
      return true;
    });
  }, [instructors, search, areaFilter, estadoFilter]);

  const filtered = React.useMemo(() => {
    if (depFilter === 'Todas') return filteredWithoutDep;
    return filteredWithoutDep.filter((i) => i.dependencia === depFilter);
  }, [filteredWithoutDep, depFilter]);

  const selected = React.useMemo(
    () => filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  const counters = DEPENDENCIAS.map((dep) => ({
    dep,
    count: filteredWithoutDep.filter((i) => i.dependencia === dep).length,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-1">
            Coordinacion Operativa
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Instructores</h1>
          <p className="text-sm text-gray-500 mt-1">
            Directorio operativo con contexto administrativo. En articulacion la lectura se adapta por colegio, cobertura y modalidad.
          </p>
        </div>

        {/* 3 métricas flat — igual al mock */}
        <div className="grid gap-3 xl:grid-cols-3">
          {[
            { label: 'Perfiles visibles', value: filteredWithoutDep.length },
            { label: 'Articulacion', value: filteredWithoutDep.filter((i) => i.dependencia === 'Articulacion').length },
            { label: 'Titulada', value: filteredWithoutDep.filter((i) => i.dependencia === 'Titulada').length },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-[1rem] border border-gray-200 bg-white px-4 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {m.label}
              </p>
              <p className="mt-1 text-[1.35rem] font-semibold leading-none text-gray-900">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tarjeta directorio */}
        <Card className="overflow-visible">
          <CardHeader className="gap-4">
            <div>
              <CardTitle>Directorio de instructores</CardTitle>
              <CardDescription>
                Vista humana del equipo docente con acceso rapido al perfil. La sede activa sigue siendo administrativa; articulacion se lee por colegio y cobertura.
              </CardDescription>
            </div>

            {/* Fila de filtros */}
            <div className="grid gap-2 lg:grid-cols-[1fr_160px_200px_160px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, telefono o correo"
                  className="w-full h-10 rounded-[0.95rem] border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <select
                value={depFilter}
                onChange={(e) => setDepFilter(e.target.value as any)}
                className="h-10 rounded-[0.95rem] border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="Todas">Todas</option>
                {DEPENDENCIAS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="h-10 rounded-[0.95rem] border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {areas.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="h-10 rounded-[0.95rem] border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {estados.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Counter chips */}
            <div className="flex flex-wrap gap-2">
              {counters.map(({ dep, count }) => (
                <button
                  key={dep}
                  type="button"
                  onClick={() => setDepFilter(depFilter === dep ? 'Todas' : dep)}
                  className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    depFilter === dep
                      ? 'border-green-600 bg-green-600 text-white'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-green-300'
                  }`}
                >
                  {dep} · {count}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
              </div>
            ) : !filtered.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <UserRound className="h-12 w-12 mb-3 opacity-30" />
                <p className="font-medium">Sin instructores visibles</p>
                <p className="text-sm mt-1">Ajusta los filtros para recuperar perfiles.</p>
              </div>
            ) : (
              <div className="grid items-start gap-4 xl:grid-cols-[1.4fr_0.6fr]">

                {/* Lista agrupada por dependencia */}
                <div className="space-y-5">
                  {DEPENDENCIAS.map((dep) => {
                    const items = filtered.filter((i) => i.dependencia === dep);
                    if (!items.length) return null;
                    return (
                      <section key={dep} className="space-y-3">
                        {/* Header de sección */}
                        <div className="flex items-center gap-2">
                          <DepBadge dep={dep} />
                          <span className="text-xs uppercase tracking-[0.16em] text-gray-400">
                            {items.length} perfiles
                          </span>
                        </div>

                        {/* Grid de tarjetas */}
                        <div className="grid gap-3 xl:grid-cols-2">
                          {items.map((item) => {
                            const active = item.id === selected?.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedId(item.id)}
                                className={`flex items-center gap-4 rounded-[1rem] border px-4 py-4 text-left transition-all ${
                                  active
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
                                }`}
                              >
                                <Avatar instructor={item} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-gray-900">{item.nombre}</p>
                                    <DepBadge dep={dep} />
                                  </div>
                                  <div className="mt-1.5 space-y-1 text-sm text-gray-500">
                                    {item.telefono && (
                                      <p className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5" />
                                        {item.telefono}
                                      </p>
                                    )}
                                    <p className="flex items-center gap-1.5 truncate">
                                      <Mail className="h-3.5 w-3.5" />
                                      {item.email}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-green-600 flex-shrink-0">
                                  Ver perfil
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}

                  {/* Sin dependencia asignada */}
                  {(() => {
                    const items = filtered.filter((i) => !i.dependencia);
                    if (!items.length) return null;
                    return (
                      <section className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                            Sin dependencia
                          </span>
                          <span className="text-xs uppercase tracking-[0.16em] text-gray-400">
                            {items.length} perfiles
                          </span>
                        </div>
                        <div className="grid gap-3 xl:grid-cols-2">
                          {items.map((item) => {
                            const active = item.id === selected?.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setSelectedId(item.id)}
                                className={`flex items-center gap-4 rounded-[1rem] border px-4 py-4 text-left transition-all ${
                                  active
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-gray-50'
                                }`}
                              >
                                <Avatar instructor={item} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold text-gray-900">{item.nombre}</p>
                                  <div className="mt-1.5 space-y-1 text-sm text-gray-500">
                                    {item.telefono && (
                                      <p className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5" />
                                        {item.telefono}
                                      </p>
                                    )}
                                    <p className="flex items-center gap-1.5 truncate">
                                      <Mail className="h-3.5 w-3.5" />
                                      {item.email}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-green-600 flex-shrink-0">
                                  Ver perfil
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })()}
                </div>

                {/* Panel perfil rápido — sticky */}
                <div className="xl:sticky xl:top-[5.5rem] xl:self-start">
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-base">Perfil rapido</CardTitle>
                      <CardDescription className="text-xs">
                        Detalle operativo del instructor seleccionado sin salir de la pantalla.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="xl:max-h-[calc(100vh-13rem)] xl:overflow-y-auto">
                      {selected ? (
                        <InstructorDetailPanel instructor={selected} />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                          <UserRound className="h-10 w-10 mb-2 opacity-30" />
                          <p className="text-sm">Elige un instructor para ver su detalle.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

