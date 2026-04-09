# Base de Datos — Esquema y Convenciones

> Última actualización: Abril 2026  
> Motor: PostgreSQL 15  
> ORM: TypeORM (`synchronize: true` en desarrollo)

---

## Convenciones Generales

- Todas las tablas heredan de `BaseEntity` que provee los campos de auditoría
- Los nombres de tabla usan `snake_case` en plural (e.g., `fichas`, `aprendices`)
- Los UUIDs se generan automáticamente con `uuid_generate_v4()`
- Los borrados son **soft delete**: nunca se eliminan registros físicamente
- Los timestamps usan zona horaria del servidor

---

## BaseEntity — Campos Heredados

Todos los modelos incluyen estos campos automáticamente:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `UUID` | Clave primaria, auto-generada |
| `created_at` | `TIMESTAMP` | Fecha de creación |
| `updated_at` | `TIMESTAMP` | Fecha de última actualización |
| `deleted_at` | `TIMESTAMP` | Fecha de borrado lógico (NULL = activo) |
| `created_by_id` | `UUID` | ID del usuario que creó el registro |
| `updated_by_id` | `UUID` | ID del usuario que actualizó el registro |
| `deleted_by_id` | `UUID` | ID del usuario que eliminó el registro |

---

## Tablas del Sistema

### `users` — Usuarios del sistema

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `nombre` | `VARCHAR(100)` | NOT NULL | Nombre completo |
| `email` | `VARCHAR(100)` | UNIQUE, NOT NULL | Correo electrónico |
| `documento` | `VARCHAR(20)` | UNIQUE, NOT NULL | Número de documento |
| `telefono` | `VARCHAR(20)` | NULLABLE | Teléfono de contacto |
| `password` | `VARCHAR(255)` | NOT NULL | Contraseña hasheada (bcrypt) |
| `rol` | `ENUM` | DEFAULT `instructor` | `admin`, `instructor`, `coordinador`, `aprendiz` |
| `foto_perfil` | `VARCHAR(500)` | NULLABLE | URL de foto (S3 o local) |
| `activo` | `BOOLEAN` | DEFAULT `true` | Estado activo/inactivo |

**Notas:**
- Al crear un aprendiz por importación Excel, se crea automáticamente un `User` con `rol = aprendiz`, contraseña = documento del aprendiz (hasheada con bcrypt)
- Los passwords se hashean automáticamente con `@BeforeInsert` y `@BeforeUpdate`

---

### `colegios` — Colegios articulados

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `nombre` | `VARCHAR(200)` | NOT NULL | Nombre del colegio |
| `codigo_dane` | `VARCHAR(20)` | UNIQUE, NULLABLE | Código DANE |
| `direccion` | `VARCHAR(300)` | NULLABLE | Dirección |
| `localidad` | `VARCHAR(100)` | NULLABLE | Localidad |
| `telefono` | `VARCHAR(20)` | NULLABLE | Teléfono |
| `email` | `VARCHAR(100)` | NULLABLE | Email institucional |
| `rector` | `VARCHAR(200)` | NULLABLE | Nombre del rector |
| `activo` | `BOOLEAN` | DEFAULT `true` | Estado |

---

### `programas` — Programas de formación SENA

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `nombre` | `VARCHAR(200)` | NOT NULL | Nombre del programa |
| `codigo` | `VARCHAR(20)` | UNIQUE, NOT NULL | Código SENA del programa |
| `descripcion` | `TEXT` | NULLABLE | Descripción |
| `duracion_horas` | `INT` | NULLABLE | Duración en horas |
| `nivel_formacion` | `VARCHAR(100)` | NULLABLE | Técnico, Tecnólogo, etc. |

---

