# 🧪 Guía de Pruebas - Sprint 2: Aprendices + Acudientes

## 📋 Resumen del Sprint 2

**Módulos implementados:**
- ✅ **Aprendices** - Gestión de estudiantes con autenticación
- ✅ **Acudientes** - Gestión de contactos familiares (nested routes)

**Características:**
- Relación Aprendiz → User (login habilitado para rol APRENDIZ)
- Relación Aprendiz → Ficha → Colegio/Programa
- Acudientes con enum Parentesco (MADRE, PADRE, HERMANO, TIO, ABUELO, OTRO)
- Control de acceso por roles (ADMIN, INSTRUCTOR, COORDINADOR)
- Validaciones de negocio (documentos únicos, teléfonos únicos por aprendiz)
- Soft delete para auditoría

---

## 🔐 Autenticación

**IMPORTANTE:** Todos los endpoints requieren token JWT. Obtén uno primero:

### POST /api/auth/login
```json
{
  "email": "admin@sena.edu.co",
  "password": "Admin123!"
}
```

**Respuesta:**
```json
{
  "user": {
    "id": "uuid",
    "nombre": "Admin User",
    "email": "admin@sena.edu.co",
    "rol": "admin"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Configurar token en Swagger:**
1. Copia el `access_token`
2. Click en el botón "Authorize" (candado verde)
3. Pega: `Bearer <tu-token>`
4. Click "Authorize"

---

## 👨‍🎓 Módulo Aprendices

### 1. Crear Aprendiz

**POST** `/api/aprendices`

**Roles permitidos:** ADMIN, INSTRUCTOR, COORDINADOR

**UUIDs de la base de datos (usar los reales):**
```
Programas:
- Análisis y Desarrollo de Software: e7b8c9d0-1a2b-3c4d-5e6f-7a8b9c0d1e2f
- Multimedia: a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d
- Animación 3D: f1e2d3c4-b5a6-9788-0011-223344556677

Colegios:
- Colegio San José: 123e4567-e89b-12d3-a456-426614174000
- Colegio Nacional: 223e4567-e89b-12d3-a456-426614174111

Users:
- Admin: f47ac10b-58cc-4372-a567-0e02b2c3d479
- Instructor: a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**JSON de ejemplo:**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez Gómez",
  "tipoDocumento": "CC",
  "documento": "1098765432",
  "email": "juan.perez@estudiante.sena.edu.co",
  "telefono": "3201234567",
  "direccion": "Calle 123 # 45-67, Bogotá",
  "estadoAcademico": "ACTIVO",
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "fichaId": "REEMPLAZAR_CON_UUID_REAL_DE_FICHA"
}
```

**⚠️ IMPORTANTE:** Debes crear primero una ficha válida o usar el UUID de una ficha existente.

**Crear ficha primero:**
```json
POST /api/fichas
{
  "numero": "2756789",
  "fechaInicio": "2024-01-15",
  "fechaFin": "2025-07-15",
  "jornadaFormacion": "DIURNA",
  "modalidadFormacion": "PRESENCIAL",
  "estadoFicha": "EN_FORMACION",
  "programaId": "e7b8c9d0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "colegioId": "123e4567-e89b-12d3-a456-426614174000",
  "instructorId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

Guarda el `id` de la ficha creada y úsalo en el aprendiz.

---

### 2. Listar Aprendices con Filtros

**GET** `/api/aprendices?page=1&limit=10`

**Query params opcionales:**
- `fichaId`: UUID de la ficha
- `colegioId`: UUID del colegio
- `programaId`: UUID del programa
- `estadoAcademico`: ACTIVO | DESERTOR | RETIRADO | SUSPENDIDO
- `search`: Buscar por nombres, apellidos o documento
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)

**Ejemplos:**
```
GET /api/aprendices?estadoAcademico=ACTIVO
GET /api/aprendices?search=Juan
GET /api/aprendices?fichaId=UUID-FICHA&page=1&limit=5
```

**Nota INSTRUCTOR:** Los instructores solo ven aprendices de sus fichas asignadas.

---

### 3. Obtener Detalle de Aprendiz

**GET** `/api/aprendices/{id}`

```
GET /api/aprendices/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d
```

**Respuesta incluye:**
- Datos completos del aprendiz
- Relación con User (para login)
- Relación con Ficha (con colegio y programa)

