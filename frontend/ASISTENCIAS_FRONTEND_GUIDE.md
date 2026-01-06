# Guía del Módulo de Asistencias - Frontend

## 📁 Estructura de Archivos

```
frontend/
├── app/dashboard/asistencias/
│   ├── page.tsx                    # Dashboard principal de asistencias
│   ├── nueva-sesion/
│   │   └── page.tsx               # Formulario para crear nueva sesión
│   ├── registrar/[id]/
│   │   └── page.tsx               # Interfaz para registrar asistencias
│   ├── alertas/
│   │   └── page.tsx               # Visualización de alertas de riesgo
│   ├── resumen/
│   │   └── page.tsx               # Resumen y estadísticas
│   └── sesion/[id]/
│       └── page.tsx               # Detalle de sesión individual
├── types/index.ts                  # TypeScript interfaces
└── components/layout/sidebar.tsx   # Menú actualizado con Asistencias
```

## 🎯 Páginas Implementadas

### 1. Dashboard Principal (`/dashboard/asistencias`)

**Funcionalidades:**
- Lista de sesiones de clase con paginación
- Selector de ficha para filtrar sesiones
- Resumen de alertas (estudiantes en riesgo)
- Acciones rápidas: crear sesión, ver alertas, ver resumen

**Componentes:**
- Selector de ficha (dropdown)
- Tarjetas de sesión con información clave
- Estadísticas de alertas
- Botones de navegación

**Estado Local:**
```typescript
const [sesiones, setSesiones] = useState<ClaseSesion[]>([]);
const [fichas, setFichas] = useState<any[]>([]);
const [fichaId, setFichaId] = useState<string>('');
const [alertas, setAlertas] = useState<AlertasResponse | null>(null);
const [page, setPage] = useState(1);
const [limit] = useState(10);
```

**API Calls:**
- `GET /asistencias/sesiones?fichaId={id}&page={page}&limit={limit}`
- `GET /asistencias/fichas/{id}/alertas`
- `GET /fichas`

---

### 2. Nueva Sesión (`/dashboard/asistencias/nueva-sesion`)

**Funcionalidades:**
- Formulario para crear sesión de clase
- Validación de fecha (no puede ser futura)
- Selección de ficha
- Campos: tema, observaciones

**Validaciones:**
- Ficha requerida
- Fecha requerida y no puede ser futura
- Tema requerido (mínimo 5 caracteres)

**API Call:**
- `POST /asistencias/sesiones`
  ```json
  {
    "fichaId": "uuid",
    "fecha": "2024-01-15",
    "tema": "Introducción a NestJS",
    "observaciones": "Clase práctica con ejemplos"
  }
  ```

**Comportamiento:**
- Al crear exitosamente, pre-carga automáticamente las asistencias de todos los aprendices de la ficha
- Redirige al dashboard de asistencias

---

### 3. Registrar Asistencias (`/dashboard/asistencias/registrar/[id]`)

**Funcionalidades:**
- Interfaz interactiva con checkboxes para marcar presentes/ausentes
- Búsqueda de aprendices por nombre o documento
- Botones para marcar todos presentes/ausentes
- Estadísticas en tiempo real
- Indicadores visuales (verde = presente, gris = ausente)

**Estado Local:**
```typescript
const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
const [search, setSearch] = useState('');
const [hasChanges, setHasChanges] = useState(false);
```

**API Calls:**
- `GET /asistencias/sesiones/{id}` - Obtener sesión con asistencias
- `POST /asistencias/sesiones/{id}/registrar` - Guardar cambios
  ```json
  {
    "asistencias": [
      { "aprendizId": "uuid", "presente": true },
      { "aprendizId": "uuid", "presente": false }
    ]
  }
  ```

**Características:**
- Filtrado en tiempo real de aprendices
- Contador de presentes/ausentes
- Confirmación antes de salir si hay cambios sin guardar

---

### 4. Alertas de Riesgo (`/dashboard/asistencias/alertas`)

**Funcionalidades:**
- Lista de estudiantes con riesgo de deserción
- Filtrado por ficha
- Selector de mes para análisis histórico
- Badges de criterios (3 consecutivas, 5 en el mes, ambas)
- Historial de sesiones con indicadores visuales
- Acciones recomendadas

**Criterios de Alerta:**
1. **3_CONSECUTIVAS**: 3 o más faltas consecutivas
2. **5_MES**: 5 o más faltas en el mes
3. **AMBAS**: Cumple ambos criterios (riesgo crítico)

**API Call:**
- `GET /asistencias/fichas/{fichaId}/alertas?mes={mes}`

**Componentes:**
```typescript
// Badge de criterio
{alerta.criterios.includes('AMBAS') && (
  <Badge className="bg-red-100 text-red-800">⚠️ CRÍTICO</Badge>
)}
```

