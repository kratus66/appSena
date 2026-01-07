import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgendaService } from './agenda.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventEstadoDto } from './dto/update-event-estado.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Agenda')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  // ==================== EVENTOS ====================

  @Post('eventos')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo evento en la agenda' })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos para esta ficha' })
  createEvent(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.agendaService.createEvent(createEventDto, req.user);
  }

  @Get('eventos')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar eventos con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  findAllEvents(@Query() queryDto: QueryEventsDto, @Request() req) {
    return this.agendaService.findAll(queryDto, req.user);
  }

  @Get('eventos/mios')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener mis eventos (creados o asignados)' })
  @ApiResponse({ status: 200, description: 'Lista de eventos del usuario' })
  findMyEvents(@Query() queryDto: QueryEventsDto, @Request() req) {
    return this.agendaService.findMyEvents(queryDto, req.user);
  }

  @Get('eventos/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener detalle de un evento' })
  @ApiResponse({ status: 200, description: 'Detalle del evento' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver este evento' })
  findOneEvent(@Param('id') id: string, @Request() req) {
    return this.agendaService.findOne(id, req.user);
  }

  @Patch('eventos/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un evento' })
  @ApiResponse({ status: 200, description: 'Evento actualizado' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para editar este evento' })
  updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Request() req) {
    return this.agendaService.update(id, updateEventDto, req.user);
  }

  @Patch('eventos/:id/estado')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cambiar el estado de un evento' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  updateEventEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEventEstadoDto,
    @Request() req,
  ) {
    return this.agendaService.updateEstado(id, updateEstadoDto, req.user);
  }

  // ==================== RECORDATORIOS ====================

  @Post('eventos/:id/recordatorios')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un recordatorio para un evento' })
  @ApiResponse({ status: 201, description: 'Recordatorio creado' })
  @ApiResponse({ status: 400, description: 'Fecha del recordatorio inválida' })
  createReminder(
    @Param('id') eventId: string,
    @Body() createReminderDto: CreateReminderDto,
    @Request() req,
  ) {
    return this.agendaService.createReminder(eventId, createReminderDto, req.user);
  }

  @Get('eventos/:id/recordatorios')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar recordatorios de un evento' })
  @ApiResponse({ status: 200, description: 'Lista de recordatorios' })
  findEventReminders(@Param('id') eventId: string, @Request() req) {
    return this.agendaService.findEventReminders(eventId, req.user);
  }

  @Patch('recordatorios/:id/cancelar')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancelar un recordatorio' })
  @ApiResponse({ status: 200, description: 'Recordatorio cancelado' })
  cancelReminder(@Param('id') id: string, @Request() req) {
    return this.agendaService.cancelReminder(id, req.user);
  }

  @Patch('recordatorios/:id/marcar-enviado')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Marcar recordatorio como enviado (simula cron job - MVP)',
    description:
      'Este endpoint marca un recordatorio como enviado y crea la notificación correspondiente. En producción, esto lo haría un worker/cron automáticamente.',
  })
  @ApiResponse({ status: 200, description: 'Recordatorio marcado como enviado y notificación creada' })
  markReminderAsSent(@Param('id') id: string, @Request() req) {
    return this.agendaService.markReminderAsSent(id, req.user);
  }
}
