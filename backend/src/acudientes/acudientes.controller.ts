import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AcudientesService } from './acudientes.service';
import { CreateAcudienteDto } from './dto/create-acudiente.dto';
import { UpdateAcudienteDto } from './dto/update-acudiente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';

@ApiTags('Acudientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('aprendices/:aprendizId/acudientes')
export class AcudientesController {
  constructor(private readonly acudientesService: AcudientesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Crear un nuevo acudiente para un aprendiz' })
  @ApiResponse({ status: 201, description: 'Acudiente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe un acudiente con el mismo teléfono para este aprendiz' })
  create(
    @Param('aprendizId') aprendizId: string,
    @Body() createAcudienteDto: CreateAcudienteDto,
    @GetUser() user: User,
  ) {
    return this.acudientesService.create(aprendizId, createAcudienteDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Listar todos los acudientes de un aprendiz' })
  @ApiResponse({ status: 200, description: 'Lista de acudientes obtenida exitosamente' })
  findAll(
    @Param('aprendizId') aprendizId: string,
    @GetUser() user: User,
  ) {
    return this.acudientesService.findAllByAprendiz(aprendizId, user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Obtener detalle de un acudiente' })
  @ApiResponse({ status: 200, description: 'Detalle del acudiente obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Acudiente no encontrado' })
  findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.acudientesService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Actualizar datos de un acudiente' })
  @ApiResponse({ status: 200, description: 'Acudiente actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Acudiente no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un acudiente con el mismo teléfono para este aprendiz' })
  update(
    @Param('id') id: string,
    @Body() updateAcudienteDto: UpdateAcudienteDto,
    @GetUser() user: User,
  ) {
    return this.acudientesService.update(id, updateAcudienteDto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar un acudiente (solo ADMIN)' })
  @ApiResponse({ status: 200, description: 'Acudiente eliminado exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permisos para eliminar acudientes' })
  @ApiResponse({ status: 404, description: 'Acudiente no encontrado' })
  remove(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.acudientesService.remove(id, user);
  }
}
