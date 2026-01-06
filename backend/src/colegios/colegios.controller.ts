import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ColegiosService } from './colegios.service';
import { CreateColegioDto } from './dto/create-colegio.dto';
import { UpdateColegioDto } from './dto/update-colegio.dto';
import { Colegio } from './entities/colegio.entity';

@ApiTags('Colegios')
@Controller('colegios')
export class ColegiosController {
  constructor(private readonly colegiosService: ColegiosService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo colegio',
    description: 'Registra un nuevo colegio en el sistema (HU-CO-01)',
  })
  @ApiResponse({
    status: 201,
    description: 'Colegio creado exitosamente',
    type: Colegio,
  })
  @ApiResponse({ status: 409, description: 'Ya existe un colegio con ese NIT' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createColegioDto: CreateColegioDto): Promise<Colegio> {
    return this.colegiosService.create(createColegioDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los colegios',
    description: 'Obtiene la lista de colegios, opcionalmente filtrados por estado activo (HU-CO-02)',
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    type: Boolean,
    description: 'Filtrar por colegios activos o inactivos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de colegios obtenida exitosamente',
    type: [Colegio],
  })
  findAll(@Query('activo') activo?: string): Promise<Colegio[]> {
    const activoBoolean = activo === 'true' ? true : activo === 'false' ? false : undefined;
    return this.colegiosService.findAll(activoBoolean);
  }

  @Get('departamento/:departamento')
  @ApiOperation({
    summary: 'Buscar colegios por departamento',
    description: 'Obtiene todos los colegios activos de un departamento específico',
  })
  @ApiParam({ name: 'departamento', example: 'Cundinamarca' })
  @ApiResponse({
    status: 200,
    description: 'Colegios encontrados',
    type: [Colegio],
  })
  findByDepartamento(@Param('departamento') departamento: string): Promise<Colegio[]> {
    return this.colegiosService.findByDepartamento(departamento);
  }

  @Get('ciudad/:ciudad')
  @ApiOperation({
    summary: 'Buscar colegios por ciudad',
    description: 'Obtiene todos los colegios activos de una ciudad específica',
  })
  @ApiParam({ name: 'ciudad', example: 'Bogotá' })
  @ApiResponse({
    status: 200,
    description: 'Colegios encontrados',
    type: [Colegio],
  })
  findByCiudad(@Param('ciudad') ciudad: string): Promise<Colegio[]> {
    return this.colegiosService.findByCiudad(ciudad);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un colegio por ID',
    description: 'Obtiene la información detallada de un colegio específico',
  })
  @ApiParam({ name: 'id', type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Colegio encontrado',
    type: Colegio,
  })
  @ApiResponse({ status: 404, description: 'Colegio no encontrado' })
  findOne(@Param('id') id: string): Promise<Colegio> {
    return this.colegiosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un colegio',
    description: 'Actualiza la información de un colegio existente',
  })
  @ApiParam({ name: 'id', type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Colegio actualizado exitosamente',
    type: Colegio,
  })
  @ApiResponse({ status: 404, description: 'Colegio no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un colegio con ese NIT' })
  update(
    @Param('id') id: string,
    @Body() updateColegioDto: UpdateColegioDto,
  ): Promise<Colegio> {
    return this.colegiosService.update(id, updateColegioDto);
  }

  @Patch(':id/toggle-activo')
  @ApiOperation({
    summary: 'Activar/Desactivar un colegio',
    description: 'Cambia el estado activo de un colegio',
  })
  @ApiParam({ name: 'id', type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Estado del colegio actualizado',
    type: Colegio,
  })
  @ApiResponse({ status: 404, description: 'Colegio no encontrado' })
  toggleActivo(@Param('id') id: string): Promise<Colegio> {
    return this.colegiosService.toggleActivo(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un colegio',
    description: 'Elimina permanentemente un colegio del sistema',
  })
  @ApiParam({ name: 'id', type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Colegio eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Colegio no encontrado' })
  async remove(@Param('id') id: string) {
    await this.colegiosService.remove(id);
    return {
      message: 'Colegio eliminado exitosamente sfsfsfsdfsd',
      id,
    };
  }
}
