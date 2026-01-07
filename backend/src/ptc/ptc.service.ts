import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ptc, PtcEstado } from './entities/ptc.entity';
import { PtcItem } from './entities/ptc-item.entity';
import { Acta } from './entities/acta.entity';
import { ActaAsistente } from './entities/acta-asistente.entity';
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
import { User, UserRole } from '../users/entities/user.entity';
import { FichasService } from '../fichas/fichas.service';
import { AprendicesService } from '../aprendices/aprendices.service';
import { DisciplinarioService } from '../disciplinario/disciplinario.service';

@Injectable()
export class PtcService {
  constructor(
    @InjectRepository(Ptc)
    private ptcRepository: Repository<Ptc>,
    @InjectRepository(PtcItem)
    private ptcItemRepository: Repository<PtcItem>,
    @InjectRepository(Acta)
    private actaRepository: Repository<Acta>,
    @InjectRepository(ActaAsistente)
    private actaAsistenteRepository: Repository<ActaAsistente>,
    private fichasService: FichasService,
    private aprendicesService: AprendicesService,
    private disciplinarioService: DisciplinarioService,
  ) {}

  // ==================== PTC CRUD ====================

  async createPtc(createPtcDto: CreatePtcDto, user: User): Promise<Ptc> {
    // Validar que el aprendiz existe y pertenece a la ficha
    const aprendiz = await this.aprendicesService.findOne(createPtcDto.aprendizId, user);
    
    if (aprendiz.fichaId !== createPtcDto.fichaId) {
      throw new BadRequestException('El aprendiz no pertenece a la ficha especificada');
    }

    // Validar permisos del instructor sobre la ficha
    await this.validateFichaPermissions(createPtcDto.fichaId, user);

    // Validar que no existe otro PTC VIGENTE para el mismo aprendiz
    const ptcVigenteExistente = await this.ptcRepository.findOne({
      where: {
        aprendizId: createPtcDto.aprendizId,
        estado: PtcEstado.VIGENTE,
      },
    });

    if (ptcVigenteExistente) {
      throw new BadRequestException(
        'El aprendiz ya tiene un PTC vigente. Debe cerrarlo antes de crear uno nuevo.',
      );
    }

    const ptc = this.ptcRepository.create({
      ...createPtcDto,
      createdById: user.id,
    });

    return this.ptcRepository.save(ptc);
  }

  async createPtcFromCase(createDto: CreatePtcFromCaseDto, user: User): Promise<Ptc> {
    // Obtener el caso disciplinario
    const caso = await this.disciplinarioService.findOne(createDto.casoId, user);

    // Validar que el caso existe y está en estado que permite crear PTC
    if (caso.estado === 'BORRADOR') {
      throw new BadRequestException('No se puede crear un PTC desde un caso en estado BORRADOR');
    }

    // Validar que no existe otro PTC VIGENTE para el mismo aprendiz
    const ptcVigenteExistente = await this.ptcRepository.findOne({
      where: {
        aprendizId: caso.aprendizId,
        estado: PtcEstado.VIGENTE,
      },
    });

    if (ptcVigenteExistente) {
      throw new BadRequestException(
        'El aprendiz ya tiene un PTC vigente. Debe cerrarlo antes de crear uno nuevo.',
      );
    }

    // Validar permisos del instructor sobre la ficha
    await this.validateFichaPermissions(caso.fichaId, user);

    // Crear el PTC basado en el caso disciplinario
    const motivo = createDto.motivo || `PTC derivado del caso disciplinario: ${caso.asunto}`;
    const descripcion = createDto.descripcion || caso.descripcion;
    const fechaInicio = createDto.fechaInicio || new Date().toISOString().split('T')[0];

    const ptc = this.ptcRepository.create({
      fichaId: caso.fichaId,
      aprendizId: caso.aprendizId,
      casoDisciplinarioId: caso.id,
      motivo,
      descripcion,
      fechaInicio,
      estado: PtcEstado.BORRADOR,
      createdById: user.id,
    });

    return this.ptcRepository.save(ptc);
  }

