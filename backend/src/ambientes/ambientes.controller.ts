import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AmbientesService } from './ambientes.service';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { CreateAsignacionAmbienteDto } from './dto/create-asignacion-ambiente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@ApiTags('ambientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ambientes')
export class AmbientesController {
  constructor(private readonly ambientesService: AmbientesService) {}

  // ── Tablero (before :id to avoid route conflict) ────────────────────────
  @Get('tablero')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  @ApiOperation({ summary: 'Obtener tablero operativo de ambientes por sede' })
  @ApiQuery({ name: 'sede', required: false })
  getTablero(@Query('sede') sede?: string) {
    return this.ambientesService.getTablero(sede);
  }

  // ── CRUD ────────────────────────────────────────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  @ApiOperation({ summary: 'Listar ambientes' })
  @ApiQuery({ name: 'sede', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'estado', required: false })
  findAll(
    @Query('sede') sede?: string,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
  ) {
    return this.ambientesService.findAll({ sede, tipo, estado });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ambientesService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  @ApiOperation({ summary: 'Crear ambiente' })
  create(@Body() dto: CreateAmbienteDto, @GetUser() user: User) {
    return this.ambientesService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAmbienteDto,
    @GetUser() user: User,
  ) {
    return this.ambientesService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.ambientesService.remove(id, user);
  }

  // ── Asignaciones ────────────────────────────────────────────────────────
  @Post(':id/asignaciones')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  @ApiOperation({ summary: 'Asignar ficha a un bloque de ambiente' })
  createAsignacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAsignacionAmbienteDto,
    @GetUser() user: User,
  ) {
    return this.ambientesService.createAsignacion(id, dto, user);
  }

  @Delete('asignaciones/:asignacionId')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  @ApiOperation({ summary: 'Eliminar asignación de un bloque' })
  removeAsignacion(
    @Param('asignacionId', ParseUUIDPipe) asignacionId: string,
    @GetUser() user: User,
  ) {
    return this.ambientesService.removeAsignacion(asignacionId, user);
  }

  @Get(':id/asignaciones')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.DESARROLLADOR)
  getAsignaciones(@Param('id', ParseUUIDPipe) id: string) {
    return this.ambientesService.getAsignacionesByAmbiente(id);
  }
}
