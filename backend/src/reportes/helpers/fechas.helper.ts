/**
 * Helper para manejo de rangos de fechas en reportes
 */

export interface RangoFechas {
  desde: Date;
  hasta: Date;
}

/**
 * Convierte un mes en formato YYYY-MM a un rango de fechas UTC
 * @param month String en formato YYYY-MM
 * @returns Objeto con fechas desde y hasta
 */
export function mesARango(month: string): RangoFechas {
  const [year, monthNum] = month.split('-').map(Number);
  
  // Primer día del mes a las 00:00:00 UTC
  const desde = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
  
  // Último día del mes a las 23:59:59.999 UTC
  const hasta = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
  
  return { desde, hasta };
}

/**
 * Obtiene el rango de fechas basado en los parámetros recibidos
 * Si no hay parámetros, retorna el mes actual
 * @param desde Fecha de inicio opcional
 * @param hasta Fecha de fin opcional
 * @param month Mes en formato YYYY-MM opcional
 * @returns Objeto con fechas desde y hasta
 */
export function obtenerRangoFechas(
  desde?: string,
  hasta?: string,
  month?: string,
): RangoFechas {
  // Si se proporciona el mes, usarlo
  if (month) {
    return mesARango(month);
  }

  // Si se proporcionan ambas fechas, usarlas
  if (desde && hasta) {
    return {
      desde: new Date(desde),
      hasta: new Date(hasta),
    };
  }

  // Por defecto, usar el mes actual
  const now = new Date();
  const yearActual = now.getUTCFullYear();
  const mesActual = now.getUTCMonth() + 1;
  const monthActual = `${yearActual}-${mesActual.toString().padStart(2, '0')}`;
  
  return mesARango(monthActual);
}

/**
 * Escapa caracteres especiales para CSV
 * @param value Valor a escapar
 * @returns Valor escapado y entre comillas si es necesario
 */
export function escapeCsv(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Si contiene comillas, comas, saltos de línea, escapar
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convierte un array de objetos a formato CSV
 * @param data Array de objetos
 * @param headers Array con los nombres de las columnas
 * @returns String en formato CSV con BOM para Excel
 */
export function arrayToCsv(data: any[], headers: string[]): string {
  // BOM para que Excel reconozca UTF-8
  const BOM = '\ufeff';
  
  // Header row
  const headerRow = headers.map(escapeCsv).join(',');
  
  // Data rows
  const dataRows = data.map(row => {
    return headers.map(header => escapeCsv(row[header])).join(',');
  }).join('\n');
  
  return BOM + headerRow + '\n' + dataRows;
}
