import { CoordinatorMetricStrip } from "@/components/coordinator/coordinator-metric-strip";
import { ImportWorkbench } from "@/components/coordinator/import-workbench";
import { CoordinatorSectionHeader } from "@/components/coordinator/coordinator-section-header";
import { ActivityTable } from "@/components/tables/activity-table";
import {
  coordinatorImportColumns,
  coordinatorImportIssues,
  coordinatorImportPreview,
  coordinatorImportSummary,
} from "@/lib/mocks/coordinator-import";

const metrics = [
  {
    label: "Columnas detectadas",
    value: `${coordinatorImportColumns.length}`,
    tone: "neutral" as const,
  },
  {
    label: "Columnas invalidas",
    value: `${coordinatorImportColumns.filter((column) => column.status === "Invalida").length}`,
    tone: "danger" as const,
  },
  {
    label: "Errores priorizados",
    value: `${coordinatorImportIssues.filter((issue) => issue.severity === "alta").length}`,
    tone: "warning" as const,
  },
];

const activity = [
  {
    id: "XLS-201",
    item: "Se detectaron 48 registros en la hoja INSTRUCTORES_2026_03",
    owner: "Motor de validacion mock",
    status: "Al dia" as const,
    updatedAt: "Hoy, 11:19",
  },
  {
    id: "XLS-202",
    item: "Se marcaron 5 correos con dominio invalido o faltante",
    owner: "Reglas de integridad",
    status: "En revision" as const,
    updatedAt: "Hoy, 11:21",
  },
  {
    id: "XLS-203",
    item: "Programa ADSO - software requiere remapeo a catalogo oficial",
    owner: "Normalizacion de catalogos",
    status: "Pendiente" as const,
    updatedAt: "Hoy, 11:22",
  },
];

export default function CoordinadorImportacionExcelPage() {
  return (
    <div className="space-y-5">
      <CoordinatorSectionHeader
        title="Importaciones"
        description="Carga masiva, deteccion de columnas, preview del lote y errores accionables antes del procesamiento."
      />
      <CoordinatorMetricStrip metrics={metrics} />
      <ImportWorkbench
        summary={coordinatorImportSummary}
        columns={coordinatorImportColumns}
        previewRows={coordinatorImportPreview}
        issues={coordinatorImportIssues}
      />
      <ActivityTable
        rows={activity}
        title="Traza del lote"
        description="Eventos recientes del flujo de importacion para soporte y auditoria."
      />
    </div>
  );
}