### `fichas` — Fichas de formación ← TABLA PRINCIPAL

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `numero_ficha` | `VARCHAR(30)` | UNIQUE, NOT NULL | Número oficial SENA |
| `jornada` | `ENUM` | NOT NULL | `MAÑANA`, `TARDE`, `NOCHE`, `MIXTA` |
| `estado` | `ENUM` | DEFAULT `ACTIVA` | `ACTIVA`, `EN_CIERRE`, `FINALIZADA` |
| `dependencia` | `ENUM` | DEFAULT `TITULADA` | `ARTICULACION`, `TITULADA`, `COMPLEMENTARIA` |
| `tipo_programa_formacion` | `VARCHAR(200)` | NULLABLE | Tipo descriptivo del programa |
| `cupo_esperado` | `INT` | DEFAULT `30` | Cupo máximo de aprendices |
| `modalidad_articulacion` | `ENUM` | NULLABLE | `COMPARTIDA`, `UNICA`, `COLEGIO_PRIVADO` |
| `localidad` | `VARCHAR(200)` | NULLABLE | Localidad (solo articulación) |
| `ambiente` | `VARCHAR(200)` | NULLABLE | Ambiente/aula asignada |
| `observaciones` | `TEXT` | NULLABLE | Notas adicionales |
| `fecha_inicio` | `DATE` | NULLABLE | Inicio de la ficha |
| `fecha_fin` | `DATE` | NULLABLE | Fin estimado |
| `colegio_id` | `UUID FK` | NULLABLE → `colegios` | Solo fichas de articulación |
| `programa_id` | `UUID FK` | NULLABLE → `programas` | Programa asociado |
| `instructor_id` | `UUID FK` | NULLABLE → `users` | Instructor responsable |

**Enums:**
```
JornadaFicha:          MAÑANA | TARDE | NOCHE | MIXTA
EstadoFicha:           ACTIVA | EN_CIERRE | FINALIZADA
DependenciaFicha:      ARTICULACION | TITULADA | COMPLEMENTARIA
ModalidadArticulacion: COMPARTIDA | UNICA | COLEGIO_PRIVADO
```

**Relaciones:**
- `fichas` → `colegios` (ManyToOne, eager, nullable)
- `fichas` → `programas` (ManyToOne, eager, nullable)
- `fichas` → `users` (ManyToOne, eager, nullable) | instructor
- `fichas` ← `aprendices` (OneToMany) | para conteo de aprendices

**Borrado lógico:**
El campo heredado `deleted_at` se usa para soft delete. Al eliminar, también se registra `deleted_by_id` con el UUID del administrador que realizó la acción.

---

### `aprendices` — Aprendices del SENA

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `nombres` | `VARCHAR(100)` | NOT NULL | Nombres |
| `apellidos` | `VARCHAR(100)` | NOT NULL | Apellidos |
| `tipo_documento` | `ENUM` | NOT NULL | `CC`, `TI`, `CE`, `PAS` |
| `documento` | `VARCHAR(20)` | UNIQUE, NOT NULL | Número de documento |
| `email` | `VARCHAR(100)` | UNIQUE, NULLABLE | Email personal |
| `telefono` | `VARCHAR(20)` | NULLABLE | Teléfono |
| `direccion` | `VARCHAR(300)` | NULLABLE | Dirección |
| `estado_academico` | `ENUM` | DEFAULT `ACTIVO` | `ACTIVO`, `DESERTOR`, `RETIRADO`, `SUSPENDIDO` |
| `user_id` | `UUID FK` | NOT NULL → `users` | Usuario asociado (login) |
| `ficha_id` | `UUID FK` | NOT NULL → `fichas` | Ficha a la que pertenece |

**Importación masiva desde Excel:**
- Endpoint: `POST /api/fichas/:id/importar-aprendices` (multipart/form-data)
- Por cada fila del Excel se crea un `User` (si no existe) y luego el `Aprendiz`
- Columnas esperadas: `nombres`, `apellidos`, `tipoDocumento`, `documento`, `email`, `telefono`, `direccion`
- Si el aprendiz ya existe (por documento), la fila se omite sin error
- Si el email ya está en uso, se asigna `{documento}@sena.edu.co`

---

### `acudientes` — Acudientes de aprendices

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `nombres` | `VARCHAR(100)` | NOT NULL | Nombres del acudiente |
| `apellidos` | `VARCHAR(100)` | NOT NULL | Apellidos |
| `tipo_documento` | `ENUM` | NOT NULL | `CC`, `TI`, `CE`, `PAS` |
| `documento` | `VARCHAR(20)` | UNIQUE, NOT NULL | Documento |
| `email` | `VARCHAR(100)` | NULLABLE | Email |
| `telefono` | `VARCHAR(20)` | NULLABLE | Teléfono |
| `parentesco` | `VARCHAR(50)` | NULLABLE | Parentesco con el aprendiz |
| `aprendiz_id` | `UUID FK` | NOT NULL → `aprendices` | Aprendiz asociado |

---

