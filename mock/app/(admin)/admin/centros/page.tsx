import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function AdminCentrosPage() {
  return (
    <ModulePlaceholder
      eyebrow="Cobertura institucional"
      title="Centros de formacion"
      description="Espacio base para administrar centros, responsables, cobertura y estado operativo."
      highlight="Aqui podemos crecer hacia catalogos maestros, mapas, filtros avanzados y relaciones con sedes."
      filters={["Region", "Estado", "Cobertura", "Director"]}
      metrics={[
        { label: "Centros activos", value: "18", helper: "15 con ocupacion superior al 80%", trend: "+2" },
        { label: "Nuevos convenios", value: "6", helper: "Integraciones proyectadas para el trimestre", trend: "+1" },
        { label: "Cobertura nacional", value: "94%", helper: "Basada en sedes homologadas", trend: "+3%" },
      ]}
      activity={[
        { id: "CTR-01", item: "Alta de Centro Regional Norte", owner: "Operacion nacional", status: "En revision", updatedAt: "Hoy, 09:00" },
        { id: "CTR-02", item: "Ajuste de director asignado", owner: "Talento humano", status: "Al dia", updatedAt: "Hoy, 07:30" },
        { id: "CTR-03", item: "Revision de cobertura rural", owner: "Planeacion", status: "Pendiente", updatedAt: "Ayer, 18:20" },
      ]}
      nextStep="La siguiente iteracion puede incluir CRUD, relacion centro-sede y trazabilidad de cambios."
    />
  );
}
