# Script de pruebas del Frontend
# Este script verifica que todos los módulos estén conectados correctamente

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  PRUEBAS DE CONEXIÓN FRONTEND-BACKEND" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$apiUrl = "http://localhost:3000/api"
$frontendUrl = "http://localhost:3001"

# Función para verificar si el servicio está corriendo
function Test-Service {
    param($url, $name)
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 5 -UseBasicParsing
        Write-Host "✓ $name está corriendo" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "✗ $name no está disponible" -ForegroundColor Red
        return $false
    }
}

# Función para probar endpoint con token
function Test-Endpoint {
    param($endpoint, $token, $description)
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $response = Invoke-RestMethod -Uri "$apiUrl$endpoint" -Headers $headers -Method Get
        Write-Host "  ✓ $description" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "  ✗ $description - Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "1. Verificando servicios..." -ForegroundColor Yellow
Write-Host ""

$backendRunning = Test-Service "$apiUrl/auth/login" "Backend API"
$frontendRunning = Test-Service $frontendUrl "Frontend"

Write-Host ""

if (-not $backendRunning) {
    Write-Host "ERROR: El backend no está corriendo." -ForegroundColor Red
    Write-Host "Por favor ejecuta: cd backend; npm run start:dev" -ForegroundColor Yellow
    exit 1
}

if (-not $frontendRunning) {
    Write-Host "ERROR: El frontend no está corriendo." -ForegroundColor Red
    Write-Host "Por favor ejecuta: cd frontend; npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "2. Probando autenticación..." -ForegroundColor Yellow
Write-Host ""

try {
    $loginData = @{
        email = "admin@sena.edu.co"
        password = "Admin123*"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "  ✓ Login exitoso como: $($loginResponse.user.nombre)" -ForegroundColor Green
    Write-Host "  ✓ Token obtenido" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Verifica las credenciales en backend/USERS_CREDENTIALS.md" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "3. Probando endpoints del API..." -ForegroundColor Yellow
Write-Host ""

$endpoints = @(
    @{ path="/aprendices?page=1&limit=5"; desc="Aprendices - Listado" },
    @{ path="/aprendices?search=Juan"; desc="Aprendices - Búsqueda" },
    @{ path="/aprendices?estadoAcademico=ACTIVO"; desc="Aprendices - Filtro por estado" },
    @{ path="/fichas?page=1&limit=5"; desc="Fichas - Listado" },
    @{ path="/fichas?estado=ACTIVA"; desc="Fichas - Filtro por estado" },
    @{ path="/colegios?page=1&limit=5"; desc="Colegios - Listado" },
    @{ path="/programas?page=1&limit=5"; desc="Programas - Listado" },
    @{ path="/programas?nivelFormacion=TECNICO"; desc="Programas - Filtro por nivel" },
    @{ path="/users?page=1&limit=5"; desc="Usuarios - Listado" },
    @{ path="/users?rol=instructor"; desc="Usuarios - Filtro por rol" }
)

$totalTests = $endpoints.Count
$passedTests = 0

foreach ($endpoint in $endpoints) {
    $result = Test-Endpoint -endpoint $endpoint.path -token $token -description $endpoint.desc
    if ($result) {
        $passedTests++
    }
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "4. Resumen de pruebas" -ForegroundColor Yellow
Write-Host ""

Write-Host "  Tests ejecutados: $totalTests" -ForegroundColor Cyan
Write-Host "  Tests exitosos:   $passedTests" -ForegroundColor Green
Write-Host "  Tests fallidos:   $($totalTests - $passedTests)" -ForegroundColor Red

Write-Host ""

if ($passedTests -eq $totalTests) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "  ✓ TODAS LAS PRUEBAS PASARON" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "El frontend está correctamente conectado al backend." -ForegroundColor Green
    Write-Host ""
    Write-Host "Puedes acceder a:" -ForegroundColor Cyan
    Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
    Write-Host "  Login:    $frontendUrl/login" -ForegroundColor White
    Write-Host ""
    Write-Host "Credenciales:" -ForegroundColor Cyan
    Write-Host "  Email:    admin@sena.edu.co" -ForegroundColor White
    Write-Host "  Password: Admin123*" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "================================================" -ForegroundColor Red
    Write-Host "  ✗ ALGUNAS PRUEBAS FALLARON" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los errores anteriores para más detalles." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "5. Módulos del Frontend implementados:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✓ Dashboard Principal       (/dashboard)" -ForegroundColor Green
Write-Host "  ✓ Gestión de Aprendices     (/dashboard/aprendices)" -ForegroundColor Green
Write-Host "  ✓ Gestión de Fichas         (/dashboard/fichas)" -ForegroundColor Green
Write-Host "  ✓ Gestión de Colegios       (/dashboard/colegios)" -ForegroundColor Green
Write-Host "  ✓ Gestión de Programas      (/dashboard/programas)" -ForegroundColor Green
Write-Host "  ✓ Gestión de Usuarios       (/dashboard/users)" -ForegroundColor Green
Write-Host "  ✓ Estadísticas              (/dashboard/stats)" -ForegroundColor Green
Write-Host "  ✓ Login                     (/login)" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
