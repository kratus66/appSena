import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisciplinaryCase, CaseEstado, CaseTipo, CaseGravedad } from './entities/disciplinary-case.entity';
import { CaseAction, ActionTipo } from './entities/case-action.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { UpdateCaseEstadoDto } from './dto/update-case-estado.dto';
import { QueryCasesDto } from './dto/query-cases.dto';
import { CreateCaseActionDto } from './dto/create-case-action.dto';
import { UpdateCaseActionDto } from './dto/update-case-action.dto';
import { CreateCaseFromAlertDto } from './dto/create-case-from-alert.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';

@Injectable()
export class DisciplinarioService {
  constructor(
    @InjectRepository(DisciplinaryCase)
    private readonly caseRepository: Repository<DisciplinaryCase>,
    @InjectRepository(CaseAction)
    private readonly actionRepository: Repository<CaseAction>,
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
    @InjectRepository(Aprendiz)
    private readonly aprendizRepository: Repository<Aprendiz>,
  ) {}

  // ==================== CASOS ====================

  async create(createCaseDto: CreateCaseDto, user: User): Promise<DisciplinaryCase> {
    const { fichaId, aprendizId, fechaIncidente, ...rest } = createCaseDto;

    // Validar que la ficha existe
    const ficha = await this.fichaRepository.findOne({ where: { id: fichaId } });
    if (!ficha) {
      throw new NotFoundException(`No se encontró la ficha con ID ${fichaId}`);
    }

    // Validar que el aprendiz existe y pertenece a la ficha
    const aprendiz = await this.aprendizRepository.findOne({
      where: { id: aprendizId },
    });
    if (!aprendiz) {
      throw new NotFoundException(`No se encontró el aprendiz con ID ${aprendizId}`);
    }
    if (aprendiz.fichaId !== fichaId) {
      throw new BadRequestException(
        'El aprendiz no pertenece a la ficha especificada',
      );
    }

    // Validar permisos: INSTRUCTOR solo puede crear para sus fichas
    if (user.rol === UserRole.INSTRUCTOR && ficha.instructorId !== user.id) {
      throw new ForbiddenException(
        'Solo puedes crear casos para aprendices de tus fichas',
      );
    }

    // Validar que fechaIncidente no sea futura
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaIncidente);
    if (fecha > hoy) {
      throw new BadRequestException('La fecha del incidente no puede ser futura');
    }

    const caso = this.caseRepository.create({
      ...rest,
      fichaId,
      aprendizId,
      fechaIncidente: fecha,
      createdById: user.id,
    });

