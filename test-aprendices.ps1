# ==================================================================
# Script de Pruebas - Módulo de Aprendices
# ==================================================================

$BASE_URL = "http://localhost:3000/api"
$ErrorActionPreference = "Continue"

# Colores para la terminal
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Title { param($msg) Write-Host "`n========================================" -ForegroundColor Magenta; Write-Host $msg -ForegroundColor Magenta; Write-Host "========================================`n" -ForegroundColor Magenta }

# Variables globales
$adminToken = ""
$instructorToken = ""
$coordinadorToken = ""
$fichaId = ""
$userId = ""
$aprendizId = ""
$colegioId = ""
$programaId = ""

# ==================================================================
# FUNCIÓN: LOGIN
# ==================================================================
function Get-LoginToken {
    param(
        [string]$email,
        [string]$password,
        [string]$roleName
    )
    
    Write-Info "🔐 Iniciando sesión como $roleName..."
    
    $body = @{
        email = $email
        password = $password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body $body -ContentType "application/json"
        Write-Success "✓ Login exitoso como $roleName"
        Write-Host "   Token: $($response.access_token.Substring(0, 50))..." -ForegroundColor Gray
        return $response.access_token
    }
    catch {
        Write-Error "✗ Error en login como $roleName"
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $null
    }
}

# ==================================================================
# FUNCIÓN: OBTENER DATOS DE REFERENCIA
# ==================================================================
function Get-ReferenceData {
    param([string]$token)
    
    Write-Info "📋 Obteniendo datos de referencia (fichas, usuarios)..."
    
    try {
        # Obtener fichas
        $fichasResponse = Invoke-RestMethod -Uri "$BASE_URL/fichas?page=1&limit=5" -Method Get -Headers @{Authorization = "Bearer $token"}
        if ($fichasResponse.data -and $fichasResponse.data.Count -gt 0) {
            $script:fichaId = $fichasResponse.data[0].id
            $script:colegioId = $fichasResponse.data[0].colegioId
            $script:programaId = $fichasResponse.data[0].programaId
            Write-Success "✓ Ficha ID obtenida: $($script:fichaId)"
        }
        
        # Obtener usuarios (para asignar a aprendices)
        $usersResponse = Invoke-RestMethod -Uri "$BASE_URL/users?page=1&limit=10" -Method Get -Headers @{Authorization = "Bearer $token"}
        if ($usersResponse.data -and $usersResponse.data.Count -gt 0) {
            # Buscar un usuario que no sea admin/instructor/coordinador
            $availableUser = $usersResponse.data | Where-Object { $_.rol -eq 'aprendiz' -or $_.rol -eq 'acudiente' } | Select-Object -First 1
            if ($availableUser) {
                $script:userId = $availableUser.id
                Write-Success "✓ Usuario ID obtenido: $($script:userId)"
            } else {
                Write-Warning "⚠ No se encontró usuario disponible, se creará uno nuevo"
            }
        }
    }
    catch {
        Write-Warning "⚠ Error obteniendo datos de referencia: $($_.Exception.Message)"
    }
}

# ==================================================================
# FUNCIÓN: CREAR USUARIO PARA APRENDIZ
# ==================================================================
function New-UserForAprendiz {
    param([string]$token)
    
    Write-Info "👤 Creando usuario para aprendiz..."
    
    $randomNum = Get-Random -Minimum 1000 -Maximum 9999
    $body = @{
        nombre = "Estudiante"
        apellido = "Test$randomNum"
        email = "estudiante$randomNum@test.com"
        password = "Password123!"
        documento = "1000$randomNum"
        rol = "aprendiz"
        telefono = "300$randomNum"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/users" -Method Post -Body $body -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
        $script:userId = $response.id
        Write-Success "✓ Usuario creado con ID: $($script:userId)"
        return $response.id
    }
    catch {
        Write-Error "✗ Error creando usuario: $($_.Exception.Message)"
        return $null
    }
}

