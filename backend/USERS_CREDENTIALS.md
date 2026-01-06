# 👥 Usuarios de Prueba - AppSena

Este documento contiene las credenciales de los usuarios creados por los seeders para pruebas.

## 🔐 Usuarios Disponibles

### 1. Administrador
- **Email**: `admin@sena.edu.co`
- **Password**: `Admin123!`
- **Rol**: `admin`
- **Documento**: `1234567890`
- **Teléfono**: `3001111111`

### 2. Instructor
- **Email**: `instructor@sena.edu.co`
- **Password**: `Instructor123!`
- **Rol**: `instructor`
- **Documento**: `9876543210`
- **Teléfono**: `3002222222`

### 3. Coordinador
- **Email**: `coordinador@sena.edu.co`
- **Password**: `Coordinador123!`
- **Rol**: `coordinador`
- **Documento**: `5555555555`
- **Teléfono**: `3003333333`

## 🚀 Cómo usar

1. Ejecuta los seeders:
```bash
npm run seed
```

2. Inicia sesión en `/api/auth/login` con cualquiera de las credenciales anteriores.

3. Usa el token JWT recibido para autenticarte en las demás rutas.

## 📝 Ejemplo de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sena.edu.co",
    "password": "Admin123!"
  }'
```

Respuesta:
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

## 🔒 Usar el Token

Incluye el token en el header `Authorization` de tus peticiones:

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
