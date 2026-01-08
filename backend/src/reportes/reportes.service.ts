import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaseSesion } from '../asistencias/entities/clase-sesion.entity';
import { Asistencia } from '../asistencias/entities/asistencia.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';
import { DisciplinaryCase, CaseEstado } from '../disciplinario/entities/disciplinary-case.entity';
import { Ptc, PtcEstado } from '../ptc/entities/ptc.entity';
import { CalendarEvent, EventStatus } from '../agenda/entities/calendar-event.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { obtenerRangoFechas, RangoFechas, arrayToCsv } from './helpers/fechas.helper';
import { QueryPanelCoordinacionDto } from './dto/query-panel-coordinacion.dto';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(ClaseSesion)
    private readonly sesionRepository: Repository<ClaseSesion>,
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
    @InjectRepository(Aprendiz)
    private readonly aprendizRepository: Repository<Aprendiz>,
    @InjectRepository(DisciplinaryCase)
    private readonly caseRepository: Repository<DisciplinaryCase>,
    @InjectRepository(Ptc)
    private readonly ptcRepository: Repository<Ptc>,
    @InjectRepository(CalendarEvent)
    private readonly agendaRepository: Repository<CalendarEvent>,
  ) {}

  /**
   * Dashboard del instructor autenticado
   */
  async getInstructorDashboard(
    user: User,
    desde?: string,
    hasta?: string,
    month?: string,
  ) {
    const rango = obtenerRangoFechas(desde, hasta, month);

    // Obtener fichas del instructor
    const fichas = await this.fichaRepository.find({
      where: { instructorId: user.id },
      select: ['id'],
    });

    const fichaIds = fichas.map((f) => f.id);

    if (fichaIds.length === 0) {
      return {
        totalFichas: 0,
        totalAprendices: 0,
        totalSesiones: 0,
        tasaAsistenciaPromedio: 0,
        totalAlertasRiesgo: 0,
        topFichasRiesgo: [],
        agendaProximaSemana: 0,
      };
    }

    // Total de aprendices en mis fichas
    const totalAprendices = await this.aprendizRepository.count({
      where: { fichaId: fichaIds as any },
    });

    // Total de sesiones en el rango
    const totalSesiones = await this.sesionRepository
      .createQueryBuilder('sesion')
      .where('sesion.fichaId IN (:...fichaIds)', { fichaIds })
      .andWhere('sesion.fecha >= :desde', { desde: rango.desde })
      .andWhere('sesion.fecha <= :hasta', { hasta: rango.hasta })
      .getCount();

    // Tasa de asistencia promedio
    const asistenciaStats = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .select('COUNT(CASE WHEN asistencia.presente = true THEN 1 END)', 'presentes')
      .addSelect('COUNT(*)', 'total')
      .innerJoin('asistencia.sesion', 'sesion')
      .where('sesion.fichaId IN (:...fichaIds)', { fichaIds })
      .andWhere('sesion.fecha >= :desde', { desde: rango.desde })
      .andWhere('sesion.fecha <= :hasta', { hasta: rango.hasta })
      .getRawOne();

    const tasaAsistenciaPromedio =
      asistenciaStats.total > 0
        ? parseFloat(((asistenciaStats.presentes / asistenciaStats.total) * 100).toFixed(2))
        : 0;

    // Alertas de riesgo (3 consecutivas o 5 en el mes)
    const alertas = await this.calcularAlertasInstructor(fichaIds, rango);

    // Top fichas con más alertas
    const topFichasRiesgo = await this.getTopFichasRiesgo(fichaIds, rango, 5);

    // Agenda próxima semana
    const hoy = new Date();
    const proximaSemana = new Date(hoy);
    proximaSemana.setDate(proximaSemana.getDate() + 7);

    const agendaProximaSemana = await this.agendaRepository.count({
      where: {
        fichaId: fichaIds as any,
        fechaInicio: proximaSemana as any,
        estado: EventStatus.PROGRAMADO,
      },
    });

    return {
      totalFichas: fichas.length,
      totalAprendices,
      totalSesiones,
      tasaAsistenciaPromedio,
      totalAlertasRiesgo: alertas.length,
      topFichasRiesgo,
      agendaProximaSemana,
    };
  }

  /**
   * Resumen por ficha
   */
  async getFichaResumen(
    fichaId: string,
    user: User,
    desde?: string,
    hasta?: string,
    month?: string,
  ) {
    const rango = obtenerRangoFechas(desde, hasta, month);

    // Verificar que la ficha existe y que el usuario tiene permisos
    const ficha = await this.fichaRepository.findOne({
      where: { id: fichaId },
      relations: ['programa', 'colegio', 'instructor'],
    });

    if (!ficha) {
      throw new NotFoundException('Ficha no encontrada');
    }

    // Validar permisos
    if (user.rol === UserRole.INSTRUCTOR && ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para ver esta ficha');
    }

    // Total de aprendices
    const totalAprendices = await this.aprendizRepository.count({
      where: { fichaId },
    });

    // Total de sesiones en el rango
    const totalSesiones = await this.sesionRepository.count({
      where: {
        fichaId,
        fecha: rango as any,
      },
    });

    // Conteo de asistencias
    const asistenciaStats = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .select('COUNT(CASE WHEN asistencia.presente = true THEN 1 END)', 'presentes')
      .addSelect(
        'COUNT(CASE WHEN asistencia.presente = false AND asistencia.justificada = true THEN 1 END)',
        'ausenciasJustificadas',
      )
      .addSelect(
        'COUNT(CASE WHEN asistencia.presente = false AND asistencia.justificada = false THEN 1 END)',
        'ausenciasNoJustificadas',
      )
      .addSelect('COUNT(*)', 'total')
      .innerJoin('asistencia.sesion', 'sesion')
      .where('sesion.fichaId = :fichaId', { fichaId })
      .andWhere('sesion.fecha >= :desde', { desde: rango.desde })
      .andWhere('sesion.fecha <= :hasta', { hasta: rango.hasta })
      .getRawOne();

    const porcentajeAsistencia =
      asistenciaStats.total > 0
        ? parseFloat(((asistenciaStats.presentes / asistenciaStats.total) * 100).toFixed(2))
        : 0;

    // Top aprendices con más ausencias no justificadas
    const topAprendicesAusencias = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .select('aprendiz.id', 'aprendizId')
      .addSelect('aprendiz.nombres', 'nombres')
      .addSelect('aprendiz.apellidos', 'apellidos')
      .addSelect('aprendiz.documento', 'documento')
      .addSelect(
        'COUNT(CASE WHEN asistencia.presente = false AND asistencia.justificada = false THEN 1 END)',
        'ausenciasNoJustificadas',
      )
      .innerJoin('asistencia.sesion', 'sesion')
      .innerJoin('asistencia.aprendiz', 'aprendiz')
      .where('sesion.fichaId = :fichaId', { fichaId })
      .andWhere('sesion.fecha >= :desde', { desde: rango.desde })
      .andWhere('sesion.fecha <= :hasta', { hasta: rango.hasta })
      .groupBy('aprendiz.id')
      .addGroupBy('aprendiz.nombres')
      .addGroupBy('aprendiz.apellidos')
      .addGroupBy('aprendiz.documento')
      .orderBy('ausenciasNoJustificadas', 'DESC')
      .limit(10)
      .getRawMany();

    // Alertas de la ficha
    const alertas = await this.calcularAlertasFicha(fichaId, rango);

    return {
      ficha: {
        id: ficha.id,
        numeroFicha: ficha.numeroFicha,
        programa: ficha.programa?.nombre || '',
        colegio: ficha.colegio?.nombre || '',
        instructor: ficha.instructor?.nombre || '',
      },
      totalAprendices,
      totalSesiones,
      conteo: {
        presentes: parseInt(asistenciaStats.presentes),
        ausenciasJustificadas: parseInt(asistenciaStats.ausenciasJustificadas),
        ausenciasNoJustificadas: parseInt(asistenciaStats.ausenciasNoJustificadas),
      },
      porcentajeAsistencia,
      topAprendicesAusencias,
      alertas,
    };
  }

  /**
   * Resumen por aprendiz
   */
  async getAprendizResumen(
    aprendizId: string,
    user: User,
    desde?: string,
    hasta?: string,
    month?: string,
  ) {
    const rango = obtenerRangoFechas(desde, hasta, month);

    // Verificar que el aprendiz existe
    const aprendiz = await this.aprendizRepository.findOne({
      where: { id: aprendizId },
      relations: ['ficha'],
    });

    if (!aprendiz) {
      throw new NotFoundException('Aprendiz no encontrado');
    }

    // Validar permisos
    if (user.rol === UserRole.INSTRUCTOR && aprendiz.ficha?.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para ver este aprendiz');
    }

    // Estadísticas de asistencia
    const asistenciaStats = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .select('COUNT(CASE WHEN asistencia.presente = true THEN 1 END)', 'presentes')
      .addSelect(
        'COUNT(CASE WHEN asistencia.presente = false AND asistencia.justificada = true THEN 1 END)',
        'ausenciasJustificadas',
      )
      .addSelect(
        'COUNT(CASE WHEN asistencia.presente = false AND asistencia.justificada = false THEN 1 END)',
        'ausenciasNoJustificadas',
      )
      .addSelect('COUNT(*)', 'total')
      .innerJoin('asistencia.sesion', 'sesion')
      .where('asistencia.aprendizId = :aprendizId', { aprendizId })
      .andWhere('sesion.fecha >= :desde', { desde: rango.desde })
      .andWhere('sesion.fecha <= :hasta', { hasta: rango.hasta })
      .getRawOne();

    const porcentajeAsistencia =
      asistenciaStats.total > 0
        ? parseFloat(((asistenciaStats.presentes / asistenciaStats.total) * 100).toFixed(2))
        : 0;

    // Historial de últimas 10 sesiones
    const historialSesiones = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .select('sesion.fecha', 'fecha')
      .addSelect('asistencia.presente', 'presente')
      .addSelect('asistencia.justificada', 'justificada')
      .addSelect('asistencia.motivo', 'motivo')
      .innerJoin('asistencia.sesion', 'sesion')
      .where('asistencia.aprendizId = :aprendizId', { aprendizId })
      .orderBy('sesion.fecha', 'DESC')
      .limit(10)
      .getRawMany();

    // Alertas actuales
    const alertas = await this.calcularAlertasAprendiz(aprendizId, rango);

    // Casos disciplinarios abiertos
    const casosAbiertos = await this.caseRepository.count({
      where: {
        aprendizId,
        estado: CaseEstado.ABIERTO,
      },
    });

    const ultimoCaso = await this.caseRepository.findOne({
      where: { aprendizId },
      order: { createdAt: 'DESC' },
    });

    // PTC vigente
    const ptcVigente = await this.ptcRepository.findOne({
      where: {
        aprendizId,
        estado: PtcEstado.VIGENTE,
      },
    });

    // Próximos eventos de agenda
    const hoy = new Date();
    const proximosEventos = await this.agendaRepository.find({
      where: {
        aprendizId,
        fechaInicio: hoy as any,
        estado: EventStatus.PROGRAMADO,
      },
      order: { fechaInicio: 'ASC' },
      take: 5,
    });

    return {
      aprendiz: {
        id: aprendiz.id,
        nombres: aprendiz.nombres,
        apellidos: aprendiz.apellidos,
        documento: aprendiz.documento,
        fichaId: aprendiz.fichaId,
        numeroFicha: aprendiz.ficha?.numeroFicha || '',
      },
      asistencia: {
        presentes: parseInt(asistenciaStats.presentes),
        ausenciasJustificadas: parseInt(asistenciaStats.ausenciasJustificadas),
        ausenciasNoJustificadas: parseInt(asistenciaStats.ausenciasNoJustificadas),
        porcentajeAsistencia,
      },
      historialUltimasSesiones: historialSesiones,
      alertas,
      disciplinario: {
        totalCasosAbiertos: casosAbiertos,
        ultimoCaso: ultimoCaso
          ? {
              id: ultimoCaso.id,
              tipo: ultimoCaso.tipo,
              gravedad: ultimoCaso.gravedad,
              estado: ultimoCaso.estado,
              fechaIncidente: ultimoCaso.fechaIncidente,
            }
          : null,
      },
      ptc: ptcVigente
        ? {
            id: ptcVigente.id,
            estado: ptcVigente.estado,
            fechaInicio: ptcVigente.fechaInicio,
            fechaFin: ptcVigente.fechaFin,
          }
        : null,
      proximosEventos: proximosEventos.map((e) => ({
        id: e.id,
        titulo: e.titulo,
        tipo: e.tipo,
        fechaInicio: e.fechaInicio,
      })),
    };
  }

  /**
   * Panel de coordinación (solo COORDINADOR o ADMIN)
   */
  async getPanelCoordinacion(query: QueryPanelCoordinacionDto, user: User) {
    if (user.rol !== UserRole.ADMIN && user.rol !== UserRole.COORDINADOR) {
      throw new ForbiddenException('No tienes permisos para acceder al panel de coordinación');
    }

    const rango = obtenerRangoFechas(query.desde, query.hasta, query.month);

    // Construir query de fichas con filtros
    const fichasQuery = this.fichaRepository.createQueryBuilder('ficha');

    if (query.colegioId) {
      fichasQuery.andWhere('ficha.colegioId = :colegioId', { colegioId: query.colegioId });
    }

    if (query.programaId) {
      fichasQuery.andWhere('ficha.programaId = :programaId', { programaId: query.programaId });
    }

    if (query.estadoFicha) {
      fichasQuery.andWhere('ficha.estado = :estado', { estado: query.estadoFicha });
    }

    const fichas = await fichasQuery.getMany();
    const fichaIds = fichas.map((f) => f.id);

    if (fichaIds.length === 0) {
      return {
        totalFichasActivas: 0,
        totalAprendicesActivos: 0,
        alertasPorCriterio: {
          tresConsecutivas: 0,
          cincoMes: 0,
          ambas: 0,
        },
        rankingProgramas: [],
        rankingFichas: [],
      };
    }

    // Total de aprendices activos
    const totalAprendicesActivos = await this.aprendizRepository.count({
      where: { fichaId: fichaIds as any },
    });

    // Alertas por criterio
    const alertas = await this.calcularAlertasInstructor(fichaIds, rango);
    const alertasPorCriterio = {
      tresConsecutivas: alertas.filter((a) => a.consecutivas >= 3).length,
      cincoMes: alertas.filter((a) => a.faltasMes >= 5).length,
      ambas: alertas.filter((a) => a.consecutivas >= 3 && a.faltasMes >= 5).length,
    };

    // Ranking programas con más alertas
    const rankingProgramas = await this.getRankingProgramasAlertas(fichaIds, rango, 10);

    // Ranking fichas con más ausencias no justificadas
    const rankingFichas = await this.getRankingFichasAusencias(fichaIds, rango, 10);

    return {
      totalFichasActivas: fichas.length,
      totalAprendicesActivos,
      alertasPorCriterio,
      rankingProgramas,
      rankingFichas,
    };
  }

  /**
   * Exportar asistencia de ficha a CSV
   */
  async exportFichaAsistenciaCsv(
    fichaId: string,
    user: User,
    desde?: string,
    hasta?: string,
    month?: string,
  ): Promise<string> {
    const rango = obtenerRangoFechas(desde, hasta, month);

    // Verificar permisos
    const ficha = await this.fichaRepository.findOne({ where: { id: fichaId } });
    if (!ficha) {
      throw new NotFoundException('Ficha no encontrada');
    }

    if (user.rol === UserRole.INSTRUCTOR && ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para exportar esta ficha');
    }

    // Obtener registros de asistencia
    const registros = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .select('sesion.fecha', 'fecha')
      .addSelect('ficha.numeroFicha', 'numeroFicha')
      .addSelect('aprendiz.documento', 'aprendizDocumento')
      .addSelect("CONCAT(aprendiz.nombres, ' ', aprendiz.apellidos)", 'aprendizNombre')
      .addSelect('asistencia.presente', 'presente')
      .addSelect('asistencia.justificada', 'justificada')
      .addSelect('asistencia.motivo', 'motivo')
      .innerJoin('asistencia.sesion', 'sesion')
      .innerJoin('sesion.ficha', 'ficha')
      .innerJoin('asistencia.aprendiz', 'aprendiz')
      .where('sesion.fichaId = :fichaId', { fichaId })
      .andWhere('sesion.fecha >= :desde', { desde: rango.desde })
      .andWhere('sesion.fecha <= :hasta', { hasta: rango.hasta })
      .orderBy('sesion.fecha', 'ASC')
      .addOrderBy('aprendiz.apellidos', 'ASC')
      .getRawMany();

    const headers = [
      'fecha',
      'numeroFicha',
      'aprendizDocumento',
      'aprendizNombre',
      'presente',
      'justificada',
      'motivo',
    ];

    return arrayToCsv(registros, headers);
  }

  /**
   * Exportar alertas de ficha a CSV
   */
  async exportFichaAlertasCsv(fichaId: string, user: User, month: string): Promise<string> {
    const rango = mesARango(month);

    // Verificar permisos
    const ficha = await this.fichaRepository.findOne({ where: { id: fichaId } });
    if (!ficha) {
      throw new NotFoundException('Ficha no encontrada');
    }

    if (user.rol === UserRole.INSTRUCTOR && ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para exportar esta ficha');
    }

    // Calcular alertas
    const alertas = await this.calcularAlertasFicha(fichaId, rango);

    const registros = alertas.map((alerta) => ({
      aprendizDocumento: alerta.documento,
      aprendizNombre: `${alerta.nombres} ${alerta.apellidos}`,
      consecutivasNoJustificadas: alerta.consecutivas,
      faltasMesNoJustificadas: alerta.faltasMes,
      criterio: alerta.criterio,
    }));

    const headers = [
      'aprendizDocumento',
      'aprendizNombre',
      'consecutivasNoJustificadas',
      'faltasMesNoJustificadas',
      'criterio',
    ];

    return arrayToCsv(registros, headers);
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Calcular alertas de riesgo para un instructor
   */
  private async calcularAlertasInstructor(fichaIds: string[], rango: RangoFechas) {
    const aprendices = await this.aprendizRepository.find({
      where: { fichaId: fichaIds as any },
    });

    const alertas = [];

    for (const aprendiz of aprendices) {
      const alerta = await this.verificarAlertaAprendiz(aprendiz.id, rango);
      if (alerta) {
        alertas.push(alerta);
      }
    }

    return alertas;
  }

  /**
   * Calcular alertas de una ficha específica
   */
  private async calcularAlertasFicha(fichaId: string, rango: RangoFechas) {
    const aprendices = await this.aprendizRepository.find({
      where: { fichaId },
    });

    const alertas = [];

    for (const aprendiz of aprendices) {
      const alerta = await this.verificarAlertaAprendiz(aprendiz.id, rango);
      if (alerta) {
        alertas.push(alerta);
      }
    }

    return alertas;
  }

  /**
   * Calcular alertas de un aprendiz específico
   */
  private async calcularAlertasAprendiz(aprendizId: string, rango: RangoFechas) {
    const alerta = await this.verificarAlertaAprendiz(aprendizId, rango);
    return alerta ? [alerta] : [];
  }

  /**
   * Verificar si un aprendiz cumple criterios de alerta
   */
  private async verificarAlertaAprendiz(aprendizId: string, rango: RangoFechas) {
    const aprendiz = await this.aprendizRepository.findOne({ where: { id: aprendizId } });
    if (!aprendiz) return null;

    // Obtener asistencias ordenadas por fecha
    const asistencias = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .innerJoin('asistencia.sesion', 'sesion')
      .where('asistencia.aprendizId = :aprendizId', { aprendizId })
      .andWhere('sesion.fecha >= :desde', { desde: rango.desde })
      .andWhere('sesion.fecha <= :hasta', { hasta: rango.hasta })
      .orderBy('sesion.fecha', 'ASC')
      .getMany();

    // Contar ausencias no justificadas consecutivas
    let consecutivas = 0;
    let maxConsecutivas = 0;

    for (const asist of asistencias) {
      if (!asist.presente && !asist.justificada) {
        consecutivas++;
        maxConsecutivas = Math.max(maxConsecutivas, consecutivas);
      } else {
        consecutivas = 0;
      }
    }

    // Contar faltas no justificadas en el mes
    const faltasMes = asistencias.filter((a) => !a.presente && !a.justificada).length;

    // Determinar si cumple criterio
    const cumpleTresConsecutivas = maxConsecutivas >= 3;
    const cumpleCincoMes = faltasMes >= 5;

    if (!cumpleTresConsecutivas && !cumpleCincoMes) {
      return null;
    }

    let criterio = '';
    if (cumpleTresConsecutivas && cumpleCincoMes) {
      criterio = '3 consecutivas + 5 en el mes';
    } else if (cumpleTresConsecutivas) {
      criterio = '3 ausencias consecutivas';
    } else {
      criterio = '5 ausencias en el mes';
    }

    return {
      aprendizId,
      nombres: aprendiz.nombres,
      apellidos: aprendiz.apellidos,
      documento: aprendiz.documento,
      consecutivas: maxConsecutivas,
      faltasMes,
      criterio,
    };
  }

  /**
   * Top fichas con más alertas
   */
  private async getTopFichasRiesgo(fichaIds: string[], rango: RangoFechas, limit: number) {
    const fichasAlertas = [];

    for (const fichaId of fichaIds) {
      const alertas = await this.calcularAlertasFicha(fichaId, rango);
      const ficha = await this.fichaRepository.findOne({
        where: { id: fichaId },
        relations: ['programa'],
      });

      if (alertas.length > 0) {
        fichasAlertas.push({
          fichaId,
          numeroFicha: ficha?.numeroFicha || '',
          programa: ficha?.programa?.nombre || '',
          totalAlertas: alertas.length,
        });
      }
    }

    return fichasAlertas.sort((a, b) => b.totalAlertas - a.totalAlertas).slice(0, limit);
  }

  /**
   * Ranking de programas con más alertas
   */
  private async getRankingProgramasAlertas(fichaIds: string[], rango: RangoFechas, limit: number) {
    const programasMap = new Map<string, { nombre: string; alertas: number }>();

    const fichas = await this.fichaRepository.find({
      where: { id: fichaIds as any },
      relations: ['programa'],
    });

    for (const ficha of fichas) {
      const alertas = await this.calcularAlertasFicha(ficha.id, rango);
      const programaId = ficha.programaId;
      const programaNombre = ficha.programa?.nombre || 'Sin programa';

      if (programasMap.has(programaId)) {
        const current = programasMap.get(programaId)!;
        current.alertas += alertas.length;
      } else {
        programasMap.set(programaId, { nombre: programaNombre, alertas: alertas.length });
      }
    }

    return Array.from(programasMap.values())
      .sort((a, b) => b.alertas - a.alertas)
      .slice(0, limit);
  }

  /**
   * Ranking de fichas con más ausencias no justificadas
   */
  private async getRankingFichasAusencias(fichaIds: string[], rango: RangoFechas, limit: number) {
    const ranking = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .select('ficha.id', 'fichaId')
      .addSelect('ficha.numeroFicha', 'numeroFicha')
      .addSelect('programa.nombre', 'programa')
      .addSelect(
        'COUNT(CASE WHEN asistencia.presente = false AND asistencia.justificada = false THEN 1 END)',
        'ausenciasNoJustificadas',
      )
      .innerJoin('asistencia.sesion', 'sesion')
      .innerJoin('sesion.ficha', 'ficha')
      .leftJoin('ficha.programa', 'programa')
      .where('sesion.fichaId IN (:...fichaIds)', { fichaIds })
      .andWhere('sesion.fecha >= :desde', { desde: rango.desde })
      .andWhere('sesion.fecha <= :hasta', { hasta: rango.hasta })
      .groupBy('ficha.id')
      .addGroupBy('ficha.numeroFicha')
      .addGroupBy('programa.nombre')
      .orderBy('ausenciasNoJustificadas', 'DESC')
      .limit(limit)
      .getRawMany();

    return ranking;
  }
}

// Helper importado localmente para evitar error de importación circular
function mesARango(month: string): RangoFechas {
  const [year, monthNum] = month.split('-').map(Number);
  const desde = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
  const hasta = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
  return { desde, hasta };
}
