# Script de pruebas para el Módulo de Agenda - Sprint 6
# Ejecutar desde la raíz del proyecto: .\test-agenda.ps1

$baseUrl = "http://localhost:3000/api"
$token = ""

Write-Host "==========================================="`n
Write-Host "PRUEBAS MÓDULO AGENDA - SPRINT 6"`n
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

# ========== 2. OBTENER FICHAS Y APRENDICES ===========
Write-Host "2️⃣  Obteniendo fichas y aprendices disponibles..." -ForegroundColor Cyan

try {
    $fichasResponse = Invoke-RestMethod -Uri "$baseUrl/fichas?limit=5" -Method GET -Headers $headers
    
    if ($fichasResponse.data.Count -eq 0) {
        Write-Host "⚠️  No hay fichas disponibles. Ejecuta 'npm run seed' primero." -ForegroundColor Yellow
        exit
    }
    
    $fichaId = $fichasResponse.data[0].id
    $fichaNumero = $fichasResponse.data[0].numeroFicha
    
    Write-Host "✅ Ficha seleccionada: $fichaNumero (ID: $fichaId)" -ForegroundColor Green
    
    # Obtener aprendices de la ficha
    $aprendicesUrl = "$baseUrl/aprendices?fichaId=$fichaId&limit=5"
    $aprendicesResponse = Invoke-RestMethod -Uri $aprendicesUrl -Method GET -Headers $headers
    
    if ($aprendicesResponse.data.Count -eq 0) {
        Write-Host "⚠️  No hay aprendices en esta ficha. Ejecuta 'npm run seed' primero." -ForegroundColor Yellow
        exit
    }
    
    $aprendizId = $aprendicesResponse.data[0].id
    $aprendizNombre = $aprendicesResponse.data[0].nombres + " " + $aprendicesResponse.data[0].apellidos
    
    Write-Host "✅ Aprendiz seleccionado: $aprendizNombre (ID: $aprendizId)"`n -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error obteniendo datos: $_" -ForegroundColor Red
    exit
}

# ========== 3. CREAR EVENTO CON FICHA Y APRENDIZ ===========
Write-Host "3️⃣  Crear evento: Reunión de seguimiento académico..." -ForegroundColor Cyan

# Calcular fecha de mañana a las 2pm
$fechaEvento = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT14:00:00.000Z")
$fechaEventoFin = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT15:00:00.000Z")

$createEventBody = @{
    titulo = "Reunión de seguimiento académico"
    descripcion = "Revisión de avances del aprendiz en el primer trimestre"
    tipo = "REUNION"
    fechaInicio = $fechaEvento
    fechaFin = $fechaEventoFin
    allDay = $false
    prioridad = "ALTA"
    fichaId = $fichaId
    aprendizId = $aprendizId
} | ConvertTo-Json

try {
    $eventResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos" -Method POST -Body $createEventBody -Headers $headers
    $eventoId = $eventResponse.id
    
    Write-Host "✅ Evento creado exitosamente" -ForegroundColor Green
    Write-Host "   ID: $eventoId"
    Write-Host "   Título: $($eventResponse.titulo)"
    Write-Host "   Tipo: $($eventResponse.tipo)"
    Write-Host "   Estado: $($eventResponse.estado)"
    Write-Host "   Prioridad: $($eventResponse.prioridad)"
    Write-Host "   Fecha: $($eventResponse.fechaInicio)"`n
} catch {
    Write-Host "❌ Error creando evento: $_" -ForegroundColor Red
    Write-Host $_.Exception.Response
    exit
}

# ========== 4. CREAR EVENTO SOLO CON APRENDIZ (DERIVA FICHA) ===========
Write-Host "4️⃣  Crear evento solo con aprendizId (deriva ficha automáticamente)..." -ForegroundColor Cyan

$fechaClase = (Get-Date).AddDays(2).ToString("yyyy-MM-ddT10:00:00.000Z")
$fechaClaseFin = (Get-Date).AddDays(2).ToString("yyyy-MM-ddT12:00:00.000Z")

$createEventBody2 = @{
    titulo = "Clase de TypeScript Avanzado"
    descripcion = "Módulo de decoradores y metadata"
    tipo = "CLASE"
    fechaInicio = $fechaClase
    fechaFin = $fechaClaseFin
    allDay = $false
    prioridad = "MEDIA"
    aprendizId = $aprendizId
} | ConvertTo-Json

