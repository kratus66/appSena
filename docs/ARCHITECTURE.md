# AppSena — Arquitectura General

> Última actualización: Abril 2026  
> Versión: Sprint 6+

---

## Descripción del Proyecto

**AppSena** es una plataforma web para la gestión de instructores, fichas de formación y aprendices del SENA. Permite a coordinadores e instructores administrar el ciclo completo de una ficha: desde su creación hasta la asignación de aprendices, seguimiento de asistencias y registro disciplinario.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Backend | NestJS | 10.x |
| ORM | TypeORM | 0.3.x |
| Base de datos | PostgreSQL | 15 |
| Frontend | Next.js | 16.1.1 |
| Estilos | Tailwind CSS | 3.x |
| Lenguaje | TypeScript | 5.x |
| Autenticación | JWT (Passport) | — |
| Documentación API | Swagger / OpenAPI | 7.x |
| Subida de archivos | Multer + AWS S3 | — |
| Parseo de Excel | xlsx | 0.18.5 |

---

## Estructura de Directorios

```
AppSena/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── acudientes/         # Módulo: acudientes de aprendices
│   │   ├── agenda/             # Módulo: agenda/calendario
│   │   ├── aprendices/         # Módulo: aprendices (CRUD + importación Excel)
│   │   ├── asistencias/        # Módulo: control de asistencias por clase
│   │   ├── auth/               # Módulo: autenticación JWT
│   │   ├── colegios/           # Módulo: colegios articulados
│   │   ├── common/             # BaseEntity, guardias, decoradores comunes
│   │   ├── database/           # Seeders de datos iniciales
│   │   ├── disciplinario/      # Módulo: proceso disciplinario
│   │   ├── fichas/             # Módulo: fichas de formación ← MODULO PRINCIPAL
│   │   ├── notificaciones/     # Módulo: notificaciones en tiempo real
│   │   ├── programas/          # Módulo: programas de formación SENA
│   │   ├── ptc/                # Módulo: plan de trabajo del cuatrimestre
│   │   ├── reportes/           # Módulo: generación de reportes
│   │   ├── upload/             # Módulo: subida de archivos a S3
│   │   └── users/              # Módulo: usuarios del sistema
│   └── uploads/                # Archivos locales (desarrollo)
│
├── frontend/                   # App Next.js
│   ├── app/
│   │   ├── dashboard/          # Rutas autenticadas
│   │   │   ├── fichas/         # Listado y detalle de fichas
│   │   │   ├── aprendices/     # Gestión de aprendices
│   │   │   ├── asistencias/    # Control de asistencias
│   │   │   ├── disciplinario/  # Proceso disciplinario
│   │   │   ├── agenda/         # Agenda del instructor
│   │   │   ├── ptc/            # PTC (Plan de trabajo)
│   │   │   ├── colegios/       # Colegios
│   │   │   ├── users/          # Usuarios (solo admin)
│   │   │   └── stats/          # Estadísticas generales
│   │   ├── login/              # Página de login
│   │   └── register/           # Página de registro
│   ├── components/
│   │   ├── layout/             # Sidebar, DashboardLayout
│   │   ├── ui/                 # Componentes base (Badge, Button, Card, Input)
│   │   └── users/              # Modales de usuario
│   ├── lib/
│   │   ├── api.ts              # Cliente Axios centralizado
│   │   ├── reportes.api.ts     # Cliente para reportes
│   │   └── utils.ts            # Utilidades (formatDate, cn)
│   └── types/
│       └── index.ts            # Interfaces TypeScript globales
│
├── docs/                       # ← DOCUMENTACIÓN DEL PROYECTO
│   ├── ARCHITECTURE.md         # Este archivo
│   ├── DATABASE.md             # Esquema de base de datos
│   ├── API.md                  # Referencia de endpoints
│   ├── FRONTEND.md             # Guía del frontend
│   └── CHANGELOG.md            # Historial de cambios
│
└── scripts/                    # Scripts de prueba y arranque
```

---

## Flujo de Autenticación

```
Usuario → POST /api/auth/login
         → JWT Token (almacenado en localStorage)
         → Interceptor Axios adjunta Authorization: Bearer <token>
         → Guards NestJS verifican JWT y Rol en cada endpoint
```

- El token incluye: `{ sub: userId, email, nombre, rol }`
- Los guards `JwtAuthGuard` y `RolesGuard` están **comentados en desarrollo** para facilitar pruebas sin autenticación
- En producción, todos los endpoints deben tener sus guards activos

---

## Roles del Sistema

| Rol | Valor en DB | Permisos principales |
|-----|-------------|---------------------|
| Administrador | `admin` | Acceso total, puede eliminar fichas |
| Coordinador | `coordinador` | Ve todas las fichas, gestiona colegios |
| Instructor | `instructor` | Solo sus fichas y aprendices |
| Aprendiz | `aprendiz` | Solo lectura de su información |

---

## Convenciones de Código

### Backend
- Cada módulo sigue la estructura: `entity → dto → service → controller → module`
- `BaseEntity` provee: `id (UUID)`, `createdAt`, `updatedAt`, `deletedAt`, `createdById`, `updatedById`, `deletedById`
- Todos los borrados son **soft delete** (campo `deletedAt`)
- Los DTOs de creación usan `class-validator` con mensajes en español
- Los endpoints de paginación retornan: `{ data: T[], total, page, limit }`

### Frontend
- Componentes con `'use client'` cuando usan hooks de React
- Estilos: Tailwind CSS, tema verde (`green-600`, `green-700`) como color principal
- API calls centralizados en `lib/api.ts` (instancia Axios con interceptores)
- `localStorage` almacena `token` y `user` (objeto con `{ id, nombre, email, rol }`)

---

## Variables de Entorno

### Backend (`backend/.env`)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Colombia123
DB_DATABASE=appsena
NODE_ENV=development
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3001
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Puertos

| Servicio | Puerto |
|----------|--------|
| Backend NestJS | 3000 |
| Frontend Next.js | 3001 |
| PostgreSQL | 5432 |
| Swagger UI | http://localhost:3000/api/docs |
