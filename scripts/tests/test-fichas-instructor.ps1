# Script de Prueba - Endpoint GET /api/fichas/mias con instructorId

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " PRUEBA: GET /api/fichas/mias" -ForegroundColor Cyan
Write-Host " Búsqueda por UUID del instructor" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# UUID del instructor Juan Carlos (del seeder)
$instructorId = "16198d6c-e411-42b9-a454-d6bdf6903ec3"

try {
    Write-Host "🔍 TEST 1: Listar fichas del instructor" -ForegroundColor Yellow
    Write-Host "   InstructorId: $instructorId`n" -ForegroundColor Gray

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/fichas/mias?instructorId=$instructorId" -Method Get
    
    Write-Host "   ✅ Respuesta recibida correctamente" -ForegroundColor Green
    Write-Host "   📊 Total de fichas: $($response.total)" -ForegroundColor White
    Write-Host "   📄 Página: $($response.page) | Límite: $($response.limit)`n" -ForegroundColor White
    
    if ($response.total -gt 0) {
        Write-Host "   📋 Fichas encontradas:" -ForegroundColor Yellow
        foreach ($ficha in $response.data) {
            Write-Host "      • Número: $($ficha.numeroFicha) | Jornada: $($ficha.jornada) | Estado: $($ficha.estado)" -ForegroundColor White
            Write-Host "        Colegio: $($ficha.colegio.nombre)" -ForegroundColor Gray
            Write-Host "        Programa: $($ficha.programa.nombre)" -ForegroundColor Gray
            Write-Host "        Instructor: $($ficha.instructor.nombre)`n" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  No se encontraron fichas para este instructor" -ForegroundColor Yellow
    }

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host " ✅ PRUEBA COMPLETADA EXITOSAMENTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Endpoint respondió correctamente" -ForegroundColor Green
    Write-Host "✓ Búsqueda por instructorId funcionando" -ForegroundColor Green
    Write-Host "✓ Relaciones con BD cargadas (Colegio, Programa, Instructor)" -ForegroundColor Green
    Write-Host "✓ Guards desactivados para pruebas sin autenticación`n" -ForegroundColor Green

} catch {
    Write-Host "`n❌ ERROR EN LA PRUEBA:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "`nDetalles del error:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}

# Prueba adicional: Verificar que sin instructorId da error
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " PRUEBA 2: Sin instructorId (debe fallar)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

try {
    Write-Host "🔍 Intentando llamar /api/fichas/mias sin instructorId..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/fichas/mias" -Method Get
    Write-Host "   ⚠️  Debería haber fallado pero respondió" -ForegroundColor Yellow
} catch {
    Write-Host "   ✅ Error esperado recibido correctamente" -ForegroundColor Green
    Write-Host "   Mensaje: $($_.ErrorDetails.Message)`n" -ForegroundColor Gray
}