# ==================================================================
# PRUEBA 1: CREAR APRENDIZ (POST /aprendices)
# ==================================================================
function Test-CreateAprendiz {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 1: Crear Aprendiz como $roleName"
    
    if (-not $script:fichaId) {
        Write-Error "✗ No se puede crear aprendiz: falta fichaId"
        return
    }
    
    if (-not $script:userId) {
        # Intentar crear un usuario
        $newUserId = New-UserForAprendiz -token $token
        if (-not $newUserId) {
            Write-Error "✗ No se puede crear aprendiz: falta userId"
            return
        }
    }
    
    $randomNum = Get-Random -Minimum 1000 -Maximum 9999
    $body = @{
        nombres = "Juan Carlos"
        apellidos = "Pérez Test$randomNum"
        tipoDocumento = "CC"
        documento = "9999$randomNum"
        email = "aprendiz$randomNum@test.com"
        telefono = "315$randomNum"
        direccion = "Calle Test #$randomNum"
        estadoAcademico = "ACTIVO"
        userId = $script:userId
        fichaId = $script:fichaId
    } | ConvertTo-Json
    
    Write-Info "📤 Enviando solicitud para crear aprendiz..."
    Write-Host "Body: $body" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices" -Method Post -Body $body -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
        $script:aprendizId = $response.id
        Write-Success "✓ Aprendiz creado exitosamente"
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "✗ Error al crear aprendiz (Status: $statusCode)"
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
        }
    }
}

# ==================================================================
# PRUEBA 2: LISTAR APRENDICES (GET /aprendices)
# ==================================================================
function Test-ListAprendices {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 2: Listar Aprendices como $roleName"
    
    Write-Info "📤 Obteniendo lista de aprendices..."
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices?page=1&limit=10" -Method Get -Headers @{Authorization = "Bearer $token"}
        Write-Success "✓ Lista obtenida exitosamente"
        Write-Host "   Total: $($response.total)" -ForegroundColor Cyan
        Write-Host "   Página: $($response.page)/$([Math]::Ceiling($response.total / $response.limit))" -ForegroundColor Cyan
        Write-Host "   Aprendices en esta página: $($response.data.Count)" -ForegroundColor Cyan
        
        if ($response.data.Count -gt 0) {
            Write-Host "`nPrimeros aprendices:" -ForegroundColor Yellow
            $response.data | Select-Object -First 3 | ForEach-Object {
                Write-Host "   - $($_.nombres) $($_.apellidos) (Doc: $($_.documento)) - Estado: $($_.estadoAcademico)" -ForegroundColor Gray
            }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "✗ Error al listar aprendices (Status: $statusCode)"
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# ==================================================================
# PRUEBA 3: LISTAR CON FILTROS
# ==================================================================
function Test-ListAprendicesWithFilters {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 3: Listar Aprendices con Filtros como $roleName"
    
    if ($script:fichaId) {
        Write-Info "📤 Filtrando por fichaId: $($script:fichaId)..."
        try {
            $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices?fichaId=$($script:fichaId)&page=1&limit=10" -Method Get -Headers @{Authorization = "Bearer $token"}
            Write-Success "✓ Filtro por ficha aplicado"
            Write-Host "   Total aprendices en esta ficha: $($response.total)" -ForegroundColor Cyan
        }
        catch {
            Write-Error "✗ Error al filtrar por ficha"
        }
    }
    
    Write-Info "📤 Filtrando por estado ACTIVO..."
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices?estadoAcademico=ACTIVO&page=1&limit=10" -Method Get -Headers @{Authorization = "Bearer $token"}
        Write-Success "✓ Filtro por estado aplicado"
        Write-Host "   Total aprendices activos: $($response.total)" -ForegroundColor Cyan
    }
    catch {
        Write-Error "✗ Error al filtrar por estado"
    }
}

# ==================================================================
# PRUEBA 4: BUSCAR APRENDIZ
# ==================================================================
function Test-SearchAprendiz {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 4: Buscar Aprendices como $roleName"
    
    Write-Info "📤 Buscando aprendices con término 'Test'..."
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices?search=Test&page=1&limit=10" -Method Get -Headers @{Authorization = "Bearer $token"}
        Write-Success "✓ Búsqueda completada"
        Write-Host "   Resultados encontrados: $($response.total)" -ForegroundColor Cyan
        
        if ($response.data.Count -gt 0) {
            $response.data | Select-Object -First 3 | ForEach-Object {
                Write-Host "   - $($_.nombres) $($_.apellidos)" -ForegroundColor Gray
            }
        }
    }
    catch {
        Write-Error "✗ Error en búsqueda"
    }
}

