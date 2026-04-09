import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function AdminSedesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Infraestructura"
      title="Sedes y ubicaciones"
      description="Base estructural para gestionar sedes, capacidad fisica y estado de habilitacion."
      highlight="La UI ya soporta futuras tablas densas, filtros por ciudad y paneles de detalle."
      filters={["Ciudad", "Capacidad", "Estado", "Tipo de sede"]}
      metrics={[
        { label: "Sedes activas", value: "64", helper: "57 con configuracion completa", trend: "+4%" },
        { label: "Ambientes asociados", value: "298", helper: "Consolidacion centralizada", trend: "+18" },
        { label: "Pendientes de homologacion", value: "7", helper: "Requieren visita o evidencia", trend: "-2" },
      ]}
      activity={[
        { id: "SED-11", item: "Apertura de sede satelite", owner: "Infraestructura", status: "En revision", updatedAt: "Hoy, 10:20" },
        { id: "SED-12", item: "Actualizacion de capacidad instalada", owner: "Centro Sur", status: "Al dia", updatedAt: "Hoy, 08:10" },
        { id: "SED-13", item: "Validacion de accesibilidad", owner: "Calidad", status: "Pendiente", updatedAt: "Ayer, 16:05" },
      ]}
      nextStep="Este modulo puede sumar mapas, adjuntos de evidencia y sincronizacion con ambientes."
    />
  );
}
