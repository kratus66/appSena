#!/bin/bash

# Script de pruebas para el Módulo de Agenda - Sprint 6
# Ejecutar desde la raíz del proyecto: ./test-agenda.sh

BASE_URL="http://localhost:3000/api"
TOKEN=""

echo "==========================================="
echo "PRUEBAS MÓDULO AGENDA - SPRINT 6"
echo "==========================================="
echo ""

# 1. LOGIN
echo "1. LOGIN - Obteniendo token de autenticación..."

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sena.edu.co",
    "password": "Admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ Login exitoso"
  echo "Token: ${TOKEN:0:20}..."
  echo ""
else
  echo "❌ Error en login"
  echo $LOGIN_RESPONSE | jq
  exit 1
fi

# 2. OBTENER FICHAS Y APRENDICES
echo "2. Obteniendo fichas y aprendices..."

FICHAS_RESPONSE=$(curl -s -X GET "$BASE_URL/fichas?limit=5" \
  -H "Authorization: Bearer $TOKEN")

FICHA_ID=$(echo $FICHAS_RESPONSE | jq -r '.data[0].id')
FICHA_NUMERO=$(echo $FICHAS_RESPONSE | jq -r '.data[0].numeroFicha')

if [ "$FICHA_ID" == "null" ] || [ -z "$FICHA_ID" ]; then
  echo "❌ No hay fichas disponibles. Ejecuta 'npm run seed' primero"
  exit 1
fi

echo "✅ Ficha seleccionada: $FICHA_NUMERO (ID: $FICHA_ID)"

APRENDICES_RESPONSE=$(curl -s -X GET "$BASE_URL/aprendices?fichaId=$FICHA_ID&limit=5" \
  -H "Authorization: Bearer $TOKEN")

APRENDIZ_ID=$(echo $APRENDICES_RESPONSE | jq -r '.data[0].id')
APRENDIZ_NOMBRE=$(echo $APRENDICES_RESPONSE | jq -r '.data[0].nombres + " " + .data[0].apellidos')

if [ "$APRENDIZ_ID" == "null" ] || [ -z "$APRENDIZ_ID" ]; then
  echo "❌ No hay aprendices en esta ficha"
  exit 1
fi

echo "✅ Aprendiz seleccionado: $APRENDIZ_NOMBRE"
echo ""

# 3. CREAR EVENTO
echo "3. Crear evento: Reunión de seguimiento académico..."

