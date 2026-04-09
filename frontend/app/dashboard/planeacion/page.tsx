'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  History,
  Layers3,
  ArrowRightLeft,
  School,
  UserRound,
  Info,
  GitBranchPlus,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Ficha,
  User,
  TableroData,
  TableroRow,
  Colegio,
} from '@/types/index';

// ─── Local types ────────────────────────────────────────────────────────────

type Dependency = 'Titulada' | 'Complementaria' | 'Articulacion';
type FlowTab = 'new' | 'active' | 'history';
type FlowMode = 'create' | 'edit' | 'reassign';
type EstadoPlaneacion = 'ACTIVA' | 'REASIGNADA' | 'PARCIAL' | 'PENDIENTE' | 'CERRADA';
type ModalidadArticulacion = 'COMPARTIDA' | 'UNICA' | 'COLEGIO_PRIVADO';

interface Asignacion {
  id: string;
  dependencia: string;
  fichaId?: string;
  fichaNumero: string;
  programa: string;
  instructorId?: string;
  instructorNombre: string;
  instructorArea?: string;
  ambienteId?: string;
  ambienteNombre?: string;
  bloques: string[];
  horasAsignadas: number;
  estado: EstadoPlaneacion;
  notas?: string;
  siteContext?: string;
  schoolId?: string;
  schoolName?: string;
  localidad?: string;
  modalidad?: ModalidadArticulacion;
  jornada?: string;
  fechaInicio?: string;
  fechaFin?: string;
  createdAt: string;
  updatedAt: string;
}

interface HistorialEntry {
  id: string;
  planeacionId?: string;
  accion: string;
  dependencia: string;
  fichaNumero: string;
  instructorNombre: string;
  resumen?: string;
  actor?: string;
  ocurrioEn?: string;
  createdAt: string;
}

interface Metrics {
  activas: number;
  historialReciente: number;
}

const ARTICULACION_MODES: ModalidadArticulacion[] = ['COMPARTIDA', 'UNICA', 'COLEGIO_PRIVADO'];
const ARTICULACION_SHIFTS = ['Manana', 'Tarde'] as const;
type ArtShift = typeof ARTICULACION_SHIFTS[number];

const MODALIDAD_LABELS: Record<ModalidadArticulacion, string> = {
  COMPARTIDA: 'Compartida',
  UNICA: 'Unica',
  COLEGIO_PRIVADO: 'Colegio privado',
};

const DEP_LABEL: Record<DependenciaBackend, Dependency> = {
  ARTICULACION: 'Articulacion',
  TITULADA: 'Titulada',
  COMPLEMENTARIA: 'Complementaria',
};
type DependenciaBackend = 'ARTICULACION' | 'TITULADA' | 'COMPLEMENTARIA';

const DEP_BACKEND: Record<Dependency, DependenciaBackend> = {
  Articulacion: 'ARTICULACION',
  Titulada: 'TITULADA',
  Complementaria: 'COMPLEMENTARIA',
};

// ─── Badge helpers ──────────────────────────────────────────────────────────

function DependencyBadge({ dep }: { dep: string }) {
  const cls =
    dep === 'ARTICULACION' || dep === 'Articulacion'
      ? 'bg-amber-100 text-amber-700 border border-amber-200'
      : dep === 'TITULADA' || dep === 'Titulada'
        ? 'bg-green-100 text-green-700 border border-green-200'
        : 'bg-blue-100 text-blue-700 border border-blue-200';
  const label =
    dep === 'ARTICULACION' ? 'Articulacion' :
      dep === 'TITULADA' ? 'Titulada' :
        dep === 'COMPLEMENTARIA' ? 'Complementaria' : dep;
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', cls)}>
      {label}
    </span>
  );
}

function StatusBadge({ estado }: { estado: EstadoPlaneacion }) {
  const cls =
    estado === 'ACTIVA'
      ? 'bg-green-100 text-green-700 border border-green-200'
      : estado === 'REASIGNADA'
        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
        : estado === 'PARCIAL'
          ? 'bg-orange-100 text-orange-700 border border-orange-200'
          : estado === 'CERRADA'
            ? 'bg-gray-100 text-gray-600 border border-gray-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200';
  const label = { ACTIVA: 'Activa', REASIGNADA: 'Reasignada', PARCIAL: 'Parcial', PENDIENTE: 'Pendiente', CERRADA: 'Cerrada' }[estado];
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', cls)}>{label}</span>
  );
}

function ActionBadge({ accion }: { accion: string }) {
  const cls =
    accion === 'CREADA'
      ? 'bg-green-100 text-green-700 border border-green-200'
      : accion === 'REASIGNADA'
        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
        : accion === 'CERRADA'
          ? 'bg-gray-100 text-gray-600 border border-gray-200'
          : 'bg-blue-100 text-blue-700 border border-blue-200';
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide', cls)}>
      {accion}
    </span>
  );
}

// ─── Week date utilities ────────────────────────────────────────────────
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS_ORDEN = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

function snapToMonday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dow = date.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  date.setDate(date.getDate() + diff);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getWeekDates(mondayStr: string): Record<string, string> {
  if (!mondayStr) return {};
  const result: Record<string, string> = {};
  DIAS_ORDEN.forEach((dia, i) => {
    const [y, m, d] = mondayStr.split('-').map(Number);
    const fecha = new Date(y, m - 1, d + i);
    result[dia] = `${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`;
  });
  return result;
}

