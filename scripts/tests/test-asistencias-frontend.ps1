# Script de Pruebas - Módulo de Asistencias Frontend
# Este script verifica que el frontend pueda conectarse al backend

Write-Host "=== Pruebas del Módulo de Asistencias - Frontend ===" -ForegroundColor Cyan
Write-Host ""

# Configuración
$baseUrl = "http://localhost:3000/api"
$token = ""

# Función para hacer peticiones HTTP
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = ""
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Uri = "$baseUrl$Endpoint"
        Method = $Method
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
        }
        return $null
    }
}

# Test 1: Login
Write-Host "Test 1: Login como instructor" -ForegroundColor Yellow
$loginData = @{
    email = "instructor@mail.com"
    password = "12345678"
}

$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginData

if ($loginResponse) {
    $token = $loginResponse.access_token
    Write-Host "✅ Login exitoso. Token obtenido." -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.user.nombre) - Rol: $($loginResponse.user.rol)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Error en login" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Listar Fichas
Write-Host "Test 2: Obtener fichas disponibles" -ForegroundColor Yellow
$fichas = Invoke-ApiRequest -Method "GET" -Endpoint "/fichas" -Token $token

if ($fichas) {
    Write-Host "✅ Fichas obtenidas: $($fichas.Count)" -ForegroundColor Green
    if ($fichas.Count -gt 0) {
        $fichaId = $fichas[0].id
        Write-Host "Primera ficha: $($fichas[0].numeroFicha) - Programa: $($fichas[0].programa.nombre)" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Error al obtener fichas" -ForegroundColor Red
}

Write-Host ""

# Test 3: Crear Sesión
if ($fichaId) {
    Write-Host "Test 3: Crear nueva sesión de clase" -ForegroundColor Yellow
    $hoy = (Get-Date).ToString("yyyy-MM-dd")
    
    $nuevaSesion = @{
        fichaId = $fichaId
        fecha = $hoy
        tema = "Testing Frontend Integration"
        observaciones = "Sesión de prueba creada desde PowerShell"
    }
    
    $sesionCreada = Invoke-ApiRequest -Method "POST" -Endpoint "/asistencias/sesiones" -Body $nuevaSesion -Token $token
    
    if ($sesionCreada) {
        $sesionId = $sesionCreada.id
        Write-Host "✅ Sesión creada con ID: $sesionId" -ForegroundColor Green
        Write-Host "Tema: $($sesionCreada.tema)" -ForegroundColor Cyan
        Write-Host "Asistencias pre-cargadas: $($sesionCreada.asistencias.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al crear sesión" -ForegroundColor Red
    }
}

Write-Host ""

# Test 4: Listar Sesiones
Write-Host "Test 4: Listar sesiones de la ficha" -ForegroundColor Yellow
$sesiones = Invoke-ApiRequest -Method "GET" -Endpoint "/asistencias/sesiones?fichaId=$fichaId&page=1&limit=10" -Token $token

if ($sesiones) {
    Write-Host "✅ Sesiones obtenidas: $($sesiones.data.Count)" -ForegroundColor Green
    foreach ($ses in $sesiones.data) {
        $presentes = ($ses.asistencias | Where-Object { $_.presente -eq $true }).Count
        $ausentes = ($ses.asistencias | Where-Object { $_.presente -eq $false }).Count
        Write-Host "  - Fecha: $($ses.fecha) | Tema: $($ses.tema) | Presentes: $presentes | Ausentes: $ausentes" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Error al listar sesiones" -ForegroundColor Red
}

Write-Host ""

# Test 5: Obtener detalle de sesión
if ($sesionId) {
    Write-Host "Test 5: Obtener detalle de sesión" -ForegroundColor Yellow
    $detalleSesion = Invoke-ApiRequest -Method "GET" -Endpoint "/asistencias/sesiones/$sesionId" -Token $token
    
    if ($detalleSesion) {
        Write-Host "✅ Detalle obtenido correctamente" -ForegroundColor Green
        Write-Host "Fecha: $($detalleSesion.fecha)" -ForegroundColor Cyan
        Write-Host "Tema: $($detalleSesion.tema)" -ForegroundColor Cyan
        Write-Host "Total aprendices: $($detalleSesion.asistencias.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al obtener detalle" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: Registrar asistencias
if ($sesionId -and $detalleSesion) {
    Write-Host "Test 6: Registrar asistencias" -ForegroundColor Yellow
    
    # Marcar los primeros 3 como presentes
    $asistenciasUpdate = @{
        asistencias = @()
    }
    
    for ($i = 0; $i -lt [Math]::Min(3, $detalleSesion.asistencias.Count); $i++) {
        $asistenciasUpdate.asistencias += @{
            aprendizId = $detalleSesion.asistencias[$i].aprendizId
            presente = $true
        }
    }
    
    # Marcar el resto como ausentes
    for ($i = 3; $i -lt $detalleSesion.asistencias.Count; $i++) {
        $asistenciasUpdate.asistencias += @{
            aprendizId = $detalleSesion.asistencias[$i].aprendizId
            presente = $false
        }
    }
    
    $registroResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/asistencias/sesiones/$sesionId/registrar" -Body $asistenciasUpdate -Token $token
    
    if ($registroResponse) {
        Write-Host "✅ Asistencias registradas correctamente" -ForegroundColor Green
        $presentesCount = ($registroResponse.asistencias | Where-Object { $_.presente -eq $true }).Count
        $ausentesCount = ($registroResponse.asistencias | Where-Object { $_.presente -eq $false }).Count
        Write-Host "Presentes: $presentesCount | Ausentes: $ausentesCount" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Error al registrar asistencias" -ForegroundColor Red
    }
}

Write-Host ""

# Test 7: Obtener alertas
if ($fichaId) {
    Write-Host "Test 7: Obtener alertas de riesgo" -ForegroundColor Yellow
    $mesActual = (Get-Date).ToString("yyyy-MM")
    
    $alertas = Invoke-ApiRequest -Method "GET" -Endpoint "/asistencias/fichas/$fichaId/alertas?mes=$mesActual" -Token $token
    
    if ($alertas) {
        Write-Host "✅ Alertas obtenidas correctamente" -ForegroundColor Green
        Write-Host "Estudiantes en riesgo: $($alertas.alertas.Count)" -ForegroundColor Cyan
        
        if ($alertas.alertas.Count -gt 0) {
            foreach ($alerta in $alertas.alertas) {
                Write-Host "  ⚠️  $($alerta.nombres) $($alerta.apellidos)" -ForegroundColor Yellow
                Write-Host "     Consecutivas: $($alerta.consecutivasNoJustificadas) | Mes: $($alerta.faltasMesNoJustificadas) | Criterio: $($alerta.criterio)" -ForegroundColor Cyan
            }
        } else {
            Write-Host "No hay estudiantes en riesgo actualmente" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Error al obtener alertas" -ForegroundColor Red
    }
}

Write-Host ""

# Test 8: Obtener resumen
if ($fichaId) {
    Write-Host "Test 8: Obtener resumen de asistencias" -ForegroundColor Yellow
    $fechaInicio = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
    $fechaFin = (Get-Date).ToString("yyyy-MM-dd")
    
    $resumen = Invoke-ApiRequest -Method "GET" -Endpoint "/asistencias/fichas/$fichaId/resumen?fechaInicio=$fechaInicio&fechaFin=$fechaFin" -Token $token
    
    if ($resumen) {
        Write-Host "✅ Resumen obtenido correctamente" -ForegroundColor Green
        Write-Host "Ficha: $($resumen.numeroFicha)" -ForegroundColor Cyan
        Write-Host "Total sesiones: $($resumen.totalSesiones)" -ForegroundColor Cyan
        Write-Host "Total aprendices: $($resumen.totalAprendices)" -ForegroundColor Cyan
        Write-Host "Porcentaje asistencia promedio: $([Math]::Round($resumen.porcentajeAsistenciaPromedio, 2))%" -ForegroundColor Cyan
        
        if ($resumen.topAusencias.Count -gt 0) {
            Write-Host "`nTop 5 con más ausencias:" -ForegroundColor Yellow
            for ($i = 0; $i -lt [Math]::Min(5, $resumen.topAusencias.Count); $i++) {
                $top = $resumen.topAusencias[$i]
                Write-Host "  $($i+1). $($top.nombres) $($top.apellidos) - $($top.totalAusencias) ausencias" -ForegroundColor Cyan
            }
        }
    } else {
        Write-Host "❌ Error al obtener resumen" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Pruebas Completadas ===" -ForegroundColor Green
Write-Host ""
Write-Host "Resumen de rutas del frontend:" -ForegroundColor Cyan
Write-Host "  - Dashboard principal:      http://localhost:3001/dashboard/asistencias" -ForegroundColor White
Write-Host "  - Nueva sesión:             http://localhost:3001/dashboard/asistencias/nueva-sesion" -ForegroundColor White
Write-Host "  - Registrar asistencia:     http://localhost:3001/dashboard/asistencias/registrar/[id]" -ForegroundColor White
Write-Host "  - Alertas de riesgo:        http://localhost:3001/dashboard/asistencias/alertas" -ForegroundColor White
Write-Host "  - Resumen estadísticas:     http://localhost:3001/dashboard/asistencias/resumen" -ForegroundColor White
Write-Host "  - Detalle de sesión:        http://localhost:3001/dashboard/asistencias/sesion/[id]" -ForegroundColor White
Write-Host ""
Write-Host "Nota: Asegúrate de que el frontend Next.js esté corriendo en el puerto 3001" -ForegroundColor Yellow
