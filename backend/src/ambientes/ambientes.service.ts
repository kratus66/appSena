import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ambiente, EstadoAmbiente } from './entities/ambiente.entity';
import { AsignacionAmbiente, DiaSemana, JornadaBloque } from './entities/asignacion-ambiente.entity';
import { CreateAmbienteDto } from './dto/create-ambiente.dto';
import { UpdateAmbienteDto } from './dto/update-ambiente.dto';
import { CreateAsignacionAmbienteDto } from './dto/create-asignacion-ambiente.dto';
import { User } from '../users/entities/user.entity';

const DIAS: DiaSemana[] = [
  DiaSemana.LUN, DiaSemana.MAR, DiaSemana.MIE,
  DiaSemana.JUE, DiaSemana.VIE, DiaSemana.SAB, DiaSemana.DOM,
];
const JORNADAS: JornadaBloque[] = [JornadaBloque.MANANA, JornadaBloque.TARDE, JornadaBloque.NOCHE];

@Injectable()
export class AmbientesService {
  constructor(
    @InjectRepository(Ambiente)
    private readonly ambienteRepo: Repository<Ambiente>,
    @InjectRepository(AsignacionAmbiente)
    private readonly asignacionRepo: Repository<AsignacionAmbiente>,
  ) {}

  // ── CRUD Ambientes ──────────────────────────────────────────────────────

  async findAll(query: { sede?: string; tipo?: string; estado?: string }) {
    const qb = this.ambienteRepo.createQueryBuilder('a').withDeleted().where('a.deleted_at IS NULL');

    if (query.sede) qb.andWhere('a.sede = :sede', { sede: query.sede });
    if (query.tipo) qb.andWhere('a.tipo = :tipo', { tipo: query.tipo });
    if (query.estado) qb.andWhere('a.estado = :estado', { estado: query.estado });

    const data = await qb.orderBy('a.sede').addOrderBy('a.nombre').getMany();
    return { data, total: data.length };
  }

  async findOne(id: string) {
    const ambiente = await this.ambienteRepo.findOne({
      where: { id },
      relations: ['asignaciones', 'asignaciones.ficha', 'asignaciones.instructor'],
    });
    if (!ambiente) throw new NotFoundException(`Ambiente ${id} no encontrado`);
    return ambiente;
  }

  async create(dto: CreateAmbienteDto, user: User) {
    const ambiente = this.ambienteRepo.create({
      ...dto,
      createdById: user.id,
      updatedById: user.id,
    });
    return this.ambienteRepo.save(ambiente);
  }

  async update(id: string, dto: UpdateAmbienteDto, user: User) {
    const ambiente = await this.findOne(id);
    Object.assign(ambiente, { ...dto, updatedById: user.id });
    return this.ambienteRepo.save(ambiente);
  }

  async remove(id: string, user: User) {
    const ambiente = await this.findOne(id);
    ambiente.deletedById = user.id;
    await this.ambienteRepo.save(ambiente);
    await this.ambienteRepo.softDelete(id);
    return { message: 'Ambiente eliminado correctamente' };
  }

  // ── Tablero ─────────────────────────────────────────────────────────────

  async getTablero(sede?: string) {
    const query: any = {};
    if (sede) query.sede = sede;

    const ambientes = await this.ambienteRepo.find({
      where: query,
      relations: ['asignaciones', 'asignaciones.ficha', 'asignaciones.instructor'],
      order: { sede: 'ASC', nombre: 'ASC' },
    });

    const rows = ambientes.map((amb) => {
      const cells = DIAS.flatMap((dia) =>
        JORNADAS.map((jornada) => {
          const asignacion = amb.asignaciones?.find(
            (a) => a.dia === dia && a.jornada === jornada && !a.deletedAt,
          );
          return {
            id: `${amb.id}-${dia}-${jornada}`,
            block: `${dia} ${jornada}`,
            dia,
            jornada,
            state: asignacion ? 'Ocupado' : 'Libre',
            fichaId: asignacion?.fichaId ?? null,
            fichaNumero: asignacion?.ficha?.numeroFicha ?? null,
            instructorId: asignacion?.instructorId ?? null,
            instructorNombre: asignacion?.instructor?.nombre ?? null,
            asignacionId: asignacion?.id ?? null,
            notas: asignacion?.notas ?? null,
          };
        }),
      );

      const libres = cells.filter((c) => c.state === 'Libre').length;
      const conflictos = 0; // se puede implementar detección de conflictos de horario en futuro

      return {
        id: amb.id,
        nombre: amb.nombre,
        sede: amb.sede,
        tipo: amb.tipo,
        estado: amb.estado,
        capacidad: amb.capacidad,
        equipamiento: amb.equipamiento,
        cells,
        libres,
        ocupados: cells.length - libres,
        conflictos,
      };
    });

    const totalCells = rows.flatMap((r) => r.cells);
    const sedes = [...new Set(ambientes.map((a) => a.sede))];

    return {
      rows,
      sedes,
      blocks: DIAS.flatMap((d) => JORNADAS.map((j) => `${d} ${j}`)),
      dias: DIAS,
      jornadas: JORNADAS,
      metrics: {
        ambientesLibres: rows.filter((r) => r.libres === r.cells.length).length,
        ambientesTotal: rows.length,
        bloquesLibres: totalCells.filter((c) => c.state === 'Libre').length,
        bloquesTotal: totalCells.length,
      },
    };
  }

  // ── Asignaciones ────────────────────────────────────────────────────────

  async createAsignacion(ambienteId: string, dto: CreateAsignacionAmbienteDto, user: User) {
    await this.findOne(ambienteId);

    const existe = await this.asignacionRepo.findOne({
      where: { ambienteId, dia: dto.dia, jornada: dto.jornada },
    });
    if (existe) {
      throw new ConflictException(
        `El ambiente ya tiene una asignación en ${dto.dia} ${dto.jornada}`,
      );
    }

    const asignacion = this.asignacionRepo.create({
      ambienteId,
      fichaId: dto.fichaId ?? null,
      instructorId: dto.instructorId ?? null,
      dia: dto.dia,
      jornada: dto.jornada,
      notas: dto.notas ?? null,
      createdById: user.id,
      updatedById: user.id,
    });

    return this.asignacionRepo.save(asignacion);
  }

  async removeAsignacion(asignacionId: string, user: User) {
    const asignacion = await this.asignacionRepo.findOne({ where: { id: asignacionId } });
    if (!asignacion) throw new NotFoundException('Asignación no encontrada');
    asignacion.deletedById = user.id;
    await this.asignacionRepo.save(asignacion);
    await this.asignacionRepo.softDelete(asignacionId);
    return { message: 'Asignación eliminada correctamente' };
  }

  async getAsignacionesByAmbiente(ambienteId: string) {
    return this.asignacionRepo.find({
      where: { ambienteId },
      relations: ['ficha', 'instructor'],
      order: { dia: 'ASC', jornada: 'ASC' },
    });
  }
}
