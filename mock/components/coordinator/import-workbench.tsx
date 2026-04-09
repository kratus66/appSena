"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Sparkles,
  UploadCloud,
  WandSparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ImportBatchSummary,
  ImportColumnReport,
  ImportIssue,
  ImportPreviewRow,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type ImportStage = "uploaded" | "detected" | "validated";

type ImportWorkbenchProps = {
  summary: ImportBatchSummary;
  columns: ImportColumnReport[];
  previewRows: ImportPreviewRow[];
  issues: ImportIssue[];
};

function columnBadgeVariant(status: ImportColumnReport["status"]) {
  if (status === "Valida") {
    return "success";
  }

  if (status === "Advertencia") {
    return "warning";
  }

  return "danger";
}

function rowBadgeVariant(status: ImportPreviewRow["status"]) {
  if (status === "Valido") {
    return "success";
  }

  if (status === "Con observaciones") {
    return "warning";
  }

  return "danger";
}

function severityBadgeVariant(severity: ImportIssue["severity"]) {
  if (severity === "alta") {
    return "danger";
  }

  if (severity === "media") {
    return "warning";
  }

  return "secondary";
}

export function ImportWorkbench({
  summary,
  columns,
  previewRows,
  issues,
}: ImportWorkbenchProps) {
  const [stage, setStage] = useState<ImportStage>("validated");

  const visibleSummary = useMemo(() => {
    if (stage === "uploaded") {
      return {
        recordsDetected: summary.recordsDetected,
        validRecords: 0,
        warningRecords: 0,
        errorRecords: 0,
        processedPercent: 12,
      };
    }

    if (stage === "detected") {
      return {
        recordsDetected: summary.recordsDetected,
        validRecords: Math.max(summary.validRecords - 11, 0),
        warningRecords: Math.max(summary.warningRecords - 2, 0),
        errorRecords: Math.max(summary.errorRecords - 2, 0),
        processedPercent: 58,
      };
    }

    return summary;
  }, [stage, summary]);

  const visibleColumns =
    stage === "uploaded"
      ? columns.map((column) => ({ ...column, status: "Advertencia" as const }))
      : columns;

  const visibleRows =
    stage === "uploaded"
      ? previewRows.slice(0, 4).map((row, index) => ({
          ...row,
          status: index < 2 ? ("Con observaciones" as const) : row.status,
        }))
      : previewRows;

  const visibleIssues = stage === "validated" ? issues : issues.slice(0, 2);

  const statusLine =
    stage === "uploaded"
      ? "Archivo recibido y hoja detectada. Aun no se consolidan reglas por columna."
      : stage === "detected"
        ? "Columnas mapeadas. Falta cerrar validaciones y reporte final."
        : "Lote validado en modo mock. Listo para futuras acciones de correccion y procesamiento.";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-dashed border-primary/20 bg-gradient-to-br from-white via-white to-secondary/50">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Subir archivo</CardTitle>
                <CardDescription>
                  Flujo mock para recibir una plantilla, detectar estructura y validar el lote.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Simulado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex min-h-48 flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-primary/20 bg-background/70 p-6 text-center">
              <div className="rounded-3xl bg-primary/10 p-4 text-primary">
                <UploadCloud className="h-7 w-7" />
              </div>
              <p className="mt-4 text-lg font-semibold text-foreground">
                {summary.fileName}
              </p>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                Entidad detectada: {summary.detectedEntity}. Hoja analizada: {summary.sheetName}. Fecha:
                {" "}
                {summary.uploadedAt}.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setStage("uploaded")}
                className={cn(
                  "rounded-[1.5rem] border px-4 py-4 text-left transition-all",
                  stage === "uploaded"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white/80 text-foreground",
                )}
              >
                <p className="text-xs uppercase tracking-[0.24em] opacity-80">Paso 1</p>
                <p className="mt-2 font-semibold">Carga</p>
              </button>
              <button
                type="button"
                onClick={() => setStage("detected")}
                className={cn(
                  "rounded-[1.5rem] border px-4 py-4 text-left transition-all",
                  stage === "detected"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white/80 text-foreground",
                )}
              >
                <p className="text-xs uppercase tracking-[0.24em] opacity-80">Paso 2</p>
                <p className="mt-2 font-semibold">Deteccion</p>
              </button>
              <button
                type="button"
                onClick={() => setStage("validated")}
                className={cn(
                  "rounded-[1.5rem] border px-4 py-4 text-left transition-all",
                  stage === "validated"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white/80 text-foreground",
                )}
              >
                <p className="text-xs uppercase tracking-[0.24em] opacity-80">Paso 3</p>
                <p className="mt-2 font-semibold">Validacion</p>
              </button>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-white/80 p-4 text-sm text-muted-foreground">
              {statusLine}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => setStage("uploaded")} variant="outline">
                <FileSpreadsheet className="h-4 w-4" />
                Seleccionar archivo mock
              </Button>
              <Button type="button" onClick={() => setStage("detected")} variant="secondary">
                <WandSparkles className="h-4 w-4" />
                Detectar columnas
              </Button>
              <Button type="button" onClick={() => setStage("validated")}>
                <CheckCircle2 className="h-4 w-4" />
                Validar lote
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen del procesamiento</CardTitle>
            <CardDescription>
              Lectura ejecutiva del lote detectado antes de confirmar importacion.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Registros detectados</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {visibleSummary.recordsDetected}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Procesado</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {visibleSummary.processedPercent}%
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-success/20 bg-success/5 p-4">
              <p className="text-sm text-success">Validos</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {visibleSummary.validRecords}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-warning/30 bg-warning/10 p-4">
              <p className="text-sm text-warning-foreground">Con observaciones</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {visibleSummary.warningRecords}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-danger/20 bg-danger/5 p-4 sm:col-span-2">
              <p className="text-sm text-danger">Con error</p>
              <p className="mt-2 text-3xl font-semibold text-foreground">
                {visibleSummary.errorRecords}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Indicadores por columna</CardTitle>
            <CardDescription>
              Calidad del mapeo detectado y cobertura por campo relevante.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleColumns.map((column) => (
              <div
                key={column.key}
                className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{column.label}</p>
                    <p className="text-sm text-muted-foreground">Mapeado a {column.mappedTo}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{column.coverage}</Badge>
                    <Badge variant={columnBadgeVariant(column.status)}>{column.status}</Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{column.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporte visual de errores</CardTitle>
            <CardDescription>
              Incidencias priorizadas para corregir antes de una futura importacion real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleIssues.map((issue) => (
              <div
                key={issue.id}
                className={cn(
                  "rounded-[1.5rem] border p-4",
                  issue.severity === "alta"
                    ? "border-danger/20 bg-danger/5"
                    : issue.severity === "media"
                      ? "border-warning/30 bg-warning/10"
                      : "border-border/70 bg-background/80",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {issue.rowRef} · {issue.column}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{issue.message}</p>
                  </div>
                  <Badge variant={severityBadgeVariant(issue.severity)}>
                    {issue.severity}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{issue.recommendation}</p>
              </div>
            ))}
            {!visibleIssues.length ? (
              <div className="rounded-[1.5rem] border border-success/20 bg-success/5 p-4 text-sm text-success">
                No se detectan errores en el estado actual del lote.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Vista previa de datos detectados</CardTitle>
              <CardDescription>
                Muestra representativa del dataset antes del procesamiento final.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3.5 w-3.5" />
              {visibleRows.length} filas visibles
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border/70">
                <th className="px-0 py-3 font-medium">Fila</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Documento</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Programa</th>
                <th className="px-4 py-3 font-medium">Centro</th>
                <th className="px-4 py-3 font-medium">Disponibilidad</th>
                <th className="px-4 py-3 font-medium">Correo</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 align-top last:border-0">
                  <td className="px-0 py-4 font-medium text-foreground">{row.id}</td>
                  <td className="px-4 py-4">
                    <Badge variant={rowBadgeVariant(row.status)}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">{row.values.documento}</td>
                  <td className="px-4 py-4 text-muted-foreground">{row.values.nombre_completo}</td>
                  <td className="px-4 py-4 text-muted-foreground">{row.values.programa}</td>
                  <td className="px-4 py-4 text-muted-foreground">{row.values.centro}</td>
                  <td className="px-4 py-4 text-muted-foreground">{row.values.disponibilidad}</td>
                  <td className="px-4 py-4 text-muted-foreground">{row.values.correo || "Sin dato"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Decisiones sugeridas</CardTitle>
            <CardDescription>
              Enfoque de producto para el siguiente paso del flujo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Correccion guiada
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Permitir editar solo celdas observadas sin rehacer toda la carga.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <WandSparkles className="h-4 w-4 text-primary" />
                Reglas de remapeo
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Guardar equivalencias de programa, centro y disponibilidad para futuros lotes.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riesgos detectados</CardTitle>
            <CardDescription>
              Lo que hoy afectaria una importacion real si no se corrige antes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[1.5rem] border border-danger/20 bg-danger/5 p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <AlertTriangle className="h-4 w-4 text-danger" />
                Acceso y comunicacion
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Registros sin correo institucional impedirian notificaciones y activacion de cuenta.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-warning/30 bg-warning/10 p-4">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <AlertTriangle className="h-4 w-4 text-warning-foreground" />
                Planeacion automatica
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Disponibilidades en texto libre reducen la calidad de asignacion y agenda sugerida.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
