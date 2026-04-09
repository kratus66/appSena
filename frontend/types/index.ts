export type UserRole = 'admin' | 'instructor' | 'coordinador' | 'aprendiz' | 'acudiente';
export type DependenciaInstructor = 'Articulacion' | 'Titulada' | 'Complementaria';
export type EstadoDisponibilidad = 'Disponible' | 'Parcial' | 'Saturado';

export interface User {
  id: string;
  nombre: string;
  email: string;
  documento: string;
  telefono?: string;
  rol: UserRole;
  fotoPerfil?: string;
  activo: boolean;
  // Perfil de instructor
  profesion?: string;
  dependencia?: DependenciaInstructor;
  area?: string;
  tipoPrograma?: string;
  sede?: string;
  fechaInicioContrato?: string;
  fechaFinContrato?: string;
  colegioArticulacion?: string;
  modalidadArticulacion?: string;
  jornadaArticulacion?: string;
  localidad?: string;
  estadoDisponibilidad?: EstadoDisponibilidad;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorProfile extends User {
  initials: string;
  fichasCount: number;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Colegio {
  id: string;
  nombre: string;
  nit: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  telefono: string;
  email: string;
  rector: string;
  activo: boolean;
}

export interface Programa {
  id: string;
  nombre: string;
  codigo: string;
  nivelFormacion: 'TECNICO' | 'TECNOLOGO' | 'ESPECIALIZACION';
  areaConocimiento: string;
  duracionMeses: number;
  totalHoras: number;
  descripcion: string;
  requisitos: string;
  activo: boolean;
}

export interface Ficha {
  id: string;
  numeroFicha: string;
  jornada: 'MAÑANA' | 'TARDE' | 'NOCHE' | 'MIXTA';
  estado: 'ACTIVA' | 'EN_CIERRE' | 'FINALIZADA';
  dependencia: 'ARTICULACION' | 'TITULADA' | 'COMPLEMENTARIA';
  tipoProgramaFormacion?: string;
  cupoEsperado: number;
  modalidadArticulacion?: 'COMPARTIDA' | 'UNICA' | 'COLEGIO_PRIVADO';
  localidad?: string;
  ambiente?: string;
  observaciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
  colegioId?: string;
  programaId?: string;
  instructorId?: string;
  colegio?: Colegio;
  programa?: Programa;
  instructor?: User;
  aprendicesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Aprendiz {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'PAS';
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estadoAcademico: 'ACTIVO' | 'DESERTOR' | 'RETIRADO' | 'SUSPENDIDO';
  userId: string;
  fichaId: string;
  user?: User;
  ficha?: Ficha;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalAprendices: number;
  aprendicesActivos: number;
  totalFichas: number;
  fichasActivas: number;
  totalColegios: number;
  totalProgramas: number;
}

// ============= ASISTENCIAS =============

export interface ClaseSesion {
  id: string;
  fichaId: string;
  fecha: string;
  tema?: string;
  observaciones?: string;
  createdByUserId?: string;
  ficha?: Ficha;
  createdByUser?: User;
  resumen?: {
    totalAprendices: number;
    presentes: number;
    ausentes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Asistencia {
  id: string;
  sesionId: string;
  aprendizId: string;
  presente: boolean;
  justificada: boolean;
  motivoJustificacion?: string;
  evidenciaUrl?: string;
  sesion?: ClaseSesion;
  aprendiz?: Aprendiz;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSesionDto {
  fichaId: string;
  fecha: string;
  tema?: string;
  observaciones?: string;
}

export interface RegistroAsistenciaItem {
  aprendizId: string;
  presente: boolean;
}

export interface RegistrarAsistenciaDto {
  asistencias: RegistroAsistenciaItem[];
}

export interface JustificarAsistenciaDto {
  justificada: boolean;
  motivoJustificacion: string;
  evidenciaUrl?: string;
}

export interface AlertaRiesgo {
  aprendizId: string;
  nombres: string;
  apellidos: string;
  documento: string;
  consecutivasNoJustificadas: number;
  faltasMesNoJustificadas: number;
  criterio: '3_CONSECUTIVAS' | '5_MES' | 'AMBAS';
  sesionesDetalle?: {
    fecha: string;
    presente: boolean;
    justificada: boolean;
  }[];
}

export interface AlertasResponse {
  fichaId: string;
  numeroFicha: string;
  mes: string;
  alertas: AlertaRiesgo[];
}

export interface ResumenAsistencia {
  fichaId: string;
  numeroFicha: string;
  totalSesiones: number;
  totalAprendices: number;
  porcentajeAsistenciaPromedio: number;
  topAusencias: {
    aprendizId: string;
    nombres: string;
    apellidos: string;
    documento: string;
    totalAusencias: number;
  }[];
}

// ========== AGENDA + NOTIFICACIONES (SPRINT 6) ==========

export type EventType = 'CLASE' | 'REUNION' | 'CITACION' | 'COMPROMISO' | 'OTRO';
export type EventStatus = 'PROGRAMADO' | 'CANCELADO' | 'COMPLETADO';
export type EventPriority = 'BAJA' | 'MEDIA' | 'ALTA';
export type ReminderChannel = 'IN_APP' | 'EMAIL' | 'SMS';
export type ReminderStatus = 'PENDIENTE' | 'ENVIADO' | 'CANCELADO';
export type NotificationType = 'RECORDATORIO' | 'EVENTO_CREADO' | 'EVENTO_CANCELADO' | 'EVENTO_ACTUALIZADO' | 'OTRO';

export interface CalendarEvent {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: EventType;
  fechaInicio: string;
  fechaFin?: string;
  allDay: boolean;
  estado: EventStatus;
  prioridad: EventPriority;
  fichaId?: string;
  aprendizId?: string;
  casoDisciplinarioId?: string;
  ptcId?: string;
  actaId?: string;
  createdByUserId: string;
  assignedToId?: string;
  ficha?: Ficha;
  aprendiz?: Aprendiz;
  createdByUser?: User;
  assignedTo?: User;
  recordatorios?: Reminder[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  eventId: string;
  remindAt: string;
  canal: ReminderChannel;
  estado: ReminderStatus;
  mensaje?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  entityType?: string;
  entityId?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  titulo: string;
  descripcion?: string;
  tipo: EventType;
  fechaInicio: string;
  fechaFin?: string;
  allDay?: boolean;
  prioridad: EventPriority;
  fichaId?: string;
  aprendizId?: string;
  casoDisciplinarioId?: string;
  ptcId?: string;
  actaId?: string;
  assignedToId?: string;
}

export interface EventsResponse {
  data: CalendarEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

// ============= AMBIENTES =============

export type TipoAmbiente = 'TITULADA' | 'COMPLEMENTARIA';
export type EstadoAmbiente = 'ACTIVO' | 'MANTENIMIENTO' | 'INACTIVO';
export type DiaSemana = 'LUN' | 'MAR' | 'MIE' | 'JUE' | 'VIE' | 'SAB' | 'DOM';
export type JornadaBloque = 'MANANA' | 'TARDE' | 'NOCHE';
export type CeldaEstado = 'Libre' | 'Ocupado' | 'Conflicto';

export interface Ambiente {
  id: string;
  nombre: string;
  sede: string;
  capacidad: number;
  tipo: TipoAmbiente;
  estado: EstadoAmbiente;
  descripcion?: string;
  equipamiento?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AsignacionAmbiente {
  id: string;
  ambienteId: string;
  fichaId?: string;
  instructorId?: string;
  dia: DiaSemana;
  jornada: JornadaBloque;
  notas?: string;
  ficha?: Ficha;
  instructor?: User;
  createdAt: string;
}

export interface TableroCell {
  id: string;
  block: string;
  dia: DiaSemana;
  jornada: JornadaBloque;
  state: CeldaEstado;
  fichaId?: string | null;
  fichaNumero?: string | null;
  instructorId?: string | null;
  instructorNombre?: string | null;
  asignacionId?: string | null;
  notas?: string | null;
}

export interface TableroRow {
  id: string;
  nombre: string;
  sede: string;
  tipo: TipoAmbiente;
  estado: EstadoAmbiente;
  capacidad: number;
  equipamiento?: string;
  cells: TableroCell[];
  libres: number;
  ocupados: number;
  conflictos: number;
}

export interface TableroData {
  rows: TableroRow[];
  sedes: string[];
  blocks: string[];
  dias: DiaSemana[];
  jornadas: JornadaBloque[];
  metrics: {
    ambientesLibres: number;
    ambientesTotal: number;
    bloquesLibres: number;
    bloquesTotal: number;
  };
}

// ============= PLANEACION =============

export type DependenciaPlaneacion = 'ARTICULACION' | 'TITULADA' | 'COMPLEMENTARIA';
export type EstadoPlaneacion = 'ACTIVA' | 'REASIGNADA' | 'PARCIAL' | 'PENDIENTE' | 'CERRADA';
export type ModalidadPlaneacion = 'COMPARTIDA' | 'UNICA' | 'COLEGIO_PRIVADO';
export type AccionHistorial = 'CREADA' | 'EDITADA' | 'REASIGNADA' | 'CERRADA';

export interface Planeacion {
  id: string;
  dependencia: DependenciaPlaneacion;
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
  modalidad?: ModalidadPlaneacion;
  jornada?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaneacionHistorial {
  id: string;
  planeacionId?: string;
  accion: AccionHistorial;
  dependencia: string;
  fichaNumero: string;
  instructorNombre: string;
  resumen?: string;
  actor?: string;
  ocurrioEn?: string;
  createdAt: string;
}

