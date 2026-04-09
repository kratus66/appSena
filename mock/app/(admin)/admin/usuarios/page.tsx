import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export default function AdminUsuariosPage() {
  return (
    <ModulePlaceholder
      eyebrow="Seguridad y accesos"
      title="Usuarios del sistema"
      description="Punto de partida para administrar cuentas, roles, dependencias y ciclos de acceso."
      highlight="La estructura actual facilita agregar permisos finos, auditoria de sesiones y aprobaciones."
      filters={["Rol", "Centro", "Estado", "Ultimo acceso"]}
      metrics={[
        { label: "Usuarios activos", value: "428", helper: "91% con autenticacion reciente", trend: "+9%" },
        { label: "Roles asignados", value: "612", helper: "Incluye usuarios con doble alcance", trend: "+15" },
        { label: "Bloqueos preventivos", value: "14", helper: "Control de accesos inactivos", trend: "-3" },
      ]}
      activity={[
        { id: "USR-21", item: "Alta de coordinador academico", owner: "Soporte", status: "Al dia", updatedAt: "Hoy, 08:25" },
        { id: "USR-22", item: "Cambio de rol por encargo", owner: "Talento humano", status: "En revision", updatedAt: "Hoy, 11:10" },
        { id: "USR-23", item: "Depuracion de cuentas sin uso", owner: "Seguridad TI", status: "Pendiente", updatedAt: "Ayer, 15:55" },
      ]}
      nextStep="Aqui encajan invitaciones, restablecimiento de acceso y gestion de permisos por modulo."
    />
  );
}