---

### 4. Actualizar Aprendiz

**PATCH** `/api/aprendices/{id}`

**Campos actualizables:**
```json
{
  "nombres": "Juan Carlos Actualizado",
  "apellidos": "Pérez Gómez",
  "email": "nuevo.email@estudiante.sena.edu.co",
  "telefono": "3109876543",
  "direccion": "Nueva dirección",
  "estadoAcademico": "ACTIVO"
}
```

**No se puede actualizar:**
- `userId` (inmutable)
- `fichaId` (inmutable)
- `documento` (inmutable)
- `tipoDocumento` (inmutable)

---

### 5. Cambiar Estado Académico

**PATCH** `/api/aprendices/{id}/estado`

**Roles permitidos:** ADMIN, COORDINADOR (⚠️ INSTRUCTOR NO puede)

```json
{
  "estadoAcademico": "SUSPENDIDO"
}
```

**Estados disponibles:**
- `ACTIVO`
- `DESERTOR`
- `RETIRADO`
- `SUSPENDIDO`

---

### 6. Eliminar Aprendiz (Soft Delete)

**DELETE** `/api/aprendices/{id}`

**Roles permitidos:** ADMIN únicamente

```
DELETE /api/aprendices/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d
```

**Nota:** Soft delete - el registro se marca como eliminado pero no se borra físicamente.

---

### 7. Listar Aprendices por Ficha

**GET** `/api/aprendices/ficha/{fichaId}/aprendices`

```
GET /api/aprendices/ficha/UUID-FICHA/aprendices
```

---

## 👨‍👩‍👧 Módulo Acudientes (Nested Routes)

### 1. Crear Acudiente para un Aprendiz

**POST** `/api/aprendices/{aprendizId}/acudientes`

**Roles permitidos:** ADMIN, INSTRUCTOR, COORDINADOR

**JSON de ejemplo:**
```json
{
  "nombres": "María Luisa",
  "apellidos": "Gómez de Pérez",
  "telefono": "3001234567",
  "email": "maria.gomez@email.com",
  "parentesco": "MADRE"
}
```

**Enum Parentesco:**
- `MADRE`
- `PADRE`
- `HERMANO`
- `TIO`
- `ABUELO`
- `OTRO`

**Validaciones:**
- El teléfono debe ser único para cada aprendiz (un aprendiz no puede tener dos acudientes con el mismo teléfono)
- El email es opcional

**Ejemplo completo:**
```json
POST /api/aprendices/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/acudientes

{
  "nombres": "Carlos Alberto",
  "apellidos": "Pérez Martínez",
  "telefono": "3209876543",
  "email": "carlos.perez@email.com",
  "parentesco": "PADRE"
}
```

---

### 2. Listar Acudientes de un Aprendiz

**GET** `/api/aprendices/{aprendizId}/acudientes`

```
GET /api/aprendices/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/acudientes
```

**Respuesta:**
```json
[
  {
    "id": "uuid-acudiente-1",
    "nombres": "María Luisa",
    "apellidos": "Gómez de Pérez",
    "telefono": "3001234567",
    "email": "maria.gomez@email.com",
    "parentesco": "MADRE",
    "aprendizId": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": "uuid-acudiente-2",
    "nombres": "Carlos Alberto",
    "apellidos": "Pérez Martínez",
    "telefono": "3209876543",
    "email": "carlos.perez@email.com",
    "parentesco": "PADRE",
    "aprendizId": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
]
```

---

### 3. Obtener Detalle de un Acudiente

**GET** `/api/aprendices/{aprendizId}/acudientes/{id}`

```
GET /api/aprendices/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/acudientes/uuid-acudiente-1
```

**Respuesta incluye:**
- Datos completos del acudiente
- Relación con Aprendiz
- Relación con Ficha del aprendiz

---

### 4. Actualizar Acudiente

**PATCH** `/api/aprendices/{aprendizId}/acudientes/{id}`

**Todos los campos son opcionales:**
```json
{
  "nombres": "María Luisa Actualizada",
  "telefono": "3001112233",
  "email": "nuevo.email@email.com",
  "parentesco": "MADRE"
}
```

**Validación:** Si cambias el teléfono, no puede coincidir con otro acudiente del mismo aprendiz.

---

### 5. Eliminar Acudiente (Soft Delete)

