'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Ambiente, EstadoAmbiente, TableroData, TableroRow, TableroCell,
  TipoAmbiente, DiaSemana, JornadaBloque, CeldaEstado,
} from '@/types';
import api from '@/lib/api';
import {
  Search, Plus, X, AlertTriangle, DoorOpen, Pen, Trash2, BookOpen,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// ── Constantes ─────────────────────────────────────────────────────────────

const DIAS: DiaSemana[] = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const JORNADAS: JornadaBloque[] = ['MANANA', 'TARDE', 'NOCHE'];

// ── Utilidades de semana ───────────────────────────────────────────────────
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function getCurrentWeekDates(): Record<DiaSemana, string> {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun,1=Mon,...
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  const result = {} as Record<DiaSemana, string>;
  DIAS.forEach((dia, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    result[dia] = `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
  });
  return result;
}
const JORNADA_LABELS: Record<JornadaBloque, string> = {
  MANANA: 'Mañana', TARDE: 'Tarde', NOCHE: 'Noche',
};
const TIPO_LABELS: Record<TipoAmbiente, string> = {
  TITULADA: 'Titulada', COMPLEMENTARIA: 'Complementaria',
};
const ESTADO_LABELS: Record<EstadoAmbiente, string> = {
  ACTIVO: 'Activo', MANTENIMIENTO: 'Mantenimiento', INACTIVO: 'Inactivo',
};

// ── Helpers de estilo ──────────────────────────────────────────────────────

function cellBg(state: CeldaEstado) {
  if (state === 'Conflicto') return 'border-red-200 bg-gradient-to-br from-red-50 to-white';
  if (state === 'Ocupado') return 'border-green-200 bg-gradient-to-br from-green-50 to-white';
  return 'border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white';
}

function tipoBadge(tipo: TipoAmbiente) {
  if (tipo === 'TITULADA') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-700';
}

function estadoBadge(estado: EstadoAmbiente) {
  if (estado === 'ACTIVO') return 'bg-green-100 text-green-700';
  if (estado === 'MANTENIMIENTO') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-500';
}

// ── Modal de asignación ────────────────────────────────────────────────────

interface AsignacionModalProps {
  ambienteId: string;
  ambienteNombre: string;
  dia: DiaSemana;
  jornada: JornadaBloque;
  fichas: { id: string; numeroFicha: string; tipoProgramaFormacion?: string }[];
  instructores: { id: string; nombre: string }[];
  onSave: (fichaId?: string, instructorId?: string, notas?: string) => Promise<void>;
  onClose: () => void;
}

function AsignacionModal({
  ambienteNombre, dia, jornada, fichas, instructores, onSave, onClose,
}: AsignacionModalProps) {
  const [fichaId, setFichaId] = React.useState('');
  const [instructorId, setInstructorId] = React.useState('');
  const [notas, setNotas] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(fichaId || undefined, instructorId || undefined, notas || undefined);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-[1.2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-600">Asignar bloque</p>
            <h3 className="font-semibold text-gray-900">{ambienteNombre}</h3>
            <p className="text-sm text-gray-500">{dia} — {JORNADA_LABELS[jornada]}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Ficha</label>
            <select
              value={fichaId}
              onChange={(e) => setFichaId(e.target.value)}
              className="w-full rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Sin ficha asignada</option>
              {fichas.map((f) => (
                <option key={f.id} value={f.id}>{f.numeroFicha} — {f.tipoProgramaFormacion ?? 'Sin programa'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Instructor</label>
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              className="w-full rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Sin instructor</option>
              {instructores.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Notas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="w-full rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Opcional..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal crear/editar ambiente ────────────────────────────────────────────

interface AmbienteForm {
  nombre: string; sede: string; capacidad: string;
  tipo: TipoAmbiente; estado: EstadoAmbiente;
  descripcion: string; equipamiento: string;
}

interface AmbienteModalProps {
  inicial?: Ambiente | null;
  onSave: (data: AmbienteForm) => Promise<void>;
  onClose: () => void;
}

function AmbienteModal({ inicial, onSave, onClose }: AmbienteModalProps) {
  const [form, setForm] = React.useState<AmbienteForm>({
    nombre: inicial?.nombre ?? '',
    sede: inicial?.sede ?? '',
    capacidad: String(inicial?.capacidad ?? 30),
    tipo: inicial?.tipo ?? 'TITULADA',
    estado: inicial?.estado ?? 'ACTIVO',
    descripcion: inicial?.descripcion ?? '',
    equipamiento: inicial?.equipamiento ?? '',
  });
  const [saving, setSaving] = React.useState(false);

  const set = (key: keyof AmbienteForm, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-[1.2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-600">
              {inicial ? 'Editar' : 'Crear'} ambiente
            </p>
            <h3 className="font-semibold text-gray-900">{inicial?.nombre ?? 'Nuevo ambiente'}</h3>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {[
            { label: 'Nombre', key: 'nombre', placeholder: 'Sala 4' },
            { label: 'Sede', key: 'sede', placeholder: 'Chapinero' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
              <input
                value={form[key as keyof AmbienteForm]}
                onChange={(e) => set(key as keyof AmbienteForm, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Capacidad</label>
            <input
              type="number" min={1} value={form.capacidad}
              onChange={(e) => set('capacidad', e.target.value)}
              className="w-full rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Tipo</label>
            <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}
              className="w-full rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
              <option value="TITULADA">Titulada</option>
              <option value="COMPLEMENTARIA">Complementaria</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</label>
            <select value={form.estado} onChange={(e) => set('estado', e.target.value)}
              className="w-full rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
              <option value="ACTIVO">Activo</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Equipamiento</label>
            <input
              value={form.equipamiento}
              onChange={(e) => set('equipamiento', e.target.value)}
              placeholder="Computadores, Proyector, Tablero digital..."
              className="w-full rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              rows={2}
              className="w-full resize-none rounded-[0.85rem] border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button onClick={onClose} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={async () => { setSaving(true); try { await onSave(form); } finally { setSaving(false); } }}
            disabled={saving || !form.nombre.trim() || !form.sede.trim()}
            className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────

export default function AmbientesPage() {
  const [tablero, setTablero] = React.useState<TableroData | null>(null);
  const [ambientes, setAmbientes] = React.useState<Ambiente[]>([]);
  const [fichas, setFichas] = React.useState<{ id: string; numeroFicha: string; tipoProgramaFormacion?: string }[]>([]);
  const [instructores, setInstructores] = React.useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<'board' | 'catalog'>('board');
  const [selectedDia, setSelectedDia] = React.useState<DiaSemana>('LUN');
  const [sedeFilter, setSedeFilter] = React.useState('');
  const [tipoFilter, setTipoFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'free' | 'occupied'>('all');
  const [search, setSearch] = React.useState('');
  const [asignacionModal, setAsignacionModal] = React.useState<{
    ambienteId: string; ambienteNombre: string; dia: DiaSemana; jornada: JornadaBloque;
  } | null>(null);
  const [ambienteModal, setAmbienteModal] = React.useState<{ open: boolean; item?: Ambiente | null }>({ open: false });
  const [toast, setToast] = React.useState<string | null>(null);
  const [catalogEstadoFilter, setCatalogEstadoFilter] = React.useState('');

  React.useEffect(() => { fetchData(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tableroRes, ambientesRes, fichasRes, instructoresRes] = await Promise.all([
        api.get('/ambientes/tablero'),
        api.get('/ambientes'),
        api.get('/fichas'),
        api.get('/users/instructores'),
      ]);
      setTablero(tableroRes.data);
      setAmbientes(ambientesRes.data?.data ?? []);
      setFichas(fichasRes.data?.data ?? []);
      setInstructores(instructoresRes.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const refreshTablero = async () => {
    const res = await api.get('/ambientes/tablero', { params: sedeFilter ? { sede: sedeFilter } : {} });
    setTablero(res.data);
    const res2 = await api.get('/ambientes', { params: sedeFilter ? { sede: sedeFilter } : {} });
    setAmbientes(res2.data?.data ?? []);
  };

  // ── Filtrar filas del tablero ─────────────────────────────────────────

  const rows = React.useMemo(() => {
    if (!tablero) return [];
    const q = search.trim().toLowerCase();
    return tablero.rows.filter((row) => {
      if (sedeFilter && row.sede !== sedeFilter) return false;
      if (tipoFilter && row.tipo !== tipoFilter) return false;
      if (statusFilter === 'free' && row.libres === 0) return false;
      if (statusFilter === 'occupied' && row.ocupados === 0) return false;
      if (q && !row.nombre.toLowerCase().includes(q) && !row.sede.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tablero, sedeFilter, tipoFilter, statusFilter, search]);

  const visibleBlocks = JORNADAS.map((j) => `${selectedDia} ${j}`);

  const catalogAmbientes = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return ambientes.filter((a) => {
      if (tipoFilter && a.tipo !== tipoFilter) return false;
      if (catalogEstadoFilter && a.estado !== catalogEstadoFilter) return false;
      if (q && !a.nombre.toLowerCase().includes(q) && !a.sede.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [ambientes, search, tipoFilter, catalogEstadoFilter]);

  const sedes = React.useMemo(
    () => tablero ? ['', ...tablero.sedes] : [],
    [tablero],
  );

  const metrics = tablero?.metrics ?? { ambientesLibres: 0, ambientesTotal: 0, bloquesLibres: 0, bloquesTotal: 0 };

  // ── Acciones ─────────────────────────────────────────────────────────

  const handleCellClick = (row: TableroRow, dia: DiaSemana, jornada: JornadaBloque, cell: TableroCell) => {
    if (cell.state === 'Ocupado' || cell.state === 'Conflicto') return;
    setAsignacionModal({ ambienteId: row.id, ambienteNombre: row.nombre, dia, jornada });
  };

  const handleAsignar = async (fichaId?: string, instructorId?: string, notas?: string) => {
    if (!asignacionModal) return;
    await api.post(`/ambientes/${asignacionModal.ambienteId}/asignaciones`, {
      dia: asignacionModal.dia,
      jornada: asignacionModal.jornada,
      fichaId,
      instructorId,
      notas,
    });
    setAsignacionModal(null);
    await refreshTablero();
    showToast('Bloque asignado correctamente');
  };

  const handleLiberarBloque = async (asignacionId: string) => {
    if (!confirm('¿Liberar este bloque?')) return;
    await api.delete(`/ambientes/asignaciones/${asignacionId}`);
    await refreshTablero();
    showToast('Bloque liberado');
  };

  const handleGuardarAmbiente = async (form: AmbienteForm) => {
    const payload = { ...form, capacidad: Number(form.capacidad) };
    if (ambienteModal.item) {
      await api.patch(`/ambientes/${ambienteModal.item.id}`, payload);
      showToast('Ambiente actualizado');
    } else {
      await api.post('/ambientes', payload);
      showToast('Ambiente creado');
    }
    setAmbienteModal({ open: false });
    await refreshTablero();
  };

  const handleEliminarAmbiente = async (id: string) => {
    if (!confirm('¿Eliminar este ambiente? Esta acción no se puede deshacer.')) return;
    await api.delete(`/ambientes/${id}`);
    await refreshTablero();
    showToast('Ambiente eliminado');
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-green-600 mb-1">
            Coordinacion Operativa
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Ambientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tablero operativo para ubicar ambientes de formación por sede, jornada y día de la semana.
          </p>
        </div>

        {/* Métricas planas */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Ambientes libres', value: metrics.ambientesLibres, color: 'text-green-700' },
            { label: 'Sede activa', value: sedeFilter || 'Todas', color: 'text-gray-900' },
            { label: 'Bloques libres', value: metrics.bloquesLibres, color: 'text-green-700' },
            { label: 'Total ambientes', value: metrics.ambientesTotal, color: 'text-gray-900' },
          ].map((m) => (
            <div key={m.label} className="rounded-[1rem] border border-gray-200 bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{m.label}</p>
              <p className={`mt-1 text-xl font-semibold ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Vista tabs */}
        <div className="rounded-[1rem] border border-gray-200 bg-white px-4 py-4">
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-green-600">Ambientes</p>
            <p className="mt-0.5 text-sm text-gray-500">
              El tablero operativo es la vista principal. El catálogo permite gestión CRUD de ambientes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[{ id: 'board', label: 'Tablero operativo' }, { id: 'catalog', label: 'Catálogo de ambientes' }].map((opt) => {
              const active = view === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setView(opt.id as 'board' | 'catalog')}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    active ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-green-300'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TABLERO ────────────────────────────────────────────────────── */}
        {view === 'board' && (
          <Card className="overflow-hidden">
            <CardHeader className="gap-4 border-b border-gray-100">
              <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-green-600">Consola de ocupación</p>
                  <CardTitle className="mt-1">Tablero de ocupación por bloque</CardTitle>
                  <CardDescription>
                    Cada fila es un ambiente. Cada celda muestra la disponibilidad real por bloque.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="rounded-full border border-gray-200 bg-white px-3 py-1">Libre</span>
                  <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-green-700">Ocupado</span>
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-700">Conflicto</span>
                </div>
              </div>

              {/* Sub-métricas del tablero */}
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Ambientes visibles', value: rows.length, cls: 'border-gray-200' },
                  { label: 'Bloques libres', value: rows.flatMap((r) => r.cells).filter((c) => c.state === 'Libre').length, cls: 'border-green-100 bg-green-50' },
                  { label: 'Bloques ocupados', value: rows.flatMap((r) => r.cells).filter((c) => c.state === 'Ocupado').length, cls: 'border-green-100 bg-green-50/60' },
                  { label: 'Conflictos', value: rows.flatMap((r) => r.cells).filter((c) => c.state === 'Conflicto').length, cls: 'border-red-100 bg-red-50' },
                ].map((m) => (
                  <div key={m.label} className={`rounded-[0.95rem] border px-4 py-3 ${m.cls}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">{m.label}</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Filtros */}
              <div className="grid gap-3 xl:grid-cols-[180px_180px_1fr_auto]">
                <select value={sedeFilter} onChange={(e) => setSedeFilter(e.target.value)}
                  className="h-10 rounded-[0.95rem] border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
                  <option value="">Todas las sedes</option>
                  {sedes.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value)}
                  className="h-10 rounded-[0.95rem] border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600">
                  <option value="">Todas las dependencias</option>
                  <option value="TITULADA">Titulada</option>
                  <option value="COMPLEMENTARIA">Complementaria</option>
                </select>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar ambiente, ficha o instructor"
                    className="h-10 w-full rounded-[0.95rem] border border-gray-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {[{ id: 'free', label: 'Solo libres' }, { id: 'occupied', label: 'Solo ocupados' }].map((f) => {
                    const active = statusFilter === f.id;
                    return (
                      <button key={f.id} onClick={() => setStatusFilter(statusFilter === f.id ? 'all' : f.id as any)}
                        className={`rounded-full border px-3 py-2 text-[11px] font-semibold uppercase transition-all ${
                          active ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 bg-white text-gray-500 hover:border-green-300'
                        }`}>{f.label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Selector de día */}
              {(() => {
                const weekDates = getCurrentWeekDates();
                return (
                  <div className="rounded-[0.95rem] border border-gray-100 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Vista por día</p>
                      <p className="text-xs text-gray-400">Mañana · Tarde · Noche</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {DIAS.map((dia) => {
                        const active = selectedDia === dia;
                        return (
                          <button key={dia} onClick={() => setSelectedDia(dia)}
                            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all text-center ${
                              active ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                            }`}>
                            <span className="block">{dia}</span>
                            <span className={`block text-[10px] mt-0.5 ${
                              active ? 'text-green-100' : 'text-gray-400'
                            }`}>{weekDates[dia]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
                </div>
              ) : rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <DoorOpen className="h-12 w-12 mb-3 opacity-30" />
                  <p className="font-medium">Sin ambientes registrados</p>
                  <p className="text-sm mt-1">Ve al catálogo para crear ambientes de formación.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div style={{ minWidth: 900 }}>
                    {/* Header de columnas */}
                    <div className="grid border-b border-gray-100 bg-gray-50/80" style={{ gridTemplateColumns: `220px repeat(3, 1fr)` }}>
                      <div className="sticky left-0 z-20 bg-gray-50 border-r border-gray-100 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        Ambiente
                      </div>
                      {JORNADAS.map((j) => (
                        <div key={j} className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                          {selectedDia} {JORNADA_LABELS[j]}
                        </div>
                      ))}
                    </div>

                    {/* Filas */}
                    {rows.map((row) => (
                      <div key={row.id} className="grid border-b border-gray-100 last:border-0" style={{ gridTemplateColumns: `220px repeat(3, 1fr)` }}>
                        {/* Info del ambiente */}
                        <div className="sticky left-0 z-10 border-r border-gray-100 bg-white/95 px-5 py-4">
                          <p className="font-semibold text-gray-900">{row.nombre}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{row.sede} · {TIPO_LABELS[row.tipo]}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Cap. {row.capacidad}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="rounded-full border border-green-100 bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                              {row.libres} libres
                            </span>
                            {row.conflictos > 0 && (
                              <span className="rounded-full border border-red-100 bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                                {row.conflictos} conflicto
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Celdas por jornada */}
                        {JORNADAS.map((jornada) => {
                          const cell = row.cells.find((c) => c.dia === selectedDia && c.jornada === jornada)
                            ?? { id: `${row.id}-${selectedDia}-${jornada}`, block: '', dia: selectedDia, jornada, state: 'Libre' as CeldaEstado };

                          return (
                            <div key={jornada} className="p-2">
                              <button
                                type="button"
                                onClick={() => cell.state !== 'Ocupado' ? handleCellClick(row, selectedDia, jornada, cell) : undefined}
                                className={`min-h-[120px] w-full rounded-[1rem] border px-4 py-4 text-left transition-all ${cellBg(cell.state)} ${
                                  cell.state === 'Libre' ? 'hover:border-green-300 hover:shadow-md cursor-pointer' : 'cursor-default'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  {/* Badge estado */}
                                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                    cell.state === 'Conflicto' ? 'border-red-200 text-red-700' :
                                    cell.state === 'Ocupado' ? 'border-green-200 text-green-700' :
                                    'border-gray-200 text-gray-500'
                                  }`}>{cell.state}</span>
                                  {cell.state === 'Conflicto' ? <AlertTriangle className="h-4 w-4 text-red-500" /> :
                                   cell.state === 'Libre' ? <DoorOpen className="h-4 w-4 text-green-600" /> : null}
                                </div>

                                {cell.state === 'Libre' ? (
                                  <div className="mt-3">
                                    <p className="text-sm font-medium text-gray-700">Disponible</p>
                                    <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">{JORNADA_LABELS[jornada]}</p>
                                    <p className="mt-2 text-[10px] text-green-600 font-semibold">+ Asignar ficha</p>
                                  </div>
                                ) : (
                                  <div className="mt-3 space-y-1.5">
                                    {cell.fichaNumero && (
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="h-3.5 w-3.5 text-green-600" />
                                        <p className="text-xs font-semibold text-gray-800">{cell.fichaNumero}</p>
                                      </div>
                                    )}
                                    {cell.instructorNombre && (
                                      <p className="text-xs text-gray-500">{cell.instructorNombre}</p>
                                    )}
                                    {cell.notas && <p className="text-[10px] text-gray-400 italic">{cell.notas}</p>}
                                    {cell.asignacionId && (
                                      <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={(e) => { e.stopPropagation(); handleLiberarBloque(cell.asignacionId!); }}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleLiberarBloque(cell.asignacionId!); } }}
                                        className="mt-1 cursor-pointer text-[10px] text-red-500 hover:underline font-semibold"
                                      >Liberar bloque</div>
                                    )}
                                  </div>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── CATÁLOGO ───────────────────────────────────────────────────── */}
        {view === 'catalog' && (
          <Card>
            <CardHeader className="gap-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-green-600">Gestión de ambientes</p>
                  <CardTitle className="mt-1">Catálogo de ambientes</CardTitle>
                  <CardDescription>
                    Crear, editar, cambiar estado o eliminar ambientes de formación.
                  </CardDescription>
                </div>
                <button
                  onClick={() => setAmbienteModal({ open: true, item: null })}
                  className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Nuevo ambiente
                </button>
              </div>

              {/* Filtros catálogo */}
              <div className="grid gap-3 sm:grid-cols-[1fr_160px_160px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, sede..."
                    className="h-10 w-full rounded-[0.95rem] border border-gray-200 bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                  className="h-10 rounded-[0.95rem] border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Todos los tipos</option>
                  <option value="TITULADA">Titulada</option>
                  <option value="COMPLEMENTARIA">Complementaria</option>
                </select>
                <select
                  value={catalogEstadoFilter}
                  onChange={(e) => setCatalogEstadoFilter(e.target.value)}
                  className="h-10 rounded-[0.95rem] border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                >
                  <option value="">Todos los estados</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>

              {/* Resumen rapido */}
              {(() => {
                const filtered = catalogAmbientes;
                const activos = filtered.filter(a => a.estado === 'ACTIVO').length;
                const mantenimiento = filtered.filter(a => a.estado === 'MANTENIMIENTO').length;
                const inactivos = filtered.filter(a => a.estado === 'INACTIVO').length;
                return (
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">{activos} activos</span>
                    {mantenimiento > 0 && <span className="rounded-full border border-yellow-100 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">{mantenimiento} en mantenimiento</span>}
                    {inactivos > 0 && <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">{inactivos} inactivos</span>}
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-500">{filtered.length} total</span>
                  </div>
                );
              })()}
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-7 w-7 rounded-full border-4 border-green-600 border-t-transparent animate-spin" />
                </div>
              ) : catalogAmbientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <DoorOpen className="h-12 w-12 mb-3 opacity-30" />
                  <p className="font-medium">No hay ambientes registrados</p>
                  <p className="text-sm mt-1">Crea el primer ambiente con el botón "Nuevo ambiente".</p>
                </div>
              ) : (
                <>
                  {/* Tabla */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/60">
                          <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Nombre</th>
                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Sede</th>
                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Tipo</th>
                          <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-widest text-gray-400">Cap.</th>
                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Estado</th>
                          <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Equipamiento</th>
                          <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {catalogAmbientes.map((amb) => (
                          <tr key={amb.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-700 flex-shrink-0">
                                  <DoorOpen className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{amb.nombre}</p>
                                  {amb.descripcion && <p className="text-xs text-gray-400 truncate max-w-[180px]">{amb.descripcion}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-600">{amb.sede}</td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tipoBadge(amb.tipo)}`}>
                                {TIPO_LABELS[amb.tipo]}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center font-semibold text-gray-700">{amb.capacidad}</td>
                            <td className="px-4 py-4">
                              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${estadoBadge(amb.estado)}`}>
                                {ESTADO_LABELS[amb.estado]}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs text-gray-400 max-w-[160px] truncate">{amb.equipamiento || '—'}</td>
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => setAmbienteModal({ open: true, item: amb })}
                                  title="Editar"
                                  className="rounded-lg border border-gray-200 p-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                ><Pen className="h-3.5 w-3.5 text-gray-500 hover:text-blue-600" /></button>
                                <button
                                  onClick={() => handleEliminarAmbiente(amb.id)}
                                  title="Eliminar"
                                  className="rounded-lg border border-red-100 p-2 hover:bg-red-50 transition-colors"
                                ><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
                    Mostrando {catalogAmbientes.length} ambiente{catalogAmbientes.length !== 1 ? 's' : ''}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modales */}
      {asignacionModal && (
        <AsignacionModal
          {...asignacionModal}
          fichas={fichas}
          instructores={instructores}
          onSave={handleAsignar}
          onClose={() => setAsignacionModal(null)}
        />
      )}
      {ambienteModal.open && (
        <AmbienteModal
          inicial={ambienteModal.item}
          onSave={handleGuardarAmbiente}
          onClose={() => setAmbienteModal({ open: false })}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-[0.85rem] bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </DashboardLayout>
  );
}