### `clase_sesiones` — Sesiones de clase (Asistencias)

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `fecha` | `DATE` | NOT NULL | Fecha de la sesión |
| `hora_inicio` | `TIME` | NULLABLE | Hora de inicio |
| `hora_fin` | `TIME` | NULLABLE | Hora de fin |
| `tema` | `VARCHAR(500)` | NULLABLE | Tema de la clase |
| `observaciones` | `TEXT` | NULLABLE | Observaciones |
| `ficha_id` | `UUID FK` | NOT NULL → `fichas` | Ficha a la que pertenece |
| `instructor_id` | `UUID FK` | NOT NULL → `users` | Instructor que dictó |

---

### `asistencias` — Registro de asistencia por aprendiz

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `estado` | `ENUM` | NOT NULL | `PRESENTE`, `AUSENTE`, `EXCUSA`, `TARDE` |
| `observaciones` | `VARCHAR(500)` | NULLABLE | Observaciones |
| `clase_sesion_id` | `UUID FK` | NOT NULL → `clase_sesiones` | Sesión correspondiente |
| `aprendiz_id` | `UUID FK` | NOT NULL → `aprendices` | Aprendiz evaluado |

---

### `disciplinary_cases` — Casos disciplinarios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `tipo` | `ENUM` | NOT NULL | Tipo de falta |
| `descripcion` | `TEXT` | NOT NULL | Descripción del caso |
| `estado` | `ENUM` | DEFAULT `ABIERTO` | `ABIERTO`, `EN_PROCESO`, `CERRADO` |
| `fecha_incidente` | `DATE` | NOT NULL | Fecha del incidente |
| `aprendiz_id` | `UUID FK` | NOT NULL → `aprendices` | Aprendiz involucrado |
| `instructor_id` | `UUID FK` | NOT NULL → `users` | Instructor que reporta |

---

### `case_actions` — Acciones en casos disciplinarios

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| `descripcion` | `TEXT` | NOT NULL | Descripción de la acción |
| `tipo_accion` | `VARCHAR(100)` | NULLABLE | Tipo de acción tomada |
| `case_id` | `UUID FK` | NOT NULL → `disciplinary_cases` | Caso asociado |

---

### `ptc` — Plan de Trabajo del Cuatrimestre

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `periodo` | `VARCHAR(50)` | Período (e.g., "2024-1") |
| `ficha_id` | `UUID FK` | Ficha asociada |
| `instructor_id` | `UUID FK` | Instructor responsable |

### `ptc_items` — Ítems del PTC
### `actas` — Actas de reunión/entrega
### `acta_asistentes` — Asistentes a actas

---

### `calendar_events` — Agenda / Eventos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `titulo` | `VARCHAR(200)` | Título del evento |
| `descripcion` | `TEXT` | Descripción |
| `fecha_inicio` | `TIMESTAMP` | Inicio |
| `fecha_fin` | `TIMESTAMP` | Fin |
| `tipo` | `ENUM` | Tipo de evento |
| `user_id` | `UUID FK` | Propietario del evento |

### `reminders` — Recordatorios
### `notifications` — Notificaciones del sistema

---

## Diagrama de Relaciones (simplificado)

```
users
  ├── fichas (instructor_id) ←───────────────────┐
  ├── aprendices (user_id)                        │
  ├── disciplinary_cases (instructor_id)           │
  └── calendar_events (user_id)                   │
                                                   │
colegios ──────────────────────────────── fichas ──┤
programas ─────────────────────────────── fichas ──┤
                                                   │
fichas                                             │
  ├── aprendices (ficha_id)                        │
  │     ├── acudientes (aprendiz_id)               │
  │     ├── asistencias (aprendiz_id)              │
  │     └── disciplinary_cases (aprendiz_id)       │
  ├── clase_sesiones (ficha_id)                    │
  │     └── asistencias (clase_sesion_id)          │
  └── ptc (ficha_id) ─────────────────────────────┘
        ├── ptc_items
        └── actas
              └── acta_asistentes
```

---

## Índices y Restricciones Importantes

- `fichas.numero_ficha`: UNIQUE (no puede haber dos fichas con el mismo número)
- `users.email`: UNIQUE
- `users.documento`: UNIQUE
- `aprendices.documento`: UNIQUE
- `aprendices.email`: UNIQUE (cuando se proporciona)
- Soft delete: TypeORM excluye automáticamente registros con `deleted_at IS NOT NULL` en todas las consultas

---

## Seeders

Los seeders se ejecutan con `npm run seed` desde el directorio `backend/`. Crean:
- Usuarios de prueba por rol (admin, coordinador, instructor, aprendiz)
- Colegios de ejemplo
- Programas de formación SENA
- Fichas de prueba

Ver `backend/SEEDERS.md` para credenciales y detalles.
