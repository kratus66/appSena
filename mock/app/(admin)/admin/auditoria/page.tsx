import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function AdminAuditoriaPage() {
  return (
    <ModulePlaceholder
      eyebrow="Trazabilidad"
      title="Auditoria operativa"
      description="Base visual para eventos del sistema, aprobaciones, cargas masivas y cambios sensibles."
      highlight="Este modulo puede convertirse en el centro de observabilidad funcional de la plataforma."
      filters={["Evento", "Fecha", "Actor", "Severidad"]}
      metrics={[
        { label: "Eventos del dia", value: "1,248", helper: "Incluye movimientos por integracion", trend: "+12%" },
        { label: "Alertas abiertas", value: "24", helper: "Priorizadas por criticidad", trend: "+5" },
        { label: "Cambios auditables", value: "98%", helper: "Cobertura de trazabilidad base", trend: "+1%" },
      ]}
      activity={[
        { id: "AUD-31", item: "Carga masiva de instructores", owner: "Coordinacion centro", status: "En revision", updatedAt: "Hoy, 09:40" },
        { id: "AUD-32", item: "Cambio de permisos administrativos", owner: "Seguridad TI", status: "Pendiente", updatedAt: "Hoy, 10:55" },
        { id: "AUD-33", item: "Consulta de historico exportada", owner: "Control interno", status: "Al dia", updatedAt: "Ayer, 17:20" },
      ]}
      nextStep="Se puede extender con filtros por entidad, exportacion y lineas de tiempo detalladas."
    />
  );
}
