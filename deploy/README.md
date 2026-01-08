# AWS Lightsail Deployment - Quick Reference

## 🚀 Deployment Order

### 1. Backend First
```powershell
cd deploy/scripts

# Build, push, deploy backend
.\build-backend.ps1
.\push-backend.ps1
# Update deploy/backend/deployment.json with image reference
.\deploy-backend.ps1
```

### 2. Frontend Second (after backend is running)
```powershell
# Build with backend URL, push, deploy
.\build-frontend.ps1  # Enter backend public URL when prompted
.\push-frontend.ps1
# Update deploy/frontend/deployment.json with image reference
.\deploy-frontend.ps1
```

### 3. Update CORS
```powershell
# Once frontend URL is available:
# 1. Edit deploy/backend/deployment.json
# 2. Set FRONTEND_URL to actual frontend URL
# 3. Redeploy backend
.\deploy-backend.ps1
```

---

## 🔍 Monitoring

```bash
# Check service status
aws lightsail get-container-services

# View logs
aws lightsail get-container-log --service-name appsena-backend-svc --container-name backend
aws lightsail get-container-log --service-name appsena-frontend-svc --container-name frontend

# Get public URLs
aws lightsail get-container-services --service-name appsena-backend-svc --query 'containerServices[0].url' --output text
aws lightsail get-container-services --service-name appsena-frontend-svc --query 'containerServices[0].url' --output text
```

---

## ✅ Health Checks

- Backend: `https://YOUR-BACKEND-URL/api/health`
- Backend Swagger: `https://YOUR-BACKEND-URL/api/docs`
- Frontend: `https://YOUR-FRONTEND-URL/`

---

## 🔐 Critical Environment Variables

### Backend (deploy/backend/deployment.json)
```json
{
  "DB_HOST": "YOUR_RDS_ENDPOINT.rds.amazonaws.com",
  "DB_USERNAME": "appsena_admin",
  "DB_PASSWORD": "YOUR_SECURE_PASSWORD",
  "JWT_SECRET": "RANDOM_32_CHARS_MINIMUM",
  "FRONTEND_URL": "https://YOUR_FRONTEND_URL"
}
```

### Frontend (deploy/frontend/deployment.json)
```json
{
  "NEXT_PUBLIC_API_URL": "https://YOUR_BACKEND_URL/api"
}
```

---

## 🆘 Common Issues

**Backend can't connect to RDS?**
- Check RDS security group allows port 5432 from Lightsail
- Verify DB credentials in deployment.json
- Ensure RDS is not public (security best practice)

**Frontend shows blank page?**
- Check NEXT_PUBLIC_API_URL is correct in build
- Rebuild frontend with correct backend URL
- Check browser console for errors

**CORS errors?**
- Verify FRONTEND_URL in backend deployment.json
- Must be HTTPS
- No trailing slash
- Redeploy backend after changes

---

See full documentation in [DEPLOY_LIGHTSAIL_RDS.md](DEPLOY_LIGHTSAIL_RDS.md)