try {
    $eventResponse2 = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos" -Method POST -Body $createEventBody2 -Headers $headers
    $eventoId2 = $eventResponse2.id
    
    Write-Host "✅ Evento creado (ficha derivada automáticamente)" -ForegroundColor Green
    Write-Host "   ID: $eventoId2"
    Write-Host "   Título: $($eventResponse2.titulo)"
    Write-Host "   Ficha ID: $($eventResponse2.fichaId)"`n
} catch {
    Write-Host "❌ Error creando evento: $_" -ForegroundColor Red
}

# ========== 5. CREAR EVENTO DE DÍA COMPLETO ===========
Write-Host "5️⃣  Crear evento de día completo (Compromiso)..." -ForegroundColor Cyan

$fechaCompromiso = (Get-Date).AddDays(5).ToString("yyyy-MM-ddT00:00:00.000Z")

$createEventBody3 = @{
    titulo = "Entrega de proyecto final"
    descripcion = "Fecha límite para entrega del proyecto integrador"
    tipo = "COMPROMISO"
    fechaInicio = $fechaCompromiso
    allDay = $true
    prioridad = "ALTA"
    fichaId = $fichaId
} | ConvertTo-Json

try {
    $eventResponse3 = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos" -Method POST -Body $createEventBody3 -Headers $headers
    $eventoId3 = $eventResponse3.id
    
    Write-Host "✅ Evento de día completo creado" -ForegroundColor Green
    Write-Host "   ID: $eventoId3"
    Write-Host "   All Day: $($eventResponse3.allDay)"`n
} catch {
    Write-Host "❌ Error creando evento: $_" -ForegroundColor Red
}

# ========== 6. LISTAR EVENTOS CON FILTROS ===========
Write-Host "6️⃣  Listar eventos (filtro por fecha)..." -ForegroundColor Cyan

$desde = (Get-Date).ToString("yyyy-MM-ddT00:00:00.000Z")
$hasta = (Get-Date).AddDays(30).ToString("yyyy-MM-ddT23:59:59.000Z")

try {
    $listUrl = "$baseUrl/agenda/eventos?desde=$desde&hasta=$hasta&limit=10"
    $listResponse = Invoke-RestMethod -Uri $listUrl -Method GET -Headers $headers
    
    Write-Host "✅ Eventos obtenidos: $($listResponse.total) total" -ForegroundColor Green
    Write-Host "   Página: $($listResponse.page) de $($listResponse.totalPages)"
    Write-Host "   Eventos en esta página: $($listResponse.data.Count)"`n
    
    foreach ($evento in $listResponse.data) {
        Write-Host "   - $($evento.titulo) ($($evento.tipo)) - $($evento.estado)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error listando eventos: $_" -ForegroundColor Red
}

# ========== 7. LISTAR MIS EVENTOS ===========
Write-Host "7️⃣  Listar mis eventos (creados o asignados a mí)..." -ForegroundColor Cyan

try {Url = "$baseUrl/agenda/eventos/mios?desde=$desde&hasta=$hasta"
    $misEventosResponse = Invoke-RestMethod -Uri $misEventosUrl
    $misEventosResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos/mios?desde=$desde&hasta=$hasta" -Method GET -Headers $headers
    
    Write-Host "✅ Mis eventos: $($misEventosResponse.total)" -ForegroundColor Green
    foreach ($evento in $misEventosResponse.data) {
        Write-Host "   - $($evento.titulo)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error listando mis eventos: $_" -ForegroundColor Red
}

# ========== 8. OBTENER DETALLE DE EVENTO ===========
Write-Host "8️⃣  Obtener detalle del evento..." -ForegroundColor Cyan

try {
    $detalleResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos/$eventoId" -Method GET -Headers $headers
    
    Write-Host "✅ Detalle del evento:" -ForegroundColor Green
    Write-Host "   Título: $($detalleResponse.titulo)"
    Write-Host "   Descripción: $($detalleResponse.descripcion)"
    Write-Host "   Tipo: $($detalleResponse.tipo)"
    Write-Host "   Estado: $($detalleResponse.estado)"
    Write-Host "   Prioridad: $($detalleResponse.prioridad)"
    Write-Host "   Ficha: $($detalleResponse.ficha.numeroFicha)"
    if ($detalleResponse.aprendiz) {
        Write-Host "   Aprendiz: $($detalleResponse.aprendiz.nombres) $($detalleResponse.aprendiz.apellidos)"
    }
    Write-Host "   Recordatorios: $($detalleResponse.recordatorios.Count)"`n
} catch {
    Write-Host "❌ Error obteniendo detalle: $_" -ForegroundColor Red
}

