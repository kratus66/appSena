# =========================================
# Deploy Frontend to AWS Lightsail
# =========================================

Write-Host "🚀 Deploying frontend to AWS Lightsail..." -ForegroundColor Cyan

# Configuration
$SERVICE_NAME = "appsena-frontend-svc"
$DEPLOYMENT_FILE = "$PSScriptRoot\..\frontend\deployment.json"

# Check if deployment file exists
if (-Not (Test-Path $DEPLOYMENT_FILE)) {
    Write-Host "❌ Deployment file not found: $DEPLOYMENT_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Using deployment configuration from: $DEPLOYMENT_FILE" -ForegroundColor Yellow

# IMPORTANT: Before running this, update deployment.json with:
# 1. The image reference from push-frontend.ps1 output
# 2. Your backend public URL

Write-Host ""
Write-Host "⚠️  CHECKLIST BEFORE DEPLOYING:" -ForegroundColor Yellow
Write-Host "  ✓ Updated image reference in deployment.json?" -ForegroundColor Yellow
Write-Host "  ✓ Set NEXT_PUBLIC_API_URL to backend public domain?" -ForegroundColor Yellow
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
    Write-Host "✅ Frontend deployment initiated successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Monitor deployment status:" -ForegroundColor Cyan
    Write-Host "   aws lightsail get-container-services --service-name $SERVICE_NAME" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 View logs:" -ForegroundColor Cyan
    Write-Host "   aws lightsail get-container-log --service-name $SERVICE_NAME --container-name frontend" -ForegroundColor White
} else {
    Write-Host "❌ Failed to deploy frontend" -ForegroundColor Red
    exit 1
}
