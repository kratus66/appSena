# SPRINT 3 - MÓDULO ASISTENCIAS + ALERTAS AUTOMÁTICAS

## ✅ IMPLEMENTACIÓN COMPLETA

### 📋 RESUMEN

Se ha implementado exitosamente el Sprint 3 que incluye:

- **Gestión de Sesiones de Clase**: Crear y consultar sesiones de clase por ficha
- **Registro de Asistencias**: Marcar presentes/ausentes para cada sesión
- **Justificación de Ausencias**: Justificar faltas con motivo y evidencia
- **Alertas Automáticas**: Detectar aprendices en riesgo de deserción
- **Reportes Básicos**: Resúmenes de asistencia por ficha

---

## 📁 ARCHIVOS CREADOS

### Entidades
- `backend/src/asistencias/entities/clase-sesion.entity.ts`
- `backend/src/asistencias/entities/asistencia.entity.ts`

### DTOs
- `backend/src/asistencias/dto/create-sesion.dto.ts`
- `backend/src/asistencias/dto/query-sesiones.dto.ts`
- `backend/src/asistencias/dto/registrar-asistencia.dto.ts`
- `backend/src/asistencias/dto/justificar-asistencia.dto.ts`
- `backend/src/asistencias/dto/query-alertas.dto.ts`

### Servicios y Controladores
- `backend/src/asistencias/asistencias.service.ts`
- `backend/src/asistencias/asistencias.controller.ts`
- `backend/src/asistencias/asistencias.module.ts`

### Archivos Modificados
- `backend/src/app.module.ts` (integración del nuevo módulo)

### Scripts de Prueba
- `test-asistencias.ps1` (script completo de pruebas automatizadas)

---

## 🗄️ MODELO DE DATOS

### Entidad: ClaseSesion

Representa una sesión de clase para una ficha en una fecha específica.