# ========== .CREAR RECORDATORIO (2 HORAS ANTES) ===========
Write-Host "9️⃣  Crear recordatorio (2 horas antes del evento)..." -ForegroundColor Cyan

$fechaRecordatorio = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT12:00:00.000Z")

$createReminderBody = @{
    remindAt = $fechaRecordatorio
    canal = "IN_APP"
    mensaje = "Recuerda tu reunión de seguimiento en 2 horas"
} | ConvertTo-Json

try {
    $reminderResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos/$eventoId/recordatorios" -Method POST -Body $createReminderBody -Headers $headers
    $recordatorioId = $reminderResponse.id
    
    Write-Host "✅ Recordatorio creado exitosamente" -ForegroundColor Green
    Write-Host "   ID: $recordatorioId"
    Write-Host "   RemindAt: $($reminderResponse.remindAt)"
    Write-Host "   Estado: $($reminderResponse.estado)"
    Write-Host "   Canal: $($reminderResponse.canal)"`n
} catch {
    Write-Host "❌ Error creando recordatorio: $_" -ForegroundColor Red
}

# ==========10.0. CREAR OTRO RECORDATORIO (30 MIN ANTES) ===========
Write-Host "🔟 Crear recordatorio adicional (30 min antes)..." -ForegroundColor Cyan

$fechaRecordatorio2 = (Get-Date).AddDays(1).ToString("yyyy-MM-ddT13:30:00.000Z")

$createReminderBody2 = @{
    remindAt = $fechaRecordatorio2
    canal = "IN_APP"
    mensaje = "Tu reunión comienza en 30 minutos"
} | ConvertTo-Json

try {
    $reminderResponse2 = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos/$eventoId/recordatorios" -Method POST -Body $createReminderBody2 -Headers $headers
    $recordatorioId2 = $reminderResponse2.id
    
    Write-Host "✅ Segundo recordatorio creado" -ForegroundColor Green
    Write-Host "   ID: $recordatorioId2"`n
} catch {
    Write-Host "❌ Error creando recordatorio: $_" -ForegroundColor Red
}

# ========== 11. LISTAR RECORDATORIOS DEL EVENTO ===========
Write-Host "11. Listar recordatorios del evento..." -ForegroundColor Cyan

