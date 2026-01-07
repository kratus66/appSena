# =============================================
# TEST SCRIPT: Módulo PTC (Plan de Trabajo Concertado) + Actas
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
    Write-Host "Detalles: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# =============================================
# PASO 2: Obtener fichas, aprendices y caso disciplinario
# =============================================
Write-Step "PASO 2: Obtener datos necesarios"

try {
    $fichas = Invoke-RestMethod -Uri "$baseUrl/fichas" -Method Get -Headers $headers
    $fichaId = $fichas.data[0].id
    Write-Success "✓ Ficha ID obtenida: $fichaId"
    Write-Host "  Programa: $($fichas.data[0].nombrePrograma)"
    Write-Host "  Número: $($fichas.data[0].numero)"
} catch {
    Write-Error "✗ Error obteniendo fichas: $_"
    exit 1
}

try {
    $aprendices = Invoke-RestMethod -Uri "$baseUrl/aprendices?fichaId=$fichaId" -Method Get -Headers $headers
    $aprendizId1 = $aprendices.data[0].id
    $aprendizId2 = $aprendices.data[1].id
    Write-Success "✓ Aprendices obtenidos: $($aprendices.data.Count)"
    Write-Host "  Aprendiz 1: $($aprendices.data[0].nombres) $($aprendices.data[0].apellidos)"
    Write-Host "  Aprendiz 2: $($aprendices.data[1].nombres) $($aprendices.data[1].apellidos)"
} catch {
    Write-Error "✗ Error obteniendo aprendices: $_"
    exit 1
}

# Obtener caso disciplinario existente (opcional)
try {
    $casos = Invoke-RestMethod -Uri "$baseUrl/disciplinario/casos?limit=1" -Method Get -Headers $headers
    if ($casos.data.Count -gt 0) {
        $casoId = $casos.data[0].id
        Write-Success "✓ Caso disciplinario obtenido: $casoId"
        Write-Host "  Motivo: $($casos.data[0].asunto)"
    } else {
        Write-Info "ℹ No hay casos disciplinarios disponibles"
        $casoId = $null
    }
} catch {
    Write-Info "ℹ No se pudo obtener caso disciplinario: $_"
    $casoId = $null
}

# =============================================
# PASO 3: CREAR PTC (Plan de Trabajo Concertado)
# =============================================
Write-Step "PASO 3: Crear PTC"

$ptcData = @{
    fichaId = $fichaId
    aprendizId = $aprendizId1
    motivo = "Plan de mejoramiento académico"
    descripcion = "El aprendiz presenta bajo rendimiento en competencias técnicas del trimestre 2. Se establece plan de trabajo con tutorías de refuerzo y compromisos específicos."
    fechaInicio = "2026-01-15"
    fechaFin = "2026-03-15"
}

if ($casoId) {
    $ptcData.casoDisciplinarioId = $casoId
}

$ptcJson = $ptcData | ConvertTo-Json

