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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserRole } from './entities/user.entity';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return this.usersService.toPublic(user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  async findAll() {
    const users = await this.usersService.findAll();
    return users.map((user) => this.usersService.toPublic(user));
  }

  @Get('instructores')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Obtener directorio de instructores con datos de perfil' })
  @ApiQuery({
    name: 'dependencia',
    required: false,
    description: 'Filtrar por dependencia (Articulacion | Titulada | Complementaria)',
  })
  async findInstructores(@Query('dependencia') dependencia?: string) {
    return this.usersService.findInstructores(dependencia);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Obtener mi propio perfil',
    description:
      'Cualquier usuario autenticado puede consultar sus propios datos personales (derecho de acceso, ver docs/PRODUCTION_READINESS.md#BIZ-1).',
  })
  async findMe(@GetUser() user: User) {
    return this.usersService.toPublic(user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.COORDINADOR)
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return this.usersService.toPublic(user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar usuario' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return this.usersService.toPublic(user);
  }

  @Patch(':id/toggle-activo')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Activar/Desactivar usuario' })
  async toggleActivo(@Param('id') id: string) {
    const user = await this.usersService.toggleActivo(id);
    return this.usersService.toPublic(user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuario (soft delete)' })
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restaurar usuario eliminado' })
  async restore(@Param('id') id: string) {
    const user = await this.usersService.restore(id);
    return this.usersService.toPublic(user);
  }
}
