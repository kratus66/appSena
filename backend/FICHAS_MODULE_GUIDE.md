# 📘 SPRINT 1 - MÓDULO FICHAS - IMPLEMENTACIÓN COMPLETA

## ✅ ARCHIVOS CREADOS

### Estructura del módulo `fichas/`:
```
backend/src/fichas/
├── entities/
│   └── ficha.entity.ts          ✅ Entidad Ficha + enums JornadaFicha y EstadoFicha
├── dto/
│   ├── create-ficha.dto.ts      ✅ DTO para crear fichas
│   ├── update-ficha.dto.ts      ✅ DTO para actualizar fichas (sin estado)
│   ├── update-ficha-estado.dto.ts ✅ DTO para cambiar estado (solo coordinadores)
│   └── query-ficha.dto.ts       ✅ DTO para filtros y paginación
├── fichas.controller.ts         ✅ Controller con todos los endpoints
├── fichas.service.ts            ✅ Service con lógica de negocio
└── fichas.module.ts             ✅ Module configurado
```

## 📝 ARCHIVOS MODIFICADOS

1. **app.module.ts** 
   - ✅ Importado FichasModule
   - ✅ Agregada entidad Ficha al array de entities TypeORM

2. **colegios/entities/colegio.entity.ts**
   - ✅ Actualizado comentario de relación con Fichas

3. **programas/entities/programa.entity.ts**
   - ✅ Actualizado comentario de relación con Fichas

4. **database/seeder.module.ts**
   - ✅ Importado FichasModule

5. **database/seeder.service.ts**
   - ✅ Agregado método `seedFichas()` con 8 fichas de ejemplo
   - ✅ Fichas distribuidas entre diferentes colegios, programas, jornadas y estados

---

## 🎯 ENDPOINTS IMPLEMENTADOS

### **BASE URL**: `/api/fichas`

| Método | Endpoint | Roles | Descripción |
|--------|----------|-------|-------------|
| POST | `/fichas` | ADMIN, INSTRUCTOR | Crear nueva ficha |
| GET | `/fichas` | ADMIN, COORDINADOR, INSTRUCTOR | Listar fichas (con filtros y paginación) |
| GET | `/fichas/mias` | INSTRUCTOR | Listar solo mis fichas |
| GET | `/fichas/agrupadas` | ADMIN, COORDINADOR | Fichas agrupadas por colegio y programa |
| GET | `/fichas/:id` | ADMIN, COORDINADOR, INSTRUCTOR | Detalle de una ficha |
| PATCH | `/fichas/:id` | ADMIN, INSTRUCTOR | Actualizar ficha (instructores solo sus fichas) |
| PATCH | `/fichas/:id/estado` | ADMIN, COORDINADOR | Cambiar estado de ficha |
| DELETE | `/fichas/:id` | ADMIN | Eliminar ficha (soft delete) |

---

## 🔐 REGLAS DE PERMISOS IMPLEMENTADAS

### **INSTRUCTOR**:
- ✅ Puede crear fichas
- ✅ Solo puede ver sus propias fichas en GET /fichas (filtrado automático)
- ✅ Solo puede editar sus propias fichas
- ✅ **NO** puede cambiar el estado de fichas
- ✅ **NO** puede acceder a /fichas/agrupadas

### **COORDINADOR**:
- ✅ Puede ver todas las fichas filtradas por colegio/programa
- ✅ Puede cambiar el estado de cualquier ficha (ACTIVA → EN_CIERRE → FINALIZADA)
- ✅ Puede acceder a /fichas/agrupadas
- ✅ **NO** puede crear ni editar fichas

### **ADMIN**:
- ✅ Acceso total a todos los endpoints
- ✅ Único rol que puede eliminar fichas

---

## 🧪 GUÍA DE PRUEBAS EN SWAGGER

### **PASO 1: Levantar el servidor**

```bash
cd backend
npm run start:dev
```

### **PASO 2: Ejecutar seeders (opcional pero recomendado)**

```bash
npm run seed
```

Esto creará:
- 3 usuarios (admin, instructor, coordinador)
- 5 colegios
- 8 programas
- **8 fichas de ejemplo**