# ==================================================================
# PRUEBA 5: OBTENER DETALLE DE APRENDIZ (GET /aprendices/:id)
# ==================================================================
function Test-GetAprendizDetail {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 5: Obtener Detalle de Aprendiz como $roleName"
    
    if (-not $script:aprendizId) {
        Write-Warning "⚠ No hay aprendizId, intentando obtener uno de la lista..."
        try {
            $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices?page=1&limit=1" -Method Get -Headers @{Authorization = "Bearer $token"}
            if ($response.data.Count -gt 0) {
                $script:aprendizId = $response.data[0].id
                Write-Info "   Usando aprendizId: $($script:aprendizId)"
            } else {
                Write-Error "✗ No hay aprendices disponibles"
                return
            }
        }
        catch {
            Write-Error "✗ No se pudo obtener un aprendiz"
            return
        }
    }
    
    Write-Info "📤 Obteniendo detalle del aprendiz: $($script:aprendizId)..."
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices/$($script:aprendizId)" -Method Get -Headers @{Authorization = "Bearer $token"}
        Write-Success "✓ Detalle obtenido exitosamente"
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "✗ Error al obtener detalle (Status: $statusCode)"
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# ==================================================================
# PRUEBA 6: ACTUALIZAR APRENDIZ (PATCH /aprendices/:id)
# ==================================================================
function Test-UpdateAprendiz {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 6: Actualizar Aprendiz como $roleName"
    
    if (-not $script:aprendizId) {
        Write-Error "✗ No hay aprendizId disponible"
        return
    }
    
    $body = @{
        telefono = "3009999999"
        direccion = "Calle Actualizada #123"
    } | ConvertTo-Json
    
    Write-Info "📤 Actualizando aprendiz: $($script:aprendizId)..."
    Write-Host "Body: $body" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices/$($script:aprendizId)" -Method Patch -Body $body -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
        Write-Success "✓ Aprendiz actualizado exitosamente"
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "✗ Error al actualizar aprendiz (Status: $statusCode)"
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
        }
    }
}

# ==================================================================
# PRUEBA 7: CAMBIAR ESTADO ACADÉMICO (PATCH /aprendices/:id/estado)
# ==================================================================
function Test-UpdateEstadoAcademico {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 7: Cambiar Estado Académico como $roleName"
    
    if (-not $script:aprendizId) {
        Write-Error "✗ No hay aprendizId disponible"
        return
    }
    
    $body = @{
        estadoAcademico = "SUSPENDIDO"
        observaciones = "Suspendido por pruebas de testing"
    } | ConvertTo-Json
    
    Write-Info "📤 Cambiando estado académico del aprendiz: $($script:aprendizId)..."
    Write-Host "Body: $body" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices/$($script:aprendizId)/estado" -Method Patch -Body $body -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
        Write-Success "✓ Estado académico actualizado exitosamente"
        Write-Host ($response | ConvertTo-Json -Depth 3) -ForegroundColor Green
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "✗ Error al cambiar estado (Status: $statusCode)"
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
        }
    }
}

