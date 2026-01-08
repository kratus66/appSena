# =========================================
# Complete Deployment Script
# Builds, pushes and deploys both services
# =========================================

Write-Host "🚀 AppSena - Complete AWS Lightsail Deployment" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build Backend
Write-Host "STEP 1/6: Building Backend..." -ForegroundColor Yellow
& "$PSScriptRoot\build-backend.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "STEP 2/6: Pushing Backend..." -ForegroundColor Yellow
& "$PSScriptRoot\push-backend.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "⚠️  PAUSE: Update backend deployment.json with the image reference shown above" -ForegroundColor Yellow
Read-Host "Press Enter when ready to continue"

Write-Host ""
Write-Host "STEP 3/6: Deploying Backend..." -ForegroundColor Yellow
& "$PSScriptRoot\deploy-backend.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "⏳ Waiting 60 seconds for backend to stabilize..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Step 2: Build Frontend
Write-Host ""
Write-Host "STEP 4/6: Building Frontend..." -ForegroundColor Yellow
& "$PSScriptRoot\build-frontend.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "STEP 5/6: Pushing Frontend..." -ForegroundColor Yellow
& "$PSScriptRoot\push-frontend.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "⚠️  PAUSE: Update frontend deployment.json with the image reference shown above" -ForegroundColor Yellow
Read-Host "Press Enter when ready to continue"

Write-Host ""
Write-Host "STEP 6/6: Deploying Frontend..." -ForegroundColor Yellow
& "$PSScriptRoot\deploy-frontend.ps1"
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Monitor both services in AWS Lightsail console" -ForegroundColor White
Write-Host "2. Test backend health: https://your-backend-url/api/health" -ForegroundColor White
Write-Host "3. Test backend API docs: https://your-backend-url/api/docs" -ForegroundColor White
Write-Host "4. Test frontend: https://your-frontend-url" -ForegroundColor White