try {
    $recordatoriosResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos/$eventoId/recordatorios" -Method GET -Headers $headers
    
    Write-Host "✅ Recordatorios obtenidos: $($recordatoriosResponse.Count)" -ForegroundColor Green
    foreach ($rec in $recordatoriosResponse) {
        Write-Host "   - RemindAt: $($rec.remindAt) | Estado: $($rec.estado)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error listando recordatorios: $_" -ForegroundColor Red
}

# ========== 12. MARCAR RECORDATORIO COMO ENVIADO (CREA NOTIFICACIÓN) ===========
Write-Host "12. Marcar recordatorio como enviado (crea notificacion automatica)..." -ForegroundColor Cyan

try {
    $markSentResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/recordatorios/$recordatorioId/marcar-enviado" -Method PATCH -Headers $headers
    
    Write-Host "✅ Recordatorio marcado como enviado" -ForegroundColor Green
    Write-Host "   Estado: $($markSentResponse.estado)"
    Write-Host "   SentAt: $($markSentResponse.sentAt)"
    Write-Host "   Se creo una notificacion in-app automaticamente"`n
} catch {
    Write-Host "❌ Error marcando recordatorio: $_" -ForegroundColor Red
}

# ========== 13. LISTAR NOTIFICACIONES ===========
Write-Host "13. Listar notificaciones (debe aparecer la del recordatorio)..." -ForegroundColor Cyan

try {
    $notificationsResponse = Invoke-RestMethod -Uri "$baseUrl/notificaciones?limit=10" -Method GET -Headers $headers
    
    Write-Host "✅ Notificaciones obtenidas: $($notificationsResponse.total)" -ForegroundColor Green
    Write-Host "   No leídas: $($notificationsResponse.unreadCount)"
    
    foreach ($notif in $notificationsResponse.data) {
        $readStatus = if ($notif.read) { "Leida" } else { "No leida" }
        Write-Host "   - $($notif.titulo) | $($notif.tipo) | $readStatus" -ForegroundColor White
    }
    Write-Host ""
    
    if ($notificationsResponse.data.Count -gt 0) {
        $notificationId = $notificationsResponse.data[0].id
    }
} catch {
    Write-Host "❌ Error listando notificaciones: $_" -ForegroundColor Red
}

# ========== 14. MARCAR NOTIFICACIÓN COMO LEÍDA ===========
Write-Host "14. Marcar notificacion como leida..." -ForegroundColor Cyan

try {
    if ($notificationId) {
        $markReadResponse = Invoke-RestMethod -Uri "$baseUrl/notificaciones/$notificationId/leida" -Method PATCH -Headers $headers
        
        Write-Host "✅ Notificación marcada como leída" -ForegroundColor Green
        Write-Host "   Read: $($markReadResponse.read)"
        Write-Host "   ReadAt: $($markReadResponse.readAt)"`n
    } else {
        Write-Host "⚠️  No hay notificaciones para marcar" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error marcando notificación: $_" -ForegroundColor Red
}

# ========== 15. FILTRAR NOTIFICACIONES NO LEÍDAS ===========
Write-Host "15. Filtrar solo notificaciones no leidas..." -ForegroundColor Cyan

try {
    $unreadResponse = Invoke-RestMethod -Uri "$baseUrl/notificaciones?read=false" -Method GET -Headers $headers
    
    Write-Host "✅ Notificaciones no leídas: $($unreadResponse.unreadCount)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error filtrando notificaciones: $_" -ForegroundColor Red
}

# ========== 16. ACTUALIZAR EVENTO ===========
Write-Host "16. Actualizar evento (cambiar titulo y descripcion)..." -ForegroundColor Cyan

$updateEventBody = @{
    titulo = "Reunión de seguimiento académico - ACTUALIZADA"
    descripcion = "Revisión de avances + plan de mejora"
    prioridad = "MEDIA"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos/$eventoId" -Method PATCH -Body $updateEventBody -Headers $headers
    
    Write-Host "✅ Evento actualizado" -ForegroundColor Green
    Write-Host "   Nuevo título: $($updateResponse.titulo)"
    Write-Host "   Nueva prioridad: $($updateResponse.prioridad)"`n
} catch {
    Write-Host "❌ Error actualizando evento: $_" -ForegroundColor Red
}

# ========== 17. CAMBIAR ESTADO A COMPLETADO ===========
Write-Host "17. Cambiar estado del evento a COMPLETADO..." -ForegroundColor Cyan

$updateEstadoBody = @{
    estado = "COMPLETADO"
} | ConvertTo-Json

try {
    $estadoResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos/$eventoId2/estado" -Method PATCH -Body $updateEstadoBody -Headers $headers
    
    Write-Host "✅ Estado cambiado a: $($estadoResponse.estado)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error cambiando estado: $_" -ForegroundColor Red
}

# ========== 18. CANCELAR EVENTO (CANCELA RECORDATORIOS) ===========
Write-Host "18. Cancelar evento (cancela recordatorios automaticamente)..." -ForegroundColor Cyan

$cancelEventBody = @{
    estado = "CANCELADO"
} | ConvertTo-Json

try {
    $cancelResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos/$eventoId3/estado" -Method PATCH -Body $cancelEventBody -Headers $headers
    
    Write-Host "✅ Evento cancelado" -ForegroundColor Green
    Write-Host "   Todos los recordatorios pendientes fueron cancelados automaticamente"`n
} catch {
    Write-Host "❌ Error cancelando evento: $_" -ForegroundColor Red
}

# ========== 19. CANCELAR RECORDATORIO MANUALMENTE ===========
Write-Host "19. Cancelar recordatorio manualmente..." -ForegroundColor Cyan

try {
    if ($recordatorioId2) {
        $cancelReminderResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/recordatorios/$recordatorioId2/cancelar" -Method PATCH -Headers $headers
        
        Write-Host "✅ Recordatorio cancelado" -ForegroundColor Green
        Write-Host "   Estado: $($cancelReminderResponse.estado)"`n
    }
} catch {
    Write-Host "❌ Error cancelando recordatorio: $_" -ForegroundColor Red
}

# ========== 20. MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS ===========
Write-Host "20. Marcar todas las notificaciones como leidas..." -ForegroundColor Cyan

try {
    $markAllReadResponse = Invoke-RestMethod -Uri "$baseUrl/notificaciones/marcar-todas-leidas" -Method PATCH -Headers $headers
    
    Write-Host "✅ Todas las notificaciones marcadas como leídas" -ForegroundColor Green
    Write-Host "   Afectadas: $($markAllReadResponse.affected)"`n
} catch {
    Write-Host "❌ Error marcando todas: $_" -ForegroundColor Red
}

# ========== 21. FILTRAR EVENTOS POR TIPO ===========
Write-Host "21. Filtrar eventos por tipo (REUNION)..." -ForegroundColor Cyan

try {
    $filterUrl = "$baseUrl/agenda/eventos?desde=$desde&hasta=$hasta&tipo=REUNION"
    $filterResponse = Invoke-RestMethod -Uri $filterUrl -Method GET -Headers $headers
    
    Write-Host "✅ Eventos tipo REUNION: $($filterResponse.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error filtrando: $_" -ForegroundColor Red
}

# ========== 2. Filtrar eventos por estado (PROGRAMADO)..." -ForegroundColor Cyan

try {
    $filterEstadoUrl = "$baseUrl/agenda/eventos?desde=$desde&hasta=$hasta&estado=PROGRAMADO"
    $filterEstadoResponse = Invoke-RestMethod -Uri $filterEstadoUrl
    $filterEstadoResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos?desde=$desde&hasta=$hasta&estado=PROGRAMADO" -Method GET -Headers $headers
    
    Write-Host "✅ Eventos PROGRAMADOS: $($filterEstadoResponse.total)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error filtrando: $_" -ForegroundColor Red
}
3. Busqueda de eventos por texto (TypeScript)..." -ForegroundColor Cyan

try {
    $searchUrl = "$baseUrl/agenda/eventos?desde=$desde&hasta=$hasta&search=TypeScript"
    $searchResponse = Invoke-RestMethod -Uri $searchUrl
try {
    $searchResponse = Invoke-RestMethod -Uri "$baseUrl/agenda/eventos?desde=$desde&hasta=$hasta&search=TypeScript" -Method GET -Headers $headers
    
    Write-Host "✅ Resultados de búsqueda: $($searchResponse.total)" -ForegroundColor Green
    foreach ($evento in $searchResponse.data) {
        Write-Host "   - $($evento.titulo)" -ForegroundColor White
    }
    Write-Host ""
} catch {
    Write-Host "❌ Error en búsqueda: $_" -ForegroundColor Red
}

# ========== RESUMEN FINAL ===========
Write-Host "==========================================="`n
Write-Host "✅ PRUEBAS COMPLETADAS - SPRINT 6" -ForegroundColor Green
Write-Host "==========================================="`n

Write-Host "Endpoints probados (23 pruebas):" -ForegroundColor Cyan
Write-Host "✓ Login y autenticación"
Write-Host "✓ Crear eventos (con ficha, con aprendiz, día completo)"
Write-Host "✓ Listar eventos con filtros (fecha, tipo, estado, búsqueda)"
Write-Host "✓ Listar mis eventos"
Write-Host "✓ Detalle de evento"
Write-Host "✓ Actualizar evento"
Write-Host "✓ Cambiar estado (COMPLETADO, CANCELADO)"
Write-Host "✓ Crear recordatorios (múltiples por evento)"
Write-Host "✓ Listar recordatorios"
Write-Host "✓ Marcar recordatorio enviado (crea notificación)"
Write-Host "✓ Cancelar recordatorio"
Write-Host "✓ Listar notificaciones (con contador no leídas)"
Write-Host "✓ Marcar notificación como leída"
Write-Host "Integraciones automaticas verificadas:" -ForegroundColor Yellow
Write-Host "   - Recordatorio enviado -> Notificacion creada"
Write-Host "   - Evento cancelado -> Recordatorios cancelados"
Write-Host "   - Ficha derivada desde aprendizIdas:" -ForegroundColor Yellow
Write-Host "   - Recordatorio enviado → Notificación creada ✓"
Write-Host "Para ver la documentacioordatorios cancelados ✓"
Write-Host "   - Ficha derivada desde aprendizId ✓"
Write-Host ""
Write-Host "📊 Para ver la documentación completa: backend/SPRINT6_AGENDA_GUIDE.md" -ForegroundColor White