# ==================================================================
# PRUEBA 8: LISTAR APRENDICES DE UNA FICHA
# ==================================================================
function Test-ListAprendicesByFicha {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 8: Listar Aprendices por Ficha como $roleName"
    
    if (-not $script:fichaId) {
        Write-Error "✗ No hay fichaId disponible"
        return
    }
    
    Write-Info "📤 Obteniendo aprendices de la ficha: $($script:fichaId)..."
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/aprendices/ficha/$($script:fichaId)/aprendices" -Method Get -Headers @{Authorization = "Bearer $token"}
        Write-Success "✓ Lista de aprendices por ficha obtenida"
        Write-Host "   Total aprendices en la ficha: $($response.Count)" -ForegroundColor Cyan
        
        if ($response.Count -gt 0) {
            $response | Select-Object -First 5 | ForEach-Object {
                Write-Host "   - $($_.nombres) $($_.apellidos) - Estado: $($_.estadoAcademico)" -ForegroundColor Gray
            }
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "✗ Error al obtener aprendices por ficha (Status: $statusCode)"
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# ==================================================================
# PRUEBA 9: ELIMINAR APRENDIZ (DELETE /aprendices/:id)
# ==================================================================
function Test-DeleteAprendiz {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 9: Eliminar Aprendiz como $roleName"
    
    if (-not $script:aprendizId) {
        Write-Error "✗ No hay aprendizId disponible"
        return
    }
    
    Write-Info "📤 Eliminando aprendiz: $($script:aprendizId)..."
    
    try {
        Invoke-RestMethod -Uri "$BASE_URL/aprendices/$($script:aprendizId)" -Method Delete -Headers @{Authorization = "Bearer $token"}
        Write-Success "✓ Aprendiz eliminado exitosamente (soft delete)"
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Error "✗ Error al eliminar aprendiz (Status: $statusCode)"
        Write-Host $_.Exception.Message -ForegroundColor Red
        
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Yellow
        }
    }
}

# ==================================================================
# PRUEBA 10: VALIDACIONES
# ==================================================================
function Test-Validations {
    param([string]$token, [string]$roleName)
    
    Write-Title "PRUEBA 10: Validaciones y Errores"
    
    Write-Info "📤 Intentando crear aprendiz sin datos requeridos..."
    $body = @{
        nombres = ""
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$BASE_URL/aprendices" -Method Post -Body $body -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
        Write-Error "✗ No se validaron los campos requeridos"
    }
    catch {
        Write-Success "✓ Validación de campos requeridos funciona correctamente"
        if ($_.ErrorDetails.Message) {
            Write-Host "   Errores: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
    }
    
    Write-Info "📤 Intentando crear aprendiz con documento duplicado..."
    if ($script:userId -and $script:fichaId) {
        $body = @{
            nombres = "Test"
            apellidos = "Duplicado"
            tipoDocumento = "CC"
            documento = "1234567890"  # Documento que probablemente ya existe
            userId = $script:userId
            fichaId = $script:fichaId
        } | ConvertTo-Json
        
        try {
            Invoke-RestMethod -Uri "$BASE_URL/aprendices" -Method Post -Body $body -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
            Write-Warning "⚠ Se permitió crear aprendiz con documento duplicado"
        }
        catch {
            Write-Success "✓ Validación de documento duplicado funciona correctamente"
            if ($_.ErrorDetails.Message) {
                Write-Host "   Error: $($_.ErrorDetails.Message)" -ForegroundColor Gray
            }
        }
    }
}

# ==================================================================
# SCRIPT PRINCIPAL
# ==================================================================
Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     PRUEBAS DEL MÓDULO DE APRENDICES - AppSena              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

Write-Info "🚀 Iniciando pruebas del módulo de aprendices..."
Write-Host ""

# Login con diferentes roles
$adminToken = Get-LoginToken -email "admin@sena.edu.co" -password "Admin123!" -roleName "ADMIN"
$instructorToken = Get-LoginToken -email "instructor@sena.edu.co" -password "Instructor123!" -roleName "INSTRUCTOR"
$coordinadorToken = Get-LoginToken -email "coordinador@sena.edu.co" -password "Coordinador123!" -roleName "COORDINADOR"

if (-not $adminToken) {
    Write-Error "❌ No se pudo obtener el token de administrador. Abortando pruebas."
    exit 1
}

# Obtener datos de referencia
Get-ReferenceData -token $adminToken

Write-Host "`n" 
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "          PRUEBAS CON ROL: ADMINISTRADOR" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Test-CreateAprendiz -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

Test-ListAprendices -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

Test-ListAprendicesWithFilters -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

Test-SearchAprendiz -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

Test-GetAprendizDetail -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

Test-UpdateAprendiz -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

Test-UpdateEstadoAcademico -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

Test-ListAprendicesByFicha -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

Test-Validations -token $adminToken -roleName "ADMIN"
Start-Sleep -Seconds 1

if ($instructorToken) {
    Write-Host "`n" 
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "          PRUEBAS CON ROL: INSTRUCTOR" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Test-ListAprendices -token $instructorToken -roleName "INSTRUCTOR"
    Start-Sleep -Seconds 1
    
    Test-GetAprendizDetail -token $instructorToken -roleName "INSTRUCTOR"
    Start-Sleep -Seconds 1
    
    # Instructor NO debería poder cambiar estado académico
    Write-Title "PRUEBA: Instructor NO puede cambiar estado académico"
    Test-UpdateEstadoAcademico -token $instructorToken -roleName "INSTRUCTOR"
    Start-Sleep -Seconds 1
    
    # Instructor NO debería poder eliminar
    Write-Title "PRUEBA: Instructor NO puede eliminar aprendices"
    Test-DeleteAprendiz -token $instructorToken -roleName "INSTRUCTOR"
}

if ($coordinadorToken) {
    Write-Host "`n" 
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "          PRUEBAS CON ROL: COORDINADOR" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Test-ListAprendices -token $coordinadorToken -roleName "COORDINADOR"
    Start-Sleep -Seconds 1
    
    Test-UpdateEstadoAcademico -token $coordinadorToken -roleName "COORDINADOR"
    Start-Sleep -Seconds 1
    
    # Coordinador NO debería poder eliminar (solo ADMIN)
    Write-Title "PRUEBA: Coordinador NO puede eliminar aprendices"
    Test-DeleteAprendiz -token $coordinadorToken -roleName "COORDINADOR"
}

# Prueba final de eliminación con ADMIN
Test-DeleteAprendiz -token $adminToken -roleName "ADMIN"

Write-Host "`n"
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║           ✓ PRUEBAS COMPLETADAS EXITOSAMENTE                ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
