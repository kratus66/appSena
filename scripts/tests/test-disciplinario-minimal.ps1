# Test Módulo Disciplinario - Version Minimal
$baseUrl = "http://localhost:3000/api"
$contentType = "application/json"

Write-Host "`n=== TEST DISCIPLINARIO ===" -ForegroundColor Yellow

# Login
$login = @{ email = "instructor@sena.edu.co"; password = "Instructor123!" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $login -ContentType $contentType
$headers = @{ Authorization = "Bearer $($loginResp.access_token)"; "Content-Type" = $contentType }
Write-Host "✓ Login OK" -ForegroundColor Green

# Obtener IDs
$fichas = Invoke-RestMethod -Uri "$baseUrl/fichas" -Method Get -Headers $headers
$fichaId = $fichas.data[0].id
$aprendices = Invoke-RestMethod -Uri "$baseUrl/aprendices?fichaId=$fichaId" -Method Get -Headers $headers
$aprendizId = $aprendices.data[0].id
Write-Host "✓ IDs obtenidos - Ficha: $fichaId | Aprendiz: $aprendizId" -ForegroundColor Green

# Crear caso
$caso = @{
    fichaId = $fichaId
    aprendizId = $aprendizId
    tipo = "CONVIVENCIA"
    gravedad = "MEDIA"
    asunto = "Test comportamiento"
    descripcion = "Caso de prueba automatizada"
    fechaIncidente = "2025-01-02"
} | ConvertTo-Json

$casoResp = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos" -Method Post -Body $caso -Headers $headers
$casoId = $casoResp.id
Write-Host "✓ Caso creado: $casoId - Estado: $($casoResp.estado)" -ForegroundColor Green

# Listar casos
$casos = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos" -Method Get -Headers $headers
Write-Host "✓ Casos listados: $($casos.meta.total) casos" -ForegroundColor Green

# Agregar acción
$accion = @{ tipo = "LLAMADO_ATENCION"; descripcion = "Llamado de atención" } | ConvertTo-Json
$accionResp = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos/$casoId/acciones" -Method Post -Body $accion -Headers $headers
Write-Host "✓ Acción agregada al caso" -ForegroundColor Green

# Cambiar estado
$estado = @{ estado = "ABIERTO" } | ConvertTo-Json
$estadoResp = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos/$casoId/estado" -Method Patch -Body $estado -Headers $headers
Write-Host "✓ Estado cambiado a: $($estadoResp.estado)" -ForegroundColor Green

Write-Host "`n��� Todos los endpoints funcionan correctamente!" -ForegroundColor Green
Write-Host "Swagger: http://localhost:3000/api/docs`n" -ForegroundColor Cyan