### **PASO 3: Acceder a Swagger**

Abrir en el navegador:
```
http://localhost:3000/api/docs
```

### **PASO 4: Autenticarse**

1. Ir a la sección **Auth**
2. Usar el endpoint `POST /api/auth/login`

**Usuarios de prueba** (creados por seeder):

```json
// ADMIN
{
  "email": "admin@sena.edu.co",
  "password": "Admin123!"
}

// INSTRUCTOR
{
  "email": "instructor@sena.edu.co",
  "password": "Instructor123!"
}

// COORDINADOR
{
  "email": "coordinador@sena.edu.co",
  "password": "Coordinador123!"
}
```

3. Copiar el **access_token** de la respuesta
4. Hacer clic en el botón **"Authorize"** (candado arriba a la derecha)
5. Pegar el token en el campo "Value" como: `Bearer {tu-token}`
6. Hacer clic en **"Authorize"** y luego **"Close"**

---

## 📋 EJEMPLOS DE REQUESTS

### **1. Crear una ficha** (POST /api/fichas)
**Rol requerido**: ADMIN o INSTRUCTOR

```json
{
  "numeroFicha": "2999999",
  "jornada": "MAÑANA",
  "estado": "ACTIVA",
  "fechaInicio": "2024-06-01",
  "fechaFin": "2026-06-01",
  "colegioId": "{UUID-de-colegio}",
  "programaId": "{UUID-de-programa}",
  "instructorId": "{UUID-de-instructor}"
}
```

**Tip**: Obtener UUIDs válidos de:
- `GET /api/colegios` → usar un `id`
- `GET /api/programas` → usar un `id`
- `GET /api/users` → usar un `id` de un usuario con rol "instructor"

### **2. Listar todas las fichas con filtros** (GET /api/fichas)
**Rol**: Cualquier autenticado

Query params opcionales:
```
?page=1
&limit=10
&estado=ACTIVA
&jornada=MAÑANA
&search=2654
&colegioId={UUID}
&programaId={UUID}
```

**Respuesta esperada**:
```json
{
  "data": [...],
  "total": 8,
  "page": 1,
  "limit": 10
}
```

### **3. Mis fichas** (GET /api/fichas/mias)
**Rol**: INSTRUCTOR

Muestra solo las fichas del instructor autenticado.

### **4. Fichas agrupadas** (GET /api/fichas/agrupadas)
**Rol**: ADMIN o COORDINADOR

**Respuesta esperada**:
```json
[
  {
    "colegioId": "...",
    "colegioNombre": "Institución Educativa Distrital San José",
    "programas": [
      {
        "programaId": "...",
        "programaNombre": "Tecnólogo en Análisis y Desarrollo de Software",
        "totalFichas": 3,
        "fichas": [
          {
            "id": "...",
            "numeroFicha": "2654321",
            "jornada": "MAÑANA",
            "estado": "ACTIVA",
            "instructor": {
              "id": "...",
              "nombre": "Juan Carlos Instructor"
            }
          }
        ]
      }
    ]
  }
]
```

### **5. Actualizar una ficha** (PATCH /api/fichas/:id)
**Rol**: ADMIN o INSTRUCTOR (solo sus fichas)

```json
{
  "jornada": "TARDE",
  "fechaFin": "2026-12-31"
}
```

**NOTA**: Este endpoint **NO permite cambiar el estado**. Para eso existe el endpoint específico.

### **6. Cambiar estado de ficha** (PATCH /api/fichas/:id/estado)
**Rol**: ADMIN o COORDINADOR

```json
{
  "estado": "EN_CIERRE"
}
```

Estados válidos:
- `ACTIVA`
- `EN_CIERRE`
- `FINALIZADA`

### **7. Eliminar ficha** (DELETE /api/fichas/:id)
**Rol**: SOLO ADMIN

Hace soft-delete (marca como eliminada sin borrarla físicamente).

---

## ✅ VALIDACIONES IMPLEMENTADAS