```typescript
{
  id: uuid,
  fichaId: uuid,                    // FK a Fichas
  fecha: date,                      // Fecha de la sesión
  tema?: string,                    // Tema tratado (opcional)
  observaciones?: string,           // Observaciones (opcional)
  createdByUserId?: uuid,          // Usuario que creó la sesión
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Restricción única**: No se permite duplicar sesión para la misma ficha y fecha (`fichaId` + `fecha`).

### Entidad: Asistencia

Representa el registro de asistencia de un aprendiz en una sesión.

```typescript
{
  id: uuid,
  sesionId: uuid,                   // FK a ClaseSesion
  aprendizId: uuid,                 // FK a Aprendices
  presente: boolean,                // true = presente, false = ausente
  justificada: boolean,             // true = ausencia justificada
  motivoJustificacion?: string,     // Motivo de justificación
  evidenciaUrl?: string,            // URL de evidencia (opcional)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Restricción única**: No se permite duplicar asistencia para la misma sesión y aprendiz (`sesionId` + `aprendizId`).

**Reglas de negocio**:
- Si `presente = true`, entonces `justificada = false` y se limpian `motivoJustificacion` y `evidenciaUrl`.
- Si `presente = false` y `justificada = true`, entonces `motivoJustificacion` es **obligatorio**.

---

## 🔌 ENDPOINTS DISPONIBLES

Todos los endpoints requieren autenticación (`Bearer Token`).

### 1️⃣ Crear Sesión de Clase

**POST** `/api/asistencias/sesiones`

Crea una nueva sesión de clase para una ficha. Automáticamente precarga registros de asistencia (ausentes por defecto) para todos los aprendices de la ficha.

**Permisos**: `ADMIN`, `INSTRUCTOR` (solo sus fichas), `COORDINADOR`

**Body**:
```json
{
  "fichaId": "uuid-de-la-ficha",
  "fecha": "2024-01-15",
  "tema": "Introducción a TypeORM",
  "observaciones": "Primera sesión del módulo"
}
```

**Respuesta** (201):
```json
{
  "id": "uuid-sesion",
  "fichaId": "uuid-ficha",
  "fecha": "2024-01-15",
  "tema": "Introducción a TypeORM",
  "observaciones": "Primera sesión del módulo",
  "createdByUserId": "uuid-usuario",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "ficha": { ... }
}
```

**Errores**:
- `404`: Ficha no encontrada
- `403`: No tienes permisos para crear sesiones en esta ficha
- `409`: Ya existe una sesión para esta ficha en la fecha especificada

---

### 2️⃣ Listar Sesiones

**GET** `/api/asistencias/sesiones?fichaId=uuid&desde=2024-01-01&hasta=2024-12-31&page=1&limit=10`

Lista sesiones con filtros opcionales y paginación.

**Permisos**: `ADMIN`, `INSTRUCTOR` (solo sus fichas), `COORDINADOR`

**Query Params**:
- `fichaId` (opcional): Filtrar por ficha
- `desde` (opcional): Fecha desde (YYYY-MM-DD)
- `hasta` (opcional): Fecha hasta (YYYY-MM-DD)
- `page` (opcional, default: 1): Número de página
- `limit` (opcional, default: 10): Registros por página

**Respuesta** (200):
```json
{
  "data": [
    {
      "id": "uuid-sesion",
      "fichaId": "uuid-ficha",
      "fecha": "2024-01-15",
      "tema": "Introducción a TypeORM",
      "ficha": { ... }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

### 3️⃣ Detalle de Sesión

**GET** `/api/asistencias/sesiones/:id`

Obtiene el detalle de una sesión incluyendo resumen de asistencias (presentes/ausentes).

**Permisos**: `ADMIN`, `INSTRUCTOR` (solo sus fichas), `COORDINADOR`

**Respuesta** (200):
```json
{
  "id": "uuid-sesion",
  "fichaId": "uuid-ficha",
  "fecha": "2024-01-15",
  "tema": "Introducción a TypeORM",
  "observaciones": "Primera sesión",
  "ficha": { ... },
  "resumen": {
    "totalAprendices": 30,
    "presentes": 25,
    "ausentes": 5
  }
}
```

**Errores**:
- `404`: Sesión no encontrada
- `403`: No tienes permisos para ver esta sesión

---

### 4️⃣ Registrar Asistencias

**POST** `/api/asistencias/sesiones/:id/registrar`

Registra o actualiza asistencias de múltiples aprendices para una sesión.

**Permisos**: `ADMIN`, `INSTRUCTOR` (solo sus fichas), `COORDINADOR`

**Body**:
```json
{
  "asistencias": [
    {
      "aprendizId": "uuid-aprendiz-1",
      "presente": true
    },
    {
      "aprendizId": "uuid-aprendiz-2",
      "presente": false
    }
  ]
}
```

**Respuesta** (200):
```json
{
  "message": "Asistencias registradas exitosamente",
  "registradas": 2
}
```

**Errores**:
- `404`: Sesión no encontrada
- `403`: No tienes permisos para registrar asistencias en esta sesión
- `400`: Uno o más aprendices no pertenecen a la ficha de la sesión

---

### 5️⃣ Justificar Ausencia

**PATCH** `/api/asistencias/asistencias/:id/justificar`

Justifica la ausencia de un aprendiz proporcionando un motivo y opcionalmente una evidencia.

**Permisos**: `ADMIN`, `INSTRUCTOR` (solo sus fichas), `COORDINADOR`

**Body**:
```json
{
  "justificada": true,
  "motivoJustificacion": "Cita médica programada",
  "evidenciaUrl": "https://example.com/certificado-medico.pdf"
}
```

**Respuesta** (200):
```json
{
  "id": "uuid-asistencia",
  "sesionId": "uuid-sesion",
  "aprendizId": "uuid-aprendiz",
  "presente": false,
  "justificada": true,
  "motivoJustificacion": "Cita médica programada",
  "evidenciaUrl": "https://example.com/certificado-medico.pdf",
  "updatedAt": "2024-01-15T15:30:00.000Z"
}
```

**Errores**:
- `404`: Asistencia no encontrada
- `403`: No tienes permisos para justificar esta asistencia
- `400`: No se puede justificar una asistencia si el aprendiz estuvo presente

---

### 6️⃣ Alertas de Riesgo de Deserción

**GET** `/api/asistencias/fichas/:fichaId/alertas?month=2024-01&includeDetails=false`

Retorna alertas de aprendices en riesgo de deserción según criterios:
- **3 faltas consecutivas** sin justificar
- **5 faltas en el mes** sin justificar

**Permisos**: `ADMIN`, `INSTRUCTOR` (solo sus fichas), `COORDINADOR`

**Query Params**:
- `month` (opcional, default: mes actual): Mes en formato YYYY-MM
- `includeDetails` (opcional, default: false): Incluir detalles de sesiones

**Respuesta** (200):
```json
{
  "fichaId": "uuid-ficha",
  "numeroFicha": "2654321",
  "mes": "2024-01",
  "alertas": [
    {
      "aprendizId": "uuid-aprendiz",
      "nombres": "Juan Carlos",
      "apellidos": "Pérez González",
      "documento": "1234567890",
      "consecutivasNoJustificadas": 3,
      "faltasMesNoJustificadas": 6,
      "criterio": "AMBAS",
      "sesionesDetalle": [...]  // Solo si includeDetails=true
    }
  ]
}
```

**Criterios posibles**:
- `"3_CONSECUTIVAS"`: Solo cumple el criterio de 3 consecutivas
- `"5_MES"`: Solo cumple el criterio de 5 en el mes
- `"AMBAS"`: Cumple ambos criterios

**Errores**:
- `404`: Ficha no encontrada
- `403`: No tienes permisos para ver alertas de esta ficha

---

### 7️⃣ Resumen de Asistencias por Ficha

**GET** `/api/asistencias/fichas/:fichaId/resumen?desde=2024-01-01&hasta=2024-12-31`

Retorna estadísticas resumidas de asistencias para una ficha.

**Permisos**: `ADMIN`, `INSTRUCTOR` (solo sus fichas), `COORDINADOR`

**Query Params**:
- `desde` (opcional): Fecha desde (YYYY-MM-DD)
- `hasta` (opcional): Fecha hasta (YYYY-MM-DD)

**Respuesta** (200):
```json
{
  "fichaId": "uuid-ficha",
  "numeroFicha": "2654321",
  "totalSesiones": 45,
  "totalAprendices": 30,
  "porcentajeAsistenciaPromedio": 82.5,
  "topAusencias": [
    {
      "aprendizId": "uuid-aprendiz",
      "nombres": "Juan",
      "apellidos": "Pérez",
      "documento": "123456",
      "totalAusencias": 12
    }
  ]
}
```

**Errores**:
- `404`: Ficha no encontrada
- `403`: No tienes permisos para ver el resumen de esta ficha

---

## 🔒 SISTEMA DE PERMISOS

### INSTRUCTOR
- ✅ Crear sesiones **SOLO** para fichas donde `ficha.instructorId == user.id`
- ✅ Registrar asistencias **SOLO** para sesiones de sus fichas
- ✅ Justificar ausencias **SOLO** para asistencias de sus fichas
- ✅ Ver alertas/resúmenes **SOLO** de sus fichas

### COORDINADOR
- ✅ Ver sesiones/alertas por filtros (colegio/programa/ficha)
- ✅ Puede justificar/cambiar registros si se permite
- ✅ Acceso amplio para supervisión

### ADMIN
- ✅ Acceso total a todas las funcionalidades
- ✅ Sin restricciones de fichas

---

## 🧪 CÓMO PROBAR

### Opción 1: Swagger UI (Recomendado)

1. Levanta el servidor: `cd backend && npm run start:dev`
2. Abre: http://localhost:3000/api/docs
3. Haz login en `/api/auth/login` y copia el token
4. Haz clic en "Authorize" (candado arriba) y pega el token
5. Prueba los endpoints de Asistencias

### Opción 2: Script PowerShell

```powershell
# Desde la raíz del proyecto
.\test-asistencias.ps1
```

El script ejecuta automáticamente:
1. Login con credenciales admin
2. Obtiene fichas disponibles
3. Crea sesión de clase
4. Obtiene aprendices de la ficha
5. Registra asistencias
6. Obtiene detalle de sesión
7. Justifica una ausencia
8. Obtiene resumen de ficha
9. Obtiene alertas de riesgo
10. Lista todas las sesiones

### Opción 3: cURL / Postman

Ejemplos:

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sena.edu.co","password":"Admin123"}'

# Guarda el token recibido

# 2. Crear sesión
curl -X POST http://localhost:3000/api/asistencias/sesiones \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fichaId":"uuid","fecha":"2024-01-15","tema":"Intro NestJS"}'

# 3. Listar sesiones
curl -X GET "http://localhost:3000/api/asistencias/sesiones?limit=10" \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## ✅ CHECKLIST DE VALIDACIONES

### Entidades
- ✅ Restricción única en `ClaseSesion`: (`fichaId` + `fecha`)
- ✅ Restricción única en `Asistencia`: (`sesionId` + `aprendizId`)
- ✅ Campos obligatorios y opcionales correctamente definidos
- ✅ Relaciones ManyToOne configuradas con FK y eager loading controlado

### DTOs
- ✅ Validaciones con `class-validator` en todos los DTOs
- ✅ Decoradores de Swagger (`@ApiProperty`) para documentación
- ✅ Validaciones condicionales (ej: `motivoJustificacion` obligatorio si `justificada=true`)
- ✅ Transformaciones automáticas (`@Type(() => Number)` para query params)

### Service
- ✅ Validación de existencia de Ficha antes de crear sesión
- ✅ Validación de permisos: instructor solo puede trabajar con sus fichas
- ✅ QueryBuilder para evitar N+1 en listados
- ✅ Cálculos correctos de alertas (3 consecutivas, 5 del mes)
- ✅ Lógica de precarga de asistencias al crear sesión
- ✅ Limpieza de justificación cuando se marca presente

### Controller
- ✅ Guards de autenticación (`JwtAuthGuard`) en todos los endpoints
- ✅ Guards de roles (`RolesGuard`) configurados
- ✅ Decoradores `@Roles()` especificando permisos requeridos
- ✅ Documentación completa con Swagger
- ✅ HTTP Status correctos (201 para POST, 200 para GET/PATCH)

### Errores
- ✅ `NotFoundException` cuando no existe ficha/sesión/asistencia/aprendiz
- ✅ `ForbiddenException` cuando no hay permisos
- ✅ `ConflictException` cuando se intenta duplicar sesión
- ✅ `BadRequestException` para reglas de negocio (justificar estando presente, etc.)

---

## 📊 EJEMPLOS DE USO

### Caso 1: Instructor toma asistencia diaria

1. **Crear sesión para hoy**:
   ```json
   POST /api/asistencias/sesiones
   {
     "fichaId": "mi-ficha-id",
     "fecha": "2024-01-15",
     "tema": "Programación Orientada a Objetos"
   }
   ```

2. **Registrar asistencias**:
   ```json
   POST /api/asistencias/sesiones/sesion-id/registrar
   {
     "asistencias": [
       { "aprendizId": "aprendiz-1", "presente": true },
       { "aprendizId": "aprendiz-2", "presente": false },
       { "aprendizId": "aprendiz-3", "presente": true }
     ]
   }
   ```

3. **Justificar ausencia de aprendiz-2**:
   ```json
   PATCH /api/asistencias/asistencias/asistencia-id/justificar
   {
     "justificada": true,
     "motivoJustificacion": "Cita médica",
     "evidenciaUrl": "https://drive.google.com/file/d/..."
   }
   ```

### Caso 2: Coordinador revisa alertas mensuales

1. **Ver alertas del mes**:
   ```bash
   GET /api/asistencias/fichas/ficha-id/alertas?month=2024-01&includeDetails=true
   ```

2. **Ver resumen general**:
   ```bash
   GET /api/asistencias/fichas/ficha-id/resumen?desde=2024-01-01&hasta=2024-01-31
   ```

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

1. **Frontend**: Crear interfaces para:
   - Dashboard de instructor con calendario de sesiones
   - Formulario de toma de asistencia (checklist)
   - Vista de alertas en tiempo real
   - Gráficos de tendencias de asistencia

2. **Mejoras Backend**:
   - Notificaciones automáticas cuando se genera una alerta
   - Envío de emails a acudientes cuando hay alertas
   - Exportar reportes a Excel/PDF
   - Seeder para datos de prueba de sesiones y asistencias

3. **Optimizaciones**:
   - Caché de alertas (Redis)
   - Jobs programados para cálculo nocturno de alertas
   - Índices adicionales en BD para queries frecuentes

---

## 📖 DOCUMENTACIÓN ADICIONAL

- **Swagger**: http://localhost:3000/api/docs
- **Arquitectura**: Sigue el patrón de los módulos existentes (Fichas, Aprendices)
- **TypeORM**: Las tablas se crean automáticamente con `synchronize: true` en desarrollo

---

## 🐛 TROUBLESHOOTING

**Error: "No se puede establecer una conexión"**
- Verifica que el servidor esté corriendo: `cd backend && npm run start:dev`
- Verifica que la base de datos PostgreSQL esté activa

**Error: "Ficha con ID X no encontrada"**
- Asegúrate de que existan fichas en la BD
- Ejecuta el seeder si es necesario: `npm run seed`

**Error: "No tienes permisos"**
- Verifica que el usuario tenga el rol correcto (INSTRUCTOR/COORDINADOR/ADMIN)
- Los instructores solo pueden trabajar con fichas asignadas a ellos

**Error: "Ya existe una sesión para esta ficha en la fecha"**
- No se permiten sesiones duplicadas
- Verifica que no hayas creado ya una sesión para esa ficha y fecha

---

## ✨ CONCLUSIÓN

El Sprint 3 está **100% funcional** y listo para usar. Incluye:

- ✅ Todas las entidades creadas con relaciones correctas
- ✅ DTOs con validaciones completas
- ✅ Service con lógica de negocio implementada
- ✅ Controller con endpoints documentados
- ✅ Sistema de permisos funcionando
- ✅ Alertas automáticas calculando correctamente
- ✅ Integrado en AppModule
- ✅ Documentación completa en Swagger
- ✅ Scripts de prueba automatizados

**¡Puedes empezar a usar el módulo de inmediato!** 🚀