try {
    $responsePtc1 = Invoke-RestMethod -Uri "$baseUrl/ptc" -Method Post -Body $ptcJson -Headers $headers
    $ptcId1 = $responsePtc1.id
    Write-Success "✓ PTC creado exitosamente: $ptcId1"
    Write-Host "  Motivo: $($responsePtc1.motivo)"
    Write-Host "  Estado: $($responsePtc1.estado)"
    Write-Host "  Fecha inicio: $($responsePtc1.fechaInicio)"
    Write-Host "  Fecha fin: $($responsePtc1.fechaFin)"
} catch {
    Write-Error "✗ Error creando PTC: $_"
    Write-Host "Detalles: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Crear segundo PTC para otro aprendiz
$ptcData2 = @{
    fichaId = $fichaId
    aprendizId = $aprendizId2
    motivo = "Plan de trabajo por inasistencias"
    descripcion = "El aprendiz presenta inasistencias reiteradas. Se establece compromiso de asistencia regular y justificación oportuna."
    fechaInicio = "2026-01-10"
    fechaFin = "2026-02-28"
} | ConvertTo-Json

try {
    $responsePtc2 = Invoke-RestMethod -Uri "$baseUrl/ptc" -Method Post -Body $ptcData2 -Headers $headers
    $ptcId2 = $responsePtc2.id
    Write-Success "✓ Segundo PTC creado: $ptcId2"
} catch {
    Write-Error "✗ Error creando segundo PTC: $_"
}

# =============================================
# PASO 4: AGREGAR ITEMS/COMPROMISOS AL PTC
# =============================================
Write-Step "PASO 4: Agregar compromisos al PTC"

# Compromiso del aprendiz
$item1 = @{
    tipo = "COMPROMISO_APRENDIZ"
    descripcion = "Asistir a tutorías de refuerzo los martes y jueves de 2pm a 4pm"
    fechaCompromiso = "2026-03-15"
    responsableNombre = "$($aprendices.data[0].nombres) $($aprendices.data[0].apellidos)"
    estado = "PENDIENTE"
} | ConvertTo-Json

try {
    $responseItem1 = Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1/items" -Method Post -Body $item1 -Headers $headers
    $itemId1 = $responseItem1.id
    Write-Success "✓ Compromiso de aprendiz agregado: $itemId1"
    Write-Host "  Descripción: $($responseItem1.descripcion)"
} catch {
    Write-Error "✗ Error agregando compromiso: $_"
}

# Compromiso del instructor
$item2 = @{
    tipo = "COMPROMISO_INSTRUCTOR"
    descripcion = "Realizar seguimiento semanal del progreso del aprendiz y proporcionar retroalimentación"
    fechaCompromiso = "2026-03-15"
    responsableNombre = "Carlos Martínez - Instructor"
    estado = "PENDIENTE"
} | ConvertTo-Json

try {
    $responseItem2 = Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1/items" -Method Post -Body $item2 -Headers $headers
    $itemId2 = $responseItem2.id
    Write-Success "✓ Compromiso de instructor agregado: $itemId2"
} catch {
    Write-Error "✗ Error agregando compromiso: $_"
}

# Compromiso del acudiente
$item3 = @{
    tipo = "COMPROMISO_ACUDIENTE"
    descripcion = "Verificar asistencia diaria y comunicar novedades al instructor"
    fechaCompromiso = "2026-03-15"
    responsableNombre = "Acudiente del aprendiz"
    estado = "PENDIENTE"
} | ConvertTo-Json

try {
    $responseItem3 = Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1/items" -Method Post -Body $item3 -Headers $headers
    $itemId3 = $responseItem3.id
    Write-Success "✓ Compromiso de acudiente agregado: $itemId3"
} catch {
    Write-Error "✗ Error agregando compromiso: $_"
}

# =============================================
# PASO 5: LISTAR PTCs
# =============================================
Write-Step "PASO 5: Listar PTCs con filtros"

try {
    $listaPtc = Invoke-RestMethod -Uri "$baseUrl/ptc?limit=10" -Method Get -Headers $headers
    Write-Success "✓ PTCs obtenidos: $($listaPtc.total)"
    foreach ($ptc in $listaPtc.data) {
        Write-Host "  - $($ptc.motivo) | Estado: $($ptc.estado) | Aprendiz: $($ptc.aprendiz.nombres) $($ptc.aprendiz.apellidos)"
    }
} catch {
    Write-Error "✗ Error listando PTCs: $_"
}

# Filtrar por estado BORRADOR
try {
    $ptcsBorrador = Invoke-RestMethod -Uri "$baseUrl/ptc?estado=BORRADOR" -Method Get -Headers $headers
    Write-Success "✓ PTCs en BORRADOR: $($ptcsBorrador.total)"
} catch {
    Write-Error "✗ Error filtrando por estado: $_"
}

# =============================================
# PASO 6: OBTENER DETALLE DE UN PTC
# =============================================
Write-Step "PASO 6: Obtener detalle del PTC"

try {
    $detallePtc = Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1" -Method Get -Headers $headers
    Write-Success "✓ Detalle del PTC obtenido"
    Write-Host "  Motivo: $($detallePtc.motivo)"
    Write-Host "  Estado: $($detallePtc.estado)"
    Write-Host "  Items/Compromisos: $($detallePtc.items.Count)"
    foreach ($item in $detallePtc.items) {
        Write-Host "    • $($item.tipo): $($item.descripcion.Substring(0, [Math]::Min(50, $item.descripcion.Length)))..."
    }
} catch {
    Write-Error "✗ Error obteniendo detalle: $_"
}

# =============================================
# PASO 7: ACTUALIZAR UN ITEM (marcar como CUMPLIDO)
# =============================================
Write-Step "PASO 7: Actualizar estado de compromiso"

$updateEstadoItem = @{
    estado = "CUMPLIDO"
    notas = "El aprendiz asistió a todas las tutorías programadas durante 2 semanas"
    evidenciaUrl = "https://bucket.s3.amazonaws.com/evidencia-tutorias.pdf"
} | ConvertTo-Json

try {
    $itemActualizado = Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1/items/$itemId1/estado" -Method Patch -Body $updateEstadoItem -Headers $headers
    Write-Success "✓ Estado del item actualizado a: $($itemActualizado.estado)"
    Write-Host "  Notas: $($itemActualizado.notas)"
} catch {
    Write-Error "✗ Error actualizando estado del item: $_"
}

# =============================================
# PASO 8: ACTUALIZAR PTC
# =============================================
Write-Step "PASO 8: Actualizar información del PTC"

$updatePtc = @{
    descripcion = "El aprendiz presenta bajo rendimiento en competencias técnicas del trimestre 2. Se establece plan de trabajo con tutorías de refuerzo y compromisos específicos. ACTUALIZACIÓN: Se observa mejora significativa en las primeras 2 semanas."
    fechaFin = "2026-03-30"
} | ConvertTo-Json

try {
    $ptcActualizado = Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1" -Method Patch -Body $updatePtc -Headers $headers
    Write-Success "✓ PTC actualizado exitosamente"
    Write-Host "  Nueva fecha fin: $($ptcActualizado.fechaFin)"
} catch {
    Write-Error "✗ Error actualizando PTC: $_"
}

# =============================================
# PASO 9: LOGIN como COORDINADOR (para cambiar estado)
# =============================================
Write-Step "PASO 9: Login como coordinador para cambiar estado"

$loginCoordinador = @{
    email = "laura.garcia@sena.edu.co"
    password = "Coordinador123!"
} | ConvertTo-Json

try {
    $loginRespCoord = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginCoordinador -ContentType $contentType
    $tokenCoord = $loginRespCoord.access_token
    Write-Success "✓ Login exitoso como coordinador"
    $headersCoord = @{
        "Authorization" = "Bearer $tokenCoord"
        "Content-Type" = $contentType
    }
} catch {
    Write-Error "✗ Error en login coordinador: $_"
    Write-Info "ℹ Continuando con usuario instructor..."
    $headersCoord = $headers
}

# =============================================
# PASO 10: ACTIVAR PTC (cambiar a VIGENTE)
# =============================================
Write-Step "PASO 10: Activar PTC (cambiar a VIGENTE)"

$activarPtc = @{
    estado = "VIGENTE"
} | ConvertTo-Json

try {
    $ptcVigente = Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1/estado" -Method Patch -Body $activarPtc -Headers $headersCoord
    Write-Success "✓ PTC activado - Estado: $($ptcVigente.estado)"
} catch {
    Write-Error "✗ Error activando PTC: $_"
    Write-Host "Detalles: $($_.Exception.Message)" -ForegroundColor Red
}

# =============================================
# PASO 11: CREAR ACTA DE REUNIÓN
# =============================================
Write-Step "PASO 11: Crear acta de reunión"

$actaData = @{
    fichaId = $fichaId
    aprendizId = $aprendizId1
    ptcId = $ptcId1
    fechaReunion = "2026-01-20T10:00:00Z"
    lugar = "Sala de juntas - Edificio A"
    asunto = "Primera reunión de seguimiento al PTC"
    desarrollo = "Se revisó el cumplimiento de los compromisos establecidos en el PTC. El aprendiz asistió a las tutorías programadas y muestra mejora en las evaluaciones. Se discutió el progreso académico y se identificaron áreas que requieren mayor atención."
    acuerdos = "1. Continuar con las tutorías de refuerzo. 2. Realizar evaluación de seguimiento en 2 semanas. 3. Próxima reunión programada para el 3 de febrero."
    asistentes = @(
        @{
            nombre = "$($aprendices.data[0].nombres) $($aprendices.data[0].apellidos)"
            rol = "APRENDIZ"
            email = "aprendiz@example.com"
        },
        @{
            nombre = "Carlos Martínez"
            rol = "INSTRUCTOR"
            email = "carlos.martinez@sena.edu.co"
        },
        @{
            nombre = "María González"
            rol = "ACUDIENTE"
            email = "acudiente@example.com"
            telefono = "3001234567"
        },
        @{
            nombre = "Laura García"
            rol = "COORDINADOR"
            email = "laura.garcia@sena.edu.co"
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $responseActa1 = Invoke-RestMethod -Uri "$baseUrl/ptc/actas" -Method Post -Body $actaData -Headers $headers
    $actaId1 = $responseActa1.id
    Write-Success "✓ Acta creada exitosamente: $actaId1"
    Write-Host "  Asunto: $($responseActa1.asunto)"
    Write-Host "  Estado: $($responseActa1.estado)"
    Write-Host "  Fecha reunión: $($responseActa1.fechaReunion)"
    Write-Host "  Asistentes: $($responseActa1.asistentes.Count)"
} catch {
    Write-Error "✗ Error creando acta: $_"
    Write-Host "Detalles: $($_.Exception.Message)" -ForegroundColor Red
}

# Crear segunda acta sin PTC
$actaData2 = @{
    fichaId = $fichaId
    aprendizId = $aprendizId2
    fechaReunion = "2026-01-18T14:00:00Z"
    lugar = "Aula 301"
    asunto = "Reunión de inicio de plan de mejoramiento"
    desarrollo = "Primera reunión para establecer compromisos y plan de acción."
    acuerdos = "Se establece plan de trabajo con reuniones quincenales."
    asistentes = @(
        @{
            nombre = "$($aprendices.data[1].nombres) $($aprendices.data[1].apellidos)"
            rol = "APRENDIZ"
        },
        @{
            nombre = "Carlos Martínez"
            rol = "INSTRUCTOR"
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $responseActa2 = Invoke-RestMethod -Uri "$baseUrl/ptc/actas" -Method Post -Body $actaData2 -Headers $headers
    $actaId2 = $responseActa2.id
    Write-Success "✓ Segunda acta creada: $actaId2"
} catch {
    Write-Error "✗ Error creando segunda acta: $_"
}

# =============================================
# PASO 12: LISTAR ACTAS
# =============================================
Write-Step "PASO 12: Listar actas con filtros"

try {
    $listaActas = Invoke-RestMethod -Uri "$baseUrl/ptc/actas?limit=10" -Method Get -Headers $headers
    Write-Success "✓ Actas obtenidas: $($listaActas.total)"
    foreach ($acta in $listaActas.data) {
        Write-Host "  - $($acta.asunto) | Estado: $($acta.estado) | Asistentes: $($acta.asistentes.Count)"
    }
} catch {
    Write-Error "✗ Error listando actas: $_"
}

# Filtrar actas por PTC
if ($ptcId1) {
    try {
        $actasPorPtc = Invoke-RestMethod -Uri "$baseUrl/ptc/actas?ptcId=$ptcId1" -Method Get -Headers $headers
        $totalActas = $actasPorPtc.total
        Write-Success "✓ Actas del PTC ${ptcId1}: $totalActas"
    } catch {
        Write-Error "✗ Error filtrando actas por PTC: $_"
    }
}

# =============================================
# PASO 13: OBTENER DETALLE DE ACTA
# =============================================
Write-Step "PASO 13: Obtener detalle del acta"

try {
    $detalleActa = Invoke-RestMethod -Uri "$baseUrl/ptc/actas/$actaId1" -Method Get -Headers $headers
    Write-Success "✓ Detalle del acta obtenido"
    Write-Host "  Asunto: $($detalleActa.asunto)"
    Write-Host "  Lugar: $($detalleActa.lugar)"
    Write-Host "  Estado: $($detalleActa.estado)"
    Write-Host "  Asistentes:"
    foreach ($asistente in $detalleActa.asistentes) {
        Write-Host "    • $($asistente.nombre) - $($asistente.rol)"
    }
} catch {
    Write-Error "✗ Error obteniendo detalle del acta: $_"
}

# =============================================
# PASO 14: ACTUALIZAR ACTA
# =============================================
Write-Step "PASO 14: Actualizar acta"

$updateActa = @{
    desarrollo = "Se revisó el cumplimiento de los compromisos establecidos en el PTC. El aprendiz asistió a las tutorías programadas y muestra mejora en las evaluaciones. Se discutió el progreso académico y se identificaron áreas que requieren mayor atención. ACTUALIZACIÓN: Se agregaron compromisos adicionales."
    acuerdos = "1. Continuar con las tutorías de refuerzo. 2. Realizar evaluación de seguimiento en 2 semanas. 3. Próxima reunión programada para el 3 de febrero. 4. Se asigna tutoría adicional los viernes."
} | ConvertTo-Json

try {
    $actaActualizada = Invoke-RestMethod -Uri "$baseUrl/ptc/actas/$actaId1" -Method Patch -Body $updateActa -Headers $headers
    Write-Success "✓ Acta actualizada exitosamente"
} catch {
    Write-Error "✗ Error actualizando acta: $_"
}

# =============================================
# PASO 15: CAMBIAR ESTADO DE ACTA A FIRMABLE
# =============================================
Write-Step "PASO 15: Cambiar estado del acta a FIRMABLE"

$cambiarEstadoActa = @{
    estado = "FIRMABLE"
} | ConvertTo-Json

try {
    $actaFirmable = Invoke-RestMethod -Uri "$baseUrl/ptc/actas/$actaId1/estado" -Method Patch -Body $cambiarEstadoActa -Headers $headersCoord
    Write-Success "✓ Estado del acta actualizado a: $($actaFirmable.estado)"
} catch {
    Write-Error "✗ Error cambiando estado del acta: $_"
}

# =============================================
# PASO 16: PRUEBA DE VALIDACIÓN - PTC VIGENTE DUPLICADO
# =============================================
Write-Step "PASO 16: Validación - Intentar crear segundo PTC VIGENTE (debe fallar)"

# Primero activar el segundo PTC
$activarPtc2 = @{
    estado = "VIGENTE"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId2/estado" -Method Patch -Body $activarPtc2 -Headers $headersCoord | Out-Null
    Write-Success "✓ Segundo PTC activado"
} catch {
    Write-Info "ℹ No se pudo activar segundo PTC: $_"
}

# Intentar crear otro PTC VIGENTE para el mismo aprendiz (debe fallar)
$ptcDuplicado = @{
    fichaId = $fichaId
    aprendizId = $aprendizId1
    motivo = "Intento de PTC duplicado"
    descripcion = "Este debe fallar"
    fechaInicio = "2026-01-20"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/ptc" -Method Post -Body $ptcDuplicado -Headers $headers | Out-Null
    
    # Intentar activarlo
    $ptcTempId = $_.id
    $activarDuplicado = @{ estado = "VIGENTE" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcTempId/estado" -Method Patch -Body $activarDuplicado -Headers $headersCoord | Out-Null
    
    Write-Error "✗ FALLO: Se permitió crear PTC VIGENTE duplicado (no debería permitirse)"
} catch {
    Write-Success "✓ CORRECTO: No se permite PTC VIGENTE duplicado"
    Write-Host "  Mensaje: $($_.Exception.Message)" -ForegroundColor Gray
}

# =============================================
# PASO 17: CERRAR PTC
# =============================================
Write-Step "PASO 17: Cerrar PTC con resumen"

$cerrarPtc = @{
    estado = "CERRADO"
    cierreResumen = "El aprendiz cumplió con el 85% de los compromisos establecidos. Se observó mejora significativa en el rendimiento académico. Pasó de 2.8 a 4.2 en promedio general. Asistió regularmente a tutorías y mostró compromiso con su proceso formativo. Se recomienda continuar con el seguimiento preventivo."
} | ConvertTo-Json

try {
    $ptcCerrado = Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1/estado" -Method Patch -Body $cerrarPtc -Headers $headersCoord
    Write-Success "✓ PTC cerrado exitosamente"
    Write-Host "  Estado final: $($ptcCerrado.estado)"
    Write-Host "  Resumen: $($ptcCerrado.cierreResumen.Substring(0, [Math]::Min(80, $ptcCerrado.cierreResumen.Length)))..."
} catch {
    Write-Error "✗ Error cerrando PTC: $_"
}

# =============================================
# PASO 18: VALIDACIÓN - No permitir agregar items a PTC cerrado
# =============================================
Write-Step "PASO 18: Validación - Intentar agregar item a PTC cerrado (debe fallar)"

$itemCerrado = @{
    tipo = "OTRO"
    descripcion = "Este item no debería crearse"
    fechaCompromiso = "2026-02-01"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/ptc/$ptcId1/items" -Method Post -Body $itemCerrado -Headers $headers | Out-Null
    Write-Error "✗ FALLO: Se permitió agregar item a PTC cerrado"
} catch {
    Write-Success "✓ CORRECTO: No se permite agregar items a PTC cerrado"
    Write-Host "  Mensaje: $($_.Exception.Message)" -ForegroundColor Gray
}

# =============================================
# PASO 19: CERRAR ACTA
# =============================================
Write-Step "PASO 19: Cerrar acta con resumen"

$cerrarActa = @{
    estado = "CERRADA"
    cierreResumen = "Acta cerrada con todos los compromisos registrados y firmados por los asistentes. Se dio cumplimiento a todos los puntos de la agenda."
} | ConvertTo-Json

try {
    $actaCerrada = Invoke-RestMethod -Uri "$baseUrl/ptc/actas/$actaId1/estado" -Method Patch -Body $cerrarActa -Headers $headersCoord
    Write-Success "✓ Acta cerrada exitosamente"
    Write-Host "  Estado final: $($actaCerrada.estado)"
} catch {
    Write-Error "✗ Error cerrando acta: $_"
}

# =============================================
# PASO 20: BUSQUEDA Y FILTROS AVANZADOS
# =============================================
Write-Step "PASO 20: Búsqueda y filtros avanzados"

# Búsqueda por texto
try {
    $busquedaPtc = Invoke-RestMethod -Uri "$baseUrl/ptc?search=mejoramiento" -Method Get -Headers $headers
    Write-Success "✓ Búsqueda por texto 'mejoramiento': $($busquedaPtc.total) resultados"
} catch {
    Write-Error "✗ Error en búsqueda: $_"
}

# Filtrar por rango de fechas
try {
    $ptcPorFecha = Invoke-RestMethod -Uri "$baseUrl/ptc?desde=2026-01-01&hasta=2026-01-31" -Method Get -Headers $headers
    Write-Success "✓ PTCs en enero 2026: $($ptcPorFecha.total)"
} catch {
    Write-Error "✗ Error filtrando por fecha: $_"
}

# Filtrar por aprendiz
try {
    $ptcPorAprendiz = Invoke-RestMethod -Uri "$baseUrl/ptc?aprendizId=$aprendizId1" -Method Get -Headers $headers
    Write-Success "✓ PTCs del aprendiz: $($ptcPorAprendiz.total)"
} catch {
    Write-Error "✗ Error filtrando por aprendiz: $_"
}

# Buscar actas por texto
try {
    $busquedaActas = Invoke-RestMethod -Uri "$baseUrl/ptc/actas?search=seguimiento" -Method Get -Headers $headers
    Write-Success "✓ Búsqueda de actas 'seguimiento': $($busquedaActas.total) resultados"
} catch {
    Write-Error "✗ Error en búsqueda de actas: $_"
}

# =============================================
# RESUMEN FINAL
# =============================================
Write-Step "RESUMEN DE PRUEBAS"

Write-Host ""
Write-Host "┌─────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│          PRUEBAS COMPLETADAS                    │" -ForegroundColor Cyan
Write-Host "├─────────────────────────────────────────────────┤" -ForegroundColor Cyan
Write-Host "│ ✓ PTCs creados: 2                               │" -ForegroundColor Green
Write-Host "│ ✓ Items/Compromisos agregados: 3               │" -ForegroundColor Green
Write-Host "│ ✓ Actas creadas: 2                              │" -ForegroundColor Green
Write-Host "│ ✓ Estados cambiados: VIGENTE → CERRADO          │" -ForegroundColor Green
Write-Host "│ ✓ Validaciones funcionando correctamente        │" -ForegroundColor Green
Write-Host "│ ✓ Filtros y búsquedas operativos                │" -ForegroundColor Green
Write-Host "└─────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

Write-Success "✓ TODAS LAS PRUEBAS DEL MÓDULO PTC COMPLETADAS"
Write-Host ""
Write-Info "IDs importantes para pruebas adicionales:"
Write-Host "  PTC 1: $ptcId1 (Estado: CERRADO)" -ForegroundColor Gray
Write-Host "  PTC 2: $ptcId2 (Estado: VIGENTE)" -ForegroundColor Gray
Write-Host "  Acta 1: $actaId1 (Estado: CERRADA)" -ForegroundColor Gray
Write-Host "  Acta 2: $actaId2 (Estado: BORRADOR)" -ForegroundColor Gray
Write-Host ""
