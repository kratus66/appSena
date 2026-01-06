import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { FichasService } from './fichas.service';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { UpdateFichaEstadoDto } from './dto/update-ficha-estado.dto';
import { QueryFichaDto } from './dto/query-ficha.dto';
import { Ficha } from './entities/ficha.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Fichas')
/* @ApiBearerAuth() */
@Controller('fichas')
// @UseGuards(JwtAuthGuard, RolesGuard) // COMENTADO PARA PRUEBAS
export class FichasController {
  constructor(private readonly fichasService: FichasService) {}

  @Post()
  // @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR) // COMENTADO PARA PRUEBAS
  @ApiOperation({
    summary: 'Crear una nueva ficha',
    description: 'Permite a instructores y administradores crear una nueva ficha',
  })
  @ApiResponse({
    status: 201,
    description: 'Ficha creada exitosamente',
    type: Ficha,
  })
  @ApiResponse({ status: 409, description: 'Ya existe una ficha con ese número' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  create(
    @Body() createFichaDto: CreateFichaDto,
  ): Promise<Ficha> {
    return this.fichasService.create(createFichaDto);
  }

  @Get()
  // @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR) // COMENTADO PARA PRUEBAS
  @ApiOperation({
    summary: 'Listar todas las fichas',
    description:
      'Obtiene la lista de fichas con filtros y paginación. Instructores solo ven sus fichas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fichas obtenida exitosamente',
  })
  findAll(@Query() queryDto: QueryFichaDto) {
    return this.fichasService.findAll(queryDto);
  }

  @Get('mias')
  /* @Roles(UserRole.INSTRUCTOR) */
  @ApiOperation({
    summary: 'Listar mis fichas',
    description: 'Obtiene solo las fichas del instructor. Para pruebas sin auth, pasar instructorId como query parameter.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de fichas del instructor',
  })
  findMine(@Query() queryDto: QueryFichaDto) {
    return this.fichasService.findMine(queryDto);
  }

  @Get('agrupadas')
  // @Roles(UserRole.ADMIN, UserRole.COORDINADOR) // COMENTADO PARA PRUEBAS
  @ApiOperation({
    summary: 'Listar fichas agrupadas por colegio y programa',
    description: 'Obtiene fichas agrupadas jerárquicamente (solo coordinadores y admin)',
  })
  @ApiResponse({
    status: 200,
    description: 'Fichas agrupadas exitosamente',
  })
  findGrouped(@Query() queryDto: QueryFichaDto) {
    return this.fichasService.findGrouped(queryDto);
  }

  @Get(':id')
  // @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR) // COMENTADO PARA PRUEBAS
  @ApiOperation({
    summary: 'Obtener una ficha por ID',
    description: 'Obtiene el detalle de una ficha específica',
  })
  @ApiParam({ name: 'id', description: 'UUID de la ficha' })
  @ApiResponse({
    status: 200,
    description: 'Ficha encontrada',
    type: Ficha,
  })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver esta ficha' })
  findOne(@Param('id') id: string): Promise<Ficha> {
    return this.fichasService.findOne(id);
  }

  @Patch(':id')
  // @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR) // COMENTADO PARA PRUEBAS
  @ApiOperation({
    summary: 'Actualizar una ficha',
    description: 'Permite actualizar datos de una ficha (instructores solo sus fichas)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la ficha' })
  @ApiResponse({
    status: 200,
    description: 'Ficha actualizada exitosamente',
    type: Ficha,
  })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para editar esta ficha' })
  @ApiResponse({ status: 409, description: 'Número de ficha duplicado' })
  update(
    @Param('id') id: string,
    @Body() updateFichaDto: UpdateFichaDto,
  ): Promise<Ficha> {
    return this.fichasService.update(id, updateFichaDto);
  }

  @Patch(':id/estado')
  // @Roles(UserRole.ADMIN, UserRole.COORDINADOR) // COMENTADO PARA PRUEBAS
  @ApiOperation({
    summary: 'Actualizar el estado de una ficha',
    description: 'Permite cambiar el estado de una ficha (solo coordinadores y admin)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la ficha' })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: Ficha,
  })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada' })
  @ApiResponse({ status: 403, description: 'Sin permisos para cambiar el estado' })
  updateEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateFichaEstadoDto,
  ): Promise<Ficha> {
    return this.fichasService.updateEstado(id, updateEstadoDto);
  }

  @Delete(':id')
  // @Roles(UserRole.ADMIN) // COMENTADO PARA PRUEBAS
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una ficha (soft delete)',
    description: 'Elimina lógicamente una ficha (solo administradores)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la ficha' })
  @ApiResponse({
    status: 204,
    description: 'Ficha eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Ficha no encontrada' })
  @ApiResponse({ status: 403, description: 'Solo administradores pueden eliminar' })
  remove(@Param('id') id: string): Promise<void> {
    return this.fichasService.remove(id);
  }
}
