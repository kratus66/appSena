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
import { AprendicesService } from './aprendices.service';
import { CreateAprendizDto } from './dto/create-aprendiz.dto';
import { UpdateAprendizDto } from './dto/update-aprendiz.dto';
import { UpdateEstadoAprendizDto } from './dto/update-estado-aprendiz.dto';
import { QueryAprendizDto } from './dto/query-aprendiz.dto';
import { Aprendiz } from './entities/aprendiz.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Aprendices')
@ApiBearerAuth()
@Controller('aprendices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AprendicesController {
  constructor(private readonly aprendicesService: AprendicesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Crear un nuevo aprendiz',
    description: 'Permite a instructores, coordinadores y administradores crear un nuevo aprendiz',
  })
  @ApiResponse({
    status: 201,
    description: 'Aprendiz creado exitosamente',
    type: Aprendiz,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  @ApiResponse({ status: 409, description: 'Ya existe un aprendiz con ese documento o email' })
  create(
    @Body() createAprendizDto: CreateAprendizDto,
    @GetUser() user: User,
  ): Promise<Aprendiz> {
    return this.aprendicesService.create(createAprendizDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Listar aprendices con filtros y paginación',
    description:
      'Lista aprendices. INSTRUCTOR: solo de sus fichas. COORDINADOR/ADMIN: todos con filtros',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de aprendices paginada',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  findAll(@Query() queryDto: QueryAprendizDto, @GetUser() user: User) {
    return this.aprendicesService.findAll(queryDto, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Obtener detalle de un aprendiz',
    description: 'Obtiene los detalles completos de un aprendiz',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aprendiz',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalle del aprendiz',
    type: Aprendiz,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para ver este aprendiz' })
  @ApiResponse({ status: 404, description: 'Aprendiz no encontrado' })
  findOne(@Param('id') id: string, @GetUser() user: User): Promise<Aprendiz> {
    return this.aprendicesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Actualizar datos de un aprendiz',
    description: 'Actualiza información básica del aprendiz (no incluye estado académico)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aprendiz',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Aprendiz actualizado exitosamente',
    type: Aprendiz,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos para actualizar este aprendiz' })
  @ApiResponse({ status: 404, description: 'Aprendiz no encontrado' })
  @ApiResponse({ status: 409, description: 'Email ya existe' })
  update(
    @Param('id') id: string,
    @Body() updateAprendizDto: UpdateAprendizDto,
    @GetUser() user: User,
  ): Promise<Aprendiz> {
    return this.aprendicesService.update(id, updateAprendizDto, user);
  }

  @Patch(':id/estado')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Cambiar estado académico de un aprendiz',
    description: 'Solo coordinadores y administradores pueden cambiar el estado académico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aprendiz',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado académico actualizado exitosamente',
    type: Aprendiz,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo coordinadores y administradores' })
  @ApiResponse({ status: 404, description: 'Aprendiz no encontrado' })
  updateEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEstadoAprendizDto,
    @GetUser() user: User,
  ): Promise<Aprendiz> {
    return this.aprendicesService.updateEstado(id, updateEstadoDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un aprendiz',
    description: 'Solo administradores pueden eliminar aprendices (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del aprendiz',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({ status: 204, description: 'Aprendiz eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Solo administradores pueden eliminar' })
  @ApiResponse({ status: 404, description: 'Aprendiz no encontrado' })
  remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.aprendicesService.remove(id, user);
  }

  @Get('ficha/:fichaId/aprendices')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({
    summary: 'Listar aprendices de una ficha',
    description: 'Obtiene todos los aprendices asociados a una ficha específica',
  })
  @ApiParam({
    name: 'fichaId',
    description: 'ID de la ficha',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de aprendices de la ficha',
    type: [Aprendiz],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  findByFicha(@Param('fichaId') fichaId: string, @GetUser() user: User): Promise<Aprendiz[]> {
    return this.aprendicesService.findByFicha(fichaId, user);
  }
}
