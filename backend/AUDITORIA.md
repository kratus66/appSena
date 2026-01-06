# 🔍 Sistema de Auditoría y Autenticación

## 📋 Descripción General

El sistema implementa un completo sistema de auditoría que registra **quién** y **cuándo** realiza cada acción en la base de datos.

## 🏗️ Arquitectura

### BaseEntity

Todas las entidades del sistema extienden de `BaseEntity` que incluye:

```typescript
- id: UUID único
- createdAt: Fecha de creación
- updatedAt: Fecha de última actualización
- deletedAt: Fecha de eliminación (soft delete)
- createdBy: Usuario que creó el registro
- updatedBy: Usuario que actualizó el registro
- deletedBy: Usuario que eliminó el registro
```

### Ejemplo de Uso

```typescript
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('mi_tabla')
export class MiEntidad extends BaseEntity {
  @Column()
  miCampo: string;
}
```

## 👤 Sistema de Usuarios

### Roles Disponibles

- **ADMIN**: Administrador del sistema (acceso total)
- **INSTRUCTOR**: Instructor del SENA
- **COORDINADOR**: Coordinador académico

### Entidad User

```typescript
{
  id: string;
  nombre: string;
  email: string;
  documento: string;
  telefono: string;
  password: string; // Hasheado con bcrypt
  rol: UserRole;
  fotoPerfil: string;
  activo: boolean;
}
```

## 🔐 Autenticación

### Login

**Endpoint**: `POST /api/auth/login`

**Body**:
```json
{
  "email": "admin@sena.edu.co",
  "password": "Admin123!"
}
```

**Respuesta**:
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

### Uso del Token

Incluir en headers de peticiones:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🛡️ Guards y Decoradores

### JwtAuthGuard

Protege rutas requiriendo autenticación:

```typescript
@UseGuards(JwtAuthGuard)
@Get()
findAll() {
  // Solo usuarios autenticados
}
```

### RolesGuard

Restringe acceso por rol:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Delete(':id')
remove() {
  // Solo administradores
}
```

### @GetUser()

Obtiene el usuario actual:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@GetUser() user: User) {
  return user;
}
```

## 📊 Soft Delete

Todos los registros usan soft delete:

- No se eliminan físicamente de la base de datos
- Se marca `deletedAt` con la fecha de eliminación
- Se registra `deletedBy` con el usuario que eliminó
- Los registros eliminados no aparecen en consultas normales
- Se pueden restaurar si es necesario

### Ejemplo de Eliminación

```typescript
// Soft delete
await this.repository.softDelete(id);

// Restaurar
await this.repository.restore(id);

// Consultar incluidos eliminados
await this.repository.find({ withDeleted: true });

// Consultar solo eliminados
await this.repository.find({ 
  where: { deletedAt: Not(IsNull()) },
  withDeleted: true 
});
```

## 🔄 Auditoría Automática

El sistema registra automáticamente:

1. **Creación**: 
   - `createdAt`: timestamp automático
   - `createdBy`: usuario autenticado

2. **Actualización**: 
   - `updatedAt`: timestamp automático
   - `updatedBy`: usuario autenticado

3. **Eliminación**:
   - `deletedAt`: timestamp automático
   - `deletedBy`: usuario autenticado

## 📝 Endpoints de Usuarios

### Crear Usuario
`POST /api/users`

### Listar Usuarios
`GET /api/users`

### Obtener Usuario
`GET /api/users/:id`

### Actualizar Usuario
`PATCH /api/users/:id`

### Activar/Desactivar
`PATCH /api/users/:id/toggle-activo`

### Eliminar (Soft Delete)
`DELETE /api/users/:id`

### Restaurar Usuario
`POST /api/users/:id/restore`

## 🔒 Seguridad

- Passwords hasheados con bcrypt (10 rounds)
- JWT con expiración configurable
- Validación de datos con class-validator
- Protección contra inyección SQL (TypeORM)
- CORS habilitado
- Validación de unicidad en email y documento

## 🧪 Testing

Ver credenciales de prueba en [USERS_CREDENTIALS.md](./USERS_CREDENTIALS.md)

## 🚀 Próximos Pasos

Para implementar auditoría en nuevas entidades:

1. Extender de `BaseEntity`
2. Eliminar campos duplicados (id, timestamps)
3. Usar guards en los controllers
4. Implementar soft delete en servicios