**Información Mostrada:**
- Nombre y documento del aprendiz
- Total de faltas
- Faltas consecutivas
- Porcentaje de asistencia
- Historial de sesiones del mes
- Acciones recomendadas (contactar acudiente, plan de mejora)

---

### 5. Resumen y Estadísticas (`/dashboard/asistencias/resumen`)

**Funcionalidades:**
- Estadísticas generales de asistencia
- Filtrado por ficha y rango de fechas
- Tabla de top 10 aprendices con más faltas
- Indicadores de riesgo

**Métricas:**
- Total de sesiones
- Total de asistencias registradas
- Promedio de asistencia (%)
- Aprendices en riesgo

**API Call:**
- `GET /asistencias/fichas/{fichaId}/resumen?fechaInicio={inicio}&fechaFin={fin}`

**Visualización:**
```typescript
// Barra de progreso de asistencia
<div className="w-full bg-gray-200 rounded-full h-4">
  <div 
    className={`h-4 rounded-full ${getColor(porcentaje)}`}
    style={{ width: `${porcentaje}%` }}
  />
</div>
```

---

### 6. Detalle de Sesión (`/dashboard/asistencias/sesion/[id]`)

**Funcionalidades:**
- Información completa de la sesión (fecha, tema, observaciones)
- Estadísticas de la sesión (presentes, ausentes, justificadas)
- Lista completa de asistencias
- Opción para justificar ausencias
- Modal de justificación con motivo y evidencia
- Enlace para editar asistencias

**API Calls:**
- `GET /asistencias/sesiones/{id}` - Detalle completo
- `PATCH /asistencias/asistencias/{id}/justificar` - Justificar ausencia
  ```json
  {
    "motivo": "Cita médica",
    "evidenciaUrl": "https://example.com/certificado.pdf"
  }
  ```

**Modal de Justificación:**
```typescript
<JustifyModal
  asistencia={selectedAsistencia}
  onClose={() => setShowJustifyModal(false)}
  onSuccess={() => fetchSesion()}
/>
```

---

## 🎨 Componentes UI Utilizados

### Card
```typescript
import { Card } from '@/components/ui/card';

<Card className="p-6">
  {/* Contenido */}
</Card>
```

### Button
```typescript
import { Button } from '@/components/ui/button';

<Button variant="outline" size="sm">
  Acción
</Button>
```

### Badge
```typescript
import { Badge } from '@/components/ui/badge';

<Badge className="bg-green-100 text-green-800">
  Presente
</Badge>
```

---

## 🔐 Autenticación

Todas las peticiones incluyen automáticamente el token JWT:

```typescript
// lib/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 🎭 Roles y Permisos

### ADMIN
- Acceso completo a todas las funcionalidades
- Puede crear, editar y eliminar sesiones
- Puede ver alertas de todas las fichas
- Puede justificar asistencias

### INSTRUCTOR
- Puede crear sesiones para sus fichas asignadas
- Puede registrar asistencias de sus fichas
- Puede ver alertas de sus fichas
- Puede justificar asistencias

### COORDINADOR
- Puede ver todas las sesiones
- Puede ver alertas de todas las fichas
- Puede generar reportes
- Puede justificar asistencias

---

## 📊 Tipos TypeScript

```typescript
export interface ClaseSesion {
  id: string;
  fichaId: string;
  instructorId: string;
  fecha: string;
  tema: string;
  observaciones?: string;
  ficha?: Ficha;
  instructor?: User;
  asistencias?: Asistencia[];
  createdAt: string;
  updatedAt: string;
}

export interface Asistencia {
  id: string;
  sesionId: string;
  aprendizId: string;
  presente: boolean;
  justificada: boolean;
  motivo?: string;
  evidenciaUrl?: string;
  aprendiz?: Aprendiz;
  sesion?: ClaseSesion;
  createdAt: string;
  updatedAt: string;
}

export interface AlertaRiesgo {
  aprendiz: Aprendiz;
  faltasTotales: number;
  faltasConsecutivas: number;
  porcentajeAsistencia: number;
  criterios: ('3_CONSECUTIVAS' | '5_MES' | 'AMBAS')[];
  sesionesDelMes: {
    fecha: string;
    tema: string;
    presente: boolean;
  }[];
}

export interface AlertasResponse {
  fichaId: string;
  mes: string;
  alertas: AlertaRiesgo[];
  totalEstudiantesEnRiesgo: number;
  totalSesionesDelMes: number;
}