    return this.caseRepository.save(caso);
  }

  async findAll(queryDto: QueryCasesDto, user: User) {
    const {
      fichaId,
      aprendizId,
      colegioId,
      programaId,
      estado,
      tipo,
      gravedad,
      desde,
      hasta,
      search,
      page = 1,
      limit = 10,
    } = queryDto;

    const qb = this.caseRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.ficha', 'ficha')
      .leftJoinAndSelect('ficha.colegio', 'colegio')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .leftJoinAndSelect('ficha.instructor', 'instructor')
      .leftJoinAndSelect('case.aprendiz', 'aprendiz')
      .leftJoinAndSelect('aprendiz.user', 'aprendizUser')
      .leftJoinAndSelect('case.assignedTo', 'assignedTo')
      .where('case.deletedAt IS NULL');

    // Restricción por rol
    if (user.rol === UserRole.INSTRUCTOR) {
      qb.andWhere('ficha.instructorId = :userId', { userId: user.id });
    }

    // Filtros
    if (fichaId) {
      qb.andWhere('case.fichaId = :fichaId', { fichaId });
    }
    if (aprendizId) {
      qb.andWhere('case.aprendizId = :aprendizId', { aprendizId });
    }
    if (colegioId) {
      qb.andWhere('ficha.colegioId = :colegioId', { colegioId });
    }
    if (programaId) {
      qb.andWhere('ficha.programaId = :programaId', { programaId });
    }
    if (estado) {
      qb.andWhere('case.estado = :estado', { estado });
    }
    if (tipo) {
      qb.andWhere('case.tipo = :tipo', { tipo });
    }
    if (gravedad) {
      qb.andWhere('case.gravedad = :gravedad', { gravedad });
    }
    if (desde) {
      qb.andWhere('case.fechaIncidente >= :desde', { desde });
    }
    if (hasta) {
      qb.andWhere('case.fechaIncidente <= :hasta', { hasta });
    }
    if (search) {
      qb.andWhere(
        '(case.asunto ILIKE :search OR aprendiz.nombres ILIKE :search OR aprendiz.apellidos ILIKE :search OR aprendiz.documento ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Paginación
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    // Ordenar por fecha de incidente descendente
    qb.orderBy('case.fechaIncidente', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: User): Promise<DisciplinaryCase> {
    const caso = await this.caseRepository
      .createQueryBuilder('case')
      .leftJoinAndSelect('case.ficha', 'ficha')
      .leftJoinAndSelect('ficha.colegio', 'colegio')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .leftJoinAndSelect('ficha.instructor', 'instructor')
      .leftJoinAndSelect('case.aprendiz', 'aprendiz')
      .leftJoinAndSelect('aprendiz.user', 'aprendizUser')
      .leftJoinAndSelect('case.assignedTo', 'assignedTo')
      .leftJoinAndSelect('case.acciones', 'acciones')
      .where('case.id = :id', { id })
      .andWhere('case.deletedAt IS NULL')
      .orderBy('acciones.createdAt', 'ASC')
      .getOne();

    if (!caso) {
      throw new NotFoundException(`No se encontró el caso con ID ${id}`);
    }

    // Validar permisos
    if (user.rol === UserRole.INSTRUCTOR && caso.ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para ver este caso');
    }

    return caso;
  }

  async update(id: string, updateCaseDto: UpdateCaseDto, user: User): Promise<DisciplinaryCase> {
    const caso = await this.findOne(id, user);

    // No permitir editar casos cerrados
    if (caso.estado === CaseEstado.CERRADO) {
      throw new BadRequestException('No se puede editar un caso cerrado');
    }

    // Validar permisos: INSTRUCTOR solo si es su ficha
    if (user.rol === UserRole.INSTRUCTOR && caso.ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para editar este caso');
    }

    // Si se cambia fichaId o aprendizId, validar
    if (updateCaseDto.fichaId || updateCaseDto.aprendizId) {
      const fichaId = updateCaseDto.fichaId || caso.fichaId;
      const aprendizId = updateCaseDto.aprendizId || caso.aprendizId;

      const aprendiz = await this.aprendizRepository.findOne({
        where: { id: aprendizId },
      });
      if (!aprendiz) {
        throw new NotFoundException(`No se encontró el aprendiz con ID ${aprendizId}`);
      }
      if (aprendiz.fichaId !== fichaId) {
        throw new BadRequestException(
          'El aprendiz no pertenece a la ficha especificada',
        );
      }
    }

    // Validar fechaIncidente no futura
    if (updateCaseDto.fechaIncidente) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fecha = new Date(updateCaseDto.fechaIncidente);
      if (fecha > hoy) {
        throw new BadRequestException('La fecha del incidente no puede ser futura');
      }
    }

    Object.assign(caso, updateCaseDto);
    caso.updatedById = user.id;

    return this.caseRepository.save(caso);
  }

  async updateEstado(
    id: string,
    updateEstadoDto: UpdateCaseEstadoDto,
    user: User,
  ): Promise<DisciplinaryCase> {
    const caso = await this.findOne(id, user);
    const { estado, cierreResumen } = updateEstadoDto;

    // Validar transiciones
    this.validateEstadoTransition(caso.estado, estado);

    // Si se cierra, validar cierreResumen
    if (estado === CaseEstado.CERRADO) {
      if (!cierreResumen) {
        throw new BadRequestException(
          'El resumen de cierre es obligatorio al cerrar un caso',
        );
      }

      // Solo COORDINADOR/ADMIN pueden cerrar (regla de negocio)
      if (user.rol === UserRole.INSTRUCTOR) {
        throw new ForbiddenException(
          'Solo coordinadores y administradores pueden cerrar casos',
        );
      }

      // Crear acción automática de cierre
      await this.actionRepository.save({
        caseId: id,
        tipo: ActionTipo.CIERRE,
        descripcion: cierreResumen,
        createdById: user.id,
      });

      caso.cierreResumen = cierreResumen;
    }

    caso.estado = estado;
    caso.updatedById = user.id;

    return this.caseRepository.save(caso);
  }

  private validateEstadoTransition(estadoActual: CaseEstado, estadoNuevo: CaseEstado) {
    const transiciones: Record<CaseEstado, CaseEstado[]> = {
      [CaseEstado.BORRADOR]: [CaseEstado.ABIERTO],
      [CaseEstado.ABIERTO]: [CaseEstado.SEGUIMIENTO, CaseEstado.CERRADO],
      [CaseEstado.SEGUIMIENTO]: [CaseEstado.CERRADO],
      [CaseEstado.CERRADO]: [], // No se puede salir de cerrado
    };

    if (estadoActual === estadoNuevo) {
      return; // Mismo estado, permitir
    }

    if (!transiciones[estadoActual].includes(estadoNuevo)) {
      throw new BadRequestException(
        `Transición inválida: no se puede cambiar de ${estadoActual} a ${estadoNuevo}`,
      );
    }
  }

  // ==================== ACCIONES ====================

  async createAction(
    caseId: string,
    createActionDto: CreateCaseActionDto,
    user: User,
  ): Promise<CaseAction> {
    const caso = await this.findOne(caseId, user);

    // No permitir acciones sobre casos cerrados
    if (caso.estado === CaseEstado.CERRADO) {
      throw new BadRequestException('No se pueden agregar acciones a un caso cerrado');
    }

    // Validar permisos
    if (user.rol === UserRole.INSTRUCTOR && caso.ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para agregar acciones a este caso');
    }

    const accion = this.actionRepository.create({
      ...createActionDto,
      caseId,
      createdById: user.id,
    });

    return this.actionRepository.save(accion);
  }

  async findActions(caseId: string, user: User): Promise<CaseAction[]> {
    // Validar que el caso existe y el usuario tiene permisos
    await this.findOne(caseId, user);

    return this.actionRepository.find({
      where: { caseId },
      order: { createdAt: 'ASC' },
    });
  }

  async updateAction(
    id: string,
    updateActionDto: UpdateCaseActionDto,
    user: User,
  ): Promise<CaseAction> {
    const accion = await this.actionRepository.findOne({
      where: { id },
      relations: ['case', 'case.ficha'],
    });

    if (!accion) {
      throw new NotFoundException(`No se encontró la acción con ID ${id}`);
    }

    const caso = await this.findOne(accion.caseId, user);

    // No permitir editar acciones de casos cerrados
    if (caso.estado === CaseEstado.CERRADO) {
      throw new BadRequestException('No se pueden editar acciones de un caso cerrado');
    }

    // Validar permisos
    if (user.rol === UserRole.INSTRUCTOR && caso.ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para editar esta acción');
    }

    Object.assign(accion, updateActionDto);
    return this.actionRepository.save(accion);
  }

  // ==================== INTEGRACIÓN CON ALERTAS ====================

  async createFromAlert(
    createFromAlertDto: CreateCaseFromAlertDto,
    user: User,
  ): Promise<DisciplinaryCase> {
    const { fichaId, aprendizId, criterioAlerta, gravedad, descripcionAuto } =
      createFromAlertDto;

    // Validar que la ficha existe
    const ficha = await this.fichaRepository.findOne({ where: { id: fichaId } });
    if (!ficha) {
      throw new NotFoundException(`No se encontró la ficha con ID ${fichaId}`);
    }

    // Validar que el aprendiz existe y pertenece a la ficha
    const aprendiz = await this.aprendizRepository.findOne({
      where: { id: aprendizId },
    });
    if (!aprendiz) {
      throw new NotFoundException(`No se encontró el aprendiz con ID ${aprendizId}`);
    }
    if (aprendiz.fichaId !== fichaId) {
      throw new BadRequestException(
        'El aprendiz no pertenece a la ficha especificada',
      );
    }

    // Validar permisos: INSTRUCTOR solo para sus fichas
    if (user.rol === UserRole.INSTRUCTOR && ficha.instructorId !== user.id) {
      throw new ForbiddenException(
        'Solo puedes crear casos para aprendices de tus fichas',
      );
    }

    // Construir asunto y descripción
    const asuntoMap = {
      '3_CONSECUTIVAS': 'Alerta de asistencia: 3 faltas consecutivas',
      '5_AL_MES': 'Alerta de asistencia: 5 o más faltas al mes',
    };

    const descripcionBase = `Se activa caso disciplinario por ${criterioAlerta === '3_CONSECUTIVAS' ? '3 faltas consecutivas' : '5 o más faltas en el mes'}.`;

    const caso = this.caseRepository.create({
      fichaId,
      aprendizId,
      tipo: CaseTipo.ASISTENCIA,
      gravedad: gravedad || CaseGravedad.MEDIA,
      asunto: asuntoMap[criterioAlerta],
      descripcion: descripcionAuto
        ? `${descripcionBase} ${descripcionAuto}`
        : descripcionBase,
      fechaIncidente: new Date(),
      estado: CaseEstado.ABIERTO,
      createdById: user.id,
    });

    return this.caseRepository.save(caso);
  }
}
