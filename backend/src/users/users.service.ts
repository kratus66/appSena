import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { PerfilInstructor } from './entities/perfil-instructor.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Campos que pertenecen al perfil de instructor (tabla `perfil_instructor`),
 * no a `users`. La API sigue aceptándolos y devolviéndolos de forma plana; el
 * servicio se encarga de enrutarlos hacia/desde la relación 1:1.
 */
const INSTRUCTOR_PROFILE_KEYS = [
  'profesion',
  'dependencia',
  'area',
  'tipoPrograma',
  'sede',
  'fechaInicioContrato',
  'fechaFinContrato',
  'colegioArticulacion',
  'modalidadArticulacion',
  'jornadaArticulacion',
  'localidad',
  'estadoDisponibilidad',
] as const;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PerfilInstructor)
    private readonly perfilRepository: Repository<PerfilInstructor>,
  ) {}

  /** Separa un DTO plano en datos base de `users` y datos del perfil de instructor. */
  private splitDto(dto: Record<string, any>): {
    base: Record<string, any>;
    perfil: Record<string, any>;
    hasPerfilKeys: boolean;
  } {
    const base: Record<string, any> = { ...dto };
    const perfil: Record<string, any> = {};
    let hasPerfilKeys = false;

    for (const key of INSTRUCTOR_PROFILE_KEYS) {
      if (key in base) {
        if (base[key] !== undefined) {
          perfil[key] = base[key];
          hasPerfilKeys = true;
        }
        delete base[key];
      }
    }

    return { base, perfil, hasPerfilKeys };
  }

  private async upsertPerfil(userId: string, perfil: Record<string, any>): Promise<void> {
    const existente = await this.perfilRepository.findOne({ where: { userId } });
    if (existente) {
      Object.assign(existente, perfil);
      await this.perfilRepository.save(existente);
    } else {
      await this.perfilRepository.save(this.perfilRepository.create({ ...perfil, userId }));
    }
  }

  /**
   * Serializa un usuario para la respuesta: quita el password y aplana el
   * perfil de instructor en el nivel superior (retrocompatible con el front,
   * que lee `user.profesion`, `user.dependencia`, etc.).
   */
  toPublic(user: User): Record<string, any> {
    const { password, perfil, ...rest } = user as any;
    const flat: Record<string, any> = {};
    for (const key of INSTRUCTOR_PROFILE_KEYS) {
      flat[key] = perfil?.[key] ?? null;
    }
    return { ...rest, ...flat };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si ya existe el email o documento
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }, { documento: createUserDto.documento }],
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

    const { base, perfil, hasPerfilKeys } = this.splitDto(createUserDto);

    const user = this.userRepository.create(base);
    const saved = await this.userRepository.save(user);

    if (hasPerfilKeys) {
      await this.upsertPerfil(saved.id, perfil);
    }

    return this.findOne(saved.id);
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

    const { base, perfil, hasPerfilKeys } = this.splitDto(updateUserDto);

    Object.assign(user, base);
    await this.userRepository.save(user);

    if (hasPerfilKeys) {
      await this.upsertPerfil(id, perfil);
    }

    return this.findOne(id);
  }

  async toggleActivo(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.activo = !user.activo;
    return await this.userRepository.save(user);
  }

  /** Invalida todos los tokens JWT emitidos hasta ahora para este usuario. */
  async incrementTokenVersion(id: string): Promise<void> {
    await this.userRepository.increment({ id }, 'tokenVersion', 1);
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
      // eager no aplica en QueryBuilder: hay que unir el perfil explícitamente
      .leftJoinAndSelect('u.perfil', 'perfil')
      .where('u.rol = :rol', { rol: UserRole.INSTRUCTOR })
      .andWhere('u.deletedAt IS NULL')
      .loadRelationCountAndMap('u.fichasCount', 'u.fichas')
      .orderBy('u.nombre', 'ASC');

    if (dependencia) {
      qb.andWhere('perfil.dependencia = :dependencia', { dependencia });
    }

    const instructors = await qb.getMany();

    return instructors.map((u) => {
      const p: any = (u as any).perfil ?? {};
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
        profesion: p.profesion ?? null,
        dependencia: p.dependencia ?? null,
        area: p.area ?? null,
        tipoPrograma: p.tipoPrograma ?? null,
        sede: p.sede ?? null,
        fechaInicioContrato: p.fechaInicioContrato ?? null,
        fechaFinContrato: p.fechaFinContrato ?? null,
        colegioArticulacion: p.colegioArticulacion ?? null,
        modalidadArticulacion: p.modalidadArticulacion ?? null,
        jornadaArticulacion: p.jornadaArticulacion ?? null,
        localidad: p.localidad ?? null,
        estadoDisponibilidad: p.estadoDisponibilidad ?? null,
        fichasCount: (u as any).fichasCount ?? 0,
      };
    });
  }
}