**DELETE** `/api/aprendices/{aprendizId}/acudientes/{id}`

**Roles permitidos:** ADMIN únicamente

```
DELETE /api/aprendices/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/acudientes/uuid-acudiente-1
```

---

## 🧪 Flujo de Prueba Completo

### 1. Login
```bash
POST /api/auth/login
{
  "email": "admin@sena.edu.co",
  "password": "Admin123!"
}
```

### 2. Crear Ficha (si no existe)
```bash
POST /api/fichas
{
  "numero": "2756789",
  "fechaInicio": "2024-01-15",
  "fechaFin": "2025-07-15",
  "jornadaFormacion": "DIURNA",
  "modalidadFormacion": "PRESENCIAL",
  "estadoFicha": "EN_FORMACION",
  "programaId": "e7b8c9d0-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "colegioId": "123e4567-e89b-12d3-a456-426614174000",
  "instructorId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```
→ Guarda el `fichaId` devuelto

### 3. Crear Aprendiz
```bash
POST /api/aprendices
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez Gómez",
  "tipoDocumento": "CC",
  "documento": "1098765432",
  "email": "juan.perez@estudiante.sena.edu.co",
  "telefono": "3201234567",
  "direccion": "Calle 123 # 45-67",
  "estadoAcademico": "ACTIVO",
  "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "fichaId": "USAR_EL_FICHA_ID_DEL_PASO_2"
}
```
→ Guarda el `aprendizId` devuelto

### 4. Listar Aprendices
```bash
GET /api/aprendices?estadoAcademico=ACTIVO&page=1&limit=10
```

### 5. Crear Acudiente (Madre)
```bash
POST /api/aprendices/{aprendizId}/acudientes
{
  "nombres": "María Luisa",
  "apellidos": "Gómez de Pérez",
  "telefono": "3001234567",
  "email": "maria.gomez@email.com",
  "parentesco": "MADRE"
}
```

### 6. Crear Acudiente (Padre)
```bash
POST /api/aprendices/{aprendizId}/acudientes
{
  "nombres": "Carlos Alberto",
  "apellidos": "Pérez Martínez",
  "telefono": "3209876543",
  "email": "carlos.perez@email.com",
  "parentesco": "PADRE"
}
```

### 7. Listar Acudientes del Aprendiz
```bash
GET /api/aprendices/{aprendizId}/acudientes
```

### 8. Actualizar Estado del Aprendiz (COORDINADOR/ADMIN)
```bash
PATCH /api/aprendices/{aprendizId}/estado
{
  "estadoAcademico": "SUSPENDIDO"
}
```

### 9. Actualizar Acudiente
```bash
PATCH /api/aprendices/{aprendizId}/acudientes/{acudienteId}
{
  "telefono": "3001112233"
}
```

---

## ⚠️ Errores Comunes y Soluciones

### 1. **409 Conflict - Documento duplicado**
```json
{
  "statusCode": 409,
  "message": "Ya existe un aprendiz con el documento 1098765432"
}
```
**Solución:** Usa un documento diferente.

---

### 2. **409 Conflict - Email duplicado**
```json
{
  "statusCode": 409,
  "message": "Ya existe un aprendiz con el email juan.perez@estudiante.sena.edu.co"
}
```
**Solución:** Usa un email diferente o déjalo vacío (es opcional).

---

### 3. **409 Conflict - Teléfono duplicado en acudiente**
```json
{
  "statusCode": 409,
  "message": "Ya existe un acudiente con el teléfono 3001234567 para este aprendiz"
}
```
**Solución:** Usa un teléfono diferente para el acudiente del mismo aprendiz.

---

### 4. **404 Not Found - Aprendiz no encontrado**
```json
{
  "statusCode": 404,
  "message": "Aprendiz con ID a1b2c3d4... no encontrado"
}
```
**Solución:** Verifica que el UUID del aprendiz sea correcto y que exista en la base de datos.

---

### 5. **403 Forbidden - Cambiar estado sin permisos**
```json
{
  "statusCode": 403,
  "message": "Solo los coordinadores y administradores pueden cambiar el estado académico"
}
```
**Solución:** Usa un usuario con rol COORDINADOR o ADMIN para cambiar el estado.

---

