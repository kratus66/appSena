export type UserRole = 'admin' | 'instructor' | 'coordinador' | 'aprendiz' | 'acudiente';

export interface User {
  id: string;
  nombre: string;
  email: string;
  documento: string;
  telefono?: string;
  rol: UserRole;
  fotoPerfil?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
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
  jornada: 'MADRUGADA' | 'MAÑANA' | 'TARDE' | 'NOCHE' | 'MIXTA' | 'FINES_SEMANA';
  estado: 'ACTIVA' | 'INACTIVA' | 'FINALIZADA' | 'CANCELADA';
  fechaInicio: string;
  fechaFin: string;
  colegioId: string;
  programaId: string;
  instructorId: string;
  colegio?: Colegio;
  programa?: Programa;
  instructor?: User;
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
