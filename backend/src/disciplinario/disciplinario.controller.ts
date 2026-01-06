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
} from '@nestjs/swagger';
import { DisciplinarioService } from './disciplinario.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { UpdateCaseEstadoDto } from './dto/update-case-estado.dto';
import { QueryCasesDto } from './dto/query-cases.dto';
import { CreateCaseActionDto } from './dto/create-case-action.dto';
import { UpdateCaseActionDto } from './dto/update-case-action.dto';
import { CreateCaseFromAlertDto } from './dto/create-case-from-alert.dto';
import { DisciplinaryCase } from './entities/disciplinary-case.entity';
import { CaseAction } from './entities/case-action.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Disciplinario')
@ApiBearerAuth()
@Controller('disciplinario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DisciplinarioController {
  constructor(private readonly disciplinarioService: DisciplinarioService) {}

  // ==================== CASOS ====================

  @Post('casos')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Crear un nuevo caso disciplinario',
    description:
      'Permite crear un caso disciplinario. Instructores solo pueden crear para aprendices de sus fichas.',
  })
  @ApiResponse({
    status: 201,
    description: 'Caso creado exitosamente',
    type: DisciplinaryCase,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o fecha futura' })
  @ApiResponse({ status: 403, description: 'Sin permisos para crear caso en esta ficha' })
  @ApiResponse({ status: 404, description: 'Ficha o aprendiz no encontrado' })
  create(
    @Body() createCaseDto: CreateCaseDto,
    @GetUser() user: User,
  ): Promise<DisciplinaryCase> {
    return this.disciplinarioService.create(createCaseDto, user);
  }

  @Get('casos')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Listar casos disciplinarios',
    description:
      'Obtiene la lista de casos con filtros y paginación. Instructores solo ven casos de sus fichas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de casos obtenida exitosamente',
  })
  findAll(@Query() queryDto: QueryCasesDto, @GetUser() user: User) {
    return this.disciplinarioService.findAll(queryDto, user);
  }

  @Get('casos/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Obtener detalle de un caso disciplinario',
    description: 'Retorna el caso completo con ficha, aprendiz y todas sus acciones ordenadas cronológicamente.',
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Caso encontrado',
    type: DisciplinaryCase,
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver este caso' })
  findOne(@Param('id') id: string, @GetUser() user: User): Promise<DisciplinaryCase> {
    return this.disciplinarioService.findOne(id, user);
  }

  @Patch('casos/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Actualizar un caso disciplinario',
    description:
      'Permite actualizar campos del caso. No se puede editar un caso cerrado. Instructores solo pueden editar casos de sus fichas.',
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Caso actualizado exitosamente',
    type: DisciplinaryCase,
  })
  @ApiResponse({ status: 400, description: 'Caso cerrado o datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos para editar este caso' })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateCaseDto: UpdateCaseDto,
    @GetUser() user: User,
  ): Promise<DisciplinaryCase> {
    return this.disciplinarioService.update(id, updateCaseDto, user);
  }

  @Patch('casos/:id/estado')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Cambiar el estado de un caso',
    description:
      'Permite cambiar el estado del caso. Solo coordinadores y admin pueden cerrar casos. Al cerrar se requiere cierreResumen y se crea una acción automática tipo CIERRE.',
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: DisciplinaryCase,
  })
  @ApiResponse({
    status: 400,
    description: 'Transición de estado inválida o falta resumen de cierre',
  })
  @ApiResponse({
    status: 403,
    description: 'Sin permisos para cambiar estado (ej: instructor no puede cerrar)',
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  updateEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateCaseEstadoDto,
    @GetUser() user: User,
  ): Promise<DisciplinaryCase> {
    return this.disciplinarioService.updateEstado(id, updateEstadoDto, user);
  }

  // ==================== ACCIONES ====================

  @Post('casos/:id/acciones')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Agregar una acción/seguimiento a un caso',
    description:
      'Permite registrar una acción sobre un caso. No se permite sobre casos cerrados. Instructores solo pueden agregar acciones a casos de sus fichas.',
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Acción creada exitosamente',
    type: CaseAction,
  })
  @ApiResponse({ status: 400, description: 'Caso cerrado o datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos para agregar acciones a este caso' })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  createAction(
    @Param('id') id: string,
    @Body() createActionDto: CreateCaseActionDto,
    @GetUser() user: User,
  ): Promise<CaseAction> {
    return this.disciplinarioService.createAction(id, createActionDto, user);
  }

  @Get('casos/:id/acciones')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Listar acciones de un caso',
    description: 'Obtiene todas las acciones del caso ordenadas cronológicamente.',
  })
  @ApiParam({ name: 'id', description: 'ID del caso', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Lista de acciones obtenida exitosamente',
    type: [CaseAction],
  })
  @ApiResponse({ status: 404, description: 'Caso no encontrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver las acciones de este caso' })
  findActions(@Param('id') id: string, @GetUser() user: User): Promise<CaseAction[]> {
    return this.disciplinarioService.findActions(id, user);
  }

  @Patch('acciones/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Actualizar una acción',
    description:
      'Permite editar una acción. No se puede editar acciones de casos cerrados. Instructores solo pueden editar acciones de casos de sus fichas.',
  })
  @ApiParam({ name: 'id', description: 'ID de la acción', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Acción actualizada exitosamente',
    type: CaseAction,
  })
  @ApiResponse({ status: 400, description: 'Caso cerrado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para editar esta acción' })
  @ApiResponse({ status: 404, description: 'Acción no encontrada' })
  updateAction(
    @Param('id') id: string,
    @Body() updateActionDto: UpdateCaseActionDto,
    @GetUser() user: User,
  ): Promise<CaseAction> {
    return this.disciplinarioService.updateAction(id, updateActionDto, user);
  }

  // ==================== INTEGRACIÓN CON ALERTAS ====================

  @Post('casos/desde-alerta')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({
    summary: 'Crear caso disciplinario desde alerta de asistencia',
    description:
      'Crea un caso tipo ASISTENCIA automáticamente desde una alerta. Instructores solo para sus fichas.',
  })
  @ApiResponse({
    status: 201,
    description: 'Caso creado desde alerta exitosamente',
    type: DisciplinaryCase,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 403, description: 'Sin permisos para crear caso en esta ficha' })
  @ApiResponse({ status: 404, description: 'Ficha o aprendiz no encontrado' })
  createFromAlert(
    @Body() createFromAlertDto: CreateCaseFromAlertDto,
    @GetUser() user: User,
  ): Promise<DisciplinaryCase> {
    return this.disciplinarioService.createFromAlert(createFromAlertDto, user);
  }
}
