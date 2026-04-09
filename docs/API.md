# API Reference — AppSena Backend

> Última actualización: Abril 2026  
> Base URL: `http://localhost:3000/api`  
> Documentación interactiva: `http://localhost:3000/api/docs` (Swagger)

---

## Convenciones

- Todos los endpoints retornan JSON
- Los errores siguen el formato estándar NestJS: `{ statusCode, message, error }`
- Las listas paginadas retornan: `{ data: T[], total: number, page: number, limit: number }`
- Los UUIDs se usan como identificadores en todos los recursos
- **Nota de desarrollo**: Los guards de autenticación están comentados (`// @UseGuards(...)`) — en producción deben activarse

---

## Autenticación (`/auth`)

### `POST /auth/login`
Autentica un usuario y devuelve el JWT.

**Body:**
```json
{ "email": "admin@sena.edu.co", "password": "Admin123!" }
```

**Respuesta 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "uuid", "nombre": "Admin", "email": "...", "rol": "admin" }
}
```

### `GET /auth/profile`
Retorna el perfil del usuario autenticado (requiere JWT).

---

## Usuarios (`/users`)

| Método | Endpoint | Rol requerido | Descripción |
|--------|----------|---------------|-------------|
| `GET` | `/users` | admin | Listar usuarios (paginado) |
| `GET` | `/users/:id` | admin, coordinador | Obtener usuario por ID |
| `POST` | `/users` | admin | Crear usuario |
| `PATCH` | `/users/:id` | admin | Actualizar usuario |
| `DELETE` | `/users/:id` | admin | Eliminar usuario (soft delete) |

**Query params para GET /users:**
- `page`, `limit` — paginación
- `search` — busca en nombre, email, documento
- `rol` — filtra por rol

---

## Fichas (`/fichas`) ← MÓDULO PRINCIPAL

### Listado y paginación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/fichas` | Listar fichas con filtros |
| `GET` | `/fichas/:id` | Obtener ficha por ID |
| `GET` | `/fichas/mias` | Fichas del instructor autenticado |
| `GET` | `/fichas/agrupadas` | Fichas agrupadas por colegio y programa |
| `POST` | `/fichas` | Crear ficha |
| `PATCH` | `/fichas/:id` | Actualizar ficha |
| `PATCH` | `/fichas/:id/estado` | Cambiar estado de la ficha |
| `DELETE` | `/fichas/:id` | Eliminar ficha (soft delete + auditoría) |
| `POST` | `/fichas/:id/importar-aprendices` | Importar aprendices desde Excel |

---

### `GET /fichas`

**Query params:**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `page` | number | Página (default: 1) |
| `limit` | number | Registros por página (default: 10) |
| `search` | string | Busca por número de ficha |
| `dependencia` | enum | `ARTICULACION`, `TITULADA`, `COMPLEMENTARIA` |
| `jornada` | enum | `MAÑANA`, `TARDE`, `NOCHE`, `MIXTA` |
| `estado` | enum | `ACTIVA`, `EN_CIERRE`, `FINALIZADA` |
| `programaId` | UUID | Filtra por programa |
| `colegioId` | UUID | Filtra por colegio |
| `instructorId` | UUID | Filtra por instructor |

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "uuid",
      "numeroFicha": "2654321",
      "jornada": "TARDE",
      "estado": "ACTIVA",
      "dependencia": "TITULADA",
      "cupoEsperado": 30,
      "aprendicesCount": 15,
      "instructor": { "id": "...", "nombre": "Juan Instructor" },
      "programa": { "id": "...", "nombre": "Técnico en Cocina", "codigo": "631545" },
      "colegio": null
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

---

### `POST /fichas`

**Body (todos los campos opcionales excepto `numeroFicha` y `jornada`):**
```json
{
  "numeroFicha": "2654321",
  "jornada": "TARDE",
  "dependencia": "TITULADA",
  "tipoProgramaFormacion": "Formación titulada",
  "cupoEsperado": 30,
  "ambiente": "Sala 201",
  "programaId": "uuid-programa",
  "instructorId": "uuid-instructor",
  "fechaInicio": "2024-01-15",
  "fechaFin": "2026-01-15"
}
```
**Para Articulación incluir además:**
```json
{
  "dependencia": "ARTICULACION",
  "modalidadArticulacion": "COMPARTIDA",
  "localidad": "Chapinero",
  "colegioId": "uuid-colegio"
}
```

---

### `DELETE /fichas/:id`

Realiza **soft delete** con auditoría.

**Query param:**
- `deletedById` (UUID): ID del administrador que realiza la eliminación

El campo `deleted_by_id` en la tabla `fichas` queda registrado con el UUID del admin. El registro permanece en la base de datos con `deleted_at` seteado.

---

### `POST /fichas/:id/importar-aprendices`

Importa aprendices masivamente desde un archivo Excel.

**Request:** `multipart/form-data`
- Campo `file`: archivo `.xlsx` o `.xls`

**Columnas esperadas en el Excel:**

