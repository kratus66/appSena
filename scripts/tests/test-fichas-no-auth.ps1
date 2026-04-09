# Script de prueba para endpoint /api/fichas/mias sin autenticación
# Requiere pasar instructorId como query parameter

Write-Host "`n=== PRUEBA ENDPOINT /api/fichas/mias SIN AUTENTICACIÓN ===" -ForegroundColor Cyan

# ID del instructor Juan Pérez del seeder
$instructorId = "16198d6c-e411-42b9-a454-d6bdf6903ec3"

# Test 1: GET /api/fichas/mias con instructorId
Write-Host "`n1️⃣  GET /api/fichas/mias?instructorId=$instructorId" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/fichas/mias?instructorId=$instructorId&page=1&limit=10" -Method Get
    Write-Host "✅ SUCCESS: Encontradas $($response.total) fichas del instructor" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

# Test 2: GET /api/fichas/mias sin instructorId (debería fallar)
Write-Host "`n2️⃣  GET /api/fichas/mias (sin instructorId - debe fallar)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/fichas/mias" -Method Get
    Write-Host "❌ UNEXPECTED: La solicitud debería haber fallado" -ForegroundColor Red
} catch {
    Write-Host "✅ EXPECTED ERROR: $($_.ErrorDetails.Message)" -ForegroundColor Green
}

Write-Host "`n=== FIN DE LAS PRUEBAS ===" -ForegroundColor Cyan
