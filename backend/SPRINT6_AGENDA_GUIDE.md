# Sprint 6: Agenda + Recordatorios + Notificaciones (MVP)

## 📋 RESUMEN DE IMPLEMENTACIÓN

✅ **COMPLETADO**: Módulos de Agenda y Notificaciones implementados con arquitectura lista para producción.

### Módulos Creados
- **AgendaModule**: Gestión de eventos del calendario y recordatorios
- **NotificacionesModule**: Sistema de notificaciones in-app persistentes

### Entidades Creadas (3)
1. `CalendarEvent`: Eventos de agenda (clases, reuniones, citaciones, etc.)
2. `Reminder`: Recordatorios para eventos
3. `Notification`: Notificaciones in-app para usuarios

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

### Agenda Module
```
backend/src/agenda/
├── entities/
│   ├── calendar-event.entity.ts   # Entidad de eventos
│   └── reminder.entity.ts         # Entidad de recordatorios
├── dto/
│   ├── create-event.dto.ts        # DTO para crear eventos
│   ├── update-event.dto.ts        # DTO para actualizar eventos
│   ├── update-event-estado.dto.ts # DTO para cambiar estado
│   ├── query-events.dto.ts        # DTO para filtros y paginación
│   └── create-reminder.dto.ts     # DTO para crear recordatorios
├── agenda.controller.ts           # Endpoints de agenda
├── agenda.service.ts              # Lógica de negocio + permisos
└── agenda.module.ts               # Módulo de agenda
```

### Notificaciones Module
```
backend/src/notificaciones/
├── entities/
│   └── notification.entity.ts           # Entidad de notificaciones
├── dto/
│   └── query-notifications.dto.ts      # DTO para filtros
├── notificaciones.controller.ts        # Endpoints de notificaciones
├── notificaciones.service.ts           # Lógica de negocio
└── notificaciones.module.ts            # Módulo de notificaciones
```

### Seeder
```
backend/src/database/
└── agenda-seeder.ts                    # Datos de prueba
```

---

## 📊 MODELO DE DATOS

### CalendarEvent (calendar_events)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| titulo | VARCHAR(120) | Título del evento |
| descripcion | TEXT | Descripción detallada (opcional) |
| tipo | ENUM | CLASE, REUNION, CITACION, COMPROMISO, OTRO |
| fechaInicio | TIMESTAMP | Fecha/hora de inicio (UTC) |
| fechaFin | TIMESTAMP | Fecha/hora de fin (UTC, opcional) |
| allDay | BOOLEAN | Evento de día completo |
| estado | ENUM | PROGRAMADO, CANCELADO, COMPLETADO |
| prioridad | ENUM | BAJA, MEDIA, ALTA |
| fichaId | UUID | Ficha asociada (opcional) |
| aprendizId | UUID | Aprendiz asociado (opcional) |
| casoDisciplinarioId | UUID | Caso disciplinario (opcional) |
| ptcId | UUID | PTC asociado (opcional) |
| actaId | UUID | Acta asociada (opcional) |
| createdByUserId | UUID | Usuario creador |
| assignedToId | UUID | Usuario asignado (opcional) |

**Relaciones:**
- ManyToOne con Ficha, Aprendiz, DisciplinaryCase, Ptc, Acta, User
- OneToMany con Reminder

### Reminder (reminders)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| eventId | UUID | Evento asociado |
| remindAt | TIMESTAMP | Cuándo notificar (UTC) |
| canal | ENUM | IN_APP, EMAIL, SMS (MVP: solo IN_APP) |
| estado | ENUM | PENDIENTE, ENVIADO, CANCELADO |
| mensaje | TEXT | Mensaje personalizado (opcional) |
| sentAt | TIMESTAMP | Cuándo se envió (nullable) |

**Validación:** `remindAt <= event.fechaInicio`

