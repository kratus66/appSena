import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Planeacion, EstadoPlaneacion, DependenciaPlaneacion } from './entities/planeacion.entity';
import { PlaneacionHistorial, AccionHistorial } from './entities/planeacion-historial.entity';
import { CreatePlaneacionDto } from './dto/create-planeacion.dto';
import { UpdatePlaneacionDto } from './dto/update-planeacion.dto';
import { User } from '../users/entities/user.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { AsignacionAmbiente, DiaSemana, JornadaBloque } from '../ambientes/entities/asignacion-ambiente.entity';

// Maps "LUN MANANA" -> { dia: DiaSemana.LUN, jornada: JornadaBloque.MANANA }
function parseBlock(block: string): { dia: DiaSemana; jornada: JornadaBloque } | null {
  const parts = block.trim().toUpperCase().split(' ');
  if (parts.length < 2) return null;
  const dia = parts[0] as DiaSemana;
  const jornada = parts.slice(1).join('_') as JornadaBloque;
  if (!Object.values(DiaSemana).includes(dia)) return null;
  if (!Object.values(JornadaBloque).includes(jornada)) return null;
  return { dia, jornada };
}

@Injectable()
export class PlaneacionService {
  constructor(
    @InjectRepository(Planeacion)
    private readonly planeacionRepo: Repository<Planeacion>,
    @InjectRepository(PlaneacionHistorial)
    private readonly historialRepo: Repository<PlaneacionHistorial>,
    @InjectRepository(Ficha)
    private readonly fichaRepo: Repository<Ficha>,
    @InjectRepository(AsignacionAmbiente)
    private readonly asignacionRepo: Repository<AsignacionAmbiente>,
  ) {}

  // ── Sync helpers ─────────────────────────────────────────────────────────

  /** Create AsignacionAmbiente rows for each block in the planeacion */
  private async createAsignaciones(
    ambienteId: string,
    fichaId: string | undefined,
    instructorId: string | undefined,
    bloques: string[],
    planeacionNotes: string | undefined,
    user: User,
  ) {
    for (const block of bloques) {
      const parsed = parseBlock(block);
      if (!parsed || !ambienteId) continue;
      // Upsert: delete existing same slot first (avoids unique constraint on edit)
      await this.asignacionRepo.delete({
        ambienteId,
        dia: parsed.dia,
        jornada: parsed.jornada,
      });
      const asig = this.asignacionRepo.create({
        ambienteId,
        fichaId: fichaId ?? null,
        instructorId: instructorId ?? null,
        dia: parsed.dia,
        jornada: parsed.jornada,
        notas: planeacionNotes,
        createdById: user.id,
        updatedById: user.id,
      });
      await this.asignacionRepo.save(asig);
    }
  }

  /** Remove AsignacionAmbiente rows for the given ambiente + blocks */
  private async removeAsignaciones(ambienteId: string, bloques: string[]) {
    for (const block of bloques) {
      const parsed = parseBlock(block);
      if (!parsed || !ambienteId) continue;
      await this.asignacionRepo.delete({
        ambienteId,
        dia: parsed.dia,
        jornada: parsed.jornada,
      });
    }
  }

  /** Update the Ficha record with instructor and ambiente info */
  private async syncFicha(
    fichaId: string | undefined,
    instructorId: string | undefined,
    ambienteNombre: string | undefined,
  ) {
    if (!fichaId) return;
    await this.fichaRepo.update(fichaId, {
      instructorId: instructorId ?? null,
      ambiente: ambienteNombre ?? null,
    });
  }

  /** Clear the Ficha's instructor and ambiente (on planeacion removal) */
  private async clearFicha(fichaId: string | undefined) {
    if (!fichaId) return;
    await this.fichaRepo.update(fichaId, { instructorId: null, ambiente: null });
  }


