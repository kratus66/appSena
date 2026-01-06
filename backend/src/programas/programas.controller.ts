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
import { ProgramasService } from './programas.service';
import { CreateProgramaDto } from './dto/create-programa.dto';
import { UpdateProgramaDto } from './dto/update-programa.dto';
import { Programa } from './entities/programa.entity';

@ApiTags('Programas de Formación')
@Controller('programas')
export class ProgramasController {
  constructor(private readonly programasService: ProgramasService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo programa de formación',
    description: 'Registra un nuevo programa de formación en el sistemas (HU-PR-01)',
  })
  @ApiResponse({
    status: 201,
    description: 'Programa creado exitosamente',
    type: Programa,
  })
  @ApiResponse({ status: 409, description: 'Ya existe un programa con ese código' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createProgramaDto: CreateProgramaDto): Promise<Programa> {
    return this.programasService.create(createProgramaDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los programas',
    description: 'Obtiene la lista de programas de formación, con filtros opcionales (HU-PR-02)',
  })
  @ApiQuery({
    name: 'activo',
    required: false,
    type: Boolean,
    description: 'Filtrar por programas activos o inactivos',
  })
  @ApiQuery({
    name: 'nivelFormacion',
    required: false,
    type: String,
    description: 'Filtrar por nivel de formación',
    enum: ['TECNICO', 'TECNOLOGO', 'ESPECIALIZACION', 'OPERARIO', 'AUXILIAR'],
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de programas obtenida exitosamente',
    type: [Programa],
  })
  findAll(
    @Query('activo') activo?: string,
    @Query('nivelFormacion') nivelFormacion?: string,
  ): Promise<Programa[]> {
    const activoBoolean = activo === 'true' ? true : activo === 'false' ? false : undefined;
    return this.programasService.findAll(activoBoolean, nivelFormacion);
  }

  @Get('estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas de programas',
    description: 'Obtiene estadísticas generales de los programas de formación',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getEstadisticas() {
    return this.programasService.getEstadisticas();
  }

  @Get('codigo/:codigo')
  @ApiOperation({
    summary: 'Buscar programa por código',
    description: 'Obtiene un programa específico por su código SENA',
  })
  @ApiParam({ name: 'codigo', example: '228106' })
  @ApiResponse({
    status: 200,
    description: 'Programa encontrado',
    type: Programa,
  })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  findByCodigo(@Param('codigo') codigo: string): Promise<Programa> {
    return this.programasService.findByCodigo(codigo);
  }

  @Get('area/:area')
  @ApiOperation({
    summary: 'Buscar programas por área de conocimiento',
    description: 'Obtiene todos los programas activos de un área específica',
  })
  @ApiParam({ name: 'area', example: 'Software y TIC' })
  @ApiResponse({
    status: 200,
    description: 'Programas encontrados',
    type: [Programa],
  })
  findByArea(@Param('area') area: string): Promise<Programa[]> {
    return this.programasService.findByAreaConocimiento(area);
  }

  @Get('nivel/:nivel')
  @ApiOperation({
    summary: 'Buscar programas por nivel de formación',
    description: 'Obtiene todos los programas activos de un nivel específico',
  })
  @ApiParam({ 
    name: 'nivel', 
    example: 'TECNOLOGO',
    enum: ['TECNICO', 'TECNOLOGO', 'ESPECIALIZACION', 'OPERARIO', 'AUXILIAR']
  })
  @ApiResponse({
    status: 200,
    description: 'Programas encontrados',
    type: [Programa],
  })
  findByNivel(@Param('nivel') nivel: string): Promise<Programa[]> {
    return this.programasService.findByNivelFormacion(nivel);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un programa por ID',
    description: 'Obtiene la información detallada de un programa específico',
  })
  @ApiParam({ name: 'id', type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Programa encontrado',
    type: Programa,
  })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  findOne(@Param('id') id: string): Promise<Programa> {
    return this.programasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un programa',
    description: 'Actualiza la información de un programa existente',
  })
  @ApiParam({ name: 'id', type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Programa actualizado exitosamente',
    type: Programa,
  })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un programa con ese código' })
  update(
    @Param('id') id: string,
    @Body() updateProgramaDto: UpdateProgramaDto,
  ): Promise<Programa> {
    return this.programasService.update(id, updateProgramaDto);
  }

  @Patch(':id/toggle-activo')
  @ApiOperation({
    summary: 'Activar/Desactivar un programa',
    description: 'Cambia el estado activo de un programa',
  })
  @ApiParam({ name: 'id', type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({
    status: 200,
    description: 'Estado del programa actualizado',
    type: Programa,
  })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  toggleActivo(@Param('id') id: string): Promise<Programa> {
    return this.programasService.toggleActivo(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un programa',
    description: 'Elimina permanentemente un programa del sistema',
  })
  @ApiParam({ name: 'id', type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Programa eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  async remove(@Param('id') id: string) {
    await this.programasService.remove(id);
    return {
      message: 'Programa eliminado exitosamente',
      id,
    };
  }
}
