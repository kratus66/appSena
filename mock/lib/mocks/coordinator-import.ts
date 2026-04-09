import {
  ImportBatchSummary,
  ImportColumnReport,
  ImportIssue,
  ImportPreviewRow,
} from "@/lib/types";

export const coordinatorImportSummary: ImportBatchSummary = {
  fileName: "plantilla_instructores_corte_marzo.xlsx",
  uploadedAt: "Hoy, 11:18",
  sheetName: "INSTRUCTORES_2026_03",
  detectedEntity: "Instructores y disponibilidad",
  recordsDetected: 48,
  validRecords: 39,
  warningRecords: 6,
  errorRecords: 3,
  processedPercent: 81,
};

export const coordinatorImportColumns: ImportColumnReport[] = [
  {
    key: "documento",
    label: "Documento",
    mappedTo: "user.documentNumber",
    status: "Valida",
    coverage: "48/48",
    detail: "Campo obligatorio completo y sin duplicados en el archivo.",
  },
  {
    key: "nombre_completo",
    label: "Nombre completo",
    mappedTo: "user.fullName",
    status: "Valida",
    coverage: "48/48",
    detail: "Normalizacion correcta de mayusculas y espacios.",
  },
  {
    key: "programa",
    label: "Programa",
    mappedTo: "instructor.primaryProgram",
    status: "Advertencia",
    coverage: "44/48",
    detail: "Cuatro filas traen programa no homologado con el catalogo maestro.",
  },
  {
    key: "centro",
    label: "Centro",
    mappedTo: "instructor.center",
    status: "Valida",
    coverage: "47/48",
    detail: "Un centro requiere remapeo a nombre oficial.",
  },
  {
    key: "disponibilidad",
    label: "Disponibilidad",
    mappedTo: "availability.slot",
    status: "Advertencia",
    coverage: "45/48",
    detail: "Tres celdas vienen en formato libre y deben normalizarse.",
  },
  {
    key: "correo",
    label: "Correo",
    mappedTo: "user.email",
    status: "Invalida",
    coverage: "43/48",
    detail: "Cinco correos tienen dominio invalido o estan vacios.",
  },
];

export const coordinatorImportPreview: ImportPreviewRow[] = [
  {
    id: "ROW-001",
    status: "Valido",
    values: {
      documento: "1032456789",
      nombre_completo: "Laura Martinez",
      programa: "ADSO",
      centro: "Centro Norte",
      disponibilidad: "Lun a jue 14:00 - 18:00",
      correo: "laura.martinez@institucion.edu.co",
    },
  },
  {
    id: "ROW-002",
    status: "Con observaciones",
    values: {
      documento: "52780112",
      nombre_completo: "Paola Herrera",
      programa: "Contabilidad",
      centro: "Centro Occidente",
      disponibilidad: "Tarde",
      correo: "paola.herrera@institucion.edu.co",
    },
  },
  {
    id: "ROW-003",
    status: "Con error",
    values: {
      documento: "80123455",
      nombre_completo: "Sergio Buitrago",
      programa: "English Dot Works",
      centro: "Centro Norte",
      disponibilidad: "Virtual noche",
      correo: "sergio.buitrago@gmail",
    },
  },
  {
    id: "ROW-004",
    status: "Valido",
    values: {
      documento: "1029988776",
      nombre_completo: "Julian Franco",
      programa: "Redes",
      centro: "Centro Norte",
      disponibilidad: "Mar a vie 13:00 - 18:00",
      correo: "julian.franco@institucion.edu.co",
    },
  },
  {
    id: "ROW-005",
    status: "Con observaciones",
    values: {
      documento: "1098877665",
      nombre_completo: "Ana Milena Cruz",
      programa: "ADSO - software",
      centro: "Centro Norte",
      disponibilidad: "Libre desde 6 pm",
      correo: "ana.cruz@institucion.edu.co",
    },
  },
  {
    id: "ROW-006",
    status: "Con error",
    values: {
      documento: "90011223",
      nombre_completo: "Camilo Perez",
      programa: "Redes",
      centro: "Occidente",
      disponibilidad: "Lun a vie 08:00 - 12:00",
      correo: "",
    },
  },
];

export const coordinatorImportIssues: ImportIssue[] = [
  {
    id: "ISS-01",
    severity: "alta",
    rowRef: "ROW-003",
    column: "correo",
    message: "El correo no cumple el dominio institucional esperado.",
    recommendation: "Solicitar correo oficial o corregir sintaxis antes de procesar.",
  },
  {
    id: "ISS-02",
    severity: "alta",
    rowRef: "ROW-006",
    column: "correo",
    message: "Campo obligatorio vacio.",
    recommendation: "Completar correo institucional para habilitar acceso al sistema.",
  },
  {
    id: "ISS-03",
    severity: "media",
    rowRef: "ROW-005",
    column: "programa",
    message: "Programa no coincide exactamente con catalogo homologado.",
    recommendation: "Remapear a ADSO desde reglas de equivalencia antes de importar.",
  },
  {
    id: "ISS-04",
    severity: "media",
    rowRef: "ROW-002",
    column: "disponibilidad",
    message: "Valor demasiado generico para construir agenda automatica.",
    recommendation: "Normalizar a franja horaria concreta.",
  },
  {
    id: "ISS-05",
    severity: "baja",
    rowRef: "ROW-006",
    column: "centro",
    message: "Nombre de centro abreviado y no homologado.",
    recommendation: "Mapear a 'Centro Occidente' desde catalogo interno.",
  },
];
