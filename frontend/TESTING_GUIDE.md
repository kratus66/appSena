# Guía de Pruebas del Frontend

## Estado de la Conexión Frontend-Backend

✅ **Todos los módulos del frontend están conectados al backend**

## Módulos Implementados

### 1. **Dashboard Principal** (`/dashboard`)
- **Ruta:** `/dashboard`
- **Características:**
  - Vista general con estadísticas
  - Gráficos de aprendices por mes
  - Estado académico de aprendices
  - Fichas por programa
- **Conexión API:**
  - `GET /api/aprendices` - Total de aprendices
  - `GET /api/fichas` - Total de fichas
  - `GET /api/colegios` - Total de colegios
  - `GET /api/users` - Total de usuarios

### 2. **Gestión de Aprendices** (`/dashboard/aprendices`)
- **Ruta:** `/dashboard/aprendices`
- **Características:**
  - Listado paginado de aprendices
  - Búsqueda por nombre o documento
  - Filtro por estado académico
  - Estados: ACTIVO, SUSPENDIDO, RETIRADO, DESERTOR
- **Conexión API:**
  - `GET /api/aprendices?page=1&limit=10&search=...&estadoAcademico=...`

### 3. **Gestión de Fichas** (`/dashboard/fichas`)
- **Ruta:** `/dashboard/fichas`
- **Características:**
  - Listado paginado de fichas
  - Búsqueda por número de ficha
  - Filtro por estado (ACTIVA, INACTIVA, FINALIZADA, CANCELADA)
  - Muestra jornada, colegio y programa
- **Conexión API:**
  - `GET /api/fichas?page=1&limit=10&search=...&estado=...`

### 4. **Gestión de Colegios** (`/dashboard/colegios`)
- **Ruta:** `/dashboard/colegios`
- **Características:**
  - Vista en tarjetas de colegios
  - Búsqueda por nombre, ciudad o NIT
  - Información de contacto
  - Estado activo/inactivo
- **Conexión API:**
  - `GET /api/colegios?page=1&limit=12&search=...`

### 5. **Gestión de Programas** (`/dashboard/programas`)
- **Ruta:** `/dashboard/programas`
- **Características:**
  - Vista en tarjetas de programas
  - Búsqueda por nombre o código
  - Filtro por nivel (TECNICO, TECNOLOGO, ESPECIALIZACION)
  - Duración y horas totales
- **Conexión API:**
  - `GET /api/programas?page=1&limit=12&search=...&nivelFormacion=...`

### 6. **Gestión de Usuarios** (`/dashboard/users`)
- **Ruta:** `/dashboard/users`
- **Características:**
  - Tabla de usuarios
  - Búsqueda por nombre, email o documento
  - Filtro por rol (admin, instructor, coordinador, aprendiz, acudiente)
  - Estado activo/inactivo
- **Conexión API:**
  - `GET /api/users?page=1&limit=10&search=...&rol=...`

### 7. **Estadísticas** (`/dashboard/stats`)
- **Ruta:** `/dashboard/stats`
- **Características:**
  - Gráficos y reportes adicionales
- **Conexión API:** Similar al dashboard principal

### 8. **Login** (`/login`)
- **Ruta:** `/login`
- **Características:**
  - Autenticación con email y password
  - Almacenamiento de token JWT
  - Redirección al dashboard
- **Conexión API:**
  - `POST /api/auth/login`

## Configuración del API

**Archivo:** `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Cliente API:** `frontend/lib/api.ts`
- Interceptor para agregar token Bearer automáticamente
- Manejo de errores 401 (redirección al login)
- Headers automáticos de Content-Type

## Cómo Probar

### 1. Iniciar el Backend
```powershell
cd backend
npm run start:dev
```
El backend corre en: `http://localhost:3000`

### 2. Iniciar el Frontend
```powershell
cd frontend
npm run dev
```
El frontend corre en: `http://localhost:3001`

### 3. Login
1. Ir a `http://localhost:3001/login`
2. Usar credenciales del archivo `backend/USERS_CREDENTIALS.md`
   - Admin: admin@sena.edu.co / Admin123*
   - Instructor: instructor@sena.edu.co / Instructor123*

### 4. Navegación
Una vez logueado, el sidebar permite navegar a:
- Dashboard Principal
- Usuarios
- Aprendices
- Fichas
- Colegios
- Programas
- Estadísticas

## Funcionalidades de Cada Módulo

### Búsqueda
- Todos los módulos tienen búsqueda en tiempo real
- Se activa mientras escribes en el campo de búsqueda

### Paginación
- Todos los listados están paginados
- Botones de navegación anterior/siguiente
- Indicador de página actual

### Filtros
- Aprendices: Por estado académico
- Fichas: Por estado
- Programas: Por nivel de formación
- Usuarios: Por rol

### Badges de Estado
- **Success (Verde):** Activo, Activa
- **Warning (Amarillo):** Suspendido, Inactiva
- **Danger (Rojo):** Retirado, Desertor, Cancelada
- **Info (Azul):** Estados informativos
- **Default (Gris):** Estados neutros

## Endpoints del Backend Conectados

| Módulo | Método | Endpoint | Parámetros |
|--------|--------|----------|------------|
| Auth | POST | /api/auth/login | email, password |
| Aprendices | GET | /api/aprendices | page, limit, search, estadoAcademico |
| Fichas | GET | /api/fichas | page, limit, search, estado |
| Colegios | GET | /api/colegios | page, limit, search |
| Programas | GET | /api/programas | page, limit, search, nivelFormacion |
| Usuarios | GET | /api/users | page, limit, search, rol |

## Verificación de Conexión

Para verificar que todo está conectado:

1. **Ver Network en DevTools:**
   - Abrir DevTools (F12)
   - Ir a la pestaña Network
   - Navegar por los módulos
   - Ver que las peticiones a `http://localhost:3000/api/*` se completan con éxito

2. **Ver Console:**
   - Si hay errores de conexión, aparecerán en la consola
   - Los errores se loguean con `console.error`

3. **Verificar Token:**
   - Ir a Application > Local Storage
   - Verificar que existe `token` y `user`

## Próximos Pasos (Opcional)

Para mejorar las pruebas, puedes agregar:

1. **Formularios de Creación:** Botones "Nuevo" para crear registros
2. **Formularios de Edición:** Botones "Editar" funcionales
3. **Eliminación:** Botones "Eliminar" con confirmación
4. **Validaciones:** Feedback visual de errores
5. **Notificaciones:** Toast para éxito/error de operaciones
6. **Carga de datos:** Indicadores visuales mientras carga

## Troubleshooting

### Error: "Network Error"
- Verificar que el backend esté corriendo
- Verificar que la URL en `.env.local` sea correcta

### Error: 401 Unauthorized
- El token expiró o es inválido
- Hacer logout y login de nuevo

### Error: CORS
- El backend tiene CORS habilitado
- Si persiste, verificar configuración en `backend/src/main.ts`

### Datos no aparecen
- Verificar que el backend tenga datos (ejecutar seeders)
- Ver la consola del backend para errores
- Verificar la conexión a PostgreSQL

## Resumen

✅ Todos los módulos del frontend están conectados
✅ Todas las rutas están implementadas
✅ La autenticación funciona correctamente
✅ Los filtros y búsqueda funcionan
✅ La paginación está implementada
✅ El manejo de errores está implementado

El sistema está listo para hacer pruebas end-to-end de todos los módulos.