function formatWeekRange(fechaInicio?: string, fechaFin?: string): string {
  if (!fechaInicio) return '';
  const [y1, m1, d1] = fechaInicio.split('-').map(Number);
  if (!fechaFin) return `Desde ${d1} ${MESES_CORTOS[m1 - 1]} ${y1}`;
  const [y2, m2, d2] = fechaFin.split('-').map(Number);
  if (y1 === y2) return `${d1} ${MESES_CORTOS[m1 - 1]} – ${d2} ${MESES_CORTOS[m2 - 1]} ${y1}`;
  return `${d1} ${MESES_CORTOS[m1 - 1]} ${y1} – ${d2} ${MESES_CORTOS[m2 - 1]} ${y2}`;
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function PlaneacionPage() {
  // ── Data state ──────────────────────────────────────────────────────────
  const [sede, setSede] = useState('Chapinero');
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [instructores, setInstructores] = useState<User[]>([]);
  const [tablero, setTablero] = useState<TableroData | null>(null);
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ activas: 0, historialReciente: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // ── Flow state ──────────────────────────────────────────────────────────
  const [currentTab, setCurrentTab] = useState<FlowTab>('new');
  const [dependency, setDependency] = useState<Dependency>('Titulada');
  const [flowMode, setFlowMode] = useState<FlowMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedFichaId, setSelectedFichaId] = useState('');
  const [selectedInstructorId, setSelectedInstructorId] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedModality, setSelectedModality] = useState<ModalidadArticulacion>('COMPARTIDA');
  const [selectedShift, setSelectedShift] = useState<ArtShift>('Manana');
  const [selectedCells, setSelectedCells] = useState<string[]>([]);
  const [programmingDay, setProgrammingDay] = useState('LUN');
  const [notes, setNotes] = useState('Validar cobertura antes de confirmar y dejar trazabilidad de la decision operativa.');
  const [saving, setSaving] = useState(false);
  const [semanaInicio, setSemanaInicio] = useState('');
  const [semanaFin, setSemanaFin] = useState('');
  const [selectedDateInput, setSelectedDateInput] = useState('');

  const sedes = ['Chapinero', 'Corferias', 'Kennedy'];

  const [userRole, setUserRole] = useState('admin');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        try { setUserRole(JSON.parse(stored).rol ?? 'admin'); } catch { /* noop */ }
      }
    }
  }, []);

  // ── Derived data ─────────────────────────────────────────────────────────
  const reservedIds = new Set(
    asignaciones
      .filter((a) => a.id !== editingId)
      .map((a) => a.fichaId ?? '')
  );
  const reservedInstructorIds = new Set(
    asignaciones
      .filter((a) => a.id !== editingId)
      .map((a) => a.instructorId ?? '')
  );

  const filteredFichas = fichas.filter((f) => f.dependencia === DEP_BACKEND[dependency]);
  const filteredInstructores = instructores.filter(
    (i) => !i.dependencia || i.dependencia === dependency || dependency === 'Articulacion'
  );

  const tableroRows: TableroRow[] = tablero?.rows ?? [];
  const visibleRows = tableroRows.filter((r) => {
    if (dependency === 'Articulacion') return false;
    return r.tipo === DEP_BACKEND[dependency];
  });

  const allBlocks = tablero?.blocks ?? [];
  const programmingDays = Array.from(new Set(allBlocks.map((b) => b.split(' ')[0])));
  const visibleBlocks = allBlocks.filter((b) => b.startsWith(`${programmingDay} `));

  const reservedCells = new Set(
    asignaciones
      .filter((a) => a.id !== editingId && a.dependencia !== 'ARTICULACION' && a.ambienteNombre)
      .flatMap((a) => {
        const row = tableroRows.find((r) => r.nombre === a.ambienteNombre);
        if (!row) return [];
        return row.cells
          .filter((c) => (a.bloques ?? []).includes(c.block))
          .map((c) => c.id);
      })
  );

  const selectedRow = tableroRows.find((r) => r.cells.some((c) => selectedCells.includes(c.id)));
  const selectedAmbienteNombre = selectedRow?.nombre;
  const selectedBlockLabels = selectedRow
    ? selectedRow.cells.filter((c) => selectedCells.includes(c.id)).map((c) => c.block)
    : [];

  const selectedFicha = fichas.find((f) => f.id === selectedFichaId);
  const selectedInstructor = instructores.find((i) => i.id === selectedInstructorId);
  const selectedSchool = colegios.find((c) => c.id === selectedSchoolId);

  const weekDates = getWeekDates(semanaInicio);

  const hasFicha = Boolean(selectedFicha);
  const hasInstructor = Boolean(selectedInstructor);
  const hasProgramming =
    dependency === 'Articulacion'
      ? Boolean(selectedSchool && selectedShift && selectedModality)
      : selectedCells.length > 0;
  const canOpenAmbientes = dependency !== 'Articulacion' && hasFicha && hasInstructor;
  const isReady = hasFicha && hasInstructor && hasProgramming;

  const flowSteps =
    dependency === 'Articulacion'
      ? [
        { label: 'Selecciona ficha', done: hasFicha },
        { label: 'Selecciona instructor', done: hasInstructor },
        { label: 'Selecciona colegio', done: Boolean(selectedSchool) },
        { label: 'Confirma asignacion', done: isReady },
      ]
      : [
        { label: 'Selecciona ficha', done: hasFicha },
        { label: 'Selecciona instructor', done: hasInstructor },
        { label: 'Programa ambientes', done: selectedCells.length > 0 },
        { label: 'Confirma asignacion', done: isReady },
      ];

  // ── Load data ────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        fichasRes,
        instructoresRes,
        tableroRes,
        colegiosRes,
        asignRes,
        histRes,
        metricsRes,
      ] = await Promise.allSettled([
        api.get('/fichas', { params: { limit: 200 } }),
        api.get('/users/instructores'),
        api.get('/ambientes/tablero', { params: { sede } }),
        api.get('/colegios'),
        api.get('/planeacion'),
        api.get('/planeacion/historial'),
        api.get('/planeacion/metrics', { params: { sede } }),
      ]);

      if (fichasRes.status === 'fulfilled')
        setFichas(fichasRes.value.data?.data ?? fichasRes.value.data ?? []);
      if (instructoresRes.status === 'fulfilled')
        setInstructores(instructoresRes.value.data ?? []);
      if (tableroRes.status === 'fulfilled') {
        setTablero(tableroRes.value.data ?? null);
        const firstDay = tableroRes.value.data?.blocks?.[0]?.split(' ')[0] ?? 'LUN';
        setProgrammingDay(firstDay);
      }
      if (colegiosRes.status === 'fulfilled')
        setColegios(colegiosRes.value.data?.data ?? colegiosRes.value.data ?? []);
      if (asignRes.status === 'fulfilled')
        setAsignaciones(asignRes.value.data?.data ?? asignRes.value.data ?? []);
      if (histRes.status === 'fulfilled')
        setHistorial(histRes.value.data ?? []);
      if (metricsRes.status === 'fulfilled')
        setMetrics(metricsRes.value.data ?? { activas: 0, historialReciente: 0 });
    } finally {
      setLoading(false);
    }
  }, [sede]);

  useEffect(() => { loadData(); }, [loadData]);

  // Reload tablero when sede changes
  const loadTablero = useCallback(async () => {
    try {
      const res = await api.get('/ambientes/tablero', { params: { sede } });
      setTablero(res.data ?? null);
      const firstDay = res.data?.blocks?.[0]?.split(' ')[0] ?? 'LUN';
      setProgrammingDay(firstDay);
    } catch {
      // silent – backend may not have tablero for this sede
    }
  }, [sede]);

  useEffect(() => { loadTablero(); }, [loadTablero]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function resetFlow(nextDep = dependency) {
    setDependency(nextDep);
    setSelectedFichaId('');
    setSelectedInstructorId('');
    setSelectedSchoolId('');
    setSelectedModality('COMPARTIDA');
    setSelectedShift('Manana');
    setSelectedCells([]);
    setSemanaInicio('');
    setSemanaFin('');
    setNotes('Validar cobertura antes de confirmar y dejar trazabilidad de la decision operativa.');
    setFlowMode('create');
    setEditingId(null);
  }

  function handleCellToggle(rowId: string, cellId: string) {
    setSelectedCells((cur) => {
      const curRow = tableroRows.find((r) => r.cells.some((c) => cur.includes(c.id)));
      if (curRow && curRow.id !== rowId) return [cellId];
      return cur.includes(cellId) ? cur.filter((x) => x !== cellId) : [...cur, cellId];
    });
  }

  function loadIntoFlow(a: Asignacion, mode: FlowMode) {
    setCurrentTab('new');
    setFlowMode(mode);
    setEditingId(a.id);
    const dep = DEP_LABEL[a.dependencia as DependenciaBackend] ?? 'Titulada';
    setDependency(dep);
    setSelectedFichaId(a.fichaId ?? '');
    setSelectedInstructorId(a.instructorId ?? '');
    setSelectedSchoolId(a.schoolId ?? '');
    setSelectedModality((a.modalidad as ModalidadArticulacion) ?? 'COMPARTIDA');
    setSelectedShift((a.jornada as ArtShift) ?? 'Manana');
    setNotes(a.notas ?? '');
    setSemanaInicio(a.fechaInicio ?? '');
    setSemanaFin(a.fechaFin ?? '');

    if (dep === 'Articulacion') { setSelectedCells([]); return; }
    const row = tableroRows.find((r) => r.nombre === a.ambienteNombre);
    if (!row) { setSelectedCells([]); return; }
    setSelectedCells(row.cells.filter((c) => (a.bloques ?? []).includes(c.block)).map((c) => c.id));
    const firstBlock = a.bloques?.[0]?.split(' ')[0] ?? programmingDay;
    setProgrammingDay(firstBlock);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function handleConfirm() {
    if (!selectedFicha || !selectedInstructor) return;
    if (dependency === 'Articulacion' && !selectedSchool) return;
    if (dependency !== 'Articulacion' && !selectedAmbienteNombre) return;

    setSaving(true);
    try {
      const blocks =
        dependency === 'Articulacion'
          ? selectedShift === 'Manana' ? ['LUN MANANA', 'MIE MANANA'] : ['MAR TARDE', 'JUE TARDE']
          : selectedBlockLabels;

      const body = {
        dependencia: DEP_BACKEND[dependency],
        fichaId: selectedFicha.id,
        fichaNumero: selectedFicha.numeroFicha,
        programa: selectedFicha.programa?.nombre ?? `Ficha ${selectedFicha.numeroFicha}`,
        instructorId: selectedInstructor.id,
        instructorNombre: selectedInstructor.nombre,
        instructorArea: selectedInstructor.area ?? selectedInstructor.profesion ?? '',
        ambienteId: selectedRow?.id,
        ambienteNombre: dependency !== 'Articulacion' ? selectedAmbienteNombre : undefined,
        bloques: blocks,
        horasAsignadas: Math.max(blocks.length, 1) * 4,
        estado:
          flowMode === 'reassign' ? 'REASIGNADA' : 'ACTIVA',
        notas: notes,
        siteContext: dependency === 'Articulacion' ? 'Cobertura colegios' : sede,
        schoolId: dependency === 'Articulacion' ? selectedSchool?.id : undefined,
        schoolName: dependency === 'Articulacion' ? selectedSchool?.nombre : undefined,
        localidad: dependency === 'Articulacion' ? selectedSchool?.ciudad : undefined,
        modalidad: dependency === 'Articulacion' ? selectedModality : undefined,
        jornada: dependency === 'Articulacion' ? selectedShift : undefined,
        fechaInicio: semanaInicio || undefined,
        fechaFin: semanaFin || undefined,
      };

      if (flowMode === 'create') {
        const res = await api.post('/planeacion', body);
        setAsignaciones((cur) => [res.data, ...cur]);
        showToast('Planeacion creada correctamente');
      } else {
        const res = await api.patch(`/planeacion/${editingId}`, body);
        setAsignaciones((cur) => cur.map((a) => (a.id === editingId ? res.data : a)));
        showToast('Planeacion actualizada correctamente');
      }

      const histRes = await api.get('/planeacion/historial');
      setHistorial(histRes.data ?? []);
      const metricsRes = await api.get('/planeacion/metrics', { params: { sede } });
      setMetrics(metricsRes.data ?? metrics);

      resetFlow(dependency);
      setCurrentTab('active');
    } catch {
      showToast('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/planeacion/${id}`);
      setAsignaciones((cur) => cur.filter((a) => a.id !== id));
      const histRes = await api.get('/planeacion/historial');
      setHistorial(histRes.data ?? []);
      showToast('Planeacion cerrada');
    } catch {
      showToast('Error al cerrar planeacion');
    }
  }

  // ── Metrics display ─────────────────────────────────────────────────────
  const bloquesLibres = tablero?.metrics?.bloquesLibres ?? 0;
  const fichasArticulacion = fichas.filter((f) => f.dependencia === 'ARTICULACION').length;

  const metricCards = [
    { label: 'ACTIVAS', value: metrics.activas, dot: 'bg-green-400' },
    { label: 'BLOQUES LIBRES SEDE', value: bloquesLibres, dot: 'bg-green-400' },
    { label: 'FICHAS ARTICULACION', value: fichasArticulacion, dot: 'bg-yellow-400' },
    { label: 'HISTORIAL RECIENTE', value: metrics.historialReciente, dot: 'bg-green-400' },
  ];

  return (
    <DashboardLayout userRole={userRole}>
    <div className="min-h-screen bg-gray-50/50">
      {/* ── Toast ── */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-[1400px] space-y-6 p-6">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Centro de gestión financiera
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Planeacion</h1>
            <p className="mt-1 text-sm text-gray-500">
              Centro transaccional para planear fichas, ajustar cobertura y cerrar programacion operativa desde {sede}.
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-3">
            {/* Info chips */}
            <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500">
              <Info className="h-3.5 w-3.5 text-gray-400" />
              <span>{fichas.length} fichas por asignar</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700">
              <Info className="h-3.5 w-3.5" />
              <span>{bloquesLibres} ambientes libres titulada</span>
            </div>

            {/* Sede selector */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-600">Sede activa</span>
              <select
                value={sede}
                onChange={(e) => setSede(e.target.value)}
                className="rounded-xl border-2 border-green-500 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {sedes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {metricCards.map((m) => (
            <div key={m.label} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  {m.label}
                </p>
                <span className={cn('h-2 w-2 rounded-full', m.dot)} />
              </div>
              <p className="mt-2 text-3xl font-bold text-gray-900">{m.value}</p>
            </div>
          ))}
        </div>

        {/* ── Flujo transaccional header ── */}
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-green-600">
                Flujo transaccional
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Crea, ajusta y reasigna desde un mismo workspace. {sede} sigue siendo el contexto administrativo para titulada y complementaria.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'new' as FlowTab, label: 'Nueva planeacion' },
                { id: 'active' as FlowTab, label: 'Planeaciones activas' },
                { id: 'history' as FlowTab, label: 'Historial' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentTab(tab.id)}
                  className={cn(
                    'rounded-full border px-5 py-2 text-sm font-semibold transition-all',
                    currentTab === tab.id
                      ? 'border-green-600 bg-green-600 text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-green-200 hover:text-gray-800',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TAB: Nueva planeacion ── */}
        {currentTab === 'new' && (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Left column */}
            <div className="space-y-5">
              {/* Step card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {flowMode === 'create' ? 'Nueva planeacion' : flowMode === 'edit' ? 'Editar planeacion' : 'Reasignar cobertura'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      La ruta cambia segun la dependencia: ambientes para titulada y complementaria, colegios para articulacion.
                    </p>
                  </div>
                  {flowMode !== 'create' && (
                    <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-600">
                      {flowMode === 'edit' ? 'Edicion en curso' : 'Reasignacion en curso'}
                    </span>
                  )}
                </div>

                {/* Dependency selector */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {(['Titulada', 'Complementaria', 'Articulacion'] as Dependency[]).map((dep) => (
                    <button
                      key={dep}
                      type="button"
                      onClick={() => { setDependency(dep); resetFlow(dep); }}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                        dependency === dep
                          ? 'border-green-600 bg-green-600 text-white'
                          : 'border-gray-200 bg-white text-gray-500 hover:border-green-200',
                      )}
                    >
                      {dep}
                    </button>
                  ))}
                </div>

                {/* Steps */}
                <div className={cn(
                  'mt-4 grid gap-2',
                  dependency === 'Articulacion' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4',
                )}>
                  {flowSteps.map((step, i) => (
                    <div
                      key={step.label}
                      className={cn(
                        'rounded-xl border px-3 py-3',
                        step.done
                          ? 'border-green-300/60 bg-green-50'
                          : 'border-gray-200 bg-gray-50/60',
                      )}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">Paso {i + 1}</p>
                      <p className="mt-1 text-sm font-medium text-gray-800">{step.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ficha selection */}
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900">1. Selecciona ficha</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {dependency === 'Articulacion'
                      ? 'Pool general de fichas de articulacion.'
                      : `Pool de fichas de ${dependency.toLowerCase()} dentro del contexto de ${sede}.`}
                  </p>
                </div>
                <div className="grid gap-3 p-5 lg:grid-cols-2">
                  {loading ? (
                    <p className="col-span-2 text-sm text-gray-400">Cargando fichas...</p>
                  ) : filteredFichas.length === 0 ? (
                    <p className="col-span-2 text-sm text-gray-400">No hay fichas para esta dependencia.</p>
                  ) : (
                    filteredFichas.slice(0, 10).map((ficha) => {
                      const selected = ficha.id === selectedFichaId;
                      const reserved = reservedIds.has(ficha.id);
                      return (
                        <button
                          key={ficha.id}
                          type="button"
                          disabled={reserved}
                          onClick={() => { if (!reserved) setSelectedFichaId(ficha.id); }}
                          className={cn(
                            'rounded-xl border p-4 text-left transition-all',
                            selected
                              ? 'border-green-500 bg-green-50 shadow-[0_8px_20px_-12px_rgba(22,163,74,0.5)]'
                              : reserved
                                ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                                : 'border-gray-200 bg-white hover:border-green-200',
                          )}
                        >
                          <div className="flex flex-wrap gap-1.5">
                            <DependencyBadge dep={ficha.dependencia} />
                            <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                              {ficha.jornada}
                            </span>
                            {reserved && (
                              <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
                                Ya asignada
                              </span>
                            )}
                          </div>
                          <p className="mt-3 font-semibold text-gray-900">Ficha {ficha.numeroFicha}</p>
                          <p className="text-sm text-gray-500">{ficha.programa?.nombre ?? '—'}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {ficha.dependencia === 'ARTICULACION'
                              ? `${ficha.colegio?.nombre ?? 'Colegio pendiente'} · ${ficha.modalidadArticulacion ?? 'Modalidad pendiente'}`
                              : `${sede} · ${ficha.jornada}`}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Instructor selection */}
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900">2. Selecciona instructor</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Directorio operativo de instructores compatible con la dependencia actual.
                  </p>
                </div>
                <div className="grid gap-3 p-5 lg:grid-cols-2">
                  {loading ? (
                    <p className="col-span-2 text-sm text-gray-400">Cargando instructores...</p>
                  ) : filteredInstructores.length === 0 ? (
                    <p className="col-span-2 text-sm text-gray-400">No hay instructores disponibles.</p>
                  ) : (
                    filteredInstructores.slice(0, 10).map((inst) => {
                      const selected = inst.id === selectedInstructorId;
                      const reserved = reservedInstructorIds.has(inst.id);
                      const initials = inst.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          disabled={reserved}
                          onClick={() => { if (!reserved) setSelectedInstructorId(inst.id); }}
                          className={cn(
                            'rounded-xl border p-4 text-left transition-all',
                            selected
                              ? 'border-green-500 bg-green-50 shadow-[0_8px_20px_-12px_rgba(22,163,74,0.5)]'
                              : reserved
                                ? 'cursor-not-allowed border-gray-100 bg-gray-50 opacity-60'
                                : 'border-gray-200 bg-white hover:border-green-200',
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-green-100 text-sm font-bold text-green-700">
                              {initials}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="font-semibold text-gray-900">{inst.nombre}</p>
                                {inst.dependencia && <DependencyBadge dep={inst.dependencia} />}
                                {reserved && (
                                  <span className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] text-gray-500">
                                    Ya asignado
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{inst.area ?? inst.profesion ?? '—'}</p>
                              <p className="mt-1 text-xs text-gray-400">{inst.sede ?? sede}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Step 3 */}
              {dependency === 'Articulacion' ? (
                /* Articulacion: school + modality + shift */
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40">
                  <div className="border-b border-amber-200/60 p-5">
                    <h3 className="font-semibold text-gray-900">3. Cobertura con colegio</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Selecciona colegio, modalidad y jornada para la articulacion.
                    </p>
                  </div>
                  <div className="space-y-4 p-5">
                    {/* School grid */}
                    <div className="grid gap-3 lg:grid-cols-2">
                      {colegios.slice(0, 8).map((col) => {
                        const sel = col.id === selectedSchoolId;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => setSelectedSchoolId(col.id)}
                            className={cn(
                              'rounded-xl border p-4 text-left transition-all',
                              sel
                                ? 'border-amber-400 bg-amber-50'
                                : 'border-amber-200/60 bg-white/70 hover:border-amber-300',
                            )}
                          >
                            <p className="font-semibold text-gray-900">{col.nombre}</p>
                            <p className="mt-1 text-sm text-gray-500">{col.ciudad}</p>
                          </button>
                        );
                      })}
                    </div>
                    {/* Modality */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Modalidad</p>
                      <div className="flex flex-wrap gap-2">
                        {ARTICULACION_MODES.map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSelectedModality(m)}
                            className={cn(
                              'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                              selectedModality === m
                                ? 'border-amber-400 bg-amber-400 text-white'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-amber-200',
                            )}
                          >
                            {MODALIDAD_LABELS[m]}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Shift */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Jornada</p>
                      <div className="flex gap-2">
                        {ARTICULACION_SHIFTS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedShift(s)}
                            className={cn(
                              'rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                              selectedShift === s
                                ? 'border-amber-400 bg-amber-400 text-white'
                                : 'border-gray-200 bg-white text-gray-500 hover:border-amber-200',
                            )}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Periodo de cobertura */}
                    <div>
                      <p className="mb-2 text-sm font-medium text-gray-700">Periodo de cobertura</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Fecha inicio</label>
                          <input
                            type="date"
                            value={semanaInicio}
                            onChange={(e) => setSemanaInicio(e.target.value)}
                            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Fecha fin</label>
                          <input
                            type="date"
                            value={semanaFin}
                            onChange={(e) => setSemanaFin(e.target.value)}
                            className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-amber-400 focus:outline-none"
                          />
                        </div>
                      </div>
                      {semanaInicio && (
                        <p className="mt-1.5 text-xs text-amber-700 font-medium">
                          {formatWeekRange(semanaInicio, semanaFin)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Titulada / Complementaria: ambiente grid */
                <div className="rounded-2xl border border-gray-200 bg-white">
                  <div className="border-b border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900">3. Programacion operativa por ambientes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      La parrilla se habilita cuando ya definiste ficha e instructor.
                    </p>
                  </div>
                  <div className="p-5 space-y-4">
                    {!canOpenAmbientes ? (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-5">
                        <p className="text-sm font-medium text-gray-700">Define primero ficha e instructor</p>
                        <p className="mt-2 text-sm text-gray-400">
                          Cuando completes esos pasos, aqui se activara la parrilla operativa de ambientes.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-500">
                          Navega por dia, revisa bloques libres y selecciona jornadas sobre un solo ambiente principal.
                        </div>
                        {/* Semana de ejecucion */}
                        <div className="rounded-xl border border-green-200 bg-green-50/60 px-4 py-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-gray-800">Semana de ejecucion</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {semanaInicio
                                  ? formatWeekRange(semanaInicio, addDays(semanaInicio, 4))
                                  : 'Selecciona la semana para anclar las fechas exactas'}
                              </p>
                            </div>
                            <input
                              type="date"
                              value={selectedDateInput}
                              onChange={(e) => {
                                if (e.target.value) {
                                  setSelectedDateInput(e.target.value);
                                  const lunes = snapToMonday(e.target.value);
                                  setSemanaInicio(lunes);
                                  setSemanaFin(addDays(lunes, 4));
                                  // Mark the day the user actually picked
                                  const [y, m, d] = e.target.value.split('-').map(Number);
                                  const picked = new Date(y, m - 1, d);
                                  const dow = picked.getDay(); // 0=Sun,1=Mon,...,6=Sat
                                  const dayIndex = dow === 0 ? 6 : dow - 1; // convert to Mon=0 index
                                  const pickedDay = DIAS_ORDEN[Math.min(dayIndex, 6)];
                                  if (programmingDays.includes(pickedDay) || programmingDays.length === 0) {
                                    setProgrammingDay(pickedDay);
                                  }
                                } else {
                                  setSelectedDateInput('');
                                  setSemanaInicio('');
                                  setSemanaFin('');
                                }
                              }}
                              className="rounded-xl border border-green-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-green-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        {/* Day selector */}
                        <div className="flex flex-wrap gap-2">
                          {programmingDays.map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setProgrammingDay(day)}
                              className={cn(
                                'rounded-xl border px-4 py-2 text-sm font-semibold transition-all text-center',
                                programmingDay === day
                                  ? 'border-green-600 bg-green-600 text-white'
                                  : 'border-gray-200 bg-white text-gray-500 hover:border-green-200',
                              )}
                            >
                              <span className="block">{day}</span>
                              {weekDates[day] && (
                                <span className={cn('block text-[10px] mt-0.5', programmingDay === day ? 'text-green-100' : 'text-gray-400')}>
                                  {weekDates[day]}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Info grid */}
                        <div className="grid gap-3 sm:grid-cols-3">
                          {[
                            { label: 'Dia visible', val: weekDates[programmingDay] ? `${programmingDay} · ${weekDates[programmingDay]}` : programmingDay },
                            {
                              label: 'Jornadas del dia',
                              val: visibleBlocks.map((b) => b.split(' ').slice(1).join(' ')).join(' · ') || '—',
                            },
                            {
                              label: 'Seleccion actual',
                              val: selectedAmbienteNombre
                                ? `${selectedAmbienteNombre} · ${selectedBlockLabels.length} bloques`
                                : 'Sin ambiente seleccionado',
                            },
                          ].map((item) => (
                            <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{item.label}</p>
                              <p className="mt-1 text-sm text-gray-800">{item.val}</p>
                            </div>
                          ))}
                        </div>

                        {/* Ambiente grid */}
                        {visibleRows.length === 0 ? (
                          <p className="text-sm text-gray-400">No hay ambientes de tipo {dependency} en {sede}.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <div className="min-w-[640px] space-y-2">
                              {/* Header */}
                              <div
                                className="grid gap-2"
                                style={{ gridTemplateColumns: `200px repeat(${visibleBlocks.length}, minmax(110px, 1fr))` }}
                              >
                                <div className="rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                                  Ambiente
                                </div>
                                {visibleBlocks.map((block) => (
                                  <div key={block} className="rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                                    <div>{block.split(' ').slice(1).join(' ')}</div>
                                    {weekDates[programmingDay] && (
                                      <div className="mt-0.5 text-[10px] font-normal normal-case text-gray-400">{weekDates[programmingDay]}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {/* Rows */}
                              {visibleRows.map((row) => (
                                <div
                                  key={row.id}
                                  className="grid gap-2"
                                  style={{ gridTemplateColumns: `200px repeat(${visibleBlocks.length}, minmax(110px, 1fr))` }}
                                >
                                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-3">
                                    <p className="font-semibold text-gray-900">{row.nombre}</p>
                                    <p className="text-xs uppercase tracking-[0.14em] text-gray-400">
                                      {row.tipo} · {row.capacidad} cupos
                                    </p>
                                  </div>
                                  {row.cells
                                    .filter((c) => c.block.startsWith(`${programmingDay} `))
                                    .map((cell) => {
                                      const sel = selectedCells.includes(cell.id);
                                      const res = reservedCells.has(cell.id) || cell.state === 'Ocupado';
                                      return (
                                        <button
                                          key={cell.id}
                                          type="button"
                                          disabled={res}
                                          onClick={() => { if (!res) handleCellToggle(row.id, cell.id); }}
                                          className={cn(
                                            'rounded-xl border px-2 py-4 text-center transition-all',
                                            sel
                                              ? 'border-green-500 bg-green-600 text-white shadow-[0_8px_20px_-12px_rgba(22,163,74,0.6)]'
                                              : res
                                                ? 'cursor-not-allowed border-yellow-200 bg-yellow-50 text-yellow-700'
                                                : 'border-gray-200 bg-white hover:border-green-200 hover:bg-green-50',
                                          )}
                                        >
                                          <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
                                            {sel ? 'Selec.' : res ? 'Ocupado' : 'Libre'}
                                          </p>
                                          <p className="mt-1.5 text-sm font-medium">
                                            {cell.block.split(' ').slice(1).join(' ')}
                                          </p>
                                        </button>
                                      );
                                    })}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 p-5">
                  <h3 className="font-semibold text-gray-900">4. Confirmacion</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Deja trazabilidad breve y confirma la asignacion.
                  </p>
                </div>
                <div className="space-y-4 p-5">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={!isReady || saving}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
                        isReady && !saving
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                          : 'cursor-not-allowed bg-gray-100 text-gray-400',
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {saving ? 'Guardando...' : flowMode === 'create' ? 'Confirmar asignacion' : flowMode === 'edit' ? 'Guardar cambios' : 'Confirmar reasignacion'}
                    </button>
                    {(flowMode !== 'create' || hasFicha || hasInstructor || selectedCells.length > 0) && (
                      <button
                        type="button"
                        onClick={() => resetFlow(dependency)}
                        className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Limpiar flujo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Resumen operativo */}
            <div>
              <div className="space-y-4 xl:sticky xl:top-[8.5rem]">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h3 className="font-semibold text-gray-900">Resumen operativo</h3>
                  <p className="mt-1 text-sm text-gray-500">Lectura rapida de consistencia antes de guardar.</p>

                  <div className="mt-4 space-y-3">
                    {/* Ficha summary */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Layers3 className="h-4 w-4 text-green-600" />
                        Ficha
                      </div>
                      {selectedFicha ? (
                        <div className="mt-3 space-y-1">
                          <DependencyBadge dep={selectedFicha.dependencia} />
                          <p className="mt-2 font-semibold text-gray-900">
                            {selectedFicha.numeroFicha} · {selectedFicha.programa?.nombre ?? '—'}
                          </p>
                          <p className="text-sm text-gray-500">{sede} · {selectedFicha.jornada}</p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-400">Aun no has seleccionado una ficha.</p>
                      )}
                    </div>

                    {/* Instructor summary */}
                    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <UserRound className="h-4 w-4 text-green-600" />
                        Instructor
                      </div>
                      {selectedInstructor ? (
                        <div className="mt-3 space-y-1">
                          {selectedInstructor.dependencia && <DependencyBadge dep={selectedInstructor.dependencia} />}
                          <p className="mt-2 font-semibold text-gray-900">{selectedInstructor.nombre}</p>
                          <p className="text-sm text-gray-500">{selectedInstructor.area ?? selectedInstructor.profesion ?? '—'}</p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-gray-400">Selecciona un instructor para continuar.</p>
                      )}
                    </div>

                    {/* Ambiente / Articulacion summary */}
                    {dependency === 'Articulacion' ? (
                      <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <School className="h-4 w-4 text-amber-600" />
                          Resumen articulacion
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {[
                            { label: 'Colegio', val: selectedSchool ? `${selectedSchool.nombre} · ${selectedSchool.ciudad}` : 'Pendiente' },
                            { label: 'Modalidad', val: MODALIDAD_LABELS[selectedModality] },
                            { label: 'Jornada', val: selectedShift },
                            { label: 'Horas SENA', val: '20h' },
                          ].map((item) => (
                            <div key={item.label} className="rounded-lg border border-amber-200/70 bg-white/80 px-3 py-2">
                              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">{item.label}</p>
                              <p className="mt-0.5 text-sm text-gray-800">{item.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Building2 className="h-4 w-4 text-green-600" />
                          Programacion ambientes
                        </div>
                        {selectedAmbienteNombre ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-gray-700 font-medium">{selectedAmbienteNombre} · {selectedBlockLabels.length} bloques</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedBlockLabels.map((block) => (
                                <span key={block} className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                                  {block}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-gray-400">Selecciona ambiente y bloques para completar la programacion.</p>
                        )}
                      </div>
                    )}

                    {/* Regla */}
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <CalendarClock className="h-4 w-4 text-green-600" />
                        Regla aplicada
                      </div>
                      <p className="mt-2 text-sm text-gray-400">
                        {dependency === 'Articulacion'
                          ? 'La asignacion se define contra colegio, modalidad y jornada. No requiere ambiente del centro.'
                          : 'La asignacion exige seleccionar ambiente y bloques operativos dentro de la sede activa.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Planeaciones activas ── */}
        {currentTab === 'active' && (
          <div className="space-y-4">
            {asignaciones.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                <ClipboardList className="h-10 w-10 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-700">Sin planeaciones activas</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Crea la primera planeacion desde el flujo guiado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('new')}
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Nueva planeacion
                </button>
              </div>
            ) : (
              asignaciones.map((a) => (
                <div key={a.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <DependencyBadge dep={a.dependencia} />
                        <StatusBadge estado={a.estado} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          Ficha {a.fichaNumero} · {a.programa}
                        </p>
                        <p className="text-sm text-gray-500">{a.instructorNombre} · {a.instructorArea ?? '—'}</p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Contexto</p>
                          <p className="mt-1 text-sm text-gray-800">
                            {a.dependencia === 'ARTICULACION'
                              ? `${a.schoolName ?? '—'} · ${a.modalidad ? MODALIDAD_LABELS[a.modalidad] : '—'} · ${a.jornada ?? '—'}`
                              : `${a.ambienteNombre ?? '—'} · ${a.siteContext ?? sede}`}
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Bloques / horas</p>
                          <p className="mt-1 text-sm text-gray-800">
                            {(a.bloques ?? []).join(' · ') || '—'}
                          </p>
                          {(a.fechaInicio || a.fechaFin) && (
                            <p className="mt-0.5 text-xs text-green-700 font-medium">
                              {formatWeekRange(a.fechaInicio, a.fechaFin)}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-gray-400">{a.horasAsignadas} horas registradas</p>
                        </div>
                      </div>
                      {a.notas && <p className="text-sm text-gray-400">{a.notas}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => loadIntoFlow(a, 'edit')}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => loadIntoFlow(a, 'reassign')}
                        className="flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" />
                        Reasignar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TAB: Historial ── */}
        {currentTab === 'history' && (
          <div className="space-y-4">
            {historial.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
                <History className="h-10 w-10 text-gray-300" />
                <div>
                  <p className="font-semibold text-gray-700">Sin historial aun</p>
                  <p className="mt-1 text-sm text-gray-400">Las acciones sobre planeaciones apareceran aqui.</p>
                </div>
              </div>
            ) : (
              historial.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <DependencyBadge dep={entry.dependencia} />
                        <ActionBadge accion={entry.accion} />
                      </div>
                      <p className="font-semibold text-gray-900">
                        Ficha {entry.fichaNumero} · {entry.instructorNombre}
                      </p>
                      {entry.resumen && (
                        <p className="text-sm text-gray-500">{entry.resumen}</p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <p>{entry.actor ?? '—'}</p>
                      <p className="mt-0.5">{entry.ocurrioEn ?? entry.createdAt?.substring(0, 16)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
