# =========================================
# Deploy Backend to AWS Lightsail
# =========================================

Write-Host "🚀 Deploying backend to AWS Lightsail..." -ForegroundColor Cyan

# Configuration
$SERVICE_NAME = "appsena-backend-svc"
$DEPLOYMENT_FILE = "$PSScriptRoot\..\backend\deployment.json"

# Check if deployment file exists
if (-Not (Test-Path $DEPLOYMENT_FILE)) {
    Write-Host "❌ Deployment file not found: $DEPLOYMENT_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Using deployment configuration from: $DEPLOYMENT_FILE" -ForegroundColor Yellow

# IMPORTANT: Before running this, update deployment.json with:
# 1. The image reference from push-backend.ps1 output
# 2. Your RDS credentials
# 3. Your JWT_SECRET
# 4. Your frontend URL

Write-Host ""
Write-Host "⚠️  CHECKLIST BEFORE DEPLOYING:" -ForegroundColor Yellow
Write-Host "  ✓ Updated image reference in deployment.json?" -ForegroundColor Yellow
Write-Host "  ✓ Set RDS credentials (DB_HOST, DB_USERNAME, DB_PASSWORD)?" -ForegroundColor Yellow
Write-Host "  ✓ Set JWT_SECRET (min 32 chars)?" -ForegroundColor Yellow
Write-Host "  ✓ Set FRONTEND_URL for CORS?" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Continue with deployment? (yes/no)"
if ($confirmation -ne 'yes') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Deploy to Lightsail
aws lightsail create-container-service-deployment `
    --cli-input-json file://$DEPLOYMENT_FILE

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployment initiated successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Monitor deployment status:" -ForegroundColor Cyan
    Write-Host "   aws lightsail get-container-services --service-name $SERVICE_NAME" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 View logs:" -ForegroundColor Cyan
    Write-Host "   aws lightsail get-container-log --service-name $SERVICE_NAME --container-name backend" -ForegroundColor White
} else {
    Write-Host "❌ Failed to deploy backend" -ForegroundColor Red
    exit 1
}
