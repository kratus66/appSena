# 🚀 AppSena - Guía de Despliegue en AWS Lightsail Containers + RDS

Esta guía cubre el despliegue completo de la aplicación AppSena en AWS Lightsail Containers con base de datos PostgreSQL en RDS.

---

## 📋 Tabla de Contenidos

1. [Prerrequisitos](#prerrequisitos)
2. [Arquitectura](#arquitectura)
3. [Configuración de RDS PostgreSQL](#configuración-de-rds-postgresql)
4. [Configuración de Lightsail Container Services](#configuración-de-lightsail-container-services)
5. [Build y Push de Imágenes Docker](#build-y-push-de-imágenes-docker)
6. [Despliegue](#despliegue)
7. [Variables de Entorno](#variables-de-entorno)
8. [Verificación](#verificación)
9. [Troubleshooting](#troubleshooting)
10. [Mantenimiento](#mantenimiento)

---

## 🔧 Prerrequisitos

### Software Requerido
- [x] Docker Desktop instalado y corriendo
- [x] AWS CLI instalado (`aws --version`)
- [x] AWS CLI configurado (`aws configure`)
- [x] PowerShell 5.1+ (Windows)
- [x] Cuenta AWS activa

### Verificar AWS CLI
```powershell
aws --version
aws sts get-caller-identity  # Verificar credenciales
```

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      AWS LIGHTSAIL                          │
│                                                             │
│  ┌──────────────────────┐       ┌──────────────────────┐   │
│  │  Frontend Container  │       │  Backend Container   │   │
│  │  Next.js 16 (3001)  │◄──────┤  NestJS (3000)      │   │
│  │                      │       │                      │   │
│  │  Public Endpoint:    │       │  Public Endpoint:    │   │
│  │  appsena-frontend... │       │  appsena-backend...  │   │
│  └──────────────────────┘       └──────────┬───────────┘   │
│                                             │               │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                              │ Private
                                              │ Connection
                                              ▼
                                    ┌─────────────────┐
                                    │   AWS RDS       │
                                    │  PostgreSQL     │
                                    │   (5432)        │
                                    └─────────────────┘
```

### Componentes:
- **Frontend Service**: Next.js 16 en puerto 3001
- **Backend Service**: NestJS en puerto 3000
- **Database**: RDS PostgreSQL (gestionado por AWS)

---

## 🗄️ Configuración de RDS PostgreSQL

### Paso 1: Crear instancia RDS

1. **Ir a RDS Console**: https://console.aws.amazon.com/rds
2. **Create database**
3. **Configuración recomendada**:
   ```
   Engine: PostgreSQL 16.x
   Template: Production (o Dev/Test para menor costo)
   DB instance identifier: appsena-db
   Master username: appsena_admin
   Master password: [GENERAR CONTRASEÑA SEGURA]
   
   Instance configuration:
   - db.t4g.micro (capa gratuita) o db.t3.small (producción)
   
   Storage:
   - Allocated storage: 20 GB
   - Storage type: GP3
   - Enable autoscaling: Yes (hasta 100 GB)
   
   Connectivity:
   - VPC: Default VPC
   - Public access: No (IMPORTANTE)
   - VPC security group: Create new
   - Availability Zone: No preference
   
   Database authentication:
   - Password authentication
   
   Initial database name: appsena
   ```

4. **Crear la base de datos**

### Paso 2: Configurar Security Group

⚠️ **CRÍTICO PARA SEGURIDAD**

1. Ve a **EC2 Console** → **Security Groups**
2. Encuentra el security group de tu RDS (ej: `rds-launch-wizard-X`)
3. **Editar Inbound Rules**:

```
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: Custom
CIDR: [IP_RANGE_LIGHTSAIL_CONTAINERS]
Description: Lightsail containers access
```

⚠️ **NUNCA usar `0.0.0.0/0` en producción**

#### Cómo obtener el rango de IPs de Lightsail:

**Opción A - Temporal (para setup inicial)**:
1. Permitir temporalmente desde cualquier IP
2. Conectar los contenedores
3. Revisar los logs de conexión en RDS para ver las IPs
4. Restringir el security group a esas IPs

**Opción B - VPC Peering** (recomendado):
1. Configurar VPC peering entre Lightsail y VPC de RDS
2. Usar IPs privadas
3. Documentación: https://docs.aws.amazon.com/lightsail/

**Opción C - Bastion Host**:
1. Crear EC2 t2.micro en la misma VPC que RDS
2. Permitir SSH desde tu IP
3. Tunelizar conexiones a través del bastion

### Paso 3: Guardar credenciales RDS

Anota estos valores (los necesitarás después):
```
DB_HOST: appsena-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT: 5432
DB_USERNAME: appsena_admin
DB_PASSWORD: [tu_contraseña]
DB_DATABASE: appsena
```

---

## ☁️ Configuración de Lightsail Container Services

### Crear servicio Backend

```bash
aws lightsail create-container-service \
  --service-name appsena-backend-svc \
  --power small \
  --scale 1 \
  --region us-east-1
```

Opciones de `--power`:
- `nano`: 512 MB RAM, 0.25 vCPU ($7/mes)
- `micro`: 1 GB RAM, 0.5 vCPU ($10/mes)
- `small`: 2 GB RAM, 1 vCPU ($40/mes) ✅ Recomendado
- `medium`: 4 GB RAM, 2 vCPU ($80/mes)

### Crear servicio Frontend

```bash
aws lightsail create-container-service \
  --service-name appsena-frontend-svc \
  --power small \
  --scale 1 \
  --region us-east-1
```

### Verificar estado

```bash
aws lightsail get-container-services --service-name appsena-backend-svc
aws lightsail get-container-services --service-name appsena-frontend-svc
```

Espera hasta que el estado sea `RUNNING`.

---

## 🐳 Build y Push de Imágenes Docker

### Opción A: Scripts Automatizados (Recomendado)

Todos los scripts están en `/deploy/scripts/`:

#### 1. Build Backend
```powershell
cd deploy/scripts
.\build-backend.ps1
```

#### 2. Push Backend
```powershell
.\push-backend.ps1
```

**IMPORTANTE**: Copia la referencia de imagen del output:
```
:appsena-backend-svc.appsena-backend.X
```

#### 3. Build Frontend
```powershell
.\build-frontend.ps1
# Te pedirá la URL del backend: https://tu-backend-url.amazonaws.com/api
```

#### 4. Push Frontend
```powershell
.\push-frontend.ps1
```

### Opción B: Comandos Manuales

#### Backend
```powershell
# Build
cd backend
docker build -t appsena-backend:latest .

# Push
aws lightsail push-container-image `
  --service-name appsena-backend-svc `
  --label appsena-backend `
  --image appsena-backend:latest
```

#### Frontend
```powershell
# Build (con API URL)
cd frontend
docker build `
  --build-arg NEXT_PUBLIC_API_URL=https://tu-backend.amazonaws.com/api `
  -t appsena-frontend:latest .

# Push
aws lightsail push-container-image `
  --service-name appsena-frontend-svc `
  --label appsena-frontend `
  --image appsena-frontend:latest
```

---

## 🚀 Despliegue

### Paso 1: Actualizar deployment.json files

#### Backend (`/deploy/backend/deployment.json`)

1. Reemplaza `:appsena-backend.latest` con la referencia de imagen del push
2. Actualiza las variables de entorno:

```json
{
  "serviceName": "appsena-backend-svc",
  "containers": {
    "backend": {
      "image": ":appsena-backend-svc.appsena-backend.15",  // ← TU IMAGEN
      "environment": {
        "PORT": "3000",
        "NODE_ENV": "production",
        "DB_HOST": "appsena-db.cxxx.us-east-1.rds.amazonaws.com",  // ← TU RDS
        "DB_PORT": "5432",
        "DB_USERNAME": "appsena_admin",  // ← TU USUARIO
        "DB_PASSWORD": "TU_PASSWORD_SEGURO",  // ← TU CONTRASEÑA
        "DB_DATABASE": "appsena",
        "JWT_SECRET": "GENERAR_STRING_ALEATORIO_MINIMO_32_CARACTERES",  // ← GENERAR
        "JWT_EXPIRATION": "7d",
        "FRONTEND_URL": "https://TU-FRONTEND.amazonaws.com"  // ← Actualizar después
      },
      ...
    }
  }
}
```

#### Frontend (`/deploy/frontend/deployment.json`)

```json
{
  "serviceName": "appsena-frontend-svc",
  "containers": {
    "frontend": {
      "image": ":appsena-frontend-svc.appsena-frontend.12",  // ← TU IMAGEN
      "environment": {
        "PORT": "3001",
        "NODE_ENV": "production",
        "NEXT_PUBLIC_API_URL": "https://TU-BACKEND.amazonaws.com/api"  // ← TU BACKEND
      },
      ...
    }
  }
}
```

### Paso 2: Desplegar

#### Opción A: Script Automatizado
```powershell
cd deploy/scripts
.\deploy-all.ps1
```

#### Opción B: Manual

**Backend primero**:
```powershell
.\deploy-backend.ps1
```

Espera 2-3 minutos, luego **Frontend**:
```powershell
.\deploy-frontend.ps1
```

### Paso 3: Obtener URLs públicas

```bash
# Backend URL
aws lightsail get-container-services \
  --service-name appsena-backend-svc \
  --query 'containerServices[0].url' \
  --output text

# Frontend URL
aws lightsail get-container-services \
  --service-name appsena-frontend-svc \
  --query 'containerServices[0].url' \
  --output text
```

### Paso 4: Actualizar CORS (IMPORTANTE)

Una vez tengas la URL del frontend:

1. Edita `deploy/backend/deployment.json`
2. Actualiza `FRONTEND_URL` con la URL real
3. Re-despliega: `.\deploy-backend.ps1`

---

## 🔐 Variables de Entorno

### Backend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno | `production` |
| `DB_HOST` | Endpoint RDS | `appsena-db.xxx.rds.amazonaws.com` |
| `DB_PORT` | Puerto PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario DB | `appsena_admin` |
| `DB_PASSWORD` | Contraseña DB | `********` |
| `DB_DATABASE` | Nombre de la DB | `appsena` |
| `JWT_SECRET` | Secret para tokens | Mínimo 32 caracteres aleatorios |
| `JWT_EXPIRATION` | Expiración tokens | `7d` |
| `FRONTEND_URL` | URL del frontend | `https://xxx.amazonaws.com` |

### Frontend

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno | `production` |
| `NEXT_PUBLIC_API_URL` | URL del backend | `https://xxx.amazonaws.com/api` |

⚠️ **Nota sobre NEXT_PUBLIC_API_URL**: 
- Debe definirse en **BUILD time** (ARG en Dockerfile)
- Y también en **RUNTIME** (ENV en deployment.json)
- El script `build-frontend.ps1` te lo pedirá

### Generar JWT_SECRET seguro

```powershell
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

O usar: https://randomkeygen.com/ (CodeIgniter Encryption Keys)

---

## ✅ Verificación

### Checklist post-deployment

#### Backend
- [ ] Health check: `curl https://tu-backend.amazonaws.com/api/health`
  ```json
  {
    "status": "ok",
    "message": "✅ AppSena Backend funcionando correctamente",
    "timestamp": "2026-01-08T...",
    "uptime": 123.45
  }
  ```

- [ ] Swagger docs: `https://tu-backend.amazonaws.com/api/docs`
- [ ] Conexión a RDS verificada (revisar logs)
- [ ] CORS configurado correctamente

#### Frontend
- [ ] Página carga: `https://tu-frontend.amazonaws.com`
- [ ] Login funciona
- [ ] API calls funcionan (revisar Network tab en DevTools)

#### RDS
- [ ] Security Group permite solo tráfico desde Lightsail
- [ ] No hay acceso público (`0.0.0.0/0`)
- [ ] Backups automáticos habilitados

### Comandos útiles

```bash
# Ver logs backend
aws lightsail get-container-log \
  --service-name appsena-backend-svc \
  --container-name backend \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S)

# Ver logs frontend
aws lightsail get-container-log \
  --service-name appsena-frontend-svc \
  --container-name frontend \
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S)

# Ver estado de servicios
aws lightsail get-container-services

# Ver deployments
aws lightsail get-container-service-deployments \
  --service-name appsena-backend-svc
```

---

## 🔧 Troubleshooting

### Problema: Backend no conecta a RDS

**Síntomas**: 
- Health check falla
- Logs muestran "ECONNREFUSED"

**Soluciones**:
1. Verificar security group de RDS permite puerto 5432
2. Verificar credenciales en deployment.json
3. Verificar endpoint de RDS es correcto
4. Revisar que RDS esté en la misma región

```bash
# Test de conectividad desde contenedor
aws lightsail create-container-service-deployment \
  --cli-input-json '{
    "serviceName": "appsena-backend-svc",
    "containers": {
      "test": {
        "image": "postgres:16-alpine",
        "command": ["psql", "-h", "YOUR_RDS_HOST", "-U", "appsena_admin", "-d", "appsena"],
        "environment": {"PGPASSWORD": "YOUR_PASSWORD"}
      }
    }
  }'
```

### Problema: Frontend no carga

**Síntomas**:
- Página en blanco
- 502/503 errors

**Soluciones**:
1. Verificar logs del contenedor
2. Verificar que `NEXT_PUBLIC_API_URL` esté correcto
3. Re-build con el ARG correcto:
   ```powershell
   .\build-frontend.ps1  # Ingresa URL correcta
   .\push-frontend.ps1
   .\deploy-frontend.ps1
   ```

### Problema: CORS errors en frontend

**Síntomas**:
- Network errors en DevTools
- "CORS policy" errors

**Soluciones**:
1. Verificar `FRONTEND_URL` en backend deployment.json
2. Asegurar que sea HTTPS (no HTTP)
3. No incluir trailing slash
4. Re-desplegar backend después de cambios

### Problema: Health check falla

**Revisar**:
1. Container está corriendo: `docker ps`
2. Puerto expuesto correctamente: `3000` (backend) o `3001` (frontend)
3. Endpoint `/api/health` responde localmente
4. HEALTHCHECK en Dockerfile correcto

### Problema: Deployment atascado

**Si deployment queda en "IN_PROGRESS" por >10 min**:

```bash
# Cancelar deployment actual
aws lightsail delete-container-service \
  --service-name appsena-backend-svc

# Recrear servicio
aws lightsail create-container-service \
  --service-name appsena-backend-svc \
  --power small \
  --scale 1
```

---

## 🔄 Mantenimiento

### Actualizar aplicación

```powershell
# 1. Build nueva imagen
cd deploy/scripts
.\build-backend.ps1  # o build-frontend.ps1

# 2. Push
.\push-backend.ps1  # o push-frontend.ps1

# 3. Actualizar deployment.json con nueva imagen

# 4. Deploy
.\deploy-backend.ps1  # o deploy-frontend.ps1
```

### Rollback a versión anterior

```bash
# Listar deployments
aws lightsail get-container-service-deployments \
  --service-name appsena-backend-svc

# Identificar versión estable anterior
# Re-deploy usando deployment.json con imagen anterior
```

### Escalar servicios

```bash
# Aumentar a 2 instancias
aws lightsail update-container-service \
  --service-name appsena-backend-svc \
  --scale 2

# Aumentar poder de cómputo
aws lightsail update-container-service \
  --service-name appsena-backend-svc \
  --power medium
```

### Backups RDS

RDS hace backups automáticos. Para manual:

```bash
aws rds create-db-snapshot \
  --db-instance-identifier appsena-db \
  --db-snapshot-identifier appsena-manual-$(date +%Y%m%d-%H%M%S)
```

### Monitoreo

**CloudWatch Metrics** (automático):
- CPU utilization
- Memory utilization
- Request count
- Response time

**Configurar alertas**:
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name appsena-backend-cpu-high \
  --alarm-description "Backend CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/Lightsail \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

---

## 💰 Costos Estimados (us-east-1)

| Recurso | Configuración | Costo/mes |
|---------|---------------|-----------|
| Lightsail Backend | Small (2GB, 1vCPU) | $40 |
| Lightsail Frontend | Small (2GB, 1vCPU) | $40 |
| RDS PostgreSQL | db.t4g.micro (1GB) | $15 |
| RDS Storage | 20 GB GP3 | $2.30 |
| **TOTAL** | | **~$97/mes** |

**Optimización**:
- Usar `micro` para dev/test: ~$35/mes
- Usar RDS capa gratuita (primer año): $0
- Single container service con frontend+backend: -$40/mes

---

## 📚 Referencias

- [AWS Lightsail Containers Docs](https://docs.aws.amazon.com/lightsail/latest/userguide/amazon-lightsail-container-services.html)
- [RDS PostgreSQL Docs](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NestJS Production](https://docs.nestjs.com/faq/serverless)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `aws lightsail get-container-log`
2. Verifica security groups y networking
3. Confirma variables de entorno
4. Revisa esta documentación
5. Contacta soporte AWS si es necesario

---

**✅ ¡Deployment exitoso!** Tu aplicación AppSena está corriendo en AWS con infraestructura escalable y segura.