  async create(dto: CreatePlaneacionDto, user: User): Promise<Planeacion> {
    const planeacion = this.planeacionRepo.create({
      ...dto,
      bloques: dto.bloques ?? [],
      horasAsignadas: dto.horasAsignadas ?? (dto.bloques?.length ?? 0) * 4,
      estado: dto.estado ?? EstadoPlaneacion.ACTIVA,
      createdById: user.id,
      updatedById: user.id,
    });
    const saved = await this.planeacionRepo.save(planeacion);

    // ── Sync: mark ambiente blocks as Ocupado ────────────────────────────
    if (dto.ambienteId && dto.bloques?.length && dto.dependencia !== DependenciaPlaneacion.ARTICULACION) {
      await this.createAsignaciones(dto.ambienteId, dto.fichaId, dto.instructorId, dto.bloques, dto.notas, user);
    }

    // ── Sync: update ficha with instructor + ambiente ────────────────────
    if (dto.dependencia !== DependenciaPlaneacion.ARTICULACION) {
      await this.syncFicha(dto.fichaId, dto.instructorId, dto.ambienteNombre);
    } else {
      // Articulacion: at least set the instructor
      await this.syncFicha(dto.fichaId, dto.instructorId, undefined);
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const summary =
      dto.dependencia === DependenciaPlaneacion.ARTICULACION
        ? `Se confirmo cobertura con ${dto.schoolName ?? 'colegio pendiente'} en modalidad ${(dto.modalidad ?? 'Compartida').toLowerCase()}.`
        : `Se programo ${dto.ambienteNombre ?? 'ambiente'} en ${(dto.bloques?.length ?? 0)} bloques.`;

    await this.historialRepo.save(
      this.historialRepo.create({
        planeacionId: saved.id,
        accion: AccionHistorial.CREADA,
        dependencia: dto.dependencia,
        fichaNumero: dto.fichaNumero,
        instructorNombre: dto.instructorNombre,
        resumen: summary,
        actor: user.nombre,
        ocurrioEn: now,
        createdById: user.id,
        updatedById: user.id,
      }),
    );

    return saved;
  }

  async findAll(query: {
    dependencia?: string;
    estado?: string;
    sede?: string;
  }): Promise<{ data: Planeacion[]; total: number }> {
    const qb = this.planeacionRepo
      .createQueryBuilder('p')
      .withDeleted()
      .where('p.deleted_at IS NULL');

    if (query.dependencia) {
      qb.andWhere('p.dependencia = :dep', { dep: query.dependencia });
    }
    if (query.estado) {
      qb.andWhere('p.estado = :estado', { estado: query.estado });
    }
    if (query.sede) {
      qb.andWhere('p.siteContext = :sede', { sede: query.sede });
    }

    qb.orderBy('p.created_at', 'DESC');
    const data = await qb.getMany();
    return { data, total: data.length };
  }

  async findOne(id: string): Promise<Planeacion> {
    const planeacion = await this.planeacionRepo.findOne({ where: { id } });
    if (!planeacion) throw new NotFoundException(`Planeacion ${id} no encontrada`);
    return planeacion;
  }

  async update(id: string, dto: UpdatePlaneacionDto, user: User): Promise<Planeacion> {
    const planeacion = await this.findOne(id);
    const isReasignacion =
      dto.instructorId && dto.instructorId !== planeacion.instructorId;

    // ── Sync: remove old ambiente blocks if ambiente or blocks changed ────
    const oldAmbienteId = planeacion.ambienteId;
    const oldBloques = planeacion.bloques ?? [];
    const newAmbienteId = dto.ambienteId ?? planeacion.ambienteId;
    const newBloques = dto.bloques ?? planeacion.bloques ?? [];

    if (oldAmbienteId && oldBloques.length && planeacion.dependencia !== DependenciaPlaneacion.ARTICULACION) {
      await this.removeAsignaciones(oldAmbienteId, oldBloques);
    }

    Object.assign(planeacion, {
      ...dto,
      bloques: newBloques,
      updatedById: user.id,
    });
    const saved = await this.planeacionRepo.save(planeacion);

    // ── Sync: create new ambiente blocks ─────────────────────────────────
    if (newAmbienteId && newBloques.length && saved.dependencia !== DependenciaPlaneacion.ARTICULACION) {
      await this.createAsignaciones(
        newAmbienteId,
        dto.fichaId ?? saved.fichaId,
        dto.instructorId ?? saved.instructorId,
        newBloques,
        dto.notas ?? saved.notas,
        user,
      );
    }

    // ── Sync: update ficha ────────────────────────────────────────────────
    const resolvedFichaId = dto.fichaId ?? saved.fichaId;
    const resolvedInstructorId = dto.instructorId ?? saved.instructorId;
    const resolvedAmbienteNombre = dto.ambienteNombre ?? saved.ambienteNombre;
    if (saved.dependencia !== DependenciaPlaneacion.ARTICULACION) {
      await this.syncFicha(resolvedFichaId, resolvedInstructorId, resolvedAmbienteNombre);
    } else {
      await this.syncFicha(resolvedFichaId, resolvedInstructorId, undefined);
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const accion = isReasignacion ? AccionHistorial.REASIGNADA : AccionHistorial.EDITADA;
    const summary = isReasignacion
      ? `Se reasigno instructor a ${dto.instructorNombre ?? planeacion.instructorNombre}.`
      : `Se actualizo la planeacion con cambios en ficha/ambiente.`;

    await this.historialRepo.save(
      this.historialRepo.create({
        planeacionId: saved.id,
        accion,
        dependencia: saved.dependencia,
        fichaNumero: saved.fichaNumero,
        instructorNombre: saved.instructorNombre,
        resumen: summary,
        actor: user.nombre,
        ocurrioEn: now,
        createdById: user.id,
        updatedById: user.id,
      }),
    );

    return saved;
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const planeacion = await this.findOne(id);

    // ── Sync: free ambiente blocks ────────────────────────────────────────
    if (planeacion.ambienteId && (planeacion.bloques ?? []).length && planeacion.dependencia !== DependenciaPlaneacion.ARTICULACION) {
      await this.removeAsignaciones(planeacion.ambienteId, planeacion.bloques);
    }

    // ── Sync: clear ficha instructor/ambiente ─────────────────────────────
    await this.clearFicha(planeacion.fichaId);

    planeacion.deletedById = user.id;
    await this.planeacionRepo.save(planeacion);
    await this.planeacionRepo.softDelete(id);

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    await this.historialRepo.save(
      this.historialRepo.create({
        planeacionId: id,
        accion: AccionHistorial.CERRADA,
        dependencia: planeacion.dependencia,
        fichaNumero: planeacion.fichaNumero,
        instructorNombre: planeacion.instructorNombre,
        resumen: `Planeacion cerrada y eliminada del tablero activo.`,
        actor: user.nombre,
        ocurrioEn: now,
        createdById: user.id,
        updatedById: user.id,
      }),
    );

    return { message: 'Planeacion cerrada correctamente' };
  }

  async getMetrics(sede?: string): Promise<{
    activas: number;
    historialReciente: number;
  }> {
    const activasQb = this.planeacionRepo
      .createQueryBuilder('p')
      .where('p.deleted_at IS NULL')
      .andWhere('p.estado = :estado', { estado: EstadoPlaneacion.ACTIVA });

    if (sede) {
      activasQb.andWhere('p.siteContext = :sede', { sede });
    }

    const activas = await activasQb.getCount();

    const historialReciente = await this.historialRepo
      .createQueryBuilder('h')
      .where('h.deleted_at IS NULL')
      .getCount();

    return { activas, historialReciente };
  }

  async getHistorial(planeacionId?: string): Promise<PlaneacionHistorial[]> {
    const qb = this.historialRepo
      .createQueryBuilder('h')
      .where('h.deleted_at IS NULL')
      .orderBy('h.created_at', 'DESC');

    if (planeacionId) {
      qb.andWhere('h.planeacionId = :pid', { pid: planeacionId });
    }

    return qb.getMany();
  }
}
