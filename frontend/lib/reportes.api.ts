import api from './api';
import {
  DashboardInstructor,
  ResumenFicha,
  ResumenAprendiz,
  PanelCoordinacion,
  RangoFechas,
  FiltrosPanelCoordinacion,
} from '@/types/reportes';

// ==================== DASHBOARD INSTRUCTOR ====================

export const getDashboardInstructor = async (
  filtros?: RangoFechas
): Promise<DashboardInstructor> => {
  const params = new URLSearchParams();
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  if (filtros?.month) params.append('month', filtros.month);

  const response = await api.get(`/reportes/instructor/dashboard?${params.toString()}`);
  return response.data;
};

// ==================== RESUMEN POR FICHA ====================

export const getResumenFicha = async (
  fichaId: string,
  filtros?: RangoFechas
): Promise<ResumenFicha> => {
  const params = new URLSearchParams();
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  if (filtros?.month) params.append('month', filtros.month);

  const response = await api.get(`/reportes/fichas/${fichaId}/resumen?${params.toString()}`);
  return response.data;
};

// ==================== RESUMEN POR APRENDIZ ====================

export const getResumenAprendiz = async (
  aprendizId: string,
  filtros?: RangoFechas
): Promise<ResumenAprendiz> => {
  const params = new URLSearchParams();
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  if (filtros?.month) params.append('month', filtros.month);

  const response = await api.get(`/reportes/aprendices/${aprendizId}/resumen?${params.toString()}`);
  return response.data;
};

// ==================== PANEL COORDINACIÓN ====================

export const getPanelCoordinacion = async (
  filtros?: FiltrosPanelCoordinacion
): Promise<PanelCoordinacion> => {
  const params = new URLSearchParams();
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  if (filtros?.month) params.append('month', filtros.month);
  if (filtros?.colegioId) params.append('colegioId', filtros.colegioId);
  if (filtros?.programaId) params.append('programaId', filtros.programaId);
  if (filtros?.estadoFicha) params.append('estadoFicha', filtros.estadoFicha);

  const response = await api.get(`/reportes/coordinacion/panel?${params.toString()}`);
  return response.data;
};

// ==================== EXPORTAR CSV ====================

export const exportarAsistenciaCSV = async (
  fichaId: string,
  filtros?: RangoFechas
): Promise<Blob> => {
  const params = new URLSearchParams();
  if (filtros?.desde) params.append('desde', filtros.desde);
  if (filtros?.hasta) params.append('hasta', filtros.hasta);
  if (filtros?.month) params.append('month', filtros.month);

  const response = await api.get(`/reportes/fichas/${fichaId}/asistencia.csv?${params.toString()}`, {
    responseType: 'blob',
  });
  return response.data;
};

export const exportarAlertasCSV = async (fichaId: string, month: string): Promise<Blob> => {
  const response = await api.get(`/reportes/fichas/${fichaId}/alertas.csv?month=${month}`, {
    responseType: 'blob',
  });
  return response.data;
};

// ==================== HELPERS PARA DESCARGA ====================

export const descargarCSV = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
