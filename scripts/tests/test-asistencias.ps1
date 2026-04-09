# Script de pruebas para el Módulo de Asistencias - Sprint 3
# Ejecutar desde la raíz del proyecto: .\test-asistencias.ps1

$baseUrl = "http://localhost:3000/api"
$token = ""

Write-Host "==========================================="`n
Write-Host "PRUEBAS MÓDULO ASISTENCIAS - SPRINT 3"`n
Write-Host "==========================================="`n

# ========== 1. LOGIN ===========
Write-Host "1️⃣  LOGIN - Obteniendo token de autenticación..." -ForegroundColor Cyan

$loginBody = @{
    email = "admin@sena.edu.co"
    password = "Admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..."`n
} catch {
    Write-Host "❌ Error en login: $_" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# ========== 2. OBTENER FICHAS DISPONIBLES ===========
Write-Host "2️⃣  Obteniendo fichas disponibles..." -ForegroundColor Cyan

try {
    $fichasResponse = Invoke-RestMethod -Uri "$baseUrl/fichas?limit=5" -Method GET -Headers $headers
    
    if ($fichasResponse.data.Count -eq 0) {
        Write-Host "⚠️  No hay fichas disponibles. Por favor, crea una ficha primero." -ForegroundColor Yellow
        exit
    }
    
    $fichaId = $fichasResponse.data[0].id
    $fichaNumero = $fichasResponse.data[0].numeroFicha
    
    Write-Host "✅ Fichas obtenidas exitosamente" -ForegroundColor Green
    Write-Host "Ficha seleccionada: $fichaNumero (ID: $fichaId)"`n
} catch {
    Write-Host "❌ Error al obtener fichas: $_" -ForegroundColor Red
    exit
}

# ========== 3. CREAR SESIÓN DE CLASE ===========
Write-Host "3️⃣  Creando sesión de clase..." -ForegroundColor Cyan

$fechaHoy = Get-Date -Format "yyyy-MM-dd"

$sesionBody = @{
    fichaId = $fichaId
    fecha = $fechaHoy
    tema = "Introducción a NestJS y TypeORM"
    observaciones = "Primera sesión del módulo de backend"
} | ConvertTo-Json

try {
    $sesionResponse = Invoke-RestMethod -Uri "$baseUrl/asistencias/sesiones" -Method POST -Body $sesionBody -Headers $headers
    $sesionId = $sesionResponse.id
    
    Write-Host "✅ Sesión creada exitosamente" -ForegroundColor Green
    Write-Host "Sesión ID: $sesionId"
    Write-Host "Fecha: $($sesionResponse.fecha)"
    Write-Host "Tema: $($sesionResponse.tema)"`n
} catch {
    Write-Host "❌ Error al crear sesión: $_" -ForegroundColor Red
    
    # Si ya existe, intentar obtener sesiones
    Write-Host "⚠️  Probablemente ya existe una sesión para esta fecha. Intentando obtener sesiones..." -ForegroundColor Yellow
    
    try {
        $sesionesResponse = Invoke-RestMethod -Uri "$baseUrl/asistencias/sesiones?fichaId=$fichaId&limit=1" -Method GET -Headers $headers
        
        if ($sesionesResponse.data.Count -gt 0) {
            $sesionId = $sesionesResponse.data[0].id
            Write-Host "✅ Sesión obtenida: $sesionId"`n -ForegroundColor Green
        } else {
            Write-Host "❌ No se pudo obtener ni crear sesión" -ForegroundColor Red
            exit
        }
    } catch {
        Write-Host "❌ Error al obtener sesiones: $_" -ForegroundColor Red
        exit
    }
}

# ========== 4. OBTENER APRENDICES DE LA FICHA ===========
Write-Host "4️⃣  Obteniendo aprendices de la ficha..." -ForegroundColor Cyan

try {
    $aprendicesResponse = Invoke-RestMethod -Uri "$baseUrl/aprendices?fichaId=$fichaId" -Method GET -Headers $headers
    
    if ($aprendicesResponse.data.Count -eq 0) {
        Write-Host "⚠️  No hay aprendices en esta ficha. Por favor, crea aprendices primero." -ForegroundColor Yellow
        exit
    }
    
    Write-Host "✅ Aprendices obtenidos: $($aprendicesResponse.data.Count)" -ForegroundColor Green
    
    # Mostrar aprendices
    foreach ($aprendiz in $aprendicesResponse.data) {
        Write-Host "  - $($aprendiz.nombres) $($aprendiz.apellidos) (Doc: $($aprendiz.documento))"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener aprendices: $_" -ForegroundColor Red
    exit
}

# ========== 5. REGISTRAR ASISTENCIAS ===========
Write-Host "5️⃣  Registrando asistencias..." -ForegroundColor Cyan

$asistencias = @()
$totalAprendices = $aprendicesResponse.data.Count
$presentesCount = [Math]::Floor($totalAprendices * 0.7) # 70% presentes

for ($i = 0; $i -lt $aprendicesResponse.data.Count; $i++) {
    $aprendiz = $aprendicesResponse.data[$i]
    $presente = $i -lt $presentesCount
    
    $asistencias += @{
        aprendizId = $aprendiz.id
        presente = $presente
    }
}

$registrarBody = @{
    asistencias = $asistencias
} | ConvertTo-Json -Depth 3

try {
    $registrarResponse = Invoke-RestMethod -Uri "$baseUrl/asistencias/sesiones/$sesionId/registrar" -Method POST -Body $registrarBody -Headers $headers
    
    Write-Host "✅ Asistencias registradas exitosamente" -ForegroundColor Green
    Write-Host "Total registradas: $($registrarResponse.registradas)"
    Write-Host "Presentes: $presentesCount / Ausentes: $($totalAprendices - $presentesCount)"`n
} catch {
    Write-Host "❌ Error al registrar asistencias: $_" -ForegroundColor Red
}

# ========== 6. VER DETALLE DE SESIÓN ===========
Write-Host "6️⃣  Obteniendo detalle de la sesión..." -ForegroundColor Cyan

try {
    $detalleResponse = Invoke-RestMethod -Uri "$baseUrl/asistencias/sesiones/$sesionId" -Method GET -Headers $headers
    
    Write-Host "✅ Detalle de sesión obtenido" -ForegroundColor Green
    Write-Host "Ficha: $($detalleResponse.ficha.numeroFicha)"
    Write-Host "Fecha: $($detalleResponse.fecha)"
    Write-Host "Tema: $($detalleResponse.tema)"
    
    if ($detalleResponse.resumen) {
        Write-Host "Resumen de asistencias:"
        Write-Host "  - Total aprendices: $($detalleResponse.resumen.totalAprendices)"
        Write-Host "  - Presentes: $($detalleResponse.resumen.presentes)"
        Write-Host "  - Ausentes: $($detalleResponse.resumen.ausentes)"`n
    }
} catch {
    Write-Host "❌ Error al obtener detalle: $_" -ForegroundColor Red
}

# ========== 7. JUSTIFICAR UNA AUSENCIA ===========
Write-Host "7️⃣  Justificando una ausencia..." -ForegroundColor Cyan

# Buscar un aprendiz ausente
$aprendizAusente = $null
foreach ($i in $presentesCount..($totalAprendices - 1)) {
    if ($i -lt $aprendicesResponse.data.Count) {
        $aprendizAusente = $aprendicesResponse.data[$i]
        break
    }
}

if ($aprendizAusente) {
    # Primero necesitamos obtener el ID de la asistencia
    # Crear otra sesión para tener más datos
    $fechaAyer = (Get-Date).AddDays(-1).ToString("yyyy-MM-dd")
    
    $sesion2Body = @{
        fichaId = $fichaId
        fecha = $fechaAyer
        tema = "Repaso de conceptos"
        observaciones = "Sesión anterior"
    } | ConvertTo-Json
    
    try {
        $sesion2Response = Invoke-RestMethod -Uri "$baseUrl/asistencias/sesiones" -Method POST -Body $sesion2Body -Headers $headers
        $sesion2Id = $sesion2Response.id
        
        # Registrar asistencias para sesión 2
        $asistencias2 = @(
            @{
                aprendizId = $aprendizAusente.id
                presente = $false
            }
        )
        
        $registrar2Body = @{
            asistencias = $asistencias2
        } | ConvertTo-Json -Depth 3
        
        Invoke-RestMethod -Uri "$baseUrl/asistencias/sesiones/$sesion2Id/registrar" -Method POST -Body $registrar2Body -Headers $headers
        
        Write-Host "✅ Segunda sesión creada para pruebas de justificación" -ForegroundColor Green
        Write-Host "Aprendiz ausente: $($aprendizAusente.nombres) $($aprendizAusente.apellidos)"`n
        
    } catch {
        Write-Host "⚠️  No se pudo crear segunda sesión (puede que ya exista): $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No hay aprendices ausentes para justificar" -ForegroundColor Yellow
}

# ========== 8. OBTENER RESUMEN DE FICHA ===========
Write-Host "8️⃣  Obteniendo resumen de asistencias de la ficha..." -ForegroundColor Cyan

try {
    $resumenResponse = Invoke-RestMethod -Uri "$baseUrl/asistencias/fichas/$fichaId/resumen" -Method GET -Headers $headers
    
    Write-Host "✅ Resumen obtenido exitosamente" -ForegroundColor Green
    Write-Host "Ficha: $($resumenResponse.numeroFicha)"
    Write-Host "Total sesiones: $($resumenResponse.totalSesiones)"
    Write-Host "Total aprendices: $($resumenResponse.totalAprendices)"
    Write-Host "Porcentaje asistencia promedio: $($resumenResponse.porcentajeAsistenciaPromedio)%"
    
    if ($resumenResponse.topAusencias.Count -gt 0) {
        Write-Host "`nTop aprendices con más ausencias:"
        foreach ($item in $resumenResponse.topAusencias) {
            Write-Host "  - $($item.nombres) $($item.apellidos): $($item.totalAusencias) ausencias"
        }
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener resumen: $_" -ForegroundColor Red
}

# ========== 9. OBTENER ALERTAS ===========
Write-Host "9️⃣  Obteniendo alertas de riesgo de deserción..." -ForegroundColor Cyan

try {
    $mesActual = Get-Date -Format "yyyy-MM"
    $alertasResponse = Invoke-RestMethod -Uri "$baseUrl/asistencias/fichas/$fichaId/alertas?month=$mesActual" -Method GET -Headers $headers
    
    Write-Host "✅ Alertas obtenidas exitosamente" -ForegroundColor Green
    Write-Host "Ficha: $($alertasResponse.numeroFicha)"
    Write-Host "Mes: $($alertasResponse.mes)"
    Write-Host "Total alertas: $($alertasResponse.alertas.Count)"
    
    if ($alertasResponse.alertas.Count -gt 0) {
        Write-Host "`n⚠️  APRENDICES EN RIESGO:" -ForegroundColor Yellow
        foreach ($alerta in $alertasResponse.alertas) {
            Write-Host "  - $($alerta.nombres) $($alerta.apellidos) (Doc: $($alerta.documento))"
            Write-Host "    Consecutivas: $($alerta.consecutivasNoJustificadas)"
            Write-Host "    Faltas del mes: $($alerta.faltasMesNoJustificadas)"
            Write-Host "    Criterio: $($alerta.criterio)"`n
        }
    } else {
        Write-Host "✅ No hay aprendices en riesgo de deserción" -ForegroundColor Green
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener alertas: $_" -ForegroundColor Red
}

# ========== 10. LISTAR TODAS LAS SESIONES ===========
Write-Host "🔟  Listando todas las sesiones..." -ForegroundColor Cyan

try {
    $todasSesionesResponse = Invoke-RestMethod -Uri "$baseUrl/asistencias/sesiones?fichaId=$fichaId&limit=10" -Method GET -Headers $headers
    
    Write-Host "✅ Sesiones obtenidas: $($todasSesionesResponse.total)" -ForegroundColor Green
    
    foreach ($sesion in $todasSesionesResponse.data) {
        Write-Host "  - Fecha: $($sesion.fecha) | Tema: $($sesion.tema)"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error al listar sesiones: $_" -ForegroundColor Red
}

Write-Host "==========================================="`n
Write-Host "✅ PRUEBAS COMPLETADAS" -ForegroundColor Green
Write-Host "==========================================="`n
Write-Host "Visita Swagger para más detalles: http://localhost:3000/api/docs"`n
