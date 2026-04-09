# Script para probar todos los endpoints del módulo Fichas
# Esperar a que el servidor esté listo
Write-Host "Esperando a que el servidor esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$baseUrl = "http://localhost:3000/api/fichas"

# ============================================================================
# TEST 1: GET /api/fichas - Obtener todas las fichas
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 1: GET /api/fichas" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri $baseUrl -Method Get
    Write-Host "✓ Total fichas: $($response.data.Count)" -ForegroundColor Cyan
    Write-Host "✓ Total registros: $($response.meta.total)" -ForegroundColor Cyan
    Write-Host "✓ Primera ficha: $($response.data[0].numeroFicha) - $($response.data[0].programa.nombre)" -ForegroundColor Cyan
    $fichaId = $response.data[0].id
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# ============================================================================
# TEST 2: GET /api/fichas?estado=ACTIVA
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 2: GET /api/fichas?estado=ACTIVA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$($baseUrl)?estado=ACTIVA" -Method Get
    Write-Host "✓ Fichas activas: $($response.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# ============================================================================
# TEST 3: GET /api/fichas/mias
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 3: GET /api/fichas/mias" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$($baseUrl)/mias" -Method Get
    Write-Host "✓ Mis fichas (mock admin): $($response.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# ============================================================================
# TEST 4: GET /api/fichas/agrupadas
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 4: GET /api/fichas/agrupadas" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$($baseUrl)/agrupadas" -Method Get
    Write-Host "✓ Grupos de fichas:" -ForegroundColor Cyan
    foreach ($colegio in $response.data) {
        Write-Host "  - $($colegio.colegio): $($colegio.totalFichas) fichas" -ForegroundColor White
    }
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# ============================================================================
# TEST 5: GET /api/fichas/:id
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 5: GET /api/fichas/$fichaId" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$($baseUrl)/$fichaId" -Method Get
    Write-Host "✓ Ficha encontrada: $($response.data.numeroFicha)" -ForegroundColor Cyan
    Write-Host "  - Programa: $($response.data.programa.nombre)" -ForegroundColor White
    Write-Host "  - Colegio: $($response.data.colegio.nombre)" -ForegroundColor White
    Write-Host "  - Estado: $($response.data.estado)" -ForegroundColor White
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# ============================================================================
# TEST 6: POST /api/fichas - Crear nueva ficha
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 6: POST /api/fichas" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    # Primero obtenemos un colegio y programa válidos
    $colegios = Invoke-RestMethod -Uri "http://localhost:3000/api/colegios" -Method Get
    $programas = Invoke-RestMethod -Uri "http://localhost:3000/api/programas" -Method Get
    $users = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method Get
    
    $instructor = $users.data | Where-Object { $_.rol -eq 'instructor' } | Select-Object -First 1
    
    $nuevaFicha = @{
        numeroFicha = "2654999"
        colegioId = $colegios.data[0].id
        programaId = $programas.data[0].id
        instructorId = $instructor.id
        jornada = "MAÑANA"
        fechaInicio = "2024-06-01"
        fechaFin = "2026-06-01"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $nuevaFicha -ContentType "application/json"
    Write-Host "✓ Ficha creada: $($response.data.numeroFicha)" -ForegroundColor Cyan
    $nuevaFichaId = $response.data.id
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# ============================================================================
# TEST 7: PATCH /api/fichas/:id - Actualizar ficha
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 7: PATCH /api/fichas/$nuevaFichaId" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    $updateData = @{
        jornada = "TARDE"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$($baseUrl)/$nuevaFichaId" -Method Patch -Body $updateData -ContentType "application/json"
    Write-Host "✓ Ficha actualizada: Jornada cambiada a $($response.data.jornada)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# ============================================================================
# TEST 8: PATCH /api/fichas/:id/estado - Cambiar estado (solo coordinador)
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 8: PATCH /api/fichas/$nuevaFichaId/estado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    $estadoData = @{
        estado = "EN_CIERRE"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$($baseUrl)/$nuevaFichaId/estado" -Method Patch -Body $estadoData -ContentType "application/json"
    Write-Host "✓ Estado actualizado: $($response.data.estado)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

# ============================================================================
# TEST 9: DELETE /api/fichas/:id - Eliminar ficha (soft delete)
# ============================================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TEST 9: DELETE /api/fichas/$nuevaFichaId" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Uri "$($baseUrl)/$nuevaFichaId" -Method Delete
    Write-Host "✓ Ficha eliminada (soft delete)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
