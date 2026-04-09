# Frontend — Guía de Desarrollo

> Última actualización: Abril 2026  
> Framework: Next.js 16.1.1 (App Router)  
> Puerto desarrollo: 3001

---

## Estructura de Rutas

```
app/
├── layout.tsx              # Layout raíz (fuentes, globals.css)
├── page.tsx                # Redirige a /login
├── globals.css             # Estilos globales Tailwind
├── login/
│   └── page.tsx            # Formulario de login
├── register/
│   └── page.tsx            # Registro (limitado)
└── dashboard/
    ├── page.tsx            # Resumen / estadísticas generales
    ├── fichas/
    │   ├── page.tsx        # Listado de fichas ← MÓDULO PRINCIPAL
    │   └── [id]/
    │       └── page.tsx    # Detalle de ficha individual
    ├── aprendices/
    │   └── page.tsx
    ├── asistencias/
    │   └── page.tsx
    ├── disciplinario/
    │   └── page.tsx
    ├── agenda/
    │   └── page.tsx
    ├── ptc/
    │   └── page.tsx
    ├── colegios/
    │   └── page.tsx
    ├── users/
    │   └── page.tsx        # Solo accesible para rol admin
    └── stats/
        └── page.tsx
```

---

## Componentes Globales

### Layout

**`components/layout/dashboard-layout.tsx`**  
Envuelve todas las páginas del dashboard. Incluye:
- Sidebar de navegación
- Header con nombre de usuario y botón de logout
- Área de contenido principal

**`components/layout/sidebar.tsx`**  
Menú de navegación lateral. Los ítems se muestran condicionalmente según el rol del usuario leído desde `localStorage`.

| Ítem | Roles que lo ven |
|------|-----------------|
| Dashboard | admin, coordinador, instructor |
| Fichas | admin, coordinador, instructor |
| Aprendices | admin, coordinador, instructor |
| Asistencias | admin, coordinador, instructor |
| Disciplinario | admin, coordinador, instructor |
| Agenda | admin, coordinador, instructor |
| PTC | admin, coordinador, instructor |
| Colegios | admin, coordinador |
| Usuarios | admin |

> **Nota:** "Programas" fue eliminado del menú (la tabla y el backend existen, pero no se gestiona desde el frontend).

---

### Componentes UI (`components/ui/`)

| Componente | Descripción |
|-----------|-------------|
| `badge.tsx` | Etiquetas con variantes de color |
| `button.tsx` | Botón con variantes y tamaños |
| `card.tsx` | Contenedor con `Card`, `CardHeader`, `CardContent`, `CardTitle` |
| `input.tsx` | Input de texto estilizado |

**Variantes de Badge disponibles:**

| Variante | Color | Uso típico |
|----------|-------|-----------|
| `default` | Gris oscuro | Titulada |
| `success` | Verde | Activo, Lista para operación |
| `warning` | Amarillo | En cierre, Carga parcial, En alistamiento |
| `danger` | Rojo | Desertor, Sin asignar |
| `info` | Azul | Jornada |
| `secondary` | Gris claro | Complementaria, Finalizada |
| `outline` | Sin relleno | Sede por definir, neutro |

---

## Módulo de Fichas (Página Principal)

**Archivo:** `app/dashboard/fichas/page.tsx`

### Funcionalidades implementadas

**Cards con información por ficha:**
- Número de ficha y programa asignado
- `DependenciaBadge`: Articulación (warning), Titulada (default), Complementaria (secondary)
- `Badge` de jornada (info)
- Etiquetas de estado calculadas en tiempo real (`computeStateTags`)
- Conteo de aprendices vs cupo esperado
- Instructor y colegio/ambiente asignado

**Etiquetas de estado (`computeStateTags`):**

| Etiqueta | Condición | Color |
|----------|-----------|-------|
| `Sin aprendices` | aprendicesCount === 0 | danger |
| `Carga parcial` | 0 < aprendicesCount < cupoEsperado | warning |
| `Completa` | aprendicesCount >= cupoEsperado | success |
| `Sin instructor` | instructorId === null | danger |
| `Sin ambiente` | ambiente === null AND dep ≠ ARTICULACION | danger |
| `Lista para operación` | Todo completo | success |

**Estadísticas clickeables (filtro rápido):**
- Total de fichas
- Por dependencia: Articulación / Titulada / Complementaria

**Filtros:**
- Búsqueda por número de ficha
- Dependencia
- Jornada
- Estado

**Botón "Importar Excel" por card:**
- Abre selector de archivos (`.xlsx`, `.xls`)
- Envía a `POST /fichas/:id/importar-aprendices`
- Muestra resultado: creados, omitidos, errores (máx. 3 visibles)

**Botón eliminar (🗑️ solo admin):**
- Visible únicamente si el usuario logueado tiene `rol === 'admin'`
- Abre modal de confirmación con descripción del borrado lógico
- Llama `DELETE /fichas/:id?deletedById={userId}`

**Drawer "Nueva Ficha":**
- Se abre desde el botón "Nueva Ficha" del header
- Campos condicionales según dependencia:
  - `ARTICULACION` → muestra modalidad, localidad, colegio
  - Otros → muestra ambiente

---

## Módulo de Fichas (Página de Detalle)

