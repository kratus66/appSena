import { NavItem, RoleProfile, UserRole } from "@/lib/types";

export const roleProfiles: Record<UserRole, RoleProfile> = {
  admin: {
    role: "admin",
    label: "Administrador",
    initials: "AD",
    userName: "Paula Mendoza",
    userTitle: "Directora de Operaciones",
    team: "Gobierno de datos y cobertura",
    summary: "Control institucional, usuarios, sedes y auditoria de la plataforma.",
    quickAction: "Revisar auditoria semanal",
    homeHref: "/admin/dashboard",
  },
  coordinador: {
    role: "coordinador",
    label: "Coordinador",
    initials: "CO",
    userName: "Andres Cifuentes",
    userTitle: "Coordinador academico",
    team: "Operacion academica",
    summary: "Consola operativa para instructores, fichas, ambientes, colegios, asignaciones y planeacion.",
    quickAction: "Revisar asignaciones activas",
    homeHref: "/coordinador/dashboard",
  },
  instructor: {
    role: "instructor",
    label: "Instructor",
    initials: "IN",
    userName: "Laura Romero",
    userTitle: "Instructor titular",
    team: "Formacion presencial",
    summary: "Consulta de agenda, asignaciones y detalle de fichas activas.",
    quickAction: "Consultar agenda de hoy",
    homeHref: "/instructor/inicio",
  },
};

export const navigationByRole: Record<UserRole, NavItem[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { href: "/admin/centros", label: "Centros", icon: "building-2" },
    { href: "/admin/sedes", label: "Sedes", icon: "map-pinned" },
    { href: "/admin/usuarios", label: "Usuarios", icon: "users" },
    { href: "/admin/auditoria", label: "Auditoria", icon: "shield-check", badge: "24" },
  ],
  coordinador: [
    { href: "/coordinador/dashboard", label: "Resumen operativo", icon: "layout-dashboard" },
    { href: "/coordinador/instructores", label: "Instructores", icon: "graduation-cap" },
    { href: "/coordinador/fichas", label: "Fichas", icon: "folders" },
    { href: "/coordinador/ambientes", label: "Ambientes", icon: "door-open" },
    { href: "/coordinador/colegios", label: "Colegios", icon: "school" },
    { href: "/coordinador/programas", label: "Planeacion", icon: "git-branch-plus" },
    { href: "/coordinador/asignaciones", label: "Asignaciones", icon: "clipboard-list" },
    { href: "/coordinador/importacion-excel", label: "Importaciones", icon: "sheet", badge: "Beta" },
  ],
  instructor: [
    { href: "/instructor/inicio", label: "Inicio", icon: "house" },
    { href: "/instructor/mis-asignaciones", label: "Mis asignaciones", icon: "clipboard-list" },
    { href: "/instructor/agenda", label: "Agenda", icon: "calendar-days" },
  ],
};