### **CreateFichaDto**:
- ✅ `numeroFicha`: string, 3-30 caracteres, requerido, único
- ✅ `jornada`: enum (MAÑANA|TARDE|NOCHE|MIXTA), requerido
- ✅ `estado`: enum (ACTIVA|EN_CIERRE|FINALIZADA), opcional, default: ACTIVA
- ✅ `fechaInicio`: ISO date string, opcional
- ✅ `fechaFin`: ISO date string, opcional
- ✅ `colegioId`: UUID v4, requerido
- ✅ `programaId`: UUID v4, requerido
- ✅ `instructorId`: UUID v4, requerido

### **Reglas de negocio**:
- ✅ Número de ficha debe ser único (ConflictException si existe)
- ✅ Instructor solo edita sus fichas (ForbiddenException)
- ✅ Solo coordinador/admin cambian estado (ForbiddenException)
- ✅ Instructor autenticado ve solo sus fichas en listados
- ✅ Solo admin puede eliminar fichas

---

## 🔍 VERIFICACIONES SUGERIDAS

### **Test 1: Crear ficha duplicada**
1. Crear una ficha con número "2654321"
2. Intentar crear otra con el mismo número
3. **Esperado**: Error 409 (Conflict)

### **Test 2: Instructor intenta cambiar estado**
1. Login como instructor
2. Intentar PATCH /fichas/:id/estado
3. **Esperado**: Error 403 (Forbidden)

### **Test 3: Instructor intenta ver ficha de otro**
1. Login como instructor
2. GET /fichas (debe ver solo sus fichas)
3. GET /fichas/:id de otra ficha
4. **Esperado**: Error 403 o lista vacía

### **Test 4: Coordinador cambia estado**
1. Login como coordinador
2. PATCH /fichas/:id/estado con estado "EN_CIERRE"
3. **Esperado**: 200 OK con ficha actualizada

### **Test 5: Paginación**
1. GET /fichas?page=1&limit=5
2. Verificar que devuelve máximo 5 registros
3. GET /fichas?page=2&limit=5
4. Verificar que devuelve los siguientes

### **Test 6: Búsqueda**
1. GET /fichas?search=2654
2. **Esperado**: Solo fichas que contengan "2654" en el número

---

## 🛠️ COMANDOS ÚTILES

```bash
# Iniciar en modo desarrollo
npm run start:dev

# Ejecutar seeders
npm run seed

# Ver logs de TypeORM
# (ya está activado en development en app.module.ts)

# Generar migración (si es necesario)
npm run migration:generate -- -n CreateFichasTable

# Ejecutar migraciones
npm run migration:run
```

---

## 📊 ENUMS DEFINIDOS

### **JornadaFicha**:
```typescript
MAÑANA = 'MAÑANA'
TARDE = 'TARDE'
NOCHE = 'NOCHE'
MIXTA = 'MIXTA'
```

### **EstadoFicha**:
```typescript
ACTIVA = 'ACTIVA'
EN_CIERRE = 'EN_CIERRE'
FINALIZADA = 'FINALIZADA'
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Soft Delete**: El proyecto ya implementa soft-delete en BaseEntity. La eliminación de fichas usa `softRemove()`.

2. **Audit Trail**: Todos los campos `createdById`, `updatedById`, `deletedById` se capturan automáticamente del usuario autenticado.

3. **Relaciones Eager**: Las relaciones con Colegio, Programa e Instructor están configuradas como `eager: true`, lo que significa que se cargan automáticamente.

4. **QueryBuilder**: Para filtros complejos se usa QueryBuilder con `leftJoinAndSelect` para evitar N+1 queries.

5. **Validación Global**: El ValidationPipe global transforma y valida automáticamente todos los DTOs.

6. **Swagger**: Todos los endpoints están documentados con decoradores ApiOperation, ApiResponse, etc.

---

## 🎉 IMPLEMENTACIÓN COMPLETADA

✅ Entidad Ficha con TypeORM
✅ 4 DTOs con validaciones completas
✅ Service con toda la lógica de negocio
✅ Controller con 8 endpoints documentados
✅ Guards y decoradores de roles
✅ Filtros, búsqueda y paginación
✅ Agrupamiento jerárquico
✅ Seeder con 8 fichas de ejemplo
✅ Integración completa en AppModule
✅ Respeto total a convenciones del proyecto

**El módulo Fichas está listo para producción!** 🚀
