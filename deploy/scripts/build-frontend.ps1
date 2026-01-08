# =========================================
# Build Frontend Docker Image
# =========================================

Write-Host "🔨 Building frontend Docker image..." -ForegroundColor Cyan

# Configuration
$IMAGE_NAME = "appsena-frontend"
$IMAGE_TAG = "latest"

# IMPORTANT: Set your backend URL before building
# This is embedded into the Next.js build
$NEXT_PUBLIC_API_URL = Read-Host "Enter your backend public URL (e.g., https://backend.xyz.amazonaws.com/api)"

if ([string]::IsNullOrWhiteSpace($NEXT_PUBLIC_API_URL)) {
    Write-Host "❌ Backend URL is required for frontend build" -ForegroundColor Red
    exit 1
}

Write-Host "Building with NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" -ForegroundColor Yellow

# Navigate to frontend directory
Set-Location -Path "$PSScriptRoot\..\..\frontend"

# Build Docker image with build argument
docker build `
    --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL `
    -t "${IMAGE_NAME}:${IMAGE_TAG}" .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend image built successfully: ${IMAGE_NAME}:${IMAGE_TAG}" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to build frontend image" -ForegroundColor Red
    exit 1
}

# Return to deploy directory
Set-Location -Path "$PSScriptRoot"