### Notification (notifications)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| userId | UUID | Usuario destinatario |
| titulo | VARCHAR(120) | Título de la notificación |
| mensaje | TEXT | Contenido del mensaje |
| tipo | ENUM | RECORDATORIO, EVENTO_CREADO, EVENTO_CANCELADO, EVENTO_ACTUALIZADO, OTRO |
| entityType | VARCHAR(50) | Tipo de entidad relacionada (opcional) |
| entityId | UUID | ID de entidad relacionada (opcional) |
| read | BOOLEAN | Leída o no (default: false) |
| readAt | TIMESTAMP | Cuándo se leyó (nullable) |

---

## 🔌 ENDPOINTS API

### Base Path: `/api/agenda`

#### **EVENTOS**

**1. Crear Evento**
```http
POST /api/agenda/eventos
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Body:
{
  "titulo": "Reunión de seguimiento",
  "descripcion": "Revisión de avances",
  "tipo": "REUNION",
  "fechaInicio": "2026-01-15T14:00:00Z",
  "fechaFin": "2026-01-15T15:00:00Z",
  "allDay": false,
  "prioridad": "ALTA",
  "fichaId": "uuid-ficha",
  "aprendizId": "uuid-aprendiz",
  "assignedToId": "uuid-user"
}

Response 201:
{
  "id": "uuid-evento",
  "titulo": "Reunión de seguimiento",
  "tipo": "REUNION",
  "estado": "PROGRAMADO",
  ...
}
```

**Validaciones:**
- INSTRUCTOR solo puede crear en fichas suyas
- Si viene aprendizId + fichaId: valida que aprendiz pertenece a la ficha
- Si solo viene aprendizId: deriva la ficha automáticamente
- fechaFin >= fechaInicio (si existe)
- Crea notificación si hay assignedToId

---

**2. Listar Eventos (con filtros)**
```http
GET /api/agenda/eventos?desde=2026-01-01T00:00:00Z&hasta=2026-01-31T23:59:59Z&fichaId=uuid&page=1&limit=10
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Query Params:
- desde (required): fecha inicio rango (ISO 8601)
- hasta (required): fecha fin rango (ISO 8601)
- fichaId (optional): filtrar por ficha
- aprendizId (optional): filtrar por aprendiz
- tipo (optional): CLASE | REUNION | CITACION | COMPROMISO | OTRO
- estado (optional): PROGRAMADO | CANCELADO | COMPLETADO
- search (optional): búsqueda en título/descripción
- page (optional, default: 1)
- limit (optional, default: 10, max: 100)

Response 200:
{
  "data": [ /* eventos */ ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

**Permisos INSTRUCTOR:**
- Solo ve eventos de sus fichas O creados por él O asignados a él

---

**3. Mis Eventos**
```http
GET /api/agenda/eventos/mios?desde=2026-01-01T00:00:00Z&hasta=2026-01-31T23:59:59Z
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Response: igual que endpoint anterior
Filtro automático: createdByUserId = user.id OR assignedToId = user.id
```

---

**4. Detalle de Evento**
```http
GET /api/agenda/eventos/:id
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Response 200:
{
  "id": "uuid",
  "titulo": "...",
  "ficha": { /* datos de ficha */ },
  "aprendiz": { /* datos de aprendiz */ },
  "createdByUser": { /* datos de usuario */ },
  "assignedTo": { /* datos de usuario asignado */ },
  "recordatorios": [ /* lista de recordatorios */ ],
  ...
}
```

---

**5. Actualizar Evento**
```http
PATCH /api/agenda/eventos/:id
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Body: (todos los campos opcionales)
{
  "titulo": "Título actualizado",
  "descripcion": "...",
  "fechaInicio": "...",
  "estado": "COMPLETADO",
  ...
}

Response 200: evento actualizado
```

**Validaciones:**
- Permisos: solo creador, asignado o instructor de la ficha
- Si cambia assignedToId: crea notificación al nuevo usuario

---

**6. Cambiar Estado de Evento**
```http
PATCH /api/agenda/eventos/:id/estado
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Body:
{
  "estado": "CANCELADO"
}

