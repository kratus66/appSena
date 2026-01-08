# Sprint 7: Métricas y Reportes - Guía de Implementación

## 📋 Resumen

Se ha implementado el módulo completo de **Reportes** para instructores y coordinadores con:

- ✅ 6 endpoints REST (5 JSON + 2 CSV)
- ✅ Dashboard de instructor
- ✅ Resumen por ficha
- ✅ Resumen por aprendiz
- ✅ Panel de coordinación (solo COORDINADOR/ADMIN)
- ✅ Exportación CSV (asistencia + alertas)
- ✅ Swagger completamente documentado
- ✅ Validaciones de permisos (RolesGuard)
- ✅ Cálculo de alertas de riesgo (3 consecutivas o 5 en mes)

---

## 📁 Archivos Creados

```
backend/src/reportes/
├── dto/
│   ├── query-rango-fechas.dto.ts          # DTO base para rangos de fechas
│   └── query-panel-coordinacion.dto.ts    # DTO para panel de coordinación
├── helpers/
│   └── fechas.helper.ts                   # Helpers para manejo de fechas y CSV
├── reportes.controller.ts                  # Controller con 6 endpoints
├── reportes.service.ts                     # Service con toda la lógica de métricas
└── reportes.module.ts                      # Módulo de reportes
```

**Archivos Modificados:**
- `app.module.ts` → Agregado `ReportesModule`
- `main.ts` → Agregado tag 'Reportes' en Swagger

---

## 🚀 Endpoints Disponibles

