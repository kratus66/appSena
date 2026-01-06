# App SENA - Backend

Backend para la aplicación de gestión de instructores del SENA, desarrollado con NestJS, PostgreSQL y Docker.

## 🚀 Tecnologías

- **NestJS** - Framework de Node.js
- **PostgreSQL** - Base de datos
- **TypeORM** - ORM para TypeScript
- **Swagger** - Documentación de API
- **Docker** - Contenedorización
- **GitHub Actions** - CI/CD

## 📋 Requisitos

- Node.js 20+
- Docker y Docker Compose
- PostgreSQL 15+ (opcional si usas Docker)

## 🛠️ Instalación

### Opción 1: Con Docker (Recomendado)

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd AppSena
```

2. Copiar el archivo de variables de entorno:
```bash
cp .env.example .env
```

3. Levantar los contenedores:
```bash
docker-compose up -d
```

La aplicación estará disponible en:
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- PgAdmin: http://localhost:5050

### Opción 2: Local

1. Instalar dependencias:
```bash
npm install
```

2. Configurar las variables de entorno en `.env`

3. Ejecutar en modo desarrollo:
```bash
npm run start:dev
```

## 📚 Documentación API

Una vez iniciada la aplicación, accede a la documentación Swagger en:
```
http://localhost:3000/api/docs
```

## 🏗️ Módulos del Sistema

### ✅ Implementados
- [ ] Colegios
- [ ] Programas de Formación
- [ ] Fichas
- [ ] Aprendices
- [ ] Asistencias
- [ ] Proceso Disciplinario
- [ ] Planes de Trabajo Concertado
- [ ] Planes de Mejoramiento
- [ ] Actas
- [ ] Agenda y Recordatorios
- [ ] Métricas y Seguimiento

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests con cobertura
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 🐳 Docker Commands

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Rebuild
docker-compose up -d --build
```

## 📦 Scripts disponibles

```bash
npm run start:dev      # Modo desarrollo
npm run start:prod     # Modo producción
npm run build          # Compilar
npm run lint           # Linter
npm run format         # Formatear código
```

## 🔐 Variables de Entorno

Ver `.env.example` para todas las variables necesarias.

## 📝 Licencia

MIT