Response 200: evento actualizado
```

**Efecto especial:**
- Si estado = CANCELADO: marca todos los recordatorios pendientes como CANCELADO
- Crea notificación de cancelación si hay assignedToId

---

#### **RECORDATORIOS**

**7. Crear Recordatorio**
```http
POST /api/agenda/eventos/:id/recordatorios
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Body:
{
  "remindAt": "2026-01-15T12:00:00Z",
  "canal": "IN_APP",
  "mensaje": "Recuerda tu reunión en 2 horas"
}

Response 201:
{
  "id": "uuid-reminder",
  "eventId": "uuid-evento",
  "remindAt": "2026-01-15T12:00:00Z",
  "estado": "PENDIENTE",
  ...
}
```

**Validación:** `remindAt <= event.fechaInicio`

---

**8. Listar Recordatorios de un Evento**
```http
GET /api/agenda/eventos/:id/recordatorios
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Response 200: [ /* lista de recordatorios ordenados por remindAt */ ]
```

---

**9. Cancelar Recordatorio**
```http
PATCH /api/agenda/recordatorios/:id/cancelar
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Response 200: recordatorio con estado CANCELADO
```

---

**10. Marcar Recordatorio como Enviado (MVP - Manual)**
```http
PATCH /api/agenda/recordatorios/:id/marcar-enviado
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN

Response 200:
{
  "id": "uuid",
  "estado": "ENVIADO",
  "sentAt": "2026-01-15T12:00:05Z",
  ...
}
```

**Efecto:**
1. Marca recordatorio como ENVIADO
2. Crea notificación in-app para el usuario destinatario:
   - Si evento tiene assignedToId: ese usuario
   - Si no: createdByUserId
3. Tipo: RECORDATORIO

**Nota:** En producción, esto lo haría un cron job automáticamente.

---

### Base Path: `/api/notificaciones`

**11. Listar Notificaciones del Usuario**
```http
GET /api/notificaciones?read=false&page=1&limit=20
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN, APRENDIZ

Query Params:
- read (optional): true | false (filtrar por leídas/no leídas)
- page (optional, default: 1)
- limit (optional, default: 20, max: 100)

Response 200:
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Recordatorio: Reunión en 2 horas",
      "mensaje": "Tienes una reunión programada...",
      "tipo": "RECORDATORIO",
      "entityType": "CalendarEvent",
      "entityId": "uuid-evento",
      "read": false,
      "createdAt": "2026-01-15T12:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1,
  "unreadCount": 5
}
```

**Filtro automático:** solo notificaciones del usuario autenticado

---

**12. Marcar Notificación como Leída**
```http
PATCH /api/notificaciones/:id/leida
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN, APRENDIZ

Response 200:
{
  "id": "uuid",
  "read": true,
  "readAt": "2026-01-15T14:30:00Z",
  ...
}
```

---

**13. Marcar Todas como Leídas**
```http
PATCH /api/notificaciones/marcar-todas-leidas
Authorization: Bearer <token>
Roles: INSTRUCTOR, COORDINADOR, ADMIN, APRENDIZ

