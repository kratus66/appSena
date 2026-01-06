# Módulo Disciplinario - Guía de Implementación

## ✅ Archivos Creados

### Entidades
- `src/disciplinario/entities/disciplinary-case.entity.ts` - Entidad principal de casos disciplinarios
- `src/disciplinario/entities/case-action.entity.ts` - Entidad de acciones/seguimiento

### DTOs
- `src/disciplinario/dto/create-case.dto.ts` - Crear caso
- `src/disciplinario/dto/update-case.dto.ts` - Actualizar caso
- `src/disciplinario/dto/update-case-estado.dto.ts` - Cambiar estado
- `src/disciplinario/dto/query-cases.dto.ts` - Filtros y paginación
- `src/disciplinario/dto/create-case-action.dto.ts` - Crear acción
- `src/disciplinario/dto/update-case-action.dto.ts` - Actualizar acción
- `src/disciplinario/dto/create-case-from-alert.dto.ts` - Crear desde alerta

### Lógica
- `src/disciplinario/disciplinario.service.ts` - Servicio con toda la lógica de negocio
- `src/disciplinario/disciplinario.controller.ts` - Controller con 9 endpoints
- `src/disciplinario/disciplinario.module.ts` - Módulo

### Configuración
- `src/app.module.ts` - Registrado DisciplinarioModule y entidades

## 📋 Endpoints Implementados

### Casos
1. **POST /api/disciplinario/casos** - Crear caso
2. **GET /api/disciplinario/casos** - Listar casos (con filtros y paginación)
3. **GET /api/disciplinario/casos/:id** - Detalle de caso
4. **PATCH /api/disciplinario/casos/:id** - Actualizar caso
5. **PATCH /api/disciplinario/casos/:id/estado** - Cambiar estado

### Acciones
6. **POST /api/disciplinario/casos/:id/acciones** - Agregar acción
7. **GET /api/disciplinario/casos/:id/acciones** - Listar acciones
8. **PATCH /api/disciplinario/acciones/:id** - Actualizar acción

### Integración
9. **POST /api/disciplinario/casos/desde-alerta** - Crear desde alerta de asistencia

## 🔐 Permisos Implementados

### INSTRUCTOR
- ✅ Puede crear casos SOLO para aprendices de sus fichas
- ✅ Puede ver casos de sus fichas
- ✅ Puede agregar acciones a casos de sus fichas
- ✅ Puede editar casos/acciones de sus fichas (si no están cerrados)
- ❌ NO puede cerrar casos (solo coordinadores/admin)

### COORDINADOR / ADMIN
- ✅ Puede ver todos los casos (con filtros)
- ✅ Puede crear casos para cualquier ficha
- ✅ Puede cambiar estados (incluyendo cerrar)
- ✅ Puede editar cualquier caso/acción

## 🎯 Características Clave

### Validaciones de Negocio
- ✅ Instructor solo accede a fichas suyas
- ✅ Aprendiz debe pertenecer a la ficha especificada
- ✅ Fecha de incidente no puede ser futura
- ✅ No se pueden editar casos cerrados
- ✅ No se pueden agregar acciones a casos cerrados
- ✅ Al cerrar caso, se requiere `cierreResumen`
- ✅ Al cerrar, se crea automáticamente acción tipo CIERRE
- ✅ Transiciones de estado validadas:
  - BORRADOR → ABIERTO
  - ABIERTO → SEGUIMIENTO o CERRADO
  - SEGUIMIENTO → CERRADO
  - CERRADO → (bloqueado)

### Filtros Disponibles
- fichaId
- aprendizId
- colegioId
- programaId
- estado (BORRADOR, ABIERTO, SEGUIMIENTO, CERRADO)
- tipo (CONVIVENCIA, ACADEMICO, ASISTENCIA, OTRO)
- gravedad (LEVE, MEDIA, ALTA)
- desde/hasta (rango de fechas)
- search (asunto, nombre, documento del aprendiz)
- page/limit (paginación)

## 📊 Modelo de Datos

### DisciplinaryCase
```typescript
{
  id: uuid,
  fichaId: uuid,
  aprendizId: uuid,
  tipo: 'CONVIVENCIA' | 'ACADEMICO' | 'ASISTENCIA' | 'OTRO',
  gravedad: 'LEVE' | 'MEDIA' | 'ALTA',
  asunto: string (max 200),
  descripcion: text,
  fechaIncidente: date,
  estado: 'BORRADOR' | 'ABIERTO' | 'SEGUIMIENTO' | 'CERRADO',
  assignedToId?: uuid,
  evidenciaUrl?: string,
  cierreResumen?: string,
  // Heredados de BaseEntity:
  createdById, updatedById, deletedById,
  createdAt, updatedAt, deletedAt
}
```