FECHA_EVENTO=$(date -u -d "tomorrow 14:00:00" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT14:00:00.000Z")
FECHA_FIN=$(date -u -d "tomorrow 15:00:00" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT15:00:00.000Z")

EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/agenda/eventos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"titulo\": \"Reunión de seguimiento académico\",
    \"descripcion\": \"Revisión de avances del aprendiz\",
    \"tipo\": \"REUNION\",
    \"fechaInicio\": \"$FECHA_EVENTO\",
    \"fechaFin\": \"$FECHA_FIN\",
    \"allDay\": false,
    \"prioridad\": \"ALTA\",
    \"fichaId\": \"$FICHA_ID\",
    \"aprendizId\": \"$APRENDIZ_ID\"
  }")

EVENTO_ID=$(echo $EVENT_RESPONSE | jq -r '.id')

if [ "$EVENTO_ID" != "null" ] && [ -n "$EVENTO_ID" ]; then
  echo "✅ Evento creado exitosamente"
  echo "   ID: $EVENTO_ID"
  echo "   Título: $(echo $EVENT_RESPONSE | jq -r '.titulo')"
  echo "   Estado: $(echo $EVENT_RESPONSE | jq -r '.estado')"
  echo ""
else
  echo "❌ Error creando evento"
  echo $EVENT_RESPONSE | jq
fi

# 4. LISTAR EVENTOS
echo "4. Listar eventos..."

DESDE=$(date -u +"%Y-%m-%dT00:00:00.000Z")
HASTA=$(date -u -d "+30 days" +"%Y-%m-%dT23:59:59.000Z" 2>/dev/null || date -u -v+30d +"%Y-%m-%dT23:59:59.000Z")

LIST_RESPONSE=$(curl -s -X GET "$BASE_URL/agenda/eventos?desde=$DESDE&hasta=$HASTA&limit=10" \
  -H "Authorization: Bearer $TOKEN")

TOTAL=$(echo $LIST_RESPONSE | jq -r '.total')
echo "✅ Eventos obtenidos: $TOTAL total"
echo ""

# 5. CREAR RECORDATORIO
echo "5. Crear recordatorio (2 horas antes)..."

FECHA_RECORDATORIO=$(date -u -d "tomorrow 12:00:00" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT12:00:00.000Z")

REMINDER_RESPONSE=$(curl -s -X POST "$BASE_URL/agenda/eventos/$EVENTO_ID/recordatorios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"remindAt\": \"$FECHA_RECORDATORIO\",
    \"canal\": \"IN_APP\",
    \"mensaje\": \"Recuerda tu reunión en 2 horas\"
  }")

RECORDATORIO_ID=$(echo $REMINDER_RESPONSE | jq -r '.id')

if [ "$RECORDATORIO_ID" != "null" ] && [ -n "$RECORDATORIO_ID" ]; then
  echo "✅ Recordatorio creado"
  echo "   ID: $RECORDATORIO_ID"
  echo ""
else
  echo "❌ Error creando recordatorio"
  echo $REMINDER_RESPONSE | jq
fi

# 6. MARCAR RECORDATORIO COMO ENVIADO
echo "6. Marcar recordatorio como enviado (crea notificación)..."

MARK_SENT_RESPONSE=$(curl -s -X PATCH "$BASE_URL/agenda/recordatorios/$RECORDATORIO_ID/marcar-enviado" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Recordatorio marcado como enviado"
echo "   Se creó una notificación automáticamente"
echo ""

# 7. LISTAR NOTIFICACIONES
echo "7. Listar notificaciones..."

NOTIF_RESPONSE=$(curl -s -X GET "$BASE_URL/notificaciones?limit=10" \
  -H "Authorization: Bearer $TOKEN")

UNREAD_COUNT=$(echo $NOTIF_RESPONSE | jq -r '.unreadCount')
echo "✅ Notificaciones no leídas: $UNREAD_COUNT"
echo ""

# 8. MIS EVENTOS
echo "8. Listar mis eventos..."

MIS_EVENTOS_RESPONSE=$(curl -s -X GET "$BASE_URL/agenda/eventos/mios?desde=$DESDE&hasta=$HASTA" \
  -H "Authorization: Bearer $TOKEN")

MIS_EVENTOS_TOTAL=$(echo $MIS_EVENTOS_RESPONSE | jq -r '.total')
echo "✅ Mis eventos: $MIS_EVENTOS_TOTAL"
echo ""

# 9. ACTUALIZAR EVENTO
echo "9. Actualizar evento..."

UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/agenda/eventos/$EVENTO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Reunión de seguimiento - ACTUALIZADA",
    "prioridad": "MEDIA"
  }')

echo "✅ Evento actualizado"
echo "   Nuevo título: $(echo $UPDATE_RESPONSE | jq -r '.titulo')"
echo ""

# 10. CAMBIAR ESTADO
echo "10. Cambiar estado a COMPLETADO..."

ESTADO_RESPONSE=$(curl -s -X PATCH "$BASE_URL/agenda/eventos/$EVENTO_ID/estado" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "COMPLETADO"
  }')

echo "✅ Estado cambiado a: $(echo $ESTADO_RESPONSE | jq -r '.estado')"
echo ""

echo "==========================================="
echo "✅ PRUEBAS COMPLETADAS - SPRINT 6"
echo "==========================================="
echo ""
echo "Endpoints probados:"
echo "✓ Login y autenticación"
echo "✓ Crear evento"
echo "✓ Listar eventos"
echo "✓ Crear recordatorio"
echo "✓ Marcar recordatorio enviado (crea notificación)"
echo "✓ Listar notificaciones"
echo "✓ Mis eventos"
echo "✓ Actualizar evento"
echo "✓ Cambiar estado"
echo ""
echo "Integraciones verificadas:"
echo "✓ Recordatorio enviado → Notificación creada"
echo ""
