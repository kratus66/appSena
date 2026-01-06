# Credenciales de Usuarios de Prueba

## 👤 Usuarios Creados

### Administrador
- **Email:** admin@sena.edu.co
- **Password:** Admin123!
- **Rol:** Admin
- **Documento:** 1234567890
- **Teléfono:** 3001111111

### Instructor
- **Email:** instructor@sena.edu.co
- **Password:** Instructor123!
- **Rol:** Instructor
- **Documento:** 9876543210
- **Teléfono:** 3002222222

### Coordinador
- **Email:** coordinador@sena.edu.co
- **Password:** Coordinador123!
- **Rol:** Coordinador
- **Documento:** 5555555555
- **Teléfono:** 3003333333

## 🔐 Cómo usar la autenticación

### 1. Login
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@sena.edu.co",
  "password": "Admin123!"
}
```

**Respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "nombre": "Administrador del Sistema",
    "email": "admin@sena.edu.co",
    "rol": "admin",
    "fotoPerfil": null
  }
}
```

### 2. Usar el token en las peticiones
Agrega el header en todas las peticiones protegidas:
```
Authorization: Bearer {access_token}
```

### 3. Probar en Swagger
1. Ve a http://localhost:3000/api/docs
2. Haz clic en "Authorize" (candado verde arriba a la derecha)
3. Ingresa: `Bearer {tu_token}`
4. Haz clic en "Authorize"
5. Ahora puedes probar todos los endpoints protegidos

## 📝 Endpoints Disponibles

### Autenticación
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users` - Listar usuarios (requiere auth)
- `GET /api/users/:id` - Obtener usuario por ID
- `POST /api/users` - Crear nuevo usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `PATCH /api/users/:id/toggle-activo` - Activar/Desactivar usuario
- `DELETE /api/users/:id` - Eliminar usuario (soft delete)
- `POST /api/users/:id/restore` - Restaurar usuario eliminado

### Colegios & Programas
Todos los endpoints existentes ahora soportan auditoría automática.

## 🔍 Sistema de Auditoría

Cada registro ahora incluye automáticamente:

- `createdAt` - Cuándo se creó
- `createdBy` - Quién lo creó
- `updatedAt` - Cuándo se actualizó por última vez
- `updatedBy` - Quién lo actualizó
- `deletedAt` - Cuándo se eliminó (soft delete)
- `deletedBy` - Quién lo eliminó

## 🎯 Roles y Permisos

### Admin
- Acceso total al sistema
- Puede crear, editar y eliminar usuarios
- Puede gestionar todos los recursos

### Coordinador
- Puede gestionar fichas, aprendices y asistencias
- Acceso a reportes y métricas
- No puede gestionar usuarios

### Instructor
- Puede gestionar sus propias fichas
- Puede registrar asistencias
- Puede crear planes de trabajo y actas

> **Nota:** Los permisos específicos por rol se implementarán usando el decorador `@Roles()` en cada endpoint según los requisitos.
