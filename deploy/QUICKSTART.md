# ⚡ Quick Start - AWS Lightsail Deployment

## 🎯 5-Minute Setup Checklist

### Before You Start

- [ ] Docker Desktop running
- [ ] AWS CLI installed: `aws --version`
- [ ] AWS credentials configured: `aws configure`
- [ ] RDS PostgreSQL instance ready
- [ ] Note down: RDS endpoint, username, password

---

## 🚀 Deploy in 3 Steps

### Step 1: Create Lightsail Services (One-time)

```bash
# Backend service
aws lightsail create-container-service \
  --service-name appsena-backend-svc \
  --power small \
  --scale 1 \
  --region us-east-1

# Frontend service
aws lightsail create-container-service \
  --service-name appsena-frontend-svc \
  --power small \
  --scale 1 \
  --region us-east-1

# Wait 2-3 minutes for services to be RUNNING
aws lightsail get-container-services
```

### Step 2: Deploy Backend

```powershell
cd deploy/scripts

# Build
.\build-backend.ps1

# Push to Lightsail
.\push-backend.ps1
# 👆 COPY the image reference from output: ":appsena-backend-svc.appsena-backend.XX"

# Edit deploy/backend/deployment.json:
# 1. Replace image with copied reference
# 2. Set DB_HOST, DB_USERNAME, DB_PASSWORD (from RDS)
# 3. Generate JWT_SECRET (32+ random chars)
# 4. Set FRONTEND_URL (placeholder for now, update later)

# Deploy
.\deploy-backend.ps1

# Get backend URL
aws lightsail get-container-services \
  --service-name appsena-backend-svc \
  --query 'containerServices[0].url' \
  --output text
# Save this URL! You'll need it for frontend.
```

### Step 3: Deploy Frontend

```powershell
# Build (will prompt for backend URL)
.\build-frontend.ps1
# Enter: https://YOUR-BACKEND-URL/api

# Push
.\push-frontend.ps1
# 👆 COPY the image reference: ":appsena-frontend-svc.appsena-frontend.XX"

# Edit deploy/frontend/deployment.json:
# 1. Replace image with copied reference
# 2. Set NEXT_PUBLIC_API_URL to your backend URL + /api

# Deploy
.\deploy-frontend.ps1

# Get frontend URL
aws lightsail get-container-services \
  --service-name appsena-frontend-svc \
  --query 'containerServices[0].url' \
  --output text
```

### Step 4: Update Backend CORS

```powershell
# Edit deploy/backend/deployment.json
# Set FRONTEND_URL to your actual frontend URL from step 3

# Redeploy backend
.\deploy-backend.ps1
```

---

## ✅ Verify Everything Works

```bash
# 1. Backend health
curl https://YOUR-BACKEND-URL/api/health
# Expected: {"status":"ok",...}

# 2. Swagger docs
# Visit: https://YOUR-BACKEND-URL/api/docs

# 3. Frontend
# Visit: https://YOUR-FRONTEND-URL
# Try login
```

---

## 🔐 RDS Security Group Setup

**CRITICAL**: Restrict database access!

1. Go to: EC2 Console → Security Groups
2. Find your RDS security group
3. Edit Inbound Rules:
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port: 5432
   Source: [Lightsail Container IP Range]
   ```

**Never use `0.0.0.0/0` in production!**

---

## 🆘 Something Wrong?

### Backend fails to start
```bash
# Check logs
aws lightsail get-container-log \
  --service-name appsena-backend-svc \
  --container-name backend

# Common issues:
# - DB credentials wrong → Check deployment.json
# - Can't connect to RDS → Check security group
# - JWT_SECRET missing → Add to deployment.json
```

### Frontend shows blank page
```bash
# Check logs
aws lightsail get-container-log \
  --service-name appsena-frontend-svc \
  --container-name frontend

# Common issues:
# - Wrong NEXT_PUBLIC_API_URL → Rebuild with correct URL
# - CORS errors → Update FRONTEND_URL in backend
```

### Need to rebuild?
```powershell
# Backend
.\build-backend.ps1
.\push-backend.ps1
# Update deployment.json
.\deploy-backend.ps1

# Frontend
.\build-frontend.ps1  # Enter correct backend URL
.\push-frontend.ps1
# Update deployment.json
.\deploy-frontend.ps1
```

---

## 📚 Full Documentation

- Complete guide: [DEPLOY_LIGHTSAIL_RDS.md](../DEPLOY_LIGHTSAIL_RDS.md)
- Summary: [DEPLOYMENT_SUMMARY.md](../DEPLOYMENT_SUMMARY.md)
- Quick reference: [deploy/README.md](README.md)

---

## 💰 Costs

- 2x Lightsail Small containers: ~$80/month
- RDS db.t4g.micro: ~$15/month
- **Total: ~$95/month**

To reduce costs:
- Use Micro containers for dev/test
- Use RDS free tier (first year)

---

## 🎉 You're Done!

Your AppSena is now running on AWS with:
- ✅ Scalable containers (Lightsail)
- ✅ Managed database (RDS)
- ✅ Automatic HTTPS
- ✅ Health monitoring
- ✅ Production-ready configuration

**Next steps:**
- Set up custom domain (optional)
- Configure CloudWatch alarms
- Enable automatic backups
- Set up CI/CD pipeline

---

**Questions?** Check the full documentation or AWS support.
