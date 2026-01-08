# =========================================
# Push Backend Image to AWS Lightsail
# =========================================

Write-Host "📤 Pushing backend image to AWS Lightsail..." -ForegroundColor Cyan

# Configuration
$SERVICE_NAME = "appsena-backend-svc"
$IMAGE_NAME = "appsena-backend"
$IMAGE_TAG = "latest"

# Push image to Lightsail
Write-Host "Pushing ${IMAGE_NAME}:${IMAGE_TAG} to ${SERVICE_NAME}..." -ForegroundColor Yellow

aws lightsail push-container-image `
    --service-name $SERVICE_NAME `
    --label $IMAGE_NAME `
    --image "${IMAGE_NAME}:${IMAGE_TAG}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend image pushed successfully" -ForegroundColor Green
    Write-Host "📝 Copy the image reference from above and update deployment.json" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to push backend image" -ForegroundColor Red
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. AWS CLI is configured (aws configure)" -ForegroundColor Yellow
    Write-Host "  2. Container service '$SERVICE_NAME' exists" -ForegroundColor Yellow
    Write-Host "  3. You have sufficient permissions" -ForegroundColor Yellow
    exit 1
}
