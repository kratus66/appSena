import { DashboardData, UserRole } from "@/lib/types";

export const dashboardByRole: Record<UserRole, DashboardData> = {
  admin: {
    title: "Vista ejecutiva institucional",
    description:
      "Unifica cobertura, trazabilidad y salud operativa para centros, sedes y cuentas activas.",
    metrics: [
      { label: "Centros activos", value: "18", helper: "2 nuevos este trimestre", trend: "+11%" },
      { label: "Sedes homologadas", value: "64", helper: "Estandar institucional al 96%", trend: "+4%" },
      { label: "Usuarios con acceso", value: "428", helper: "Roles sincronizados por dependencia", trend: "+9%" },
    ],
    activity: [
      { id: "A-101", item: "Politica de acceso actualizada", owner: "Seguridad TI", status: "Al dia", updatedAt: "Hoy, 08:40" },
      { id: "A-102", item: "Revision de logs por cambios masivos", owner: "Mesa de ayuda", status: "En revision", updatedAt: "Hoy, 09:15" },
      { id: "A-103", item: "Alta de sede regional", owner: "Operacion nacional", status: "Pendiente", updatedAt: "Ayer, 16:20" },
    ],
    assignments: [
      { id: "ADM-1", title: "Auditoria de usuarios privilegiados", location: "Oficina central", time: "Hoy, 14:00", status: "Confirmada" },
      { id: "ADM-2", title: "Comite de cobertura por sedes", location: "Sala Atlas", time: "Manana, 09:30", status: "Programada" },
    ],
    agenda: [
      { id: "ADG-1", day: "Lun 30", title: "Seguimiento de cumplimiento", time: "08:00 - 09:00", place: "Virtual" },
      { id: "ADG-2", day: "Mar 31", title: "Comite de auditoria", time: "10:00 - 11:30", place: "Presidencia" },
    ],
  },
  coordinador: {
    title: "Operacion academica en curso",
    description:
      "Prioriza instructores, ambientes y fichas con alertas tempranas para programacion semanal.",
    metrics: [
      { label: "Instructores activos", value: "126", helper: "111 con disponibilidad validada", trend: "+6%" },
      { label: "Fichas en seguimiento", value: "84", helper: "12 requieren ajuste de ambiente", trend: "+3%" },
      { label: "Asignaciones del mes", value: "312", helper: "Cobertura del 97.4%", trend: "+8%" },
    ],
    activity: [
      { id: "C-201", item: "Cruce de ambientes para semana 14", owner: "Planeacion", status: "Al dia", updatedAt: "Hoy, 07:50" },
      { id: "C-202", item: "Carga de instructores nuevos", owner: "Bienestar", status: "En revision", updatedAt: "Hoy, 10:05" },
      { id: "C-203", item: "Validacion de fichas duales", owner: "Calidad", status: "Pendiente", updatedAt: "Ayer, 17:45" },
    ],
    assignments: [
      { id: "CO-1", title: "Analitica de ocupacion por ambiente", location: "Centro Norte", time: "Hoy, 11:00", status: "Confirmada" },
      { id: "CO-2", title: "Reasignacion ficha ADSO 2874901", location: "Sede Occidente", time: "Hoy, 15:30", status: "Requiere ajuste" },
      { id: "CO-3", title: "Comite de programas priorizados", location: "Sala de coordinacion", time: "Manana, 08:00", status: "Programada" },
    ],
    agenda: [
      { id: "COG-1", day: "Lun 30", title: "Mesa operativa con lideres", time: "09:00 - 10:00", place: "Virtual" },
      { id: "COG-2", day: "Mar 31", title: "Revision de Excel importado", time: "14:00 - 15:00", place: "Centro Sur" },
    ],
  },
  instructor: {
    title: "Mi jornada formativa",
    description:
      "Accede a tu agenda, fichas asignadas y novedades clave para la semana de formacion.",
    metrics: [
      { label: "Fichas activas", value: "4", helper: "2 presenciales y 2 mixtas", trend: "Estable" },
      { label: "Horas asignadas", value: "28h", helper: "Distribuidas en 5 jornadas", trend: "+2h" },
      { label: "Pendientes por registrar", value: "3", helper: "Asistencia y evidencia de clase", trend: "Atender hoy" },
    ],
    activity: [
      { id: "I-301", item: "Evidencia de clase ADSO 2874901", owner: "Laura Romero", status: "Pendiente", updatedAt: "Hoy, 06:45" },
      { id: "I-302", item: "Cambio de ambiente aprobado", owner: "Coordinacion", status: "Al dia", updatedAt: "Ayer, 18:10" },
      { id: "I-303", item: "Ajuste de agenda de emprendimiento", owner: "Planeacion", status: "En revision", updatedAt: "Ayer, 15:40" },
    ],
    assignments: [
      { id: "IN-1", title: "ADSO 2874901 - Analisis y desarrollo", location: "Ambiente B-204", time: "Hoy, 07:00", status: "Confirmada" },
      { id: "IN-2", title: "Emprendimiento 3011450", location: "Colegio San Jorge", time: "Manana, 13:00", status: "Programada" },
    ],
    agenda: [
      { id: "ING-1", day: "Lun 30", title: "Sesion ADSO", time: "07:00 - 11:00", place: "Ambiente B-204" },
      { id: "ING-2", day: "Mie 01", title: "Seguimiento de ficha", time: "13:30 - 14:30", place: "Virtual" },
      { id: "ING-3", day: "Jue 02", title: "Clase colegio articulado", time: "08:00 - 12:00", place: "Colegio San Jorge" },
    ],
  },
};
