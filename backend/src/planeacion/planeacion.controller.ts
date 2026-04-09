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
import { PlaneacionService } from './planeacion.service';
import { CreatePlaneacionDto } from './dto/create-planeacion.dto';
import { UpdatePlaneacionDto } from './dto/update-planeacion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@ApiTags('planeacion')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('planeacion')
export class PlaneacionController {
  constructor(private readonly planeacionService: PlaneacionService) {}

  // ── Metrics (before :id) ──────────────────────────────────────────────
  @Get('metrics')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Métricas del dashboard de planeacion' })
  @ApiQuery({ name: 'sede', required: false })
  getMetrics(@Query('sede') sede?: string) {
    return this.planeacionService.getMetrics(sede);
  }

  // ── Historial (before :id) ────────────────────────────────────────────
  @Get('historial')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Historial de cambios de planeacion' })
  @ApiQuery({ name: 'planeacionId', required: false })
  getHistorial(@Query('planeacionId') planeacionId?: string) {
    return this.planeacionService.getHistorial(planeacionId);
  }

  // ── CRUD ──────────────────────────────────────────────────────────────
  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Listar planeaciones' })
  @ApiQuery({ name: 'dependencia', required: false })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'sede', required: false })
  findAll(
    @Query('dependencia') dependencia?: string,
    @Query('estado') estado?: string,
    @Query('sede') sede?: string,
  ) {
    return this.planeacionService.findAll({ dependencia, estado, sede });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.planeacionService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Crear nueva planeacion' })
  create(@Body() dto: CreatePlaneacionDto, @GetUser() user: User) {
    return this.planeacionService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Actualizar planeacion' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlaneacionDto,
    @GetUser() user: User,
  ) {
    return this.planeacionService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Cerrar/eliminar planeacion' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.planeacionService.remove(id, user);
  }
}