export interface ResumenAsistencia {
  fichaId: string;
  fichaNumero: string;
  totalSesiones: number;
  totalAsistenciasRegistradas: number;
  porcentajeAsistenciaPromedio: number;
  aprendicesConMasFaltas: {
    aprendiz: Aprendiz;
    totalFaltas: number;
    totalSesiones: number;
    porcentajeAsistencia: number;
    enRiesgo: boolean;
  }[];
}
```

---

## 🚀 Flujo de Trabajo Típico

### 1. Instructor crea una sesión
1. Navega a `/dashboard/asistencias`
2. Click en "Nueva Sesión"
3. Selecciona ficha, fecha y tema
4. Submit → Backend crea sesión y pre-carga asistencias

### 2. Instructor registra asistencias
1. Desde el dashboard, click en "Registrar Asistencia"
2. Marca checkboxes de aprendices presentes
3. Usa búsqueda para encontrar aprendices específicos
4. Click en "Guardar" → Actualiza registros

### 3. Coordinador revisa alertas
1. Navega a `/dashboard/asistencias/alertas`
2. Selecciona ficha y mes
3. Ve lista de estudiantes en riesgo
4. Revisa criterios y historial
5. Toma acciones recomendadas

### 4. Justificar ausencia
1. Desde detalle de sesión
2. Click en "Justificar" junto al aprendiz ausente
3. Completa motivo y evidencia
4. Submit → Marca asistencia como justificada

---

## 🎨 Paleta de Colores

```css
/* Estados de Asistencia */
.presente: bg-green-100 text-green-800
.ausente: bg-red-100 text-red-800
.justificada: bg-yellow-100 text-yellow-800

/* Niveles de Alerta */
.riesgo-bajo: bg-yellow-100 text-yellow-800
.riesgo-alto: bg-orange-100 text-orange-800
.riesgo-critico: bg-red-100 text-red-800

/* Porcentajes de Asistencia */
>= 90%: text-green-600 / bg-green-500
>= 70%: text-yellow-600 / bg-yellow-500
< 70%: text-red-600 / bg-red-500
```

---

## 📱 Responsive Design

Todas las páginas están optimizadas para:
- **Desktop**: Grid de 2-4 columnas
- **Tablet**: Grid de 2 columnas
- **Mobile**: Grid de 1 columna

```typescript
// Ejemplo de grid responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Contenido */}
</div>
```

---

## ⚡ Optimizaciones

### 1. Debouncing en búsqueda
```typescript
const filteredAsistencias = asistencias.filter(a =>
  a.aprendiz?.nombre.toLowerCase().includes(search.toLowerCase()) ||
  a.aprendiz?.numeroDocumento.includes(search)
);
```

### 2. Paginación
```typescript
const [page, setPage] = useState(1);
const [limit] = useState(10);
// API: ?page=1&limit=10
```

### 3. Loading states
```typescript
const [loading, setLoading] = useState(true);
if (loading) return <p>Cargando...</p>;
```

---

## 🔍 Testing Manual

### Crear Sesión
```bash
1. Login como instructor
2. Ir a /dashboard/asistencias/nueva-sesion
3. Seleccionar ficha
4. Fecha: Hoy
5. Tema: "Test de asistencias"
6. Submit
✅ Debe redirigir al dashboard
✅ Debe aparecer la nueva sesión
```

### Registrar Asistencias
```bash
1. Click en "Registrar Asistencia" de una sesión
2. Marcar algunos checkboxes
3. Click "Guardar"
✅ Debe mostrar mensaje de éxito
✅ Estadísticas deben actualizarse
```

### Ver Alertas
```bash
1. Ir a /dashboard/asistencias/alertas
2. Seleccionar ficha con estudiantes
3. Verificar que aparecen alertas si hay >= 3 faltas consecutivas o >= 5 faltas en el mes
✅ Debe mostrar badges de criterios
✅ Debe mostrar historial de sesiones
```

---

## 🐛 Manejo de Errores

```typescript
try {
  const response = await api.post('/asistencias/sesiones', data);
  alert('Sesión creada exitosamente');
  router.push('/dashboard/asistencias');
} catch (error: any) {
  console.error('Error:', error);
  alert(error.response?.data?.message || 'Error al crear sesión');
}
```

---

## 📝 Notas Importantes

1. **Fechas**: Usar formato ISO (YYYY-MM-DD) para compatibilidad
2. **Tokens**: El token se guarda en localStorage y se incluye automáticamente
3. **Validaciones**: Usar validaciones tanto en frontend como backend
4. **UX**: Mostrar loading states y mensajes de confirmación
5. **Navegación**: Usar `useRouter()` para navegación programática
6. **Estado**: Refrescar datos después de operaciones CRUD

---

## 🔗 Enlaces Útiles

- **Backend API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Frontend**: http://localhost:3001 (o el puerto configurado)

---

## 📞 Soporte

Para problemas o dudas sobre el módulo de asistencias:
1. Revisar console del navegador (F12)
2. Revisar logs del backend
3. Verificar que el token JWT sea válido
4. Confirmar que el usuario tiene los permisos necesarios