**Archivo:** `app/dashboard/fichas/[id]/page.tsx`

### Funcionalidades

**Modo vista:**
- Header con badge de dependencia, estado y estado general
- Etiquetas de estado calculadas desde aprendices reales
- Tarjeta **Datos generales**: número, jornada, dependencia, tipo programa, cupo, fechas
- Tarjeta **Asignación**: instructor, programa, y condicional (colegio+modalidad+localidad para articulación, ambiente para otros)
- Tabla de **Aprendices** (obtiene desde `/aprendices/ficha/:id/aprendices`)
- Tarjeta **Trazabilidad**: createdAt, updatedAt, observaciones

**Modo edición (botón "Editar"):**
- Formulario inline con todos los campos de la ficha
- Selectores dinámicos: programas, colegios, instructores (cargados desde la API)
- Campos condicionales según dependencia
- Guarda via `PATCH /fichas/:id`
- Al guardar, recarga los datos del servidor

---

## Gestión del Usuario en el Frontend

El usuario autenticado se almacena en `localStorage` como:
```json
{ "id": "uuid", "nombre": "Admin SENA", "email": "admin@sena.edu.co", "rol": "admin" }
```

**Lectura del rol:**
```typescript
const userStr = localStorage.getItem('user');
const user = JSON.parse(userStr);
const rol = user.rol; // 'admin' | 'instructor' | 'coordinador' | 'aprendiz'
```

**Uso en componentes:**
```typescript
const [currentUserRole, setCurrentUserRole] = React.useState<string>('');
React.useEffect(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) setCurrentUserRole(JSON.parse(userStr).rol || '');
}, []);
// Luego en el render:
{currentUserRole === 'admin' && <button>Solo admin</button>}
```

---

## Cliente API (`lib/api.ts`)

Instancia de Axios preconfigurada:
- `baseURL`: `process.env.NEXT_PUBLIC_API_URL` (ej: `http://localhost:3000/api`)
- **Interceptor de request**: adjunta `Authorization: Bearer <token>` desde `localStorage`
- **Interceptor de response**: en error 401, limpia `localStorage` y redirige a `/login`

**Uso:**
```typescript
import api from '@/lib/api';

// GET con params
const res = await api.get('/fichas', { params: { page: 1, limit: 30 } });

// POST JSON
await api.post('/fichas', payload);

// POST multipart (Excel)
const formData = new FormData();
formData.append('file', file);
await api.post(`/fichas/${id}/importar-aprendices`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// PATCH
await api.patch(`/fichas/${id}`, payload);

// DELETE con query params
await api.delete(`/fichas/${id}`, { params: { deletedById: userId } });
```

---

## Utilidades (`lib/utils.ts`)

| Función | Descripción |
|---------|-------------|
| `cn(...classes)` | Combina clases Tailwind con `clsx` + `twMerge` |
| `formatDate(date)` | Formatea fecha en español (ej: "15 de enero de 2024") |
| `formatDateTime(date)` | Formatea fecha + hora en español |

---

## TypeScript — Interfaces principales (`types/index.ts`)

### `Ficha`
```typescript
interface Ficha {
  id: string;
  numeroFicha: string;
  jornada: 'MAÑANA' | 'TARDE' | 'NOCHE' | 'MIXTA';
  estado: 'ACTIVA' | 'EN_CIERRE' | 'FINALIZADA';
  dependencia: 'ARTICULACION' | 'TITULADA' | 'COMPLEMENTARIA';
  tipoProgramaFormacion?: string;
  cupoEsperado: number;
  modalidadArticulacion?: 'COMPARTIDA' | 'UNICA' | 'COLEGIO_PRIVADO';
  localidad?: string;
  ambiente?: string;
  observaciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
  colegioId?: string;
  programaId?: string;
  instructorId?: string;
  colegio?: Colegio;
  programa?: Programa;
  instructor?: User;
  aprendicesCount?: number;   // Calculado por el backend con loadRelationCountAndMap
  createdAt: string;
  updatedAt: string;
}
```

### `Aprendiz`
```typescript
interface Aprendiz {
  id: string;
  nombres: string;
  apellidos: string;
  tipoDocumento: 'CC' | 'TI' | 'CE' | 'PAS';
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  estadoAcademico: 'ACTIVO' | 'DESERTOR' | 'RETIRADO' | 'SUSPENDIDO';
  userId: string;
  fichaId: string;
  user?: User;
  ficha?: Ficha;
  createdAt: string;
  updatedAt: string;
}
```

---

## Convenciones de Estilo

- Color principal: `green-600` / `green-700` (botones primarios, focus rings)
- Textos: `gray-950` (títulos), `gray-700` (cuerpo), `gray-500` (secundarios)
- `font-semibold` para labels, `font-bold` para títulos de card
- Bordes: `border-gray-200` como estándar
- Hover de cards: `hover:shadow-lg transition-shadow`
- Botones de acción secundaria: `variant="outline"` con `border-green-600 text-green-700`
- Modales de confirmación: overlay negro 50% + card blanca centrada con animación

---

## Comandos de Desarrollo

```bash
# Desde /frontend
npm run dev       # Inicia en puerto 3001
npm run build     # Compila para producción
npm run start     # Inicia versión compilada
npm run lint      # Linting
```