### 6. **403 Forbidden - Eliminar sin permisos**
```json
{
  "statusCode": 403,
  "message": "Solo los administradores pueden eliminar aprendices"
}
```
**Solución:** Usa un usuario con rol ADMIN para eliminar.

---

### 7. **500 Internal Server Error - Foreign Key Violation**
```json
{
  "statusCode": 500,
  "message": "insert or update on table \"aprendices\" violates foreign key constraint..."
}
```
**Solución:** Verifica que el `userId` y `fichaId` existan en la base de datos.

---

## 📊 Matriz de Permisos

| Endpoint | ADMIN | COORDINADOR | INSTRUCTOR | APRENDIZ |
|----------|-------|-------------|------------|----------|
| POST /aprendices | ✅ | ✅ | ✅ | ❌ |
| GET /aprendices | ✅ (todos) | ✅ (todos) | ✅ (solo sus fichas) | ❌ |
| GET /aprendices/:id | ✅ | ✅ | ✅ (solo sus fichas) | ❌ |
| PATCH /aprendices/:id | ✅ | ✅ | ✅ (validar ficha) | ❌ |
| PATCH /aprendices/:id/estado | ✅ | ✅ | ❌ | ❌ |
| DELETE /aprendices/:id | ✅ | ❌ | ❌ | ❌ |
| POST /acudientes | ✅ | ✅ | ✅ | ❌ |
| GET /acudientes | ✅ | ✅ | ✅ (solo sus fichas) | ❌ |
| PATCH /acudientes/:id | ✅ | ✅ | ✅ (validar ficha) | ❌ |
| DELETE /acudientes/:id | ✅ | ❌ | ❌ | ❌ |

---

## 🔍 Validaciones Implementadas

### Aprendices
- ✅ Documento único en toda la tabla
- ✅ Email único (si se proporciona)
- ✅ Documento solo números (regex: `^[0-9]+$`)
- ✅ Email válido (formato estándar)
- ✅ Nombres y apellidos: mínimo 2, máximo 100 caracteres
- ✅ Teléfono: mínimo 7, máximo 20 caracteres
- ✅ Estado académico: enum validado
- ✅ Tipo documento: enum validado
- ✅ Usuario debe existir en tabla users
- ✅ Ficha debe existir en tabla fichas

### Acudientes
- ✅ Teléfono único por aprendiz (un aprendiz no puede tener dos acudientes con el mismo teléfono)
- ✅ Email válido (si se proporciona)
- ✅ Nombres: mínimo 2, máximo 100 caracteres
- ✅ Apellidos opcionales: mínimo 2, máximo 100 caracteres
- ✅ Teléfono: mínimo 7, máximo 20 caracteres
- ✅ Parentesco: enum validado (MADRE, PADRE, HERMANO, TIO, ABUELO, OTRO)
- ✅ Aprendiz debe existir

---

## 📝 Notas Importantes

1. **Todos los endpoints están protegidos con JWT** - Debes hacer login primero
2. **Guards activos** - A diferencia del módulo Fichas, los guards están activos en Aprendices y Acudientes
3. **Soft Delete** - Los registros eliminados no se borran, se marcan con `deletedAt`
4. **Audit Trail** - Todos los cambios guardan `createdById`, `updatedById`, `deletedById`
5. **Nested Routes** - Acudientes están anidados bajo aprendices (`/aprendices/:id/acudientes`)
6. **Eager Loading** - Las relaciones se cargan automáticamente (User, Ficha, Colegio, Programa)
7. **Pagination** - Todos los listados soportan paginación (page, limit)
8. **Search** - Búsqueda por nombres, apellidos y documento (ILIKE - case insensitive)

---

## 🎯 Próximos Pasos (PASO 3)

1. ✅ Verificar compilación sin errores
2. ⏳ Crear seeder con datos de prueba (aprendices + acudientes)
3. ⏳ Probar todos los endpoints en Swagger
4. ⏳ Validar restricciones de roles
5. ⏳ Validar validaciones de negocio

---

## 📚 Documentación Adicional

- **Swagger:** http://localhost:3000/api
- **Roles disponibles:** ADMIN, COORDINADOR, INSTRUCTOR, APRENDIZ
- **Base Entity:** Todos heredan id, createdAt, updatedAt, deletedAt, createdById, updatedById, deletedById
- **Naming:** snake_case para DB columns, UPPERCASE para enums, Spanish error messages
