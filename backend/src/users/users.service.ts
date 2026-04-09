import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si ya existe el email o documento
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: createUserDto.email },
        { documento: createUserDto.documento },
      ],
      withDeleted: true,
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('El email ya está registrado');
      }
      if (existingUser.documento === createUserDto.documento) {
        throw new ConflictException('El documento ya está registrado');
      }
    }

    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByDocumento(documento: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { documento } });
  }

  async findByRole(rol: UserRole): Promise<User[]> {
    return await this.userRepository.find({ where: { rol } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
  const user = await this.findOne(id);

  // Validar email si viene en el DTO
  if (updateUserDto.email) {
    const emailOwner = await this.userRepository.findOne({
      where: { email: updateUserDto.email },
      withDeleted: true,
    });

    if (emailOwner && emailOwner.id !== id) {
      throw new ConflictException('El email ya está registrado');
    }
  }

  // Validar documento si viene en el DTO
  if (updateUserDto.documento) {
    const docOwner = await this.userRepository.findOne({
      where: { documento: updateUserDto.documento },
      withDeleted: true,
    });

    if (docOwner && docOwner.id !== id) {
      throw new ConflictException('El documento ya está registrado');
    }
  }

  Object.assign(user, updateUserDto);
  return await this.userRepository.save(user);
}


  async toggleActivo(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.activo = !user.activo;
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(id);
    return { message: `Usuario ${user.nombre} eliminado exitosamente` };
  }

  async restore(id: string): Promise<User> {
    await this.userRepository.restore(id);
    return await this.findOne(id);
  }

  async findInstructores(dependencia?: string): Promise<any[]> {
    const qb = this.userRepository
      .createQueryBuilder('u')
      .where('u.rol = :rol', { rol: UserRole.INSTRUCTOR })
      .andWhere('u.deletedAt IS NULL')
      .loadRelationCountAndMap('u.fichasCount', 'u.fichas')
      .orderBy('u.nombre', 'ASC');

    if (dependencia) {
      qb.andWhere('u.dependencia = :dependencia', { dependencia });
    }

    const instructors = await qb.getMany();

    return instructors.map((u) => {
      const initials = u.nombre
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');

      return {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        documento: u.documento,
        telefono: u.telefono,
        fotoPerfil: u.fotoPerfil,
        activo: u.activo,
        initials,
        profesion: u.profesion,
        dependencia: u.dependencia,
        area: u.area,
        tipoPrograma: u.tipoPrograma,
        sede: u.sede,
        fechaInicioContrato: u.fechaInicioContrato,
        fechaFinContrato: u.fechaFinContrato,
        colegioArticulacion: u.colegioArticulacion,
        modalidadArticulacion: u.modalidadArticulacion,
        jornadaArticulacion: u.jornadaArticulacion,
        localidad: u.localidad,
        estadoDisponibilidad: u.estadoDisponibilidad,
        fichasCount: (u as any).fichasCount ?? 0,
      };
    });
  }
}
