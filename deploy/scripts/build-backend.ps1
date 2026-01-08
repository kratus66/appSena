# =========================================
# Build Backend Docker Image
# =========================================

Write-Host "🔨 Building backend Docker image..." -ForegroundColor Cyan

# Configuration
$IMAGE_NAME = "appsena-backend"
$IMAGE_TAG = "latest"

# Navigate to backend directory
Set-Location -Path "$PSScriptRoot\..\..\backend"

# Build Docker image
docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend image built successfully: ${IMAGE_NAME}:${IMAGE_TAG}" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to build backend image" -ForegroundColor Red
    exit 1
}

# Return to deploy directory
Set-Location -Path "$PSScriptRoot"