  async findAllPtc(query: QueryPtcDto, user: User): Promise<{ data: Ptc[]; total: number }> {
    const qb = this.ptcRepository
      .createQueryBuilder('ptc')
      .leftJoinAndSelect('ptc.ficha', 'ficha')
      .leftJoinAndSelect('ptc.aprendiz', 'aprendiz')
      .leftJoinAndSelect('ptc.casoDisciplinario', 'caso')
      .leftJoinAndSelect('ptc.createdBy', 'createdBy')
      .select([
        'ptc',
        'ficha.id',
        'ficha.numero',
        'ficha.nombrePrograma',
        'aprendiz.id',
        'aprendiz.nombres',
        'aprendiz.apellidos',
        'aprendiz.documento',
        'caso.id',
        'caso.numeroConsecutivo',
        'caso.motivo',
        'createdBy.id',
        'createdBy.nombre',
        'createdBy.email',
      ]);

    // Filtros por rol
    if (user.rol === UserRole.INSTRUCTOR) {
      // Solo ver PTCs de sus fichas
      qb.andWhere('ficha.instructorId = :instructorId', { instructorId: user.id });
    }

    if (query.fichaId) {
      qb.andWhere('ptc.fichaId = :fichaId', { fichaId: query.fichaId });
    }

    if (query.aprendizId) {
      qb.andWhere('ptc.aprendizId = :aprendizId', { aprendizId: query.aprendizId });
    }

    if (query.estado) {
      qb.andWhere('ptc.estado = :estado', { estado: query.estado });
    }

    if (query.desde) {
      qb.andWhere('ptc.fechaInicio >= :desde', { desde: query.desde });
    }

    if (query.hasta) {
      qb.andWhere('ptc.fechaInicio <= :hasta', { hasta: query.hasta });
    }

    if (query.search) {
      qb.andWhere('(ptc.motivo ILIKE :search OR ptc.descripcion ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const total = await qb.getCount();

    const data = await qb
      .orderBy('ptc.createdAt', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getMany();

    return { data, total };
  }

  async findOnePtc(id: string, user: User): Promise<Ptc> {
    const ptc = await this.ptcRepository.findOne({
      where: { id },
      relations: ['ficha', 'aprendiz', 'casoDisciplinario', 'createdBy', 'items', 'items.createdBy'],
    });

    if (!ptc) {
      throw new NotFoundException('PTC no encontrado');
    }

    // Validar permisos
    await this.validateFichaPermissions(ptc.fichaId, user);

    return ptc;
  }

  async updatePtc(id: string, updatePtcDto: UpdatePtcDto, user: User): Promise<Ptc> {
    const ptc = await this.findOnePtc(id, user);

    if (ptc.estado !== PtcEstado.BORRADOR && user.rol !== UserRole.COORDINADOR && user.rol !== UserRole.ADMIN) {
      throw new BadRequestException('Solo se pueden editar PTCs en estado BORRADOR');
    }

    Object.assign(ptc, updatePtcDto);
    ptc.updatedById = user.id;

    return this.ptcRepository.save(ptc);
  }

  async updatePtcEstado(id: string, updateEstadoDto: UpdatePtcEstadoDto, user: User): Promise<Ptc> {
    const ptc = await this.findOnePtc(id, user);

    // Solo COORDINADOR y ADMIN pueden cambiar estados
    if (user.rol !== UserRole.COORDINADOR && user.rol !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permisos para cambiar el estado del PTC');
    }

    if (updateEstadoDto.estado === PtcEstado.CERRADO && !updateEstadoDto.cierreResumen) {
      throw new BadRequestException('El resumen de cierre es obligatorio al cerrar un PTC');
    }

    ptc.estado = updateEstadoDto.estado;
    if (updateEstadoDto.cierreResumen) {
      ptc.cierreResumen = updateEstadoDto.cierreResumen;
    }
    ptc.updatedById = user.id;

    return this.ptcRepository.save(ptc);
  }

  async deletePtc(id: string, user: User): Promise<void> {
    const ptc = await this.findOnePtc(id, user);

    if (ptc.estado !== PtcEstado.BORRADOR) {
      throw new BadRequestException('Solo se pueden eliminar PTCs en estado BORRADOR');
    }

    await this.ptcRepository.softDelete(id);
  }

  // ==================== PTC ITEMS CRUD ====================

  async addItemToPtc(ptcId: string, createItemDto: CreatePtcItemDto, user: User): Promise<PtcItem> {
    const ptc = await this.findOnePtc(ptcId, user);

    if (ptc.estado === PtcEstado.CERRADO) {
      throw new BadRequestException('No se pueden agregar items a un PTC cerrado');
    }

    const item = this.ptcItemRepository.create({
      ...createItemDto,
      ptcId,
      createdById: user.id,
    });

    return this.ptcItemRepository.save(item);
  }

  async updatePtcItem(ptcId: string, itemId: string, updateItemDto: UpdatePtcItemDto, user: User): Promise<PtcItem> {
    const ptc = await this.findOnePtc(ptcId, user);

    const item = await this.ptcItemRepository.findOne({
      where: { id: itemId, ptcId },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    if (ptc.estado === PtcEstado.CERRADO && user.rol !== UserRole.ADMIN) {
      throw new BadRequestException('No se pueden editar items de un PTC cerrado');
    }

    Object.assign(item, updateItemDto);
    item.updatedById = user.id;

    return this.ptcItemRepository.save(item);
  }

  async updatePtcItemEstado(
    ptcId: string,
    itemId: string,
    updateEstadoDto: UpdatePtcItemEstadoDto,
    user: User,
  ): Promise<PtcItem> {
    const ptc = await this.findOnePtc(ptcId, user);

    const item = await this.ptcItemRepository.findOne({
      where: { id: itemId, ptcId },
    });

    if (!item) {
      throw new NotFoundException('Item no encontrado');
    }

    item.estado = updateEstadoDto.estado;
    if (updateEstadoDto.evidenciaUrl) {
      item.evidenciaUrl = updateEstadoDto.evidenciaUrl;
    }
    if (updateEstadoDto.notas) {
      item.notas = updateEstadoDto.notas;
    }
    item.updatedById = user.id;

    return this.ptcItemRepository.save(item);
  }

  async deletePtcItem(ptcId: string, itemId: string, user: User): Promise<void> {
    const ptc = await this.findOnePtc(ptcId, user);

    if (ptc.estado === PtcEstado.CERRADO) {
      throw new BadRequestException('No se pueden eliminar items de un PTC cerrado');
    }

    const result = await this.ptcItemRepository.delete({ id: itemId, ptcId });

    if (result.affected === 0) {
      throw new NotFoundException('Item no encontrado');
    }
  }

  // ==================== ACTAS CRUD ====================

  async createActa(createActaDto: CreateActaDto, user: User): Promise<Acta> {
    // Validar que el aprendiz existe y pertenece a la ficha
    const aprendiz = await this.aprendicesService.findOne(createActaDto.aprendizId, user);
    
    if (aprendiz.fichaId !== createActaDto.fichaId) {
      throw new BadRequestException('El aprendiz no pertenece a la ficha especificada');
    }

    // Validar permisos del instructor sobre la ficha
    await this.validateFichaPermissions(createActaDto.fichaId, user);

    const { asistentes, ...actaData } = createActaDto;

    const acta = this.actaRepository.create({
      ...actaData,
      createdById: user.id,
      asistentes: asistentes.map((asis) => this.actaAsistenteRepository.create(asis)),
    });

    return this.actaRepository.save(acta);
  }

  async findAllActas(query: QueryActaDto, user: User): Promise<{ data: Acta[]; total: number }> {
    const qb = this.actaRepository
      .createQueryBuilder('acta')
      .leftJoinAndSelect('acta.ficha', 'ficha')
      .leftJoinAndSelect('acta.aprendiz', 'aprendiz')
      .leftJoinAndSelect('acta.ptc', 'ptc')
      .leftJoinAndSelect('acta.casoDisciplinario', 'caso')
      .leftJoinAndSelect('acta.createdBy', 'createdBy')
      .leftJoinAndSelect('acta.asistentes', 'asistentes')
      .select([
        'acta',
        'ficha.id',
        'ficha.numero',
        'ficha.nombrePrograma',
        'aprendiz.id',
        'aprendiz.nombres',
        'aprendiz.apellidos',
        'ptc.id',
        'ptc.motivo',
        'caso.id',
        'caso.motivo',
        'createdBy.id',
        'createdBy.nombre',
        'asistentes',
      ]);

    // Filtros por rol
    if (user.rol === UserRole.INSTRUCTOR) {
      qb.andWhere('ficha.instructorId = :instructorId', { instructorId: user.id });
    }

    if (query.fichaId) {
      qb.andWhere('acta.fichaId = :fichaId', { fichaId: query.fichaId });
    }

    if (query.aprendizId) {
      qb.andWhere('acta.aprendizId = :aprendizId', { aprendizId: query.aprendizId });
    }

    if (query.ptcId) {
      qb.andWhere('acta.ptcId = :ptcId', { ptcId: query.ptcId });
    }

    if (query.estado) {
      qb.andWhere('acta.estado = :estado', { estado: query.estado });
    }

    if (query.desde) {
      qb.andWhere('acta.fechaReunion >= :desde', { desde: query.desde });
    }

    if (query.hasta) {
      qb.andWhere('acta.fechaReunion <= :hasta', { hasta: query.hasta });
    }

    if (query.search) {
      qb.andWhere('(acta.asunto ILIKE :search OR acta.desarrollo ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const total = await qb.getCount();

    const data = await qb
      .orderBy('acta.fechaReunion', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getMany();

    return { data, total };
  }

  async findOneActa(id: string, user: User): Promise<Acta> {
    const acta = await this.actaRepository.findOne({
      where: { id },
      relations: ['ficha', 'aprendiz', 'ptc', 'casoDisciplinario', 'createdBy', 'asistentes'],
    });

    if (!acta) {
      throw new NotFoundException('Acta no encontrada');
    }

    // Validar permisos
    await this.validateFichaPermissions(acta.fichaId, user);

    return acta;
  }

  async updateActa(id: string, updateActaDto: UpdateActaDto, user: User): Promise<Acta> {
    const acta = await this.findOneActa(id, user);

    if (acta.estado === 'CERRADA' && user.rol !== UserRole.ADMIN) {
      throw new BadRequestException('No se pueden editar actas cerradas');
    }

    const { asistentes, ...actaData } = updateActaDto;

    Object.assign(acta, actaData);
    acta.updatedById = user.id;

    // Si se actualizan asistentes, eliminar los anteriores y crear nuevos
    if (asistentes) {
      await this.actaAsistenteRepository.delete({ actaId: id });
      acta.asistentes = asistentes.map((asis) => 
        this.actaAsistenteRepository.create({ ...asis, actaId: id })
      );
    }

    return this.actaRepository.save(acta);
  }

  async updateActaEstado(id: string, updateEstadoDto: UpdateActaEstadoDto, user: User): Promise<Acta> {
    const acta = await this.findOneActa(id, user);

    // Solo COORDINADOR y ADMIN pueden cambiar estados
    if (user.rol !== UserRole.COORDINADOR && user.rol !== UserRole.ADMIN) {
      throw new ForbiddenException('No tienes permisos para cambiar el estado del acta');
    }

    if (updateEstadoDto.estado === 'CERRADA' && !updateEstadoDto.cierreResumen) {
      throw new BadRequestException('El resumen de cierre es obligatorio al cerrar un acta');
    }

    acta.estado = updateEstadoDto.estado;
    if (updateEstadoDto.cierreResumen) {
      acta.cierreResumen = updateEstadoDto.cierreResumen;
    }
    acta.updatedById = user.id;

    return this.actaRepository.save(acta);
  }

  async deleteActa(id: string, user: User): Promise<void> {
    const acta = await this.findOneActa(id, user);

    if (acta.estado !== 'BORRADOR') {
      throw new BadRequestException('Solo se pueden eliminar actas en estado BORRADOR');
    }

    await this.actaRepository.softDelete(id);
  }

  // ==================== HELPERS ====================

  private async validateFichaPermissions(fichaId: string, user: User): Promise<void> {
    const ficha = await this.fichasService.findOne(fichaId);

    if (user.rol === UserRole.INSTRUCTOR && ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos sobre esta ficha');
    }
  }
}
