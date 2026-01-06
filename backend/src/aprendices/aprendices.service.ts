import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aprendiz } from './entities/aprendiz.entity';
import { CreateAprendizDto } from './dto/create-aprendiz.dto';
import { UpdateAprendizDto } from './dto/update-aprendiz.dto';
import { UpdateEstadoAprendizDto } from './dto/update-estado-aprendiz.dto';
import { QueryAprendizDto } from './dto/query-aprendiz.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AprendicesService {
  constructor(
    @InjectRepository(Aprendiz)
    private readonly aprendizRepository: Repository<Aprendiz>,
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

    // Validar permisos: INSTRUCTOR solo puede crear en sus fichas
    if (user.rol === UserRole.INSTRUCTOR) {
      // TODO: Verificar que la ficha pertenece al instructor
      // Esto requiere acceso al fichaRepository o hacer la query aquí
    }

    const aprendiz = this.aprendizRepository.create({
      ...createAprendizDto,
      createdById: user.id,
    });

    return await this.aprendizRepository.save(aprendiz);
  }

  async findAll(
    queryDto: QueryAprendizDto,
    user: User,
  ): Promise<{ data: Aprendiz[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, fichaId, colegioId, programaId, estadoAcademico } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.aprendizRepository
      .createQueryBuilder('aprendiz')
      .leftJoinAndSelect('aprendiz.ficha', 'ficha')
      .leftJoinAndSelect('ficha.colegio', 'colegio')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .leftJoinAndSelect('aprendiz.user', 'user');

    // Restricción por rol: INSTRUCTOR solo ve aprendices de sus fichas
    if (user.rol === UserRole.INSTRUCTOR) {
      queryBuilder.andWhere('ficha.instructorId = :instructorId', {
        instructorId: user.id,
      });
    }

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
    queryBuilder
      .orderBy('aprendiz.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

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

    // Validar permisos: INSTRUCTOR solo puede ver aprendices de sus fichas
    if (user.rol === UserRole.INSTRUCTOR && aprendiz.ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para ver este aprendiz');
    }

    return aprendiz;
  }

  async update(id: string, updateAprendizDto: UpdateAprendizDto, user: User): Promise<Aprendiz> {
    const aprendiz = await this.findOne(id, user);

    // Validar permisos: INSTRUCTOR solo puede actualizar aprendices de sus fichas
    if (user.rol === UserRole.INSTRUCTOR && aprendiz.ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para actualizar este aprendiz');
    }

    // Verificar email único si se está cambiando
    if (updateAprendizDto.email && updateAprendizDto.email !== aprendiz.email) {
      const emailExistente = await this.aprendizRepository.findOne({
        where: { email: updateAprendizDto.email },
      });

      if (emailExistente) {
        throw new ConflictException(`Ya existe un aprendiz con el email ${updateAprendizDto.email}`);
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
      throw new ForbiddenException('Solo coordinadores y administradores pueden cambiar el estado académico');
    }

    const aprendiz = await this.aprendizRepository.findOne({
      where: { id },
      relations: ['ficha', 'user'],
    });

    if (!aprendiz) {
      throw new NotFoundException(`Aprendiz con ID ${id} no encontrado`);
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

    // Restricción por rol
    if (user.rol === UserRole.INSTRUCTOR) {
      queryBuilder.andWhere('ficha.instructorId = :instructorId', {
        instructorId: user.id,
      });
    }

    return await queryBuilder.getMany();
  }
}