Response 200:
{
  "affected": 5
}
```

---

## 🔒 LÓGICA DE PERMISOS

### INSTRUCTOR
**Crear eventos:**
- Solo en fichas donde `ficha.instructorId == user.id`
- Si viene solo aprendizId, deriva la ficha y valida

**Ver eventos:**
- Eventos donde:
  - `createdByUserId == user.id` OR
  - `assignedToId == user.id` OR
  - `ficha.instructorId == user.id`

**Editar/Cambiar estado:**
- Solo si cumple condiciones de "Ver eventos"

### COORDINADOR
**Crear eventos:**
- En fichas de su colegio/programa (actualmente permisivo, ajustar según negocio)

**Ver eventos:**
- Según filtros aplicados (puede ver todos si es ADMIN-like)

### ADMIN
- Acceso total sin restricciones

---

## 🔗 INTEGRACIÓN: Recordatorio → Notificación

**Flujo Automático:**

1. Usuario crea recordatorio con `remindAt = "2026-01-15T12:00:00Z"`
2. Recordatorio queda en estado `PENDIENTE`
3. (Manual MVP) Se llama a `PATCH /api/agenda/recordatorios/:id/marcar-enviado`
4. Service cambia estado a `ENVIADO` y establece `sentAt = now()`
5. Service crea notificación in-app:
   ```typescript
   {
     userId: evento.assignedToId || evento.createdByUserId,
     titulo: `Recordatorio: ${evento.titulo}`,
     mensaje: recordatorio.mensaje || `Tienes un evento...`,
     tipo: 'RECORDATORIO',
     entityType: 'CalendarEvent',
     entityId: evento.id
   }
   ```
6. Usuario ve notificación en `GET /api/notificaciones`

**Futuro (Producción):**
- Worker/Cron job cada 1 minuto busca recordatorios pendientes donde `remindAt <= now()`
- Llama internamente al método `markReminderAsSent()`
- Notificaciones se crean automáticamente

---

## 🌱 SEEDERS DE PRUEBA

Ejecutar seeders:
```bash
cd backend
npm run seed
```

**Datos creados:**
1. **Evento 1:** Reunión de seguimiento (hoy + 2 horas)
   - 1 recordatorio: 15 min antes
2. **Evento 2:** Clase de TypeScript (mañana 2pm)
   - 2 recordatorios: 1 día antes y 30 min antes
3. **Evento 3:** Citación con acudiente (próxima semana)

**Total:** 3 eventos + 3 recordatorios

---

## ✅ CHECKLIST DE PRUEBAS

### Eventos
- [ ] Crear evento con fichaId (INSTRUCTOR debe ser dueño de la ficha)
- [ ] Crear evento solo con aprendizId (ficha se deriva automáticamente)
- [ ] Crear evento con assignedToId (verificar notificación creada)
- [ ] Validar fechaFin >= fechaInicio
- [ ] Listar eventos con filtros (desde/hasta, fichaId, tipo, estado, search)
- [ ] INSTRUCTOR solo ve sus eventos o de sus fichas
- [ ] Endpoint /mios retorna eventos creados/asignados al usuario
- [ ] Detalle de evento incluye recordatorios
- [ ] Actualizar evento (validar permisos)
- [ ] Cambiar estado a CANCELADO (verificar recordatorios cancelados + notificación)

### Recordatorios
- [ ] Crear recordatorio (validar remindAt <= fechaInicio)
- [ ] Listar recordatorios de un evento
- [ ] Cancelar recordatorio
- [ ] Marcar como enviado (verificar notificación creada)

### Notificaciones
- [ ] Listar notificaciones (solo del usuario autenticado)
- [ ] Filtrar por read=false
- [ ] Marcar una notificación como leída
- [ ] Marcar todas como leídas
- [ ] Verificar unreadCount en respuesta

### Permisos
- [ ] INSTRUCTOR no puede crear en ficha ajena (403)
- [ ] INSTRUCTOR no puede ver evento de ficha ajena (403)
- [ ] COORDINADOR puede crear en fichas de su ámbito
- [ ] ADMIN tiene acceso total

### Integraciones
- [ ] Al crear evento con assignedToId: se crea notificación EVENTO_CREADO
- [ ] Al cancelar evento: se crea notificación EVENTO_CANCELADO
- [ ] Al marcar recordatorio enviado: se crea notificación RECORDATORIO

---

## 📦 EJEMPLOS DE REQUESTS (Postman/Thunder Client)

### 1. Crear Evento
```json
POST http://localhost:3000/api/agenda/eventos
Authorization: Bearer <instructor-token>
Content-Type: application/json