### Base URL: `/api/reportes`

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/instructor/dashboard` | Dashboard global del instructor | INSTRUCTOR, COORDINADOR, ADMIN |
| GET | `/fichas/:fichaId/resumen` | Resumen de una ficha específica | INSTRUCTOR, COORDINADOR, ADMIN |
| GET | `/aprendices/:aprendizId/resumen` | Resumen de un aprendiz | INSTRUCTOR, COORDINADOR, ADMIN |
| GET | `/coordinacion/panel` | Panel de coordinación global | COORDINADOR, ADMIN |
| GET | `/fichas/:fichaId/asistencia.csv` | Exportar asistencia a CSV | INSTRUCTOR, COORDINADOR, ADMIN |
| GET | `/fichas/:fichaId/alertas.csv` | Exportar alertas a CSV | INSTRUCTOR, COORDINADOR, ADMIN |

---

## 📖 Ejemplos de Uso

### 1. Dashboard del Instructor

**Request:**
```bash
GET /api/reportes/instructor/dashboard?month=2026-01
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalFichas": 3,
  "totalAprendices": 85,
  "totalSesiones": 42,
  "tasaAsistenciaPromedio": 87.5,
  "totalAlertasRiesgo": 5,
  "topFichasRiesgo": [
    {
      "fichaId": "uuid-123",
      "numeroFicha": "2654321",
      "programa": "Técnico en Cocina",
      "totalAlertas": 3
    },
    {
      "fichaId": "uuid-456",
      "numeroFicha": "2654322",
      "programa": "Técnico en Asistencia Administrativa",
      "totalAlertas": 2
    }
  ],
  "agendaProximaSemana": 4
}
```

---

### 2. Resumen por Ficha

**Request:**
```bash
GET /api/reportes/fichas/uuid-ficha/resumen?month=2026-01
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ficha": {
    "id": "uuid-ficha",
    "numeroFicha": "2654321",
    "programa": "Técnico en Cocina",
    "colegio": "Colegio Comercial Empresarial",
    "instructor": "Juan Pérez"
  },
  "totalAprendices": 32,
  "totalSesiones": 18,
  "conteo": {
    "presentes": 540,
    "ausenciasJustificadas": 12,
    "ausenciasNoJustificadas": 24
  },
  "porcentajeAsistencia": 93.75,
  "topAprendicesAusencias": [
    {
      "aprendizId": "uuid-aprendiz",
      "nombres": "Carlos",
      "apellidos": "Gómez",
      "documento": "123456789",
      "ausenciasNoJustificadas": 8
    }
  ],
  "alertas": [
    {
      "aprendizId": "uuid-aprendiz",
      "nombres": "Carlos",
      "apellidos": "Gómez",
      "documento": "123456789",
      "consecutivas": 3,
      "faltasMes": 8,
      "criterio": "3 consecutivas + 5 en el mes"
    }
  ]
}
```

---

### 3. Resumen por Aprendiz

**Request:**
```bash
GET /api/reportes/aprendices/uuid-aprendiz/resumen?month=2026-01
Authorization: Bearer <token>
```

**Response:**
```json
{
  "aprendiz": {
    "id": "uuid-aprendiz",
    "nombres": "Carlos",
    "apellidos": "Gómez",
    "documento": "123456789",
    "fichaId": "uuid-ficha",
    "numeroFicha": "2654321"
  },
  "asistencia": {
    "presentes": 15,
    "ausenciasJustificadas": 1,
    "ausenciasNoJustificadas": 3,
    "porcentajeAsistencia": 78.95
  },
  "historialUltimasSesiones": [
    {
      "fecha": "2026-01-08",
      "presente": true,
      "justificada": false,
      "motivo": null
    },
    {
      "fecha": "2026-01-07",
      "presente": false,
      "justificada": true,
      "motivo": "Cita médica"
    }
  ],
  "alertas": [
    {
      "aprendizId": "uuid-aprendiz",
      "nombres": "Carlos",
      "apellidos": "Gómez",
      "documento": "123456789",
      "consecutivas": 3,
      "faltasMes": 8,
      "criterio": "3 consecutivas + 5 en el mes"
    }
  ],
  "disciplinario": {
    "totalCasosAbiertos": 1,
    "ultimoCaso": {
      "id": "uuid-caso",
      "tipo": "ASISTENCIA",
      "gravedad": "MEDIA",
      "estado": "ABIERTO",
      "fechaIncidente": "2026-01-05"
    }
  },
  "ptc": {
    "id": "uuid-ptc",
    "estado": "VIGENTE",
    "fechaInicio": "2026-01-10",
    "fechaFin": "2026-02-10"
  },
  "proximosEventos": [
    {
      "id": "uuid-evento",
      "titulo": "Citación con acudiente",
      "tipo": "CITACION",
      "fechaInicio": "2026-01-12T14:00:00.000Z"
    }
  ]
}
```

---

### 4. Panel de Coordinación

**Request:**
```bash
GET /api/reportes/coordinacion/panel?month=2026-01&colegioId=uuid-colegio
Authorization: Bearer <token-coordinador>
```

**Response:**
```json
{
  "totalFichasActivas": 8,
  "totalAprendicesActivos": 270,
  "alertasPorCriterio": {
    "tresConsecutivas": 12,
    "cincoMes": 8,
    "ambas": 5
  },
  "rankingProgramas": [
    {
      "nombre": "Técnico en Cocina",
      "alertas": 8
    },
    {
      "nombre": "Técnico en Asistencia Administrativa",
      "alertas": 6
    }
  ],
  "rankingFichas": [
    {
      "fichaId": "uuid-ficha",
      "numeroFicha": "2654321",
      "programa": "Técnico en Cocina",
      "ausenciasNoJustificadas": 45
    }
  ]
}
```

---

### 5. Exportar Asistencia a CSV

**Request:**
```bash
GET /api/reportes/fichas/uuid-ficha/asistencia.csv?month=2026-01
Authorization: Bearer <token>
```

**Response (CSV):**
```csv
fecha,numeroFicha,aprendizDocumento,aprendizNombre,presente,justificada,motivo
2026-01-08,2654321,123456789,Carlos Gómez,true,false,
2026-01-08,2654321,987654321,Ana López,true,false,
2026-01-07,2654321,123456789,Carlos Gómez,false,true,Cita médica
```

---

### 6. Exportar Alertas a CSV

**Request:**
```bash
GET /api/reportes/fichas/uuid-ficha/alertas.csv?month=2026-01
Authorization: Bearer <token>
```

**Response (CSV):**
```csv
aprendizDocumento,aprendizNombre,consecutivasNoJustificadas,faltasMesNoJustificadas,criterio
123456789,Carlos Gómez,3,8,3 consecutivas + 5 en el mes
555444333,Pedro Ramírez,0,5,5 ausencias en el mes
```

---

## 🔒 Validación de Permisos

### Reglas Implementadas:

1. **Instructor:**
   - Solo ve datos de **sus propias fichas**
   - Validación: `ficha.instructorId === user.id`

2. **Coordinador/Admin:**
   - Acceso total con filtros opcionales
   - Panel de coordinación exclusivo

3. **Aprendiz:**
   - **NO** tiene acceso a reportes (solo INSTRUCTOR+)

---

## 📊 Cálculo de Alertas de Riesgo

### Criterios:

| Criterio | Condición |
|----------|-----------|
| **3 consecutivas** | 3 o más ausencias no justificadas seguidas |
| **5 en el mes** | 5 o más ausencias no justificadas en el mes |
| **Ambas** | Cumple ambos criterios simultáneamente |

### Implementación:

```typescript
// Ausencia no justificada: presente = false AND justificada = false
// Ausencia justificada: presente = false AND justificada = true
// Asistencia: presente = true
```

---

## 🧪 Checklist de Pruebas

### ✅ Tests Manuales (Swagger o Postman)

- [ ] **Dashboard Instructor:**
  - [ ] Sin parámetros (debe usar mes actual)
  - [ ] Con `month=2026-01`
  - [ ] Con `desde` y `hasta`
  - [ ] Verificar que instructor solo ve sus fichas

- [ ] **Resumen Ficha:**
  - [ ] Instructor puede ver su ficha
  - [ ] Instructor NO puede ver ficha de otro
  - [ ] Coordinador puede ver cualquier ficha
  - [ ] Datos correctos: % asistencia, top ausencias

- [ ] **Resumen Aprendiz:**
  - [ ] Historial de últimas 10 sesiones
  - [ ] Alertas calculadas correctamente
  - [ ] Casos disciplinarios y PTC vinculados
  - [ ] Próximos eventos de agenda

- [ ] **Panel Coordinación:**
  - [ ] Solo COORDINADOR/ADMIN puede acceder
  - [ ] Filtros por colegio funcionan
  - [ ] Filtros por programa funcionan
  - [ ] Ranking correcto

- [ ] **CSV Asistencia:**
  - [ ] Archivo descarga correctamente
  - [ ] Excel reconoce UTF-8 (BOM incluido)
  - [ ] Datos coinciden con registros

- [ ] **CSV Alertas:**
  - [ ] Solo aprendices con alertas
  - [ ] Criterios correctos

---

## 🛠️ Comandos para Probar

### 1. Compilar Backend
```bash
cd backend
npm run build
```

### 2. Ejecutar en Dev
```bash
npm run start:dev
```

### 3. Ver Swagger
```
http://localhost:3000/api/docs
```

### 4. Hacer Request con cURL

**Dashboard Instructor:**
```bash
curl -X GET "http://localhost:3000/api/reportes/instructor/dashboard?month=2026-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Exportar CSV:**
```bash
curl -X GET "http://localhost:3000/api/reportes/fichas/FICHA_ID/asistencia.csv?month=2026-01" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o asistencia.csv
```

---

## 📌 Notas Importantes

1. **Fechas en UTC:**
   - Todas las fechas se procesan en UTC
   - Frontend debe convertir a zona local

2. **CSV con BOM:**
   - Se incluye BOM (`\ufeff`) para que Excel reconozca UTF-8
   - Caracteres especiales se escapan correctamente

3. **Performance:**
   - Se usan `COUNT(CASE WHEN...)` para evitar múltiples queries
   - QueryBuilder con joins para evitar N+1
   - No se crearon vistas materializadas (MVP)

4. **Extensibilidad:**
   - Fácil agregar nuevos criterios de alerta
   - Fácil agregar nuevos formatos de export (PDF en Sprint 8)

---

## 🎯 Próximos Pasos (Sprint 8)

- [ ] Generar PDF de reportes
- [ ] Vistas materializadas para performance
- [ ] Caché de métricas
- [ ] Gráficas integradas en PDF
- [ ] Envío automático de reportes por email

---

**Estado:** ✅ Sprint 7 Completado
**Fecha:** 8 de enero de 2026