| Columna | Obligatorio | Alias aceptados |
|---------|-------------|-----------------|
| `nombres` | ✅ | `nombre` |
| `apellidos` | ✅ | `apellido` |
| `documento` | ✅ | `numerodocumento`, `numdoc` |
| `tipoDocumento` | ❌ | `tipo`, `tipodoc` (default: CC) |
| `email` | ❌ | `correo`, `correoe` |
| `telefono` | ❌ | `celular`, `tel` |
| `direccion` | ❌ | `dir` |

**Respuesta 201:**
```json
{
  "creados": 18,
  "omitidos": 2,
  "errores": ["Fila 5: campo 'nombres' requerido"]
}
```

**Lógica de importación:**
1. Por cada fila válida, busca si ya existe un `user` y `aprendiz` con ese documento
2. Si el aprendiz ya existe → omite la fila (incrementa `omitidos`)
3. Si no existe → crea el `User` con contraseña = documento y el `Aprendiz` vinculado a la ficha
4. Si el email ya está en uso → asigna `{documento}@sena.edu.co` como email del usuario

---

## Aprendices (`/aprendices`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/aprendices` | Listar aprendices (filtros: fichaId, search, estadoAcademico) |
| `GET` | `/aprendices/:id` | Obtener aprendiz por ID |
| `GET` | `/aprendices/ficha/:fichaId/aprendices` | Aprendices de una ficha específica |
| `POST` | `/aprendices` | Crear aprendiz individual |
| `PATCH` | `/aprendices/:id` | Actualizar aprendiz |
| `PATCH` | `/aprendices/:id/estado` | Cambiar estado académico |
| `DELETE` | `/aprendices/:id` | Eliminar aprendiz (soft delete) |

**Query params para GET /aprendices:**
- `fichaId` — filtra por ficha
- `colegioId` — filtra por colegio de la ficha
- `programaId` — filtra por programa de la ficha
- `estadoAcademico` — `ACTIVO`, `DESERTOR`, `RETIRADO`, `SUSPENDIDO`
- `search` — busca en nombres, apellidos, documento

---

## Colegios (`/colegios`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/colegios` | Listar colegios |
| `GET` | `/colegios/:id` | Obtener colegio |
| `POST` | `/colegios` | Crear colegio |
| `PATCH` | `/colegios/:id` | Actualizar colegio |
| `DELETE` | `/colegios/:id` | Eliminar colegio |

---

## Programas (`/programas`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/programas` | Listar programas |
| `GET` | `/programas/:id` | Obtener programa |
| `POST` | `/programas` | Crear programa |
| `PATCH` | `/programas/:id` | Actualizar programa |
| `DELETE` | `/programas/:id` | Eliminar programa |

---

## Asistencias (`/asistencias`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/asistencias/clases` | Listar sesiones de clase |
| `POST` | `/asistencias/clases` | Crear sesión de clase |
| `GET` | `/asistencias/clases/:id` | Detalle de la sesión |
| `POST` | `/asistencias/registrar` | Registrar asistencias de una sesión |
| `GET` | `/asistencias/ficha/:fichaId` | Asistencias de una ficha |

---

## Disciplinario (`/disciplinario`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/disciplinario` | Listar casos disciplinarios |
| `POST` | `/disciplinario` | Crear caso |
| `GET` | `/disciplinario/:id` | Obtener caso |
| `PATCH` | `/disciplinario/:id/estado` | Cambiar estado del caso |
| `POST` | `/disciplinario/:id/acciones` | Agregar acción al caso |

---

## Agenda (`/agenda`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/agenda` | Listar eventos del usuario |
| `POST` | `/agenda` | Crear evento |
| `PATCH` | `/agenda/:id` | Actualizar evento |
| `DELETE` | `/agenda/:id` | Eliminar evento |

---

## PTC (`/ptc`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/ptc` | Listar PTCs |
| `POST` | `/ptc` | Crear PTC |
| `GET` | `/ptc/:id` | Obtener PTC con ítems |
| `POST` | `/ptc/:id/items` | Agregar ítem al PTC |
| `POST` | `/ptc/:id/actas` | Crear acta |

---

## Acudientes (`/acudientes`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/acudientes` | Listar acudientes |
| `POST` | `/acudientes` | Crear acudiente |
| `PATCH` | `/acudientes/:id` | Actualizar acudiente |

---

## Reportes (`/reportes`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/reportes/asistencias` | Reporte de asistencias (exportable) |
| `GET` | `/reportes/aprendices` | Reporte de aprendices por ficha |

---

## Upload (`/upload`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/upload` | Subir archivo a AWS S3 |

---

## Notificaciones (`/notificaciones`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/notificaciones` | Listar notificaciones del usuario |
| `PATCH` | `/notificaciones/:id/leer` | Marcar como leída |

---

## Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| `400` | Bad Request — datos inválidos en el body |
| `401` | Unauthorized — token ausente o inválido |
| `403` | Forbidden — rol insuficiente para la operación |
| `404` | Not Found — recurso no encontrado |
| `409` | Conflict — duplicado (número de ficha, documento, email) |
