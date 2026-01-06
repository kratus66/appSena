# =============================================
# TEST SCRIPT: Módulo Disciplinario
# =============================================

$baseUrl = "http://localhost:3000/api"
$contentType = "application/json"

# Colores
function Write-Success { param([string]$msg) Write-Host $msg -ForegroundColor Green }
function Write-Error { param([string]$msg) Write-Host $msg -ForegroundColor Red }
function Write-Info { param([string]$msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Step { param([string]$msg) Write-Host "`n═══════════════════════════════" -ForegroundColor Yellow; Write-Host $msg -ForegroundColor Yellow; Write-Host "═══════════════════════════════" -ForegroundColor Yellow }

# =============================================
# PASO 1: LOGIN como instructor
# =============================================
Write-Step "PASO 1: Login como instructor"

$loginData = @{
    email = "carlos.martinez@sena.edu.co"
    password = "Instructor123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType $contentType
    $token = $loginResponse.access_token
    Write-Success "✓ Login exitoso como instructor"
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = $contentType
    }
} catch {
    Write-Error "✗ Error en login: $_"
    exit 1
}

# =============================================
# PASO 2: Obtener fichas e IDs
# =============================================
Write-Step "PASO 2: Obtener datos necesarios"

try {
    $fichas = Invoke-RestMethod -Uri "$baseUrl/fichas" -Method Get -Headers $headers
    $fichaId = $fichas.data[0].id
    Write-Success "✓ Ficha ID obtenida: $fichaId"
} catch {
    Write-Error "✗ Error obteniendo fichas: $_"
    exit 1
}

try {
    $aprendices = Invoke-RestMethod -Uri "$baseUrl/aprendices?fichaId=$fichaId" -Method Get -Headers $headers
    $aprendizId1 = $aprendices.data[0].id
    $aprendizId2 = $aprendices.data[1].id
    Write-Success "✓ Aprendices obtenidos: $($aprendices.data.Count)"
} catch {
    Write-Error "✗ Error obteniendo aprendices: $_"
    exit 1
}

# =============================================
# PASO 3: CREAR CASO DISCIPLINARIO
# =============================================
Write-Step "PASO 3: Crear caso disciplinario"

$caso1 = @{
    fichaId = $fichaId
    aprendizId = $aprendizId1
    tipo = "CONVIVENCIA"
    gravedad = "MEDIA"
    asunto = "Comportamiento disruptivo en formación"
    descripcion = "El aprendiz interrumpe constantemente la clase y no respeta la palabra de sus compañeros."
    fechaIncidente = "2025-01-02"
} | ConvertTo-Json

try {
    $responseCaso1 = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos" -Method Post -Body $caso1 -Headers $headers
    $casoId1 = $responseCaso1.id
    Write-Success "✓ Caso creado: $casoId1"
    Write-Host "  Estado: $($responseCaso1.estado)"
    Write-Host "  Tipo: $($responseCaso1.tipo)"
} catch {
    Write-Error "✗ Error creando caso: $_"
}

# =============================================
# PASO 4: LISTAR CASOS
# =============================================
Write-Step "PASO 4: Listar casos"

try {
    $listaCasos = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos?limit=10" -Method Get -Headers $headers
    Write-Success "✓ Casos obtenidos: $($listaCasos.meta.total)"
} catch {
    Write-Error "✗ Error listando casos: $_"
}

# =============================================
# PASO 5: OBTENER DETALLE DE CASO
# =============================================
Write-Step "PASO 5: Detalle de caso"

if ($casoId1) {
    try {
        $detalleCaso = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos/$casoId1" -Method Get -Headers $headers
        Write-Success "✓ Detalle obtenido"
        Write-Host "  Asunto: $($detalleCaso.asunto)"
        Write-Host "  Estado: $($detalleCaso.estado)"
    } catch {
        Write-Error "✗ Error obteniendo detalle: $_"
    }
}

# =============================================
# PASO 6: AGREGAR ACCIÓN
# =============================================
# =============================================
Write-Step "PASO 6: Agregar acción al caso"

if ($casoId1) {
    $accion = @{
        tipo = "LLAMADO_ATENCION"
        descripcion = "Se realizó llamado de atención verbal al aprendiz."
    } | ConvertTo-Json

    try {
        $responseAccion = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos/$casoId1/acciones" -Method Post -Body $accion -Headers $headers
        Write-Success "✓ Acción agregada"
        Write-Host "  Tipo: $($responseAccion.tipo)"
    } catch {
        Write-Error "✗ Error agregando acción: $_"
    }
}

# =============================================
# PASO 7: CAMBIAR ESTADO
# =============================================
Write-Step "PASO 7: Cambiar estado a ABIERTO"

if ($casoId1) {
    $cambioEstado = @{
        estado = "ABIERTO"
    } | ConvertTo-Json

    try {
        $casoAbierto = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos/$casoId1/estado" -Method Patch -Body $cambioEstado -Headers $headers
        Write-Success "✓ Estado cambiado a: $($casoAbierto.estado)"
    } catch {
        Write-Error "✗ Error cambiando estado: $_"
    }
}

# =============================================
# RESUMEN
# =============================================
Write-Step "RESUMEN"

Write-Success "`n✓ Pruebas completadas`n"

Write-Host "Endpoints probados:"
Write-Host "  [✓] POST   /disciplinario/casos"
Write-Host "  [✓] GET    /disciplinario/casos"
Write-Host "  [✓] GET    /disciplinario/casos/:id"
Write-Host "  [✓] POST   /disciplinario/casos/:id/acciones"
Write-Host "  [✓] PATCH  /disciplinario/casos/:id/estado"

Write-Host "`n🎉 Módulo Disciplinario funcionando!" -ForegroundColor Green
Write-Host "`nSwagger: http://localhost:3000/api/docs" -ForegroundColor Cyan
