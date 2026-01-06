# App SENA - Sistema de Gestión para Instructores

Sistema completo para la gestión de instructores, fichas y aprendices del SENA.

## 📁 Estructura del Proyecto

```
AppSena/
├── backend/          # API REST con NestJS + PostgreSQL
└── frontend/         # Aplicación web (próximamente)
```

## 🚀 Backend

Backend desarrollado con NestJS, PostgreSQL, TypeORM, Swagger y Docker.

### Características
- ✅ API REST completa
- ✅ Documentación con Swagger
- ✅ Base de datos PostgreSQL
- ✅ Contenedorización con Docker
- ✅ CI/CD con GitHub Actions

### Módulos Implementados
- ✅ **Colegios** - Gestión de instituciones educativas
- 🔄 **Programas de Formación** - En desarrollo
- 🔄 **Fichas** - En desarrollo
- 🔄 **Aprendices** - En desarrollo
- 🔄 **Asistencias** - En desarrollo
- 🔄 **Proceso Disciplinario** - En desarrollo
- 🔄 **Planes de Trabajo Concertado** - En desarrollo
- 🔄 **Planes de Mejoramiento** - En desarrollo
- 🔄 **Actas** - En desarrollo
- 🔄 **Agenda** - En desarrollo
- 🔄 **Métricas** - En desarrollo

### Inicio rápido

```bash
cd backend

# Con Docker (recomendado)
docker-compose up -d

# Sin Docker
npm install
cp .env.example .env
npm run start:dev
```

**URLs:**
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- PgAdmin: http://localhost:5050

Ver más detalles en [backend/README.md](backend/README.md)

## 🎨 Frontend

En desarrollo...

## 📝 Licencia

MIT
