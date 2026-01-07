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
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PtcService } from './ptc.service';
import { CreatePtcDto } from './dto/create-ptc.dto';
import { UpdatePtcDto } from './dto/update-ptc.dto';
import { UpdatePtcEstadoDto } from './dto/update-ptc-estado.dto';
import { QueryPtcDto } from './dto/query-ptc.dto';
import { CreatePtcItemDto } from './dto/create-ptc-item.dto';
import { UpdatePtcItemDto } from './dto/update-ptc-item.dto';
import { UpdatePtcItemEstadoDto } from './dto/update-ptc-item-estado.dto';
import { CreateActaDto } from './dto/create-acta.dto';
import { UpdateActaDto } from './dto/update-acta.dto';
import { UpdateActaEstadoDto } from './dto/update-acta-estado.dto';
import { QueryActaDto } from './dto/query-acta.dto';
import { CreatePtcFromCaseDto } from './dto/create-ptc-from-case.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('PTC y Actas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ptc')
export class PtcController {
  constructor(private readonly ptcService: PtcService) {}

  // ==================== PTC ENDPOINTS ====================

  @Post()
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo PTC' })
  @ApiResponse({ status: 201, description: 'PTC creado exitosamente' })
  createPtc(@Body() createPtcDto: CreatePtcDto, @Request() req) {
    return this.ptcService.createPtc(createPtcDto, req.user);
  }

  @Post('desde-caso')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un PTC desde un caso disciplinario' })
  @ApiResponse({ status: 201, description: 'PTC creado desde caso disciplinario' })
  createPtcFromCase(@Body() createDto: CreatePtcFromCaseDto, @Request() req) {
    return this.ptcService.createPtcFromCase(createDto, req.user);
  }

  @Get()
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar PTCs con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de PTCs' })
  findAllPtc(@Query() query: QueryPtcDto, @Request() req) {
    return this.ptcService.findAllPtc(query, req.user);
  }

  @Get(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener detalle de un PTC' })
  @ApiResponse({ status: 200, description: 'Detalle del PTC' })
  findOnePtc(@Param('id') id: string, @Request() req) {
    return this.ptcService.findOnePtc(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un PTC (solo BORRADOR)' })
  @ApiResponse({ status: 200, description: 'PTC actualizado' })
  updatePtc(@Param('id') id: string, @Body() updatePtcDto: UpdatePtcDto, @Request() req) {
    return this.ptcService.updatePtc(id, updatePtcDto, req.user);
  }

  @Patch(':id/estado')
  @Roles(UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cambiar estado del PTC (solo COORDINADOR/ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  updatePtcEstado(@Param('id') id: string, @Body() updateEstadoDto: UpdatePtcEstadoDto, @Request() req) {
    return this.ptcService.updatePtcEstado(id, updateEstadoDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un PTC (solo BORRADOR)' })
  @ApiResponse({ status: 200, description: 'PTC eliminado' })
  deletePtc(@Param('id') id: string, @Request() req) {
    return this.ptcService.deletePtc(id, req.user);
  }

  // ==================== PTC ITEMS ENDPOINTS ====================

  @Post(':ptcId/items')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Agregar compromiso/item al PTC' })
  @ApiResponse({ status: 201, description: 'Item agregado exitosamente' })
  addItemToPtc(@Param('ptcId') ptcId: string, @Body() createItemDto: CreatePtcItemDto, @Request() req) {
    return this.ptcService.addItemToPtc(ptcId, createItemDto, req.user);
  }

  @Patch(':ptcId/items/:itemId')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un item del PTC' })
  @ApiResponse({ status: 200, description: 'Item actualizado' })
  updatePtcItem(
    @Param('ptcId') ptcId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdatePtcItemDto,
    @Request() req,
  ) {
    return this.ptcService.updatePtcItem(ptcId, itemId, updateItemDto, req.user);
  }

  @Patch(':ptcId/items/:itemId/estado')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar estado de cumplimiento de un item' })
  @ApiResponse({ status: 200, description: 'Estado del item actualizado' })
  updatePtcItemEstado(
    @Param('ptcId') ptcId: string,
    @Param('itemId') itemId: string,
    @Body() updateEstadoDto: UpdatePtcItemEstadoDto,
    @Request() req,
  ) {
    return this.ptcService.updatePtcItemEstado(ptcId, itemId, updateEstadoDto, req.user);
  }

  @Delete(':ptcId/items/:itemId')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un item del PTC' })
  @ApiResponse({ status: 200, description: 'Item eliminado' })
  deletePtcItem(@Param('ptcId') ptcId: string, @Param('itemId') itemId: string, @Request() req) {
    return this.ptcService.deletePtcItem(ptcId, itemId, req.user);
  }

  // ==================== ACTAS ENDPOINTS ====================

  @Post('actas')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva acta de reunión' })
  @ApiResponse({ status: 201, description: 'Acta creada exitosamente' })
  createActa(@Body() createActaDto: CreateActaDto, @Request() req) {
    return this.ptcService.createActa(createActaDto, req.user);
  }

  @Get('actas')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar actas con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de actas' })
  findAllActas(@Query() query: QueryActaDto, @Request() req) {
    return this.ptcService.findAllActas(query, req.user);
  }

  @Get('actas/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener detalle de un acta' })
  @ApiResponse({ status: 200, description: 'Detalle del acta' })
  findOneActa(@Param('id') id: string, @Request() req) {
    return this.ptcService.findOneActa(id, req.user);
  }

  @Patch('actas/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un acta (no cerradas)' })
  @ApiResponse({ status: 200, description: 'Acta actualizada' })
  updateActa(@Param('id') id: string, @Body() updateActaDto: UpdateActaDto, @Request() req) {
    return this.ptcService.updateActa(id, updateActaDto, req.user);
  }

  @Patch('actas/:id/estado')
  @Roles(UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Cambiar estado del acta (solo COORDINADOR/ADMIN)' })
  @ApiResponse({ status: 200, description: 'Estado del acta actualizado' })
  updateActaEstado(@Param('id') id: string, @Body() updateEstadoDto: UpdateActaEstadoDto, @Request() req) {
    return this.ptcService.updateActaEstado(id, updateEstadoDto, req.user);
  }

  @Delete('actas/:id')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un acta (solo BORRADOR)' })
  @ApiResponse({ status: 200, description: 'Acta eliminada' })
  deleteActa(@Param('id') id: string, @Request() req) {
    return this.ptcService.deleteActa(id, req.user);
  }
}
