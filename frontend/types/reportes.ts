// Tipos para el módulo de Reportes/Estadísticas

// ==================== INTERFACES GENERALES ====================

export interface RangoFechas {
  desde?: string;
  hasta?: string;
  month?: string;
}

export interface FiltrosPanelCoordinacion extends RangoFechas {
  colegioId?: string;
  programaId?: string;
  estadoFicha?: 'ACTIVA' | 'EN_CIERRE' | 'FINALIZADA';
}

// ==================== DASHBOARD INSTRUCTOR ====================

export interface TopFichaRiesgo {
  fichaId: string;
  numeroFicha: string;
  programa: string;
  totalAlertas: number;
}

export interface DashboardInstructor {
  totalFichas: number;
  totalAprendices: number;
  totalSesiones: number;
  tasaAsistenciaPromedio: number;
  totalAlertasRiesgo: number;
  topFichasRiesgo: TopFichaRiesgo[];
  agendaProximaSemana: number;
}

// ==================== RESUMEN POR FICHA ====================

export interface FichaInfo {
  id: string;
  numeroFicha: string;
  programa: string;
  colegio: string;
  instructor: string;
}

export interface ConteoAsistencia {
  presentes: number;
  ausenciasJustificadas: number;
  ausenciasNoJustificadas: number;
}

export interface AprendizAusencias {
  aprendizId: string;
  nombres: string;
  apellidos: string;
  documento: string;
  ausenciasNoJustificadas: number;
}

export interface AlertaRiesgo {
  aprendizId: string;
  nombres: string;
  apellidos: string;
  documento: string;
  consecutivas: number;
  faltasMes: number;
  criterio: string;
}

export interface ResumenFicha {
  ficha: FichaInfo;
  totalAprendices: number;
  totalSesiones: number;
  conteo: ConteoAsistencia;
  porcentajeAsistencia: number;
  topAprendicesAusencias: AprendizAusencias[];
  alertas: AlertaRiesgo[];
}

// ==================== RESUMEN POR APRENDIZ ====================

export interface AprendizInfo {
  id: string;
  nombres: string;
  apellidos: string;
  documento: string;
  fichaId: string;
  numeroFicha: string;
}

export interface AsistenciaAprendiz {
  presentes: number;
  ausenciasJustificadas: number;
  ausenciasNoJustificadas: number;
  porcentajeAsistencia: number;
}

export interface SesionHistorial {
  fecha: string;
  presente: boolean;
  justificada: boolean;
  motivo: string | null;
}

export interface CasoDisciplinario {
  id: string;
  tipo: string;
  gravedad: string;
  estado: string;
  fechaIncidente: string;
}

export interface DisciplinarioInfo {
  totalCasosAbiertos: number;
  ultimoCaso: CasoDisciplinario | null;
}

export interface PtcInfo {
  id: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface EventoAgenda {
  id: string;
  titulo: string;
  tipo: string;
  fechaInicio: string;
}

export interface ResumenAprendiz {
  aprendiz: AprendizInfo;
  asistencia: AsistenciaAprendiz;
  historialUltimasSesiones: SesionHistorial[];
  alertas: AlertaRiesgo[];
  disciplinario: DisciplinarioInfo;
  ptc: PtcInfo | null;
  proximosEventos: EventoAgenda[];
}

// ==================== PANEL COORDINACIÓN ====================

export interface AlertasPorCriterio {
  tresConsecutivas: number;
  cincoMes: number;
  ambas: number;
}

export interface RankingPrograma {
  nombre: string;
  alertas: number;
}

export interface RankingFicha {
  fichaId: string;
  numeroFicha: string;
  programa: string;
  ausenciasNoJustificadas: number;
}

export interface PanelCoordinacion {
  totalFichasActivas: number;
  totalAprendicesActivos: number;
  alertasPorCriterio: AlertasPorCriterio;
  rankingProgramas: RankingPrograma[];
  rankingFichas: RankingFicha[];
}
