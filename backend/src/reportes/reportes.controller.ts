import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ReportesService } from './reportes.service';
import { QueryRangoFechasDto } from './dto/query-rango-fechas.dto';
import { QueryPanelCoordinacionDto } from './dto/query-panel-coordinacion.dto';

@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // ==================== DASHBOARD INSTRUCTOR ====================

  @Get('instructor/dashboard')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Dashboard del instructor autenticado',
    description:
      'Obtiene métricas globales del instructor: fichas, aprendices, sesiones, tasa de asistencia, alertas y agenda.',
  })
  @ApiQuery({ name: 'desde', required: false, type: String, description: 'Fecha inicio (ISO)' })
  @ApiQuery({ name: 'hasta', required: false, type: String, description: 'Fecha fin (ISO)' })
  @ApiQuery({
    name: 'month',
    required: false,
    type: String,
    description: 'Mes en formato YYYY-MM',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard del instructor',
    schema: {
      example: {
        totalFichas: 3,
        totalAprendices: 85,
        totalSesiones: 42,
        tasaAsistenciaPromedio: 87.5,
        totalAlertasRiesgo: 5,
        topFichasRiesgo: [
          {
            fichaId: 'uuid',
            numeroFicha: '2654321',
            programa: 'Técnico en Cocina',
            totalAlertas: 3,
          },
        ],
        agendaProximaSemana: 4,
      },
    },
  })
  async getInstructorDashboard(@Req() req, @Query() query: QueryRangoFechasDto) {
    return this.reportesService.getInstructorDashboard(
      req.user,
      query.desde,
      query.hasta,
      query.month,
    );
  }

  // ==================== RESUMEN POR FICHA ====================

  @Get('fichas/:fichaId/resumen')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Resumen de una ficha',
    description:
      'Obtiene resumen de asistencia, top aprendices con más ausencias y alertas de una ficha.',
  })
  @ApiQuery({ name: 'desde', required: false, type: String })
  @ApiQuery({ name: 'hasta', required: false, type: String })
  @ApiQuery({ name: 'month', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Resumen de la ficha',
    schema: {
      example: {
        ficha: {
          id: 'uuid',
          numeroFicha: '2654321',
          programa: 'Técnico en Cocina',
          colegio: 'Colegio Comercial Empresarial',
          instructor: 'Juan Pérez',
        },
        totalAprendices: 32,
        totalSesiones: 18,
        conteo: {
          presentes: 540,
          ausenciasJustificadas: 12,
          ausenciasNoJustificadas: 24,
        },
        porcentajeAsistencia: 93.75,
        topAprendicesAusencias: [
          {
            aprendizId: 'uuid',
            nombres: 'Carlos',
            apellidos: 'Gómez',
            documento: '123456',
            ausenciasNoJustificadas: 8,
          },
        ],
        alertas: [
          {
            aprendizId: 'uuid',
            nombres: 'Carlos',
            apellidos: 'Gómez',
            documento: '123456',
            consecutivas: 3,
            faltasMes: 8,
            criterio: '3 consecutivas + 5 en el mes',
          },
        ],
      },
    },
  })
  async getFichaResumen(
    @Param('fichaId') fichaId: string,
    @Req() req,
    @Query() query: QueryRangoFechasDto,
  ) {
    return this.reportesService.getFichaResumen(
      fichaId,
      req.user,
      query.desde,
      query.hasta,
      query.month,
    );
  }

  // ==================== RESUMEN POR APRENDIZ ====================

  @Get('aprendices/:aprendizId/resumen')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Resumen de un aprendiz',
    description:
      'Obtiene estadísticas de asistencia, historial de sesiones, alertas, casos disciplinarios, PTC y agenda del aprendiz.',
  })
  @ApiQuery({ name: 'desde', required: false, type: String })
  @ApiQuery({ name: 'hasta', required: false, type: String })
  @ApiQuery({ name: 'month', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Resumen del aprendiz',
    schema: {
      example: {
        aprendiz: {
          id: 'uuid',
          nombres: 'Carlos',
          apellidos: 'Gómez',
          documento: '123456',
          fichaId: 'uuid',
          numeroFicha: '2654321',
        },
        asistencia: {
          presentes: 15,
          ausenciasJustificadas: 1,
          ausenciasNoJustificadas: 3,
          porcentajeAsistencia: 78.95,
        },
        historialUltimasSesiones: [
          {
            fecha: '2026-01-08',
            presente: true,
            justificada: false,
            motivo: null,
          },
        ],
        alertas: [],
        disciplinario: {
          totalCasosAbiertos: 0,
          ultimoCaso: null,
        },
        ptc: null,
        proximosEventos: [],
      },
    },
  })
  async getAprendizResumen(
    @Param('aprendizId') aprendizId: string,
    @Req() req,
    @Query() query: QueryRangoFechasDto,
  ) {
    return this.reportesService.getAprendizResumen(
      aprendizId,
      req.user,
      query.desde,
      query.hasta,
      query.month,
    );
  }

  // ==================== PANEL COORDINACIÓN ====================

  @Get('coordinacion/panel')
  @Roles(UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Panel de coordinación global',
    description:
      'Obtiene métricas globales filtradas por colegio, programa, estado de ficha. Solo para COORDINADOR o ADMIN.',
  })
  @ApiQuery({ name: 'colegioId', required: false, type: String })
  @ApiQuery({ name: 'programaId', required: false, type: String })
  @ApiQuery({ name: 'estadoFicha', required: false, enum: ['ACTIVA', 'EN_CIERRE', 'FINALIZADA'] })
  @ApiQuery({ name: 'desde', required: false, type: String })
  @ApiQuery({ name: 'hasta', required: false, type: String })
  @ApiQuery({ name: 'month', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Panel de coordinación',
    schema: {
      example: {
        totalFichasActivas: 8,
        totalAprendicesActivos: 270,
        alertasPorCriterio: {
          tresConsecutivas: 12,
          cincoMes: 8,
          ambas: 5,
        },
        rankingProgramas: [
          {
            nombre: 'Técnico en Cocina',
            alertas: 8,
          },
        ],
        rankingFichas: [
          {
            fichaId: 'uuid',
            numeroFicha: '2654321',
            programa: 'Técnico en Cocina',
            ausenciasNoJustificadas: 45,
          },
        ],
      },
    },
  })
  async getPanelCoordinacion(@Req() req, @Query() query: QueryPanelCoordinacionDto) {
    return this.reportesService.getPanelCoordinacion(query, req.user);
  }

  // ==================== EXPORT CSV ====================

  @Get('fichas/:fichaId/asistencia.csv')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Exportar asistencia de ficha a CSV',
    description:
      'Descarga un archivo CSV con registros de asistencia de la ficha en el rango especificado.',
  })
  @ApiQuery({ name: 'desde', required: false, type: String })
  @ApiQuery({ name: 'hasta', required: false, type: String })
  @ApiQuery({ name: 'month', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV generado',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          example:
            'fecha,numeroFicha,aprendizDocumento,aprendizNombre,presente,justificada,motivo\n2026-01-08,2654321,123456,Carlos Gómez,true,false,',
        },
      },
    },
  })
  async exportFichaAsistenciaCsv(
    @Param('fichaId') fichaId: string,
    @Req() req,
    @Query() query: QueryRangoFechasDto,
    @Res() res: Response,
  ) {
    const csv = await this.reportesService.exportFichaAsistenciaCsv(
      fichaId,
      req.user,
      query.desde,
      query.hasta,
      query.month,
    );

    const filename = `asistencia-ficha-${fichaId}-${query.month || 'rango'}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(HttpStatus.OK).send(csv);
  }

  @Get('fichas/:fichaId/alertas.csv')
  @Roles(UserRole.INSTRUCTOR, UserRole.COORDINADOR, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Exportar alertas de ficha a CSV',
    description: 'Descarga un archivo CSV con alertas de riesgo de la ficha en el mes especificado.',
  })
  @ApiQuery({ name: 'month', required: true, type: String, description: 'Mes YYYY-MM' })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV generado',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          example:
            'aprendizDocumento,aprendizNombre,consecutivasNoJustificadas,faltasMesNoJustificadas,criterio\n123456,Carlos Gómez,3,8,3 consecutivas + 5 en el mes',
        },
      },
    },
  })
  async exportFichaAlertasCsv(
    @Param('fichaId') fichaId: string,
    @Req() req,
    @Query('month') month: string,
    @Res() res: Response,
  ) {
    const csv = await this.reportesService.exportFichaAlertasCsv(fichaId, req.user, month);

    const filename = `alertas-ficha-${fichaId}-${month}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(HttpStatus.OK).send(csv);
  }
}
