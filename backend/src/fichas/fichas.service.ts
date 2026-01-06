import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ficha } from './entities/ficha.entity';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { UpdateFichaEstadoDto } from './dto/update-ficha-estado.dto';
import { QueryFichaDto } from './dto/query-ficha.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class FichasService {
  constructor(
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
  ) {}

  async create(createFichaDto: CreateFichaDto): Promise<Ficha> {
    // Verificar si ya existe una ficha con ese número
    const fichaExistente = await this.fichaRepository.findOne({
      where: { numeroFicha: createFichaDto.numeroFicha },
    });

    if (fichaExistente) {
      throw new ConflictException(
        `Ya existe una ficha con el número ${createFichaDto.numeroFicha}`,
      );
    }

    const ficha = this.fichaRepository.create(createFichaDto);

    return await this.fichaRepository.save(ficha);
  }

  async findAll(queryDto: QueryFichaDto): Promise<{ data: Ficha[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search, instructorId, colegioId, programaId, estado, jornada } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.fichaRepository
      .createQueryBuilder('ficha')
      .leftJoinAndSelect('ficha.colegio', 'colegio')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .leftJoinAndSelect('ficha.instructor', 'instructor');

    // Filtrar por instructorId si se proporciona (para pruebas sin autenticación)
    if (instructorId) {
      queryBuilder.andWhere('ficha.instructorId = :instructorId', { instructorId });
    }

    // Aplicar filtros
    if (colegioId) {
      queryBuilder.andWhere('ficha.colegioId = :colegioId', { colegioId });
    }

    if (colegioId) {
      queryBuilder.andWhere('ficha.colegioId = :colegioId', { colegioId });
    }

    if (programaId) {
      queryBuilder.andWhere('ficha.programaId = :programaId', { programaId });
    }

    if (estado) {
      queryBuilder.andWhere('ficha.estado = :estado', { estado });
    }

    if (jornada) {
      queryBuilder.andWhere('ficha.jornada = :jornada', { jornada });
    }

    if (search) {
      queryBuilder.andWhere('ficha.numeroFicha ILIKE :search', { search: `%${search}%` });
    }

    // Orden y paginación
    queryBuilder
      .orderBy('ficha.createdAt', 'DESC')
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

  async findMine(queryDto: QueryFichaDto): Promise<{ data: Ficha[]; total: number; page: number; limit: number }> {
    // Verificar que se proporcione instructorId
    if (!queryDto.instructorId) {
      throw new ForbiddenException('Debe proporcionar el instructorId como parámetro');
    }

    // Buscar todas las fichas del instructor usando la relación en la base de datos
    return this.findAll(queryDto);
  }

  async findGrouped(queryDto: QueryFichaDto): Promise<any[]> {
    const queryBuilder = this.fichaRepository
      .createQueryBuilder('ficha')
      .leftJoinAndSelect('ficha.colegio', 'colegio')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .leftJoinAndSelect('ficha.instructor', 'instructor');

    // Si se proporciona instructorId, filtrar por ese instructor
    if (queryDto.instructorId) {
      queryBuilder.andWhere('ficha.instructorId = :instructorId', { instructorId: queryDto.instructorId });
    }

    // Aplicar filtros básicos
    if (queryDto.colegioId) {
      queryBuilder.andWhere('ficha.colegioId = :colegioId', { colegioId: queryDto.colegioId });
    }

    if (queryDto.programaId) {
      queryBuilder.andWhere('ficha.programaId = :programaId', { programaId: queryDto.programaId });
    }

    if (queryDto.estado) {
      queryBuilder.andWhere('ficha.estado = :estado', { estado: queryDto.estado });
    }

    if (queryDto.jornada) {
      queryBuilder.andWhere('ficha.jornada = :jornada', { jornada: queryDto.jornada });
    }

    queryBuilder.orderBy('colegio.nombre', 'ASC').addOrderBy('programa.nombre', 'ASC');

    const fichas = await queryBuilder.getMany();

    // Agrupar manualmente
    const agrupado = fichas.reduce((acc, ficha) => {
      const colegioId = ficha.colegioId;
      const programaId = ficha.programaId;

      let colegio = acc.find((c) => c.colegioId === colegioId);
      if (!colegio) {
        colegio = {
          colegioId,
          colegioNombre: ficha.colegio.nombre,
          programas: [],
        };
        acc.push(colegio);
      }

      let programa = colegio.programas.find((p) => p.programaId === programaId);
      if (!programa) {
        programa = {
          programaId,
          programaNombre: ficha.programa.nombre,
          totalFichas: 0,
          fichas: [],
        };
        colegio.programas.push(programa);
      }

      programa.totalFichas++;
      programa.fichas.push({
        id: ficha.id,
        numeroFicha: ficha.numeroFicha,
        jornada: ficha.jornada,
        estado: ficha.estado,
        instructor: {
          id: ficha.instructor.id,
          nombre: ficha.instructor.nombre,
        },
      });

      return acc;
    }, []);

    return agrupado;
  }

  async findOne(id: string): Promise<Ficha> {
    const ficha = await this.fichaRepository.findOne({
      where: { id },
      relations: ['colegio', 'programa', 'instructor'],
    });

    if (!ficha) {
      throw new NotFoundException(`Ficha con ID ${id} no encontrada`);
    }

    return ficha;
  }

  async update(id: string, updateFichaDto: UpdateFichaDto): Promise<Ficha> {
    const ficha = await this.findOne(id);

    // Si están cambiando el número, verificar que no exista
    if (updateFichaDto.numeroFicha && updateFichaDto.numeroFicha !== ficha.numeroFicha) {
      const fichaExistente = await this.fichaRepository.findOne({
        where: { numeroFicha: updateFichaDto.numeroFicha },
      });

      if (fichaExistente) {
        throw new ConflictException(
          `Ya existe una ficha con el número ${updateFichaDto.numeroFicha}`,
        );
      }
    }

    Object.assign(ficha, updateFichaDto);

    return await this.fichaRepository.save(ficha);
  }

  async updateEstado(
    id: string,
    updateEstadoDto: UpdateFichaEstadoDto,
  ): Promise<Ficha> {
    const ficha = await this.fichaRepository.findOne({
      where: { id },
      relations: ['colegio', 'programa', 'instructor'],
    });

    if (!ficha) {
      throw new NotFoundException(`Ficha con ID ${id} no encontrada`);
    }

    ficha.estado = updateEstadoDto.estado;

    return await this.fichaRepository.save(ficha);
  }

  async remove(id: string): Promise<void> {
    const ficha = await this.findOne(id);

    await this.fichaRepository.softRemove(ficha);
  }
}
