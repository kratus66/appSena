# 🚀 AWS Lightsail Deployment - Summary of Changes

## ✅ Files Modified

### Backend
1. **src/main.ts**
   - ✅ CORS seguro para producción con FRONTEND_URL
   - ✅ Escucha en `0.0.0.0` (crítico para contenedores)
   - ✅ Logs mejorados con información de entorno

2. **Dockerfile**
   - ✅ Agregado `EXPOSE 3000`
   - ✅ HEALTHCHECK usando `/api/health` endpoint
   - ✅ Directorio uploads creado

### Frontend
1. **next.config.ts**
   - ✅ Agregado `output: 'standalone'` para Docker

2. **Dockerfile** (NUEVO)
   - ✅ Multi-stage build optimizado
   - ✅ ARG para NEXT_PUBLIC_API_URL en build time
   - ✅ Usuario no-root para seguridad
   - ✅ HEALTHCHECK incluido
   - ✅ Puerto 3001 expuesto

3. **.dockerignore** (NUEVO)
   - ✅ Excluye node_modules, .next, archivos innecesarios

## 📁 New Files Created

### Deploy Infrastructure
```
deploy/
├── README.md                          # Quick reference guide
├── backend/
│   └── deployment.json               # Lightsail deployment config
├── frontend/
│   └── deployment.json               # Lightsail deployment config
└── scripts/
    ├── build-backend.ps1             # Build backend image
    ├── push-backend.ps1              # Push to Lightsail
    ├── deploy-backend.ps1            # Deploy backend
    ├── build-frontend.ps1            # Build frontend image
    ├── push-frontend.ps1             # Push to Lightsail
    ├── deploy-frontend.ps1           # Deploy frontend
    └── deploy-all.ps1                # Complete deployment workflow
```

### Documentation
- **DEPLOY_LIGHTSAIL_RDS.md** - Guía completa de despliegue (100+ líneas)
- **backend/.env.production.example** - Template de variables backend
- **frontend/.env.production.example** - Template de variables frontend

## 🔧 Key Configuration Changes

### Backend - Critical Updates

**CORS Seguro**:
```typescript
// Production: solo permite frontend específico
if (nodeEnv === 'production' && frontendUrl) {
  app.enableCors({
    origin: [frontendUrl],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });
}
```

**Network Binding**:
```typescript
await app.listen(port, '0.0.0.0');  // Escucha desde cualquier interfaz
```

### Frontend - Docker Ready

**Next.js Standalone Output**:
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // Genera build optimizado para Docker
};
```

**Build Argument Support**:
```dockerfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
```

## 🎯 Deployment Workflow

### Prerequisites
1. Docker Desktop installed and running
2. AWS CLI configured (`aws configure`)
3. RDS PostgreSQL instance created
4. Lightsail container services created

### Step-by-Step

```powershell
# 1. Build and deploy backend
cd deploy/scripts
.\build-backend.ps1
.\push-backend.ps1
# Update deploy/backend/deployment.json with image reference
.\deploy-backend.ps1

# 2. Build and deploy frontend (after backend is running)
.\build-frontend.ps1  # Enter backend public URL
.\push-frontend.ps1
# Update deploy/frontend/deployment.json with image reference
.\deploy-frontend.ps1

# 3. Update CORS (with frontend URL)
# Edit deploy/backend/deployment.json -> FRONTEND_URL
.\deploy-backend.ps1
```

### Or use automated script:
```powershell
.\deploy-all.ps1  # Guides through entire process
```

## 🔐 Required Environment Variables

### Backend (in deployment.json)
```
PORT=3000
NODE_ENV=production
DB_HOST=<RDS_ENDPOINT>
DB_PORT=5432
DB_USERNAME=<DB_USER>
DB_PASSWORD=<DB_PASSWORD>
DB_DATABASE=appsena
JWT_SECRET=<32_CHARS_MIN>
JWT_EXPIRATION=7d
FRONTEND_URL=https://<FRONTEND_PUBLIC_URL>
```

### Frontend (in deployment.json + build time)
```
PORT=3001
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://<BACKEND_PUBLIC_URL>/api
```

## 🚨 Critical Security Notes

### RDS Security Group
⚠️ **NEVER use `0.0.0.0/0` for inbound PostgreSQL (5432)**

Recommended approach:
1. Create RDS in private subnet
2. Configure security group to allow only Lightsail container IPs
3. Use VPC peering or bastion host for maintenance

### CORS Configuration
- Production: only allows specified FRONTEND_URL
- Development: allows all origins
- No credentials (tokens stored in localStorage, not cookies)

### JWT Secret
- Minimum 32 characters
- Random alphanumeric
- Never commit to git
- Generate new for each environment

## 📊 Architecture Overview

```
Internet
   │
   ├─► Lightsail Frontend (3001) ──┐
   │                                │
   └─► Lightsail Backend (3000) ───┼─► RDS PostgreSQL (5432)
                                    │   (Private)
                                    │
                                    └─► S3 (Optional for uploads)
```

## ✅ Verification Checklist

After deployment:

- [ ] Backend health: `curl https://backend-url/api/health`
- [ ] Backend Swagger: Visit `https://backend-url/api/docs`
- [ ] Frontend loads: Visit `https://frontend-url`
- [ ] Login works
- [ ] API calls succeed (check browser DevTools)
- [ ] RDS security group configured correctly
- [ ] CORS allows frontend domain
- [ ] Environment variables all set

## 🔍 Monitoring Commands

```bash
# Service status
aws lightsail get-container-services

# Backend logs
aws lightsail get-container-log \
  --service-name appsena-backend-svc \
  --container-name backend

# Frontend logs
aws lightsail get-container-log \
  --service-name appsena-frontend-svc \
  --container-name frontend

# Get public URLs
aws lightsail get-container-services \
  --service-name appsena-backend-svc \
  --query 'containerServices[0].url'
```

## 💡 Key Differences from Local Development

| Aspect | Local Dev | AWS Lightsail Production |
|--------|-----------|--------------------------|
| Network | localhost | 0.0.0.0 binding required |
| CORS | Open (`*`) | Restricted to frontend URL |
| Database | Local Postgres | AWS RDS (managed) |
| Env vars | `.env` file | Lightsail deployment.json |
| Health check | Manual | Automatic (Lightsail) |
| Logs | Console | CloudWatch via AWS CLI |
| SSL/TLS | HTTP | HTTPS (automatic) |
| Scaling | N/A | Configure via `--scale` |

## 🎓 Learning Resources

- Full deployment guide: [DEPLOY_LIGHTSAIL_RDS.md](DEPLOY_LIGHTSAIL_RDS.md)
- Quick reference: [deploy/README.md](deploy/README.md)
- AWS Lightsail Docs: https://docs.aws.amazon.com/lightsail/
- Next.js Production: https://nextjs.org/docs/deployment

## 🆘 Troubleshooting

Common issues and solutions documented in [DEPLOY_LIGHTSAIL_RDS.md](DEPLOY_LIGHTSAIL_RDS.md):

- Backend can't connect to RDS
- Frontend shows blank page
- CORS errors
- Health check failures
- Deployment stuck in progress

---

**All files are production-ready. No business logic changed, only infrastructure and deployment configuration.**

Generated by DevOps automation - 2026-01-08
