import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Ficha } from './entities/ficha.entity';
import { CreateFichaDto } from './dto/create-ficha.dto';
import { UpdateFichaDto } from './dto/update-ficha.dto';
import { UpdateFichaEstadoDto } from './dto/update-ficha-estado.dto';
import { QueryFichaDto } from './dto/query-ficha.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Aprendiz, TipoDocumento, EstadoAcademico } from '../aprendices/entities/aprendiz.entity';

@Injectable()
export class FichasService {
  constructor(
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
    @InjectRepository(Aprendiz)
    private readonly aprendizRepository: Repository<Aprendiz>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      .leftJoinAndSelect('ficha.instructor', 'instructor')
      .loadRelationCountAndMap('ficha.aprendicesCount', 'ficha.aprendices');

    // Filtrar por instructorId si se proporciona (para pruebas sin autenticación)
    if (instructorId) {
      queryBuilder.andWhere('ficha.instructorId = :instructorId', { instructorId });
    }

    // Aplicar filtros
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

    if (queryDto.dependencia) {
      queryBuilder.andWhere('ficha.dependencia = :dependencia', { dependencia: queryDto.dependencia });
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

    // Usar update() directo para evitar conflictos entre el objeto de relación
    // cargado en memoria y los nuevos IDs de FK al hacer save()
    await this.fichaRepository.update(id, updateFichaDto);

    // Recargar la entidad con todas las relaciones actualizadas
    return this.findOne(id);
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

  async remove(id: string, deletedById?: string): Promise<void> {
    await this.findOne(id);
    if (deletedById) {
      await this.fichaRepository.update(id, { deletedById });
    }
    await this.fichaRepository.softDelete(id);
  }

  async importarAprendicesDesdeExcel(
    fichaId: string,
    fileBuffer: Buffer,
  ): Promise<{ creados: number; omitidos: number; errores: string[] }> {
    // Verificar que la ficha existe
    await this.findOne(fichaId);

    let rows: any[];
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    } catch (e) {
      throw new BadRequestException('El archivo no es un Excel válido (.xlsx o .xls)');
    }

    if (!rows || rows.length === 0) {
      throw new BadRequestException('El archivo está vacío o no tiene filas de datos');
    }

    const normalizeKey = (obj: any, ...aliases: string[]): string => {
      const keys = Object.keys(obj).map((k) => k.trim().toLowerCase().replace(/[^a-z]/g, ''));
      for (const alias of aliases) {
        const a = alias.toLowerCase().replace(/[^a-z]/g, '');
        const found = keys.find((k) => k === a);
        if (found) {
          const original = Object.keys(obj).find((k) => k.trim().toLowerCase().replace(/[^a-z]/g, '') === found);
          return original ? String(obj[original]).trim() : '';
        }
      }
      return '';
    };

    const TIPO_DOC_MAP: Record<string, TipoDocumento> = {
      cc: TipoDocumento.CC, ti: TipoDocumento.TI, ce: TipoDocumento.CE, pas: TipoDocumento.PAS,
    };

    let creados = 0;
    let omitidos = 0;
    const errores: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 porque la fila 1 es el encabezado

      try {
        const nombres = normalizeKey(row, 'nombres', 'nombre');
        const apellidos = normalizeKey(row, 'apellidos', 'apellido');
        const documento = normalizeKey(row, 'documento', 'numerodocumento', 'numdoc');
        const tipoDocStr = normalizeKey(row, 'tipodocumento', 'tipo', 'tipodoc').toLowerCase();
        const email = normalizeKey(row, 'email', 'correo', 'correoe');
        const telefono = normalizeKey(row, 'telefono', 'celular', 'tel');
        const direccion = normalizeKey(row, 'direccion', 'direccion', 'dir');

        if (!nombres) { errores.push(`Fila ${rowNum}: campo 'nombres' requerido`); continue; }
        if (!apellidos) { errores.push(`Fila ${rowNum}: campo 'apellidos' requerido`); continue; }
        if (!documento) { errores.push(`Fila ${rowNum}: campo 'documento' requerido`); continue; }

        const tipoDocumento: TipoDocumento = TIPO_DOC_MAP[tipoDocStr] || TipoDocumento.CC;

        // Si ya existe un aprendiz con ese documento, omitir
        const aprendizExistente = await this.aprendizRepository.findOne({ where: { documento } });
        if (aprendizExistente) {
          omitidos++;
          continue;
        }

        // Buscar o crear usuario
        let user = await this.userRepository.findOne({ where: { documento } });
        if (!user) {
          const emailFinal = email || `${documento}@sena.edu.co`;
          // Si el email ya existe, usar uno generado
          const emailEnUso = email
            ? await this.userRepository.findOne({ where: { email } })
            : null;
          const emailDefinitivo = emailEnUso ? `${documento}@sena.edu.co` : emailFinal;

          user = this.userRepository.create({
            nombre: `${nombres} ${apellidos}`,
            email: emailDefinitivo,
            documento,
            password: documento, // El BeforeInsert hasheará esto
            rol: UserRole.APRENDIZ,
            telefono: telefono || undefined,
          });
          user = await this.userRepository.save(user);
        }

        // Crear aprendiz
        const aprendiz = this.aprendizRepository.create({
          nombres,
          apellidos,
          tipoDocumento,
          documento,
          email: email || undefined,
          telefono: telefono || undefined,
          direccion: direccion || undefined,
          estadoAcademico: EstadoAcademico.ACTIVO,
          userId: user.id,
          fichaId,
        });
        await this.aprendizRepository.save(aprendiz);
        creados++;
      } catch (err: any) {
        errores.push(`Fila ${rowNum}: ${err?.message || 'Error desconocido'}`);
      }
    }

    return { creados, omitidos, errores };
  }
}
