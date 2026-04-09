# Changelog — AppSena

> Historial de cambios ordenado cronológicamente.  
> Formato: [Fecha] — [Módulo afectado] — Descripción  
> Actualizar este archivo cada vez que se implemente una funcionalidad o se corrija un error relevante.

---

## [Abril 2026] — Sprint 6+

### Módulo de Fichas — Rediseño completo

#### Backend

**`backend/src/fichas/entities/ficha.entity.ts`**
- Agregados nuevos enums: `DependenciaFicha` (`ARTICULACION`, `TITULADA`, `COMPLEMENTARIA`) y `ModalidadArticulacion` (`COMPARTIDA`, `UNICA`, `COLEGIO_PRIVADO`)
- Nuevos campos en la tabla `fichas`:
  - `dependencia` (ENUM, default `TITULADA`)
  - `tipo_programa_formacion` (VARCHAR 200, nullable)
  - `cupo_esperado` (INT, default 30)
  - `modalidad_articulacion` (ENUM, nullable)
  - `localidad` (VARCHAR 200, nullable)
  - `ambiente` (VARCHAR 200, nullable)
  - `observaciones` (TEXT, nullable)
- Los campos `colegioId`, `programaId`, `instructorId` pasaron a `nullable: true`
- Agregada relación `OneToMany` hacia `Aprendiz` para habilitar el conteo de aprendices por ficha

**`backend/src/fichas/dto/create-ficha.dto.ts`**
- Reescrito completamente: solo `numeroFicha` y `jornada` son obligatorios
- Todos los demás campos son opcionales con validaciones de tipo

**`backend/src/fichas/dto/query-ficha.dto.ts`**
- Nuevo filtro: `dependencia?: DependenciaFicha`

**`backend/src/fichas/fichas.service.ts`**
- Importaciones añadidas: `xlsx`, `Aprendiz`, `User`
- Repositorios añadidos: `aprendizRepository`, `userRepository`
- `findAll`: agrega filtro `dependencia` y `loadRelationCountAndMap` para `aprendicesCount`
- `remove`: actualiza a soft delete con auditoría — acepta `deletedById` y lo persiste en `deleted_by_id`
- **Nuevo método** `importarAprendicesDesdeExcel(fichaId, fileBuffer)`:
  - Parsea Excel con librería `xlsx`
  - Acepta columnas flexibles (aliases)
  - Crea `User` + `Aprendiz` por cada fila válida
  - Omite aprendices ya existentes (por documento)
  - Resuelve conflictos de email generando `{documento}@sena.edu.co`
  - Retorna `{ creados, omitidos, errores[] }`

**`backend/src/fichas/fichas.controller.ts`**
- Importados: `UseInterceptors`, `UploadedFile`, `FileInterceptor`, decoradores de Swagger para multipart
- `DELETE /fichas/:id`: acepta `deletedById` como query param y lo pasa al servicio
- **Nuevo endpoint** `POST /fichas/:id/importar-aprendices`: recibe archivo Excel mediante `multipart/form-data`

**`backend/src/fichas/fichas.module.ts`**
- Añadidos `Aprendiz` y `User` a `TypeOrmModule.forFeature([...])`

**Dependencia instalada:**
- `xlsx@0.18.5` para parseo de archivos Excel en el backend

---

#### Frontend

**`frontend/app/dashboard/fichas/page.tsx`** — Reescrito completamente
- Estadísticas clickeables como filtro rápido (Total / Articulación / Titulada / Complementaria)
- `DependenciaBadge`: colores por dependencia (warning/default/secondary)
- `computeStateTags()`: calcula etiquetas de estado en tiempo real
- `StateTagBadge`: visualiza etiquetas con color según criticidad
- Filtros: búsqueda, dependencia, jornada, estado (server-side)
- Conteo `aprendicesCount` / cupo esperado por card
- Botón **"Ver detalle"** → navega a `/dashboard/fichas/:id`
- Botón **"Importar Excel"** por cada card con feedback de resultado (creados/omitidos/errores)
- Botón **eliminar (🗑️)** visible solo para `rol === 'admin'`
- Modal de confirmación de eliminación con descripción del borrado lógico
- Input oculto `ref` para selección de archivo Excel
- Drawer lateral "Nueva Ficha" con campos condicionales por dependencia
- El badge "Sin definir" fue renombrado a **"Sede: Por definir"**
- El badge "Configuración inicial" fue **eliminado** de las cards

**`frontend/app/dashboard/fichas/[id]/page.tsx`** — Creado desde cero
- Vista de detalle completa de una ficha
- Fetches en paralelo: ficha + aprendices de la ficha
- Header con badges (dependencia, estado, estado general) y etiquetas de estado
- Tarjeta Datos generales (número, jornada, cupo, tipo programa, fechas)
- Tarjeta Asignación (instructor, programa, y condicional articulación/ambiente)
- Tabla de aprendices con estado académico
- Tarjeta Trazabilidad (createdAt, updatedAt, observaciones)
- Botón "Editar" → modo formulario inline con todos los campos
- Selectores dinámicos de programas, colegios, instructores al abrir edición
- Guarda via `PATCH /fichas/:id` y recarga datos

**`frontend/types/index.ts`** — Interfaz `Ficha` actualizada
- Nuevos campos: `dependencia`, `tipoProgramaFormacion`, `cupoEsperado`, `modalidadArticulacion`, `localidad`, `ambiente`, `observaciones`, `aprendicesCount`
- `colegioId`, `programaId`, `instructorId`, `fechaInicio`, `fechaFin` pasaron a ser opcionales

**`frontend/components/layout/sidebar.tsx`**
- Eliminado ítem "Programas" del menú para roles `admin` y `coordinador`
- Eliminado import `BookOpen` no utilizado

---

### Corrección de CORS

**`backend/src/main.ts`**
- En modo desarrollo: `origin: true` para aceptar todas las solicitudes del frontend
- En producción: `origin: [FRONTEND_URL]` con URL explícita

---

## [Sprint anterior] — Funcionalidades base

- Autenticación JWT (login, guards por rol)
- CRUD de Usuarios, Colegios, Programas
- CRUD de Fichas (versión inicial, sin campos extendidos)
- CRUD de Aprendices con filtros
- Módulo de Asistencias (sesiones de clase + registro por aprendiz)
- Proceso Disciplinario (casos + acciones)
- Agenda / Calendario de eventos
- PTC (Plan de trabajo del cuatrimestre) con ítems y actas
- Notificaciones
- Reportes (exportables)
- Subida de archivos a AWS S3
- Seeders de datos iniciales
- Dashboard con estadísticas generales
- Sidebar con navegación por rol

---

## Pendientes / Próximos Pasos

> Actualizar esta sección al inicio de cada sprint

- [ ] Activar guards de autenticación en todos los endpoints del backend (producción)
- [ ] Verificar que `deletedById` se pase correctamente desde el JWT, no como query param
- [ ] Agregar botón "Agregar aprendiz individual" en la página de detalle de ficha
- [ ] Mejorar la página de asistencias para integrarse con el nuevo módulo de fichas
- [ ] Vista de reportes por ficha (asistencia, deserción)
- [ ] Exportar lista de aprendices a Excel desde la página de detalle
- [ ] Notificaciones en tiempo real al importar aprendices masivamente
- [ ] Paginación en la tabla de aprendices dentro del detalle de ficha
- [ ] Tests unitarios del servicio `importarAprendicesDesdeExcel`