{
  "titulo": "Reunión de seguimiento académico",
  "descripcion": "Revisión de notas del primer trimestre",
  "tipo": "REUNION",
  "fechaInicio": "2026-01-20T14:00:00Z",
  "fechaFin": "2026-01-20T15:00:00Z",
  "allDay": false,
  "prioridad": "ALTA",
  "fichaId": "uuid-ficha-del-instructor",
  "aprendizId": "uuid-aprendiz",
  "assignedToId": "uuid-coordinador"
}
```

### 2. Listar Eventos de Enero
```
GET http://localhost:3000/api/agenda/eventos?desde=2026-01-01T00:00:00Z&hasta=2026-01-31T23:59:59Z&page=1&limit=10
Authorization: Bearer <instructor-token>
```

### 3. Crear Recordatorio (2 horas antes)
```json
POST http://localhost:3000/api/agenda/eventos/<evento-id>/recordatorios
Authorization: Bearer <instructor-token>
Content-Type: application/json

{
  "remindAt": "2026-01-20T12:00:00Z",
  "canal": "IN_APP",
  "mensaje": "Recuerda tu reunión de seguimiento en 2 horas"
}
```

### 4. Marcar Recordatorio como Enviado (Simulación de Cron)
```
PATCH http://localhost:3000/api/agenda/recordatorios/<recordatorio-id>/marcar-enviado
Authorization: Bearer <admin-token>
```

### 5. Listar Notificaciones No Leídas
```
GET http://localhost:3000/api/notificaciones?read=false
Authorization: Bearer <user-token>
```

---

## 🚀 PRÓXIMOS PASOS (Post-MVP)

1. **Worker/Cron Job:**
   - Implementar worker que ejecute cada 1 min
   - Busca recordatorios donde `estado=PENDIENTE AND remindAt <= now()`
   - Marca como enviado automáticamente

2. **Canales EMAIL/SMS:**
   - Integrar servicio de emails (SendGrid, AWS SES)
   - Integrar servicio de SMS (Twilio, AWS SNS)
   - Modificar lógica para enviar según canal

3. **WebSockets para Notificaciones:**
   - Implementar Gateway con Socket.IO
   - Push de notificaciones en tiempo real
   - Badge de contador no leídas en frontend

4. **Filtros Avanzados:**
   - Filtrar por múltiples fichas
   - Filtrar por rango de prioridad
   - Agrupación por semana/mes

5. **Calendario Visual:**
   - Frontend: vista de calendario mensual
   - Drag & drop para reprogramar eventos
   - Sincronización con Google Calendar

6. **Adjuntos en Eventos:**
   - Permitir subir archivos (agenda, materiales)
   - Usar UploadService existente

---

## 📝 NOTAS TÉCNICAS

### Timezones
- **Backend:** Guarda todo en UTC (`timestamp` de TypeORM)
- **Frontend:** Debe enviar fechas en ISO 8601 (UTC o con timezone)
- **Conversión:** El frontend convierte a zona local del usuario

### Paginación
- Default: 10 items/página (eventos), 20 items/página (notificaciones)
- Máximo: 100 items/página

### Soft Delete
- Todas las entidades heredan de `BaseEntity` (soft delete con `deletedAt`)

### Validaciones
- class-validator en todos los DTOs
- Swagger documentation completa
- Mensajes de error en español

---

## 🎯 ARQUITECTURA LISTA PARA ESCALABILIDAD

✅ **Separación de concerns:** Services manejan lógica, Controllers solo routing
✅ **Permisos centralizados:** Validaciones en service layer
✅ **DTOs tipados:** Validación automática con class-validator
✅ **Paginación:** Implementada desde el inicio
✅ **Soft delete:** Auditoría completa de cambios
✅ **Relaciones lazy:** OneToMany no carga automáticamente (evita N+1)
✅ **QueryBuilder:** Consultas optimizadas con joins explícitos

---

**Implementado por:** GitHub Copilot  
**Fecha:** 7 de enero de 2026  
**Versión:** 1.0.0 (MVP)  
**Estado:** ✅ Listo para pruebas
