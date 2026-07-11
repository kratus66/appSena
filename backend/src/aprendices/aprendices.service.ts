import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Aprendiz } from './entities/aprendiz.entity';
import { CreateAprendizDto } from './dto/create-aprendiz.dto';
import { UpdateAprendizDto } from './dto/update-aprendiz.dto';
import { UpdateEstadoAprendizDto } from './dto/update-estado-aprendiz.dto';
import { QueryAprendizDto } from './dto/query-aprendiz.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { canAccessFicha, applyFichaScope } from '../common/utils/ficha-access.util';
import { Ficha } from '../fichas/entities/ficha.entity';

@Injectable()
export class AprendicesService {
  constructor(
    @InjectRepository(Aprendiz)
    private readonly aprendizRepository: Repository<Aprendiz>,
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createAprendizDto: CreateAprendizDto, user: User): Promise<Aprendiz> {
    // Verificar si el documento ya existe
    const aprendizExistente = await this.aprendizRepository.findOne({
      where: { documento: createAprendizDto.documento },
    });

    if (aprendizExistente) {
      throw new ConflictException(
        `Ya existe un aprendiz con el documento ${createAprendizDto.documento}`,
      );
    }

    // Verificar si el email ya existe (si se proporciona)
    if (createAprendizDto.email) {
      const emailExistente = await this.aprendizRepository.findOne({
        where: { email: createAprendizDto.email },
      });

      if (emailExistente) {
        throw new ConflictException(
          `Ya existe un aprendiz con el email ${createAprendizDto.email}`,
        );
      }
    }

    // Validar permisos: instructor solo en sus fichas, coordinador solo en su colegio
    const ficha = await this.fichaRepository.findOne({ where: { id: createAprendizDto.fichaId } });
    if (!ficha) {
      throw new NotFoundException(`No se encontró la ficha con ID ${createAprendizDto.fichaId}`);
    }
    if (!canAccessFicha(user, ficha)) {
      throw new ForbiddenException('No tienes permisos para crear aprendices en esta ficha');
    }

    const { userId, password, ...aprendizData } = createAprendizDto;

    // Usuario + aprendiz se crean en una sola transacción: si algo falla,
    // no queda un usuario huérfano sin aprendiz (ni al revés).
    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      let aprendizUserId = userId;

      if (aprendizUserId) {
        // Vincular a un usuario existente indicado explícitamente
        const existente = await userRepo.findOne({ where: { id: aprendizUserId } });
        if (!existente) {
          throw new NotFoundException(`No se encontró el usuario con ID ${aprendizUserId}`);
        }
      } else {
        // Reutilizar el usuario por documento si ya existe; si no, crearlo
        const usuarioPorDocumento = await userRepo.findOne({
          where: { documento: aprendizData.documento },
        });

        if (usuarioPorDocumento) {
          aprendizUserId = usuarioPorDocumento.id;
        } else {
          // Si se envió email, verificar que no esté en uso por otro usuario
          if (aprendizData.email) {
            const emailEnUso = await userRepo.findOne({
              where: { email: aprendizData.email },
            });
            if (emailEnUso) {
              throw new ConflictException(
                `El email ${aprendizData.email} ya está en uso por otro usuario`,
              );
            }
          }

          const nuevoUsuario = userRepo.create({
            nombre: `${aprendizData.nombres} ${aprendizData.apellidos}`,
            email: aprendizData.email || `${aprendizData.documento}@sena.edu.co`,
            documento: aprendizData.documento,
            telefono: aprendizData.telefono || undefined,
            password: password || aprendizData.documento, // @BeforeInsert lo hashea
            rol: UserRole.APRENDIZ,
            createdById: user.id,
          });
          const usuarioGuardado = await userRepo.save(nuevoUsuario);
          aprendizUserId = usuarioGuardado.id;
        }
      }

      const aprendiz = manager.getRepository(Aprendiz).create({
        ...aprendizData,
        userId: aprendizUserId,
        createdById: user.id,
      });

      return manager.getRepository(Aprendiz).save(aprendiz);
    });
  }

  async findAll(
    queryDto: QueryAprendizDto,
    user: User,
  ): Promise<{ data: Aprendiz[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      fichaId,
      colegioId,
      programaId,
      estadoAcademico,
    } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.aprendizRepository
      .createQueryBuilder('aprendiz')
      .leftJoinAndSelect('aprendiz.ficha', 'ficha')
      .leftJoinAndSelect('ficha.colegio', 'colegio')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .leftJoinAndSelect('aprendiz.user', 'user');

    // Alcance obligatorio: instructor → sus fichas, coordinador → su colegio
    applyFichaScope(queryBuilder, user, 'ficha');

    // Filtros
    if (fichaId) {
      queryBuilder.andWhere('aprendiz.fichaId = :fichaId', { fichaId });
    }

    if (colegioId) {
      queryBuilder.andWhere('ficha.colegioId = :colegioId', { colegioId });
    }

    if (programaId) {
      queryBuilder.andWhere('ficha.programaId = :programaId', { programaId });
    }

    if (estadoAcademico) {
      queryBuilder.andWhere('aprendiz.estadoAcademico = :estadoAcademico', { estadoAcademico });
    }

    // Búsqueda por nombres, apellidos o documento
    if (search) {
      queryBuilder.andWhere(
        '(aprendiz.nombres ILIKE :search OR aprendiz.apellidos ILIKE :search OR aprendiz.documento ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Orden y paginación
    queryBuilder.orderBy('aprendiz.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, user: User): Promise<Aprendiz> {
    const aprendiz = await this.aprendizRepository.findOne({
      where: { id },
      relations: ['ficha', 'ficha.colegio', 'ficha.programa', 'user'],
    });

    if (!aprendiz) {
      throw new NotFoundException(`Aprendiz con ID ${id} no encontrado`);
    }

    // Validar permisos: instructor → sus fichas, coordinador → su colegio
    if (!canAccessFicha(user, aprendiz.ficha)) {
      throw new ForbiddenException('No tienes permisos para ver este aprendiz');
    }

    return aprendiz;
  }

  async update(id: string, updateAprendizDto: UpdateAprendizDto, user: User): Promise<Aprendiz> {
    const aprendiz = await this.findOne(id, user);

    // findOne ya validó el acceso a la ficha del aprendiz

    // Verificar email único si se está cambiando
    if (updateAprendizDto.email && updateAprendizDto.email !== aprendiz.email) {
      const emailExistente = await this.aprendizRepository.findOne({
        where: { email: updateAprendizDto.email },
      });

      if (emailExistente) {
        throw new ConflictException(
          `Ya existe un aprendiz con el email ${updateAprendizDto.email}`,
        );
      }
    }

    Object.assign(aprendiz, updateAprendizDto);
    aprendiz.updatedById = user.id;

    return await this.aprendizRepository.save(aprendiz);
  }

  async updateEstado(
    id: string,
    updateEstadoDto: UpdateEstadoAprendizDto,
    user: User,
  ): Promise<Aprendiz> {
    // Solo COORDINADOR y ADMIN pueden cambiar estado
    if (user.rol !== UserRole.COORDINADOR && user.rol !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Solo coordinadores y administradores pueden cambiar el estado académico',
      );
    }

    const aprendiz = await this.aprendizRepository.findOne({
      where: { id },
      relations: ['ficha', 'user'],
    });

    if (!aprendiz) {
      throw new NotFoundException(`Aprendiz con ID ${id} no encontrado`);
    }

    // Alcance obligatorio: un COORDINADOR solo puede cambiar el estado de
    // aprendices de su propio colegio (evita fuga entre colegios).
    if (!canAccessFicha(user, aprendiz.ficha)) {
      throw new ForbiddenException('No tienes permisos para cambiar el estado de este aprendiz');
    }

    aprendiz.estadoAcademico = updateEstadoDto.estadoAcademico;
    aprendiz.updatedById = user.id;

    return await this.aprendizRepository.save(aprendiz);
  }

  async remove(id: string, user: User): Promise<void> {
    // Solo ADMIN puede eliminar
    if (user.rol !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo administradores pueden eliminar aprendices');
    }

    const aprendiz = await this.findOne(id, user);

    aprendiz.deletedById = user.id;
    await this.aprendizRepository.softRemove(aprendiz);
  }

  // Método auxiliar para obtener aprendices por ficha
  async findByFicha(fichaId: string, user: User): Promise<Aprendiz[]> {
    const queryBuilder = this.aprendizRepository
      .createQueryBuilder('aprendiz')
      .leftJoinAndSelect('aprendiz.user', 'user')
      .leftJoinAndSelect('aprendiz.ficha', 'ficha')
      .where('aprendiz.fichaId = :fichaId', { fichaId });

    applyFichaScope(queryBuilder, user, 'ficha');

    return await queryBuilder.getMany();
  }
}
