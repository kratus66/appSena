import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function CoordinadorSeguimientoPage() {
  return (
    <ModulePlaceholder
      eyebrow="Monitoreo"
      title="Seguimiento"
      description="Base para tableros de cumplimiento, alertas y salud academica por centro o programa."
      highlight="La UI ya soporta KPIs, tablas y bloques laterales para decisiones de coordinacion."
      filters={["Periodo", "Centro", "Programa", "Semaforo"]}
      metrics={[
        { label: "Alertas abiertas", value: "19", helper: "Riesgos academicos con seguimiento", trend: "-1" },
        { label: "Casos atendidos", value: "47", helper: "Resoluciones dentro del SLA", trend: "+6" },
        { label: "Cumplimiento semanal", value: "96%", helper: "Basado en registros y agenda", trend: "+2%" },
      ]}
      activity={[
        { id: "SEG-101", item: "Seguimiento a ficha con baja asistencia", owner: "Bienestar", status: "En revision", updatedAt: "Hoy, 10:10" },
        { id: "SEG-102", item: "Cierre de novedad docente", owner: "Coordinacion", status: "Al dia", updatedAt: "Hoy, 08:45" },
        { id: "SEG-103", item: "Pendiente de reporte externo", owner: "Colegio aliado", status: "Pendiente", updatedAt: "Ayer, 17:35" },
      ]}
      nextStep="Luego podemos sumar tableros comparativos, semaforos por ficha y comentarios colaborativos."
    />
  );
}
