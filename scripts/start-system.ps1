# Script para iniciar el sistema completo AppSena
# Backend + Frontend

Write-Host "================================" -ForegroundColor Cyan
Write-Host "   Iniciando AppSena System     " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuración
$backendPath = "C:\Users\Usuario\OneDrive\Desktop\AppSena\backend"
$frontendPath = "C:\Users\Usuario\OneDrive\Desktop\AppSena\frontend"

# Verificar que los directorios existan
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Error: No se encuentra el directorio del backend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Error: No se encuentra el directorio del frontend" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Directorios verificados correctamente" -ForegroundColor Green
Write-Host ""

# Iniciar Backend
Write-Host "🚀 Iniciando Backend (NestJS)..." -ForegroundColor Yellow
Write-Host "   Ruta: $backendPath" -ForegroundColor Gray
Write-Host "   Puerto: 3000" -ForegroundColor Gray
Write-Host ""

$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run start:dev
} -ArgumentList $backendPath

Write-Host "✅ Backend iniciado en background (Job ID: $($backendJob.Id))" -ForegroundColor Green
Write-Host ""

# Esperar un momento para que el backend inicie
Write-Host "⏳ Esperando 10 segundos para que el backend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Iniciar Frontend
Write-Host "🚀 Iniciando Frontend (Next.js)..." -ForegroundColor Yellow
Write-Host "   Ruta: $frontendPath" -ForegroundColor Gray
Write-Host "   Puerto: 3001 (o asignado automáticamente)" -ForegroundColor Gray
Write-Host ""

$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $frontendPath

Write-Host "✅ Frontend iniciado en background (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Write-Host ""

# Esperar un momento para que el frontend inicie
Write-Host "⏳ Esperando 10 segundos para que el frontend inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "      Sistema Iniciado ✅        " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 URLs del sistema:" -ForegroundColor Yellow
Write-Host "   Backend API:      http://localhost:3000/api" -ForegroundColor White
Write-Host "   Swagger Docs:     http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "   Frontend:         http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "👤 Credenciales de prueba:" -ForegroundColor Yellow
Write-Host "   Admin:" -ForegroundColor Cyan
Write-Host "     Email:    admin@mail.com" -ForegroundColor White
Write-Host "     Password: 12345678" -ForegroundColor White
Write-Host ""
Write-Host "   Instructor:" -ForegroundColor Cyan
Write-Host "     Email:    instructor@mail.com" -ForegroundColor White
Write-Host "     Password: 12345678" -ForegroundColor White
Write-Host ""
Write-Host "📋 Comandos útiles:" -ForegroundColor Yellow
Write-Host "   Ver logs del backend:  Receive-Job -Id $($backendJob.Id) -Keep" -ForegroundColor White
Write-Host "   Ver logs del frontend: Receive-Job -Id $($frontendJob.Id) -Keep" -ForegroundColor White
Write-Host "   Detener backend:       Stop-Job -Id $($backendJob.Id); Remove-Job -Id $($backendJob.Id)" -ForegroundColor White
Write-Host "   Detener frontend:      Stop-Job -Id $($frontendJob.Id); Remove-Job -Id $($frontendJob.Id)" -ForegroundColor White
Write-Host "   Detener todo:          Get-Job | Stop-Job; Get-Job | Remove-Job" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Para ejecutar pruebas:" -ForegroundColor Yellow
Write-Host "   cd C:\Users\Usuario\OneDrive\Desktop\AppSena" -ForegroundColor White
Write-Host "   .\test-asistencias-frontend.ps1" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Nota: Los procesos están corriendo en background" -ForegroundColor Yellow
Write-Host "   Para ver los logs en tiempo real, usa los comandos de 'Receive-Job' arriba" -ForegroundColor Gray
Write-Host ""
Write-Host "   Para detener los servicios, usa los comandos de 'Stop-Job' arriba" -ForegroundColor Gray
Write-Host "   o simplemente cierra esta terminal" -ForegroundColor Gray
Write-Host ""

# Mantener el script abierto
Write-Host "Presiona Ctrl+C para detener todos los servicios y salir" -ForegroundColor Yellow
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Verificar si los jobs siguen corriendo
        $backendStatus = (Get-Job -Id $backendJob.Id).State
        $frontendStatus = (Get-Job -Id $frontendJob.Id).State
        
        if ($backendStatus -ne "Running") {
            Write-Host "⚠️  Backend detenido. Estado: $backendStatus" -ForegroundColor Red
            Receive-Job -Id $backendJob.Id
        }
        
        if ($frontendStatus -ne "Running") {
            Write-Host "⚠️  Frontend detenido. Estado: $frontendStatus" -ForegroundColor Red
            Receive-Job -Id $frontendJob.Id
        }
        
        if ($backendStatus -ne "Running" -and $frontendStatus -ne "Running") {
            Write-Host "❌ Ambos servicios detenidos. Saliendo..." -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "✅ Servicios detenidos correctamente" -ForegroundColor Green
}