### CaseAction
```typescript
{
  id: uuid,
  caseId: uuid,
  tipo: 'LLAMADO_ATENCION' | 'COMPROMISO' | 'CITACION' | 'OBSERVACION' | 'CIERRE',
  descripcion: text,
  evidenciaUrl?: string,
  fechaCompromiso?: date,
  responsable?: string,
  // Heredados de BaseEntity:
  createdById, createdAt, updatedAt
}
```

## 🧪 Ejemplos de Requests

### 1. Crear Caso
```json
POST /api/disciplinario/casos
Authorization: Bearer {token}

{
  "fichaId": "uuid-ficha",
  "aprendizId": "uuid-aprendiz",
  "tipo": "CONVIVENCIA",
  "gravedad": "MEDIA",
  "asunto": "Comportamiento inadecuado en clase",
  "descripcion": "El aprendiz mostró comportamiento disruptivo...",
  "fechaIncidente": "2024-01-15",
  "evidenciaUrl": "https://storage.com/evidencia.pdf"
}
```

### 2. Listar Casos (con filtros)
```
GET /api/disciplinario/casos?estado=ABIERTO&gravedad=ALTA&page=1&limit=10
Authorization: Bearer {token}
```

### 3. Cambiar Estado a CERRADO
```json
PATCH /api/disciplinario/casos/:id/estado
Authorization: Bearer {token}

{
  "estado": "CERRADO",
  "cierreResumen": "Se aplicó el protocolo de convivencia y el aprendiz aceptó compromisos de mejora..."
}
```

### 4. Agregar Acción (Compromiso)
```json
POST /api/disciplinario/casos/:id/acciones
Authorization: Bearer {token}

{
  "tipo": "COMPROMISO",
  "descripcion": "El aprendiz se compromete a mejorar su comportamiento...",
  "fechaCompromiso": "2024-02-15",
  "responsable": "Aprendiz Juan Pérez",
  "evidenciaUrl": "https://storage.com/compromiso-firmado.pdf"
}
```

### 5. Crear Caso desde Alerta
```json
POST /api/disciplinario/casos/desde-alerta
Authorization: Bearer {token}

{
  "fichaId": "uuid-ficha",
  "aprendizId": "uuid-aprendiz",
  "criterioAlerta": "3_CONSECUTIVAS",
  "gravedad": "MEDIA",
  "descripcionAuto": "El aprendiz ha faltado 3 días consecutivos sin justificación"
}
```

## 🗄️ Base de Datos

Las tablas se crean automáticamente con TypeORM `synchronize: true`:

- `disciplinary_cases` - Casos disciplinarios
- `case_actions` - Acciones de seguimiento

**Índices recomendados** (ya incluidos en las entidades):
- `disciplinary_cases(ficha_id)`
- `disciplinary_cases(aprendiz_id)`
- `disciplinary_cases(estado)`
- `disciplinary_cases(fecha_incidente)`
- `case_actions(case_id)`

## 📝 Checklist de Pruebas

### Permisos
- [ ] Instructor puede crear caso para aprendiz de su ficha
- [ ] Instructor NO puede crear caso para aprendiz de otra ficha
- [ ] Instructor NO puede cerrar casos
- [ ] Coordinador/Admin pueden cerrar casos
- [ ] Instructor solo ve casos de sus fichas

### Validaciones
- [ ] No se puede crear caso con fecha futura
- [ ] No se puede editar caso cerrado
- [ ] No se pueden agregar acciones a caso cerrado
- [ ] Cerrar caso sin cierreResumen falla
- [ ] Transiciones de estado inválidas fallan
- [ ] Aprendiz debe pertenecer a la ficha

### Filtros
- [ ] Filtro por fichaId funciona
- [ ] Filtro por estado funciona
- [ ] Filtro por gravedad funciona
- [ ] Búsqueda por nombre/documento funciona
- [ ] Paginación funciona correctamente

### Integración
- [ ] Crear desde alerta genera caso tipo ASISTENCIA
- [ ] Caso desde alerta tiene asunto automático correcto

## 🚀 Estado

✅ **Backend compilado exitosamente**
✅ **Todos los endpoints registrados**
✅ **Swagger documentado**
✅ **Tablas creadas en PostgreSQL**

**Swagger**: http://localhost:3000/api/docs

## 📚 Próximos Pasos (Opcional)

1. **Seeder**: Crear datos de prueba (2 casos + 3 acciones)
2. **Tests**: Unitarios y E2E
3. **Frontend**: Integración con el módulo
4. **Reportes**: PDFs de casos disciplinarios
5. **Notificaciones**: Emails a acudientes

---

**Implementado por:** GitHub Copilot  
**Fecha:** 6 de enero de 2026
