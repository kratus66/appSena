import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AsistenciasService } from './asistencias.service';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { QuerySesionesDto } from './dto/query-sesiones.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { JustificarAsistenciaDto } from './dto/justificar-asistencia.dto';
import { QueryAlertasDto } from './dto/query-alertas.dto';
import { ClaseSesion } from './entities/clase-sesion.entity';
import { Asistencia } from './entities/asistencia.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Asistencias')
@ApiBearerAuth()
@Controller('asistencias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsistenciasController {
  constructor(private readonly asistenciasService: AsistenciasService) {}

  // ==================== SESIONES ====================

  @Post('sesiones')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Crear una nueva sesión de clase',
    description:
      'Permite a instructores (solo para sus fichas), coordinadores y administradores crear una nueva sesión de clase. Automáticamente crea registros de asistencia predeterminados para todos los aprendices de la ficha.',
  })
  @ApiResponse({
    status: 201,
    description: 'Sesión creada exitosamente',
    type: ClaseSesion,
  })
  @ApiResponse({
    status: 404,
    description: 'Ficha no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para crear sesiones en esta ficha',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya existe una sesión para esta ficha en la fecha especificada',
  })
  async createSesion(
    @Body() createSesionDto: CreateSesionDto,
    @GetUser() user: User,
  ): Promise<ClaseSesion> {
    return this.asistenciasService.createSesion(createSesionDto, user.id, user.rol);
  }

  @Get('sesiones')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Listar sesiones de clase',
    description:
      'Permite listar sesiones con filtros opcionales. Los instructores solo ven sesiones de sus fichas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de sesiones obtenida exitosamente',
  })
  async findAllSesiones(
    @Query() querySesionesDto: QuerySesionesDto,
    @GetUser() user: User,
  ): Promise<{ data: ClaseSesion[]; total: number; page: number; limit: number }> {
    return this.asistenciasService.findAllSesiones(querySesionesDto, user.id, user.rol);
  }

  @Get('sesiones/:id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener detalle de una sesión',
    description:
      'Obtiene el detalle de una sesión incluyendo información de la ficha y resumen de asistencias (presentes/ausentes)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sesión',
    example: 'uuid-sesion',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la sesión obtenido exitosamente',
    type: ClaseSesion,
  })
  @ApiResponse({
    status: 404,
    description: 'Sesión no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver esta sesión',
  })
  async findOneSesion(@Param('id') id: string, @GetUser() user: User): Promise<ClaseSesion> {
    return this.asistenciasService.findOneSesion(id, user.id, user.rol);
  }

  // ==================== ASISTENCIAS ====================

  @Post('sesiones/:id/registrar')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar asistencias para una sesión',
    description:
      'Permite registrar o actualizar asistencias de múltiples aprendices para una sesión específica. Los instructores solo pueden registrar asistencias en sesiones de sus fichas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la sesión',
    example: 'uuid-sesion',
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencias registradas exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Sesión no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para registrar asistencias en esta sesión',
  })
  @ApiResponse({
    status: 400,
    description: 'Uno o más aprendices no pertenecen a la ficha de la sesión',
  })
  async registrarAsistencias(
    @Param('id') id: string,
    @Body() registrarAsistenciaDto: RegistrarAsistenciaDto,
    @GetUser() user: User,
  ): Promise<{ message: string; registradas: number }> {
    return this.asistenciasService.registrarAsistencias(id, registrarAsistenciaDto, user.id, user.rol);
  }

  @Patch('asistencias/:id/justificar')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Justificar una ausencia',
    description:
      'Permite justificar la ausencia de un aprendiz proporcionando un motivo y opcionalmente una evidencia. Solo se puede justificar si el aprendiz NO estuvo presente. Los instructores solo pueden justificar asistencias de sesiones de sus fichas.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la asistencia',
    example: 'uuid-asistencia',
  })
  @ApiResponse({
    status: 200,
    description: 'Asistencia justificada exitosamente',
    type: Asistencia,
  })
  @ApiResponse({
    status: 404,
    description: 'Asistencia no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para justificar esta asistencia',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede justificar una asistencia si el aprendiz estuvo presente',
  })
  async justificarAsistencia(
    @Param('id') id: string,
    @Body() justificarDto: JustificarAsistenciaDto,
    @GetUser() user: User,
  ): Promise<Asistencia> {
    return this.asistenciasService.justificarAsistencia(id, justificarDto, user.id, user.rol);
  }

  // ==================== ALERTAS ====================

  @Get('fichas/:fichaId/alertas')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener alertas de riesgo de deserción para una ficha',
    description:
      'Retorna alertas de aprendices en riesgo de deserción basándose en:\n' +
      '- 3 faltas consecutivas sin justificar\n' +
      '- 5 faltas en el mes sin justificar\n' +
      'Los instructores solo pueden ver alertas de sus fichas.',
  })
  @ApiParam({
    name: 'fichaId',
    description: 'ID de la ficha',
    example: 'uuid-ficha',
  })
  @ApiResponse({
    status: 200,
    description: 'Alertas obtenidas exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Ficha no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver alertas de esta ficha',
  })
  async getAlertasFicha(
    @Param('fichaId') fichaId: string,
    @Query() queryAlertasDto: QueryAlertasDto,
    @GetUser() user: User,
  ): Promise<any> {
    return this.asistenciasService.getAlertasFicha(fichaId, queryAlertasDto, user.id, user.rol);
  }

  // ==================== REPORTES ====================

  @Get('fichas/:fichaId/resumen')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener resumen de asistencias de una ficha',
    description:
      'Retorna estadísticas resumidas de asistencias para una ficha:\n' +
      '- Total de sesiones\n' +
      '- Total de aprendices\n' +
      '- Porcentaje de asistencia promedio\n' +
      '- Top 10 aprendices con más ausencias no justificadas\n' +
      'Los instructores solo pueden ver resúmenes de sus fichas.',
  })
  @ApiParam({
    name: 'fichaId',
    description: 'ID de la ficha',
    example: 'uuid-ficha',
  })
  @ApiQuery({
    name: 'desde',
    description: 'Fecha desde (YYYY-MM-DD) - opcional',
    required: false,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'hasta',
    description: 'Fecha hasta (YYYY-MM-DD) - opcional',
    required: false,
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen obtenido exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Ficha no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver el resumen de esta ficha',
  })
  async getResumenFicha(
    @Param('fichaId') fichaId: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @GetUser() user?: User,
  ): Promise<any> {
    return this.asistenciasService.getResumenFicha(fichaId, desde, hasta, user?.id, user?.rol);
  }
}
