import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificacionesService } from './notificaciones.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Notificaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN, UserRole.APRENDIZ)
  @ApiOperation({ summary: 'Obtener notificaciones del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de notificaciones' })
  findAll(@Query() queryDto: QueryNotificationsDto, @Request() req) {
    return this.notificacionesService.findAll(queryDto, req.user);
  }

  @Patch(':id/leida')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN, UserRole.APRENDIZ)
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificacionesService.markAsRead(id, req.user);
  }

  @Patch('marcar-todas-leidas')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN, UserRole.APRENDIZ)
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  markAllAsRead(@Request() req) {
    return this.notificacionesService.markAllAsRead(req.user);
  }
}
