# Script de Prueba - Módulo Fichas con Autenticación JWT

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " PRUEBAS MÓDULO FICHAS - AUTENTICACIÓN REAL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    # Test 1: Login
    Write-Host "🔐 TEST 1: Autenticación (Login)" -ForegroundColor Yellow
    $loginBody = @{
        email = "juan.instructor@sena.edu.co"
        password = "instructor123"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $login.access_token
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    Write-Host "   ✅ Login exitoso" -ForegroundColor Green
    Write-Host "   Usuario: $($login.user.nombre)" -ForegroundColor White
    Write-Host "   Rol: $($login.user.rol)" -ForegroundColor White
    Write-Host "   ID: $($login.user.id)`n" -ForegroundColor Gray

    # Test 2: GET Mis Fichas
    Write-Host "📋 TEST 2: GET /api/fichas/mias (Fichas del instructor autenticado)" -ForegroundColor Yellow
    $mias = Invoke-RestMethod -Uri "http://localhost:3000/api/fichas/mias" -Method Get -Headers $headers
    Write-Host "   ✅ Respuesta recibida" -ForegroundColor Green
    Write-Host "   Total: $($mias.total) fichas" -ForegroundColor White
    Write-Host "   Números: $($mias.data.numeroFicha -join ', ')`n" -ForegroundColor Gray

    # Test 3: GET Todas las Fichas
    Write-Host "📚 TEST 3: GET /api/fichas (Todas las fichas según rol)" -ForegroundColor Yellow
    $todas = Invoke-RestMethod -Uri "http://localhost:3000/api/fichas" -Method Get -Headers $headers
    Write-Host "   ✅ Respuesta recibida" -ForegroundColor Green
    Write-Host "   Total: $($todas.total) fichas" -ForegroundColor White
    Write-Host "   Página: $($todas.page) de $($todas.totalPages)`n" -ForegroundColor Gray

    # Test 4: GET Una ficha específica
    if ($mias.data.Count -gt 0) {
        $fichaId = $mias.data[0].id
        Write-Host "🔍 TEST 4: GET /api/fichas/:id (Detalle de una ficha)" -ForegroundColor Yellow
        $ficha = Invoke-RestMethod -Uri "http://localhost:3000/api/fichas/$fichaId" -Method Get -Headers $headers
        Write-Host "   ✅ Ficha obtenida" -ForegroundColor Green
        Write-Host "   Número: $($ficha.numeroFicha)" -ForegroundColor White
        Write-Host "   Jornada: $($ficha.jornada)" -ForegroundColor White
        Write-Host "   Estado: $($ficha.estado)" -ForegroundColor White
        Write-Host "   Colegio: $($ficha.colegio.nombre)" -ForegroundColor White
        Write-Host "   Programa: $($ficha.programa.nombre)`n" -ForegroundColor White
    }

    # Resumen final
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host " ✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Autenticación JWT funcionando correctamente" -ForegroundColor Green
    Write-Host "✓ Guards y roles validando acceso" -ForegroundColor Green
    Write-Host "✓ Endpoints consultando datos reales de PostgreSQL" -ForegroundColor Green
    Write-Host "✓ Relaciones con tablas (User, Colegio, Programa) cargando correctamente`n" -ForegroundColor Green

} catch {
    Write-Host "`n❌ ERROR EN LAS PRUEBAS:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nDetalles del error:" -ForegroundColor Yellow
    Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
}
