import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaseSesion } from './entities/clase-sesion.entity';
import { Asistencia } from './entities/asistencia.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { QuerySesionesDto } from './dto/query-sesiones.dto';
import { RegistrarAsistenciaDto } from './dto/registrar-asistencia.dto';
import { JustificarAsistenciaDto } from './dto/justificar-asistencia.dto';
import { QueryAlertasDto } from './dto/query-alertas.dto';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(ClaseSesion)
    private readonly sesionRepository: Repository<ClaseSesion>,
    @InjectRepository(Asistencia)
    private readonly asistenciaRepository: Repository<Asistencia>,
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
    @InjectRepository(Aprendiz)
    private readonly aprendizRepository: Repository<Aprendiz>,
  ) {}

  // ==================== SESIONES ====================

  async createSesion(
    createSesionDto: CreateSesionDto,
    userId: string,
    userRole: UserRole,
  ): Promise<ClaseSesion> {
    const { fichaId, fecha, tema, observaciones } = createSesionDto;

    // Verificar que la ficha existe
    const ficha = await this.fichaRepository.findOne({
      where: { id: fichaId },
      relations: ['instructor'],
    });

    if (!ficha) {
      throw new NotFoundException(`Ficha con ID ${fichaId} no encontrada`);
    }

    // Validar permisos: instructor solo puede crear sesiones para sus fichas
    if (userRole === UserRole.INSTRUCTOR && ficha.instructorId !== userId) {
      throw new ForbiddenException('No tienes permisos para crear sesiones en esta ficha');
    }

    // Verificar que no exista una sesión para la misma ficha y fecha
    const existingSesion = await this.sesionRepository.findOne({
      where: { fichaId, fecha: new Date(fecha) },
    });

    if (existingSesion) {
      throw new ConflictException(
        `Ya existe una sesión para la ficha ${ficha.numeroFicha} en la fecha ${fecha}`,
      );
    }

    // Crear la sesión
    const sesion = this.sesionRepository.create({
      fichaId,
      fecha: new Date(fecha),
      tema,
      observaciones,
      createdByUserId: userId,
    });

    const savedSesion = await this.sesionRepository.save(sesion);

    // Precargar registros de asistencia para todos los aprendices de la ficha
    const aprendices = await this.aprendizRepository.find({
      where: { fichaId },
    });

    const asistenciasPreload = aprendices.map((aprendiz) =>
      this.asistenciaRepository.create({
        sesionId: savedSesion.id,
        aprendizId: aprendiz.id,
        presente: false,
        justificada: false,
      }),
    );

    await this.asistenciaRepository.save(asistenciasPreload);

    return this.sesionRepository.findOne({
      where: { id: savedSesion.id },
      relations: ['ficha', 'ficha.programa', 'ficha.colegio'],
    });
  }

  async findAllSesiones(
    querySesionesDto: QuerySesionesDto,
    userId: string,
    userRole: UserRole,
  ): Promise<{ data: ClaseSesion[]; total: number; page: number; limit: number }> {
    const { fichaId, desde, hasta, page = 1, limit = 10 } = querySesionesDto;

    const queryBuilder = this.sesionRepository
      .createQueryBuilder('sesion')
      .leftJoinAndSelect('sesion.ficha', 'ficha')
      .leftJoinAndSelect('ficha.programa', 'programa')
      .leftJoinAndSelect('ficha.colegio', 'colegio')
      .leftJoinAndSelect('ficha.instructor', 'instructor');

    // Filtrar por ficha si se proporciona
    if (fichaId) {
      queryBuilder.andWhere('sesion.fichaId = :fichaId', { fichaId });
    }

    // Si es instructor, solo puede ver sesiones de sus fichas
    if (userRole === UserRole.INSTRUCTOR) {
      queryBuilder.andWhere('ficha.instructorId = :userId', { userId });
    }

    // Filtrar por rango de fechas
    if (desde) {
      queryBuilder.andWhere('sesion.fecha >= :desde', { desde: new Date(desde) });
    }

    if (hasta) {
      queryBuilder.andWhere('sesion.fecha <= :hasta', { hasta: new Date(hasta) });
    }

    // Ordenar por fecha descendente
    queryBuilder.orderBy('sesion.fecha', 'DESC');

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOneSesion(id: string, userId: string, userRole: UserRole): Promise<ClaseSesion> {
    const sesion = await this.sesionRepository.findOne({
      where: { id },
      relations: ['ficha', 'ficha.programa', 'ficha.colegio', 'ficha.instructor'],
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }

    // Si es instructor, validar que sea su ficha
    if (userRole === UserRole.INSTRUCTOR && sesion.ficha.instructorId !== userId) {
      throw new ForbiddenException('No tienes permisos para ver esta sesión');
    }

    // Obtener resumen de asistencias
    const totalAprendices = await this.asistenciaRepository.count({
      where: { sesionId: id },
    });

    const presentes = await this.asistenciaRepository.count({
      where: { sesionId: id, presente: true },
    });

    const ausentes = totalAprendices - presentes;

    return {
      ...sesion,
      resumen: {
        totalAprendices,
        presentes,
        ausentes,
      },
    } as any;
  }

  // ==================== ASISTENCIAS ====================

  async registrarAsistencias(
    sesionId: string,
    registrarAsistenciaDto: RegistrarAsistenciaDto,
    userId: string,
    userRole: UserRole,
  ): Promise<{ message: string; registradas: number }> {
    const { asistencias } = registrarAsistenciaDto;

    // Verificar que la sesión existe
    const sesion = await this.sesionRepository.findOne({
      where: { id: sesionId },
      relations: ['ficha'],
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${sesionId} no encontrada`);
    }

    // Validar permisos
    if (userRole === UserRole.INSTRUCTOR && sesion.ficha.instructorId !== userId) {
      throw new ForbiddenException('No tienes permisos para registrar asistencias en esta sesión');
    }

    // Verificar que todos los aprendices pertenecen a la ficha de la sesión
    const aprendizIds = asistencias.map((a) => a.aprendizId);
    const aprendices = await this.aprendizRepository.find({
      where: { id: aprendizIds as any },
    });

    const aprendicesInvalidos = aprendices.filter((a) => a.fichaId !== sesion.fichaId);

    if (aprendicesInvalidos.length > 0) {
      throw new BadRequestException(
        `Los siguientes aprendices no pertenecen a la ficha de la sesión: ${aprendicesInvalidos.map((a) => a.documento).join(', ')}`,
      );
    }

    // Registrar o actualizar asistencias
    let registradas = 0;

    for (const item of asistencias) {
      const existingAsistencia = await this.asistenciaRepository.findOne({
        where: { sesionId, aprendizId: item.aprendizId },
      });

      if (existingAsistencia) {
        // Actualizar
        existingAsistencia.presente = item.presente;

        // Si está presente, limpiar justificación
        if (item.presente) {
          existingAsistencia.justificada = false;
          existingAsistencia.motivoJustificacion = null;
          existingAsistencia.evidenciaUrl = null;
        }

        await this.asistenciaRepository.save(existingAsistencia);
      } else {
        // Crear nueva
        const nuevaAsistencia = this.asistenciaRepository.create({
          sesionId,
          aprendizId: item.aprendizId,
          presente: item.presente,
          justificada: false,
        });

        await this.asistenciaRepository.save(nuevaAsistencia);
      }

      registradas++;
    }

    return {
      message: 'Asistencias registradas exitosamente',
      registradas,
    };
  }

  async justificarAsistencia(
    asistenciaId: string,
    justificarDto: JustificarAsistenciaDto,
    userId: string,
    userRole: UserRole,
  ): Promise<Asistencia> {
    const { justificada, motivoJustificacion, evidenciaUrl } = justificarDto;

    // Buscar la asistencia
    const asistencia = await this.asistenciaRepository.findOne({
      where: { id: asistenciaId },
      relations: ['sesion', 'sesion.ficha', 'aprendiz'],
    });

    if (!asistencia) {
      throw new NotFoundException(`Asistencia con ID ${asistenciaId} no encontrada`);
    }

    // Validar permisos
    if (userRole === UserRole.INSTRUCTOR && asistencia.sesion.ficha.instructorId !== userId) {
      throw new ForbiddenException('No tienes permisos para justificar esta asistencia');
    }

    // Solo se puede justificar si el aprendiz NO estuvo presente
    if (asistencia.presente) {
      throw new BadRequestException('No se puede justificar una asistencia si el aprendiz estuvo presente');
    }

    // Si justificada=true, validar que haya motivo
    if (justificada && !motivoJustificacion) {
      throw new BadRequestException('El motivo de justificación es obligatorio cuando justificada es true');
    }

    // Actualizar
    asistencia.justificada = justificada;
    asistencia.motivoJustificacion = justificada ? motivoJustificacion : null;
    asistencia.evidenciaUrl = evidenciaUrl || null;

    return this.asistenciaRepository.save(asistencia);
  }

  // ==================== ALERTAS ====================

  async getAlertasFicha(
    fichaId: string,
    queryAlertasDto: QueryAlertasDto,
    userId: string,
    userRole: UserRole,
  ): Promise<any> {
    // Verificar que la ficha existe
    const ficha = await this.fichaRepository.findOne({
      where: { id: fichaId },
      relations: ['instructor'],
    });

    if (!ficha) {
      throw new NotFoundException(`Ficha con ID ${fichaId} no encontrada`);
    }

    // Validar permisos
    if (userRole === UserRole.INSTRUCTOR && ficha.instructorId !== userId) {
      throw new ForbiddenException('No tienes permisos para ver alertas de esta ficha');
    }

    const { month, includeDetails = false } = queryAlertasDto;

    // Determinar rango del mes
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      startDate = new Date(year, monthNum - 1, 1);
      endDate = new Date(year, monthNum, 0);
    } else {
      // Mes actual
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Obtener todos los aprendices de la ficha
    const aprendices = await this.aprendizRepository.find({
      where: { fichaId },
    });

    const alertas = [];

    for (const aprendiz of aprendices) {
      // Obtener todas las asistencias del aprendiz ordenadas por fecha DESC
      const asistencias = await this.asistenciaRepository
        .createQueryBuilder('asistencia')
        .leftJoinAndSelect('asistencia.sesion', 'sesion')
        .where('asistencia.aprendizId = :aprendizId', { aprendizId: aprendiz.id })
        .andWhere('sesion.fichaId = :fichaId', { fichaId })
        .orderBy('sesion.fecha', 'DESC')
        .getMany();

      // Calcular consecutivas no justificadas
      let consecutivasNoJustificadas = 0;
      for (const asistencia of asistencias) {
        if (!asistencia.presente && !asistencia.justificada) {
          consecutivasNoJustificadas++;
        } else {
          break; // Se rompe la racha
        }
      }

      // Calcular faltas del mes no justificadas
      const faltasMesNoJustificadas = await this.asistenciaRepository
        .createQueryBuilder('asistencia')
        .leftJoin('asistencia.sesion', 'sesion')
        .where('asistencia.aprendizId = :aprendizId', { aprendizId: aprendiz.id })
        .andWhere('sesion.fichaId = :fichaId', { fichaId })
        .andWhere('sesion.fecha >= :startDate', { startDate })
        .andWhere('sesion.fecha <= :endDate', { endDate })
        .andWhere('asistencia.presente = :presente', { presente: false })
        .andWhere('asistencia.justificada = :justificada', { justificada: false })
        .getCount();

      // Determinar si hay alerta
      let criterio: string | null = null;
      if (consecutivasNoJustificadas >= 3 && faltasMesNoJustificadas >= 5) {
        criterio = 'AMBAS';
      } else if (consecutivasNoJustificadas >= 3) {
        criterio = '3_CONSECUTIVAS';
      } else if (faltasMesNoJustificadas >= 5) {
        criterio = '5_MES';
      }

      if (criterio) {
        const alerta: any = {
          aprendizId: aprendiz.id,
          nombres: aprendiz.nombres,
          apellidos: aprendiz.apellidos,
          documento: aprendiz.documento,
          consecutivasNoJustificadas,
          faltasMesNoJustificadas,
          criterio,
        };

        if (includeDetails) {
          // Incluir detalles de sesiones (últimas 10)
          const sesionesDetalle = asistencias.slice(0, 10).map((a) => ({
            fecha: a.sesion.fecha,
            presente: a.presente,
            justificada: a.justificada,
          }));
          alerta.sesionesDetalle = sesionesDetalle;
        }

        alertas.push(alerta);
      }
    }

    return {
      fichaId,
      numeroFicha: ficha.numeroFicha,
      mes: month || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`,
      alertas,
    };
  }

  // ==================== REPORTES ====================

  async getResumenFicha(
    fichaId: string,
    desde?: string,
    hasta?: string,
    userId?: string,
    userRole?: UserRole,
  ): Promise<any> {
    // Verificar que la ficha existe
    const ficha = await this.fichaRepository.findOne({
      where: { id: fichaId },
      relations: ['instructor'],
    });

    if (!ficha) {
      throw new NotFoundException(`Ficha con ID ${fichaId} no encontrada`);
    }

    // Validar permisos si se proporciona userId
    if (userId && userRole === UserRole.INSTRUCTOR && ficha.instructorId !== userId) {
      throw new ForbiddenException('No tienes permisos para ver el resumen de esta ficha');
    }

    // Query base
    const sesionesQuery = this.sesionRepository
      .createQueryBuilder('sesion')
      .where('sesion.fichaId = :fichaId', { fichaId });

    if (desde) {
      sesionesQuery.andWhere('sesion.fecha >= :desde', { desde: new Date(desde) });
    }

    if (hasta) {
      sesionesQuery.andWhere('sesion.fecha <= :hasta', { hasta: new Date(hasta) });
    }

    const totalSesiones = await sesionesQuery.getCount();

    // Total aprendices
    const totalAprendices = await this.aprendizRepository.count({
      where: { fichaId },
    });

    // Calcular porcentaje de asistencia promedio
    const asistenciasQuery = this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .leftJoin('asistencia.sesion', 'sesion')
      .where('sesion.fichaId = :fichaId', { fichaId });

    if (desde) {
      asistenciasQuery.andWhere('sesion.fecha >= :desde', { desde: new Date(desde) });
    }

    if (hasta) {
      asistenciasQuery.andWhere('sesion.fecha <= :hasta', { hasta: new Date(hasta) });
    }

    const totalAsistencias = await asistenciasQuery.getCount();
    const totalPresentes = await asistenciasQuery
      .andWhere('asistencia.presente = :presente', { presente: true })
      .getCount();

    const porcentajeAsistenciaPromedio =
      totalAsistencias > 0 ? ((totalPresentes / totalAsistencias) * 100).toFixed(2) : '0.00';

    // Top 10 con más ausencias no justificadas
    const topAusencias = await this.asistenciaRepository
      .createQueryBuilder('asistencia')
      .select('asistencia.aprendizId', 'aprendizId')
      .addSelect('COUNT(*)', 'totalAusencias')
      .leftJoin('asistencia.sesion', 'sesion')
      .leftJoin('asistencia.aprendiz', 'aprendiz')
      .addSelect('aprendiz.nombres', 'nombres')
      .addSelect('aprendiz.apellidos', 'apellidos')
      .addSelect('aprendiz.documento', 'documento')
      .where('sesion.fichaId = :fichaId', { fichaId })
      .andWhere('asistencia.presente = :presente', { presente: false })
      .andWhere('asistencia.justificada = :justificada', { justificada: false })
      .groupBy('asistencia.aprendizId')
      .addGroupBy('aprendiz.nombres')
      .addGroupBy('aprendiz.apellidos')
      .addGroupBy('aprendiz.documento')
      .orderBy('totalAusencias', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      fichaId,
      numeroFicha: ficha.numeroFicha,
      totalSesiones,
      totalAprendices,
      porcentajeAsistenciaPromedio: parseFloat(porcentajeAsistenciaPromedio),
      topAusencias: topAusencias.map((item) => ({
        aprendizId: item.aprendizId,
        nombres: item.nombres,
        apellidos: item.apellidos,
        documento: item.documento,
        totalAusencias: parseInt(item.totalAusencias, 10),
      })),
    };
  }
}
