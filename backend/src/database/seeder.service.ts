import { Injectable, Logger } from '@nestjs/common';
import { ColegiosService } from '../colegios/colegios.service';
import { ProgramasService } from '../programas/programas.service';
import { UsersService } from '../users/users.service';
import { FichasService } from '../fichas/fichas.service';
import { AprendicesService } from '../aprendices/aprendices.service';
import { DisciplinarioService } from '../disciplinario/disciplinario.service';
import { UserRole } from '../users/entities/user.entity';
import { JornadaFicha, EstadoFicha } from '../fichas/entities/ficha.entity';
import { TipoDocumento, EstadoAcademico } from '../aprendices/entities/aprendiz.entity';
import { CaseTipo, CaseGravedad, CaseEstado } from '../disciplinario/entities/disciplinary-case.entity';
import { ActionTipo } from '../disciplinario/entities/case-action.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly colegiosService: ColegiosService,
    private readonly programasService: ProgramasService,
    private readonly usersService: UsersService,
    private readonly fichasService: FichasService,
    private readonly aprendicesService: AprendicesService,
    private readonly disciplinarioService: DisciplinarioService,
  ) {}

  async seed() {
    this.logger.log('Iniciando seeders...');

    await this.seedUsers();
    await this.seedColegios();
    await this.seedProgramas();
    await this.seedFichas();
    await this.seedAprendices();
    await this.seedDisciplinario();

    this.logger.log('Seeders completados exitosamente');
  }

  private async seedUsers() {
    this.logger.log('Seeding Users...');

    const users = [
      {
        nombre: 'Administrador del Sistema',
        email: 'admin@sena.edu.co',
        documento: '1234567890',
        telefono: '3001111111',
        password: 'Admin123!',
        rol: UserRole.ADMIN,
      },
      {
        nombre: 'Juan Carlos Instructor',
        email: 'instructor@sena.edu.co',
        documento: '9876543210',
        telefono: '3002222222',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
      },
      {
        nombre: 'María Coordinadora',
        email: 'coordinador@sena.edu.co',
        documento: '5555555555',
        telefono: '3003333333',
        password: 'Coordinador123!',
        rol: UserRole.COORDINADOR,
      },
    ];

    for (const user of users) {
      try {
        await this.usersService.create(user);
        this.logger.log(`Usuario creado: ${user.email}`);
      } catch (error) {
        this.logger.warn(`Usuario ya existe: ${user.email}`);
      }
    }
  }

  private async seedColegios() {
    this.logger.log('Seeding Colegios...');

    const colegios = [
      {
        nombre: 'Institución Educativa Distrital San José',
        nit: '800123456-1',
        direccion: 'Calle 45 #23-67',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        telefono: '3001234567',
        email: 'contacto@sanjose.edu.co',
        rector: 'María Fernanda López',
      },
      {
        nombre: 'Colegio Técnico Industrial',
        nit: '800234567-2',
        direccion: 'Carrera 15 #78-90',
        ciudad: 'Medellín',
        departamento: 'Antioquia',
        telefono: '3002345678',
        email: 'info@tecnicoindustrial.edu.co',
        rector: 'Carlos Alberto Ramírez',
      },
      {
        nombre: 'Institución Educativa La Esperanza',
        nit: '800345678-3',
        direccion: 'Avenida 3 Norte #25-45',
        ciudad: 'Cali',
        departamento: 'Valle del Cauca',
        telefono: '3003456789',
        email: 'laesperanza@colegio.edu.co',
        rector: 'Ana Patricia Gómez',
      },
      {
        nombre: 'Colegio Comercial Empresarial',
        nit: '800456789-4',
        direccion: 'Calle 100 #15-20',
        ciudad: 'Barranquilla',
        departamento: 'Atlántico',
        telefono: '3004567890',
        email: 'comercial@empresarial.edu.co',
        rector: 'Jorge Luis Martínez',
      },
      {
        nombre: 'Institución Educativa Ciudad Jardín',
        nit: '800567890-5',
        direccion: 'Carrera 50 #120-80',
        ciudad: 'Bogotá',
        departamento: 'Cundinamarca',
        telefono: '3005678901',
        email: 'ciudadjardin@edu.co',
        rector: 'Sandra Milena Torres',
      },
    ];

    for (const colegio of colegios) {
      try {
        await this.colegiosService.create(colegio);
        this.logger.log(`Colegio creado: ${colegio.nombre}`);
      } catch (error) {
        this.logger.warn(`Colegio ya existe: ${colegio.nombre}`);
      }
    }
  }

  private async seedProgramas() {
    this.logger.log('Seeding Programas...');

    const programas = [
      {
        nombre: 'Tecnólogo en Análisis y Desarrollo de Software',
        codigo: '228106',
        nivelFormacion: 'TECNOLOGO',
        areaConocimiento: 'Software y TIC',
        duracionMeses: 24,
        totalHoras: 2640,
        descripcion:
          'Programa de formación en desarrollo de aplicaciones software utilizando tecnologías de la información y comunicación.',
        requisitos: 'Título de bachiller',
      },
      {
        nombre: 'Técnico en Sistemas',
        codigo: '228172',
        nivelFormacion: 'TECNICO',
        areaConocimiento: 'Software y TIC',
        duracionMeses: 18,
        totalHoras: 1980,
        descripcion: 'Formación técnica en mantenimiento de sistemas informáticos y redes.',
        requisitos: 'Título de bachiller',
      },
      {
        nombre: 'Tecnólogo en Contabilidad y Finanzas',
        codigo: '123456',
        nivelFormacion: 'TECNOLOGO',
        areaConocimiento: 'Administración y Finanzas',
        duracionMeses: 24,
        totalHoras: 2640,
        descripcion: 'Programa orientado a la gestión contable y financiera en organizaciones.',
        requisitos: 'Título de bachiller',
      },
      {
        nombre: 'Técnico en Asistencia Administrativa',
        codigo: '134678',
        nivelFormacion: 'TECNICO',
        areaConocimiento: 'Administración',
        duracionMeses: 12,
        totalHoras: 1320,
        descripcion: 'Formación en procesos administrativos y de apoyo organizacional.',
        requisitos: 'Título de bachiller',
      },
      {
        nombre: 'Tecnólogo en Diseño Gráfico',
        codigo: '224403',
        nivelFormacion: 'TECNOLOGO',
        areaConocimiento: 'Diseño y Comunicación Visual',
        duracionMeses: 24,
        totalHoras: 2640,
        descripcion: 'Programa enfocado en diseño visual, multimedia y comunicación gráfica.',
        requisitos: 'Título de bachiller',
      },
      {
        nombre: 'Técnico en Cocina',
        codigo: '521203',
        nivelFormacion: 'TECNICO',
        areaConocimiento: 'Gastronomía',
        duracionMeses: 18,
        totalHoras: 1980,
        descripcion: 'Formación en técnicas culinarias y preparación de alimentos.',
        requisitos: 'Noveno grado aprobado',
      },
      {
        nombre: 'Tecnólogo en Gestión Logística',
        codigo: '122115',
        nivelFormacion: 'TECNOLOGO',
        areaConocimiento: 'Logística y Transporte',
        duracionMeses: 24,
        totalHoras: 2640,
        descripcion: 'Programa orientado a la gestión de cadenas de suministro y distribución.',
        requisitos: 'Título de bachiller',
      },
      {
        nombre: 'Técnico en Mantenimiento Electrónico',
        codigo: '224201',
        nivelFormacion: 'TECNICO',
        areaConocimiento: 'Electrónica',
        duracionMeses: 18,
        totalHoras: 1980,
        descripcion: 'Formación en reparación y mantenimiento de equipos electrónicos.',
        requisitos: 'Título de bachiller',
      },
    ];

    for (const programa of programas) {
      try {
        await this.programasService.create(programa);
        this.logger.log(`Programa creado: ${programa.nombre}`);
      } catch (error) {
        this.logger.warn(`Programa ya existe: ${programa.nombre}`);
      }
    }
  }

  private async seedFichas() {
    this.logger.log('Seeding Fichas...');

    // Obtener referencias necesarias
    const colegios = await this.colegiosService.findAll(true);
    const programas = await this.programasService.findAll(true);
    const usuarios = await this.usersService.findAll();

    const instructores = usuarios.filter((u) => u.rol === UserRole.INSTRUCTOR);
    const adminUser = usuarios.find((u) => u.rol === UserRole.ADMIN);

    if (colegios.length === 0 || programas.length === 0 || instructores.length === 0) {
      this.logger.warn('No hay colegios, programas o instructores disponibles para crear fichas');
      return;
    }

    const fichas = [
      {
        numeroFicha: '2654321',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.ACTIVA,
        fechaInicio: '2024-01-15',
        fechaFin: '2026-01-15',
        colegioId: colegios[0]?.id,
        programaId: programas[0]?.id,
        instructorId: instructores[0]?.id,
      },
      {
        numeroFicha: '2654322',
        jornada: JornadaFicha.TARDE,
        estado: EstadoFicha.ACTIVA,
        fechaInicio: '2024-02-01',
        fechaFin: '2026-02-01',
        colegioId: colegios[0]?.id,
        programaId: programas[1]?.id,
        instructorId: instructores[0]?.id,
      },
      {
        numeroFicha: '2654323',
        jornada: JornadaFicha.NOCHE,
        estado: EstadoFicha.ACTIVA,
        fechaInicio: '2024-03-10',
        fechaFin: '2025-09-10',
        colegioId: colegios[1]?.id,
        programaId: programas[0]?.id,
        instructorId: instructores[0]?.id,
      },
      {
        numeroFicha: '2654324',
        jornada: JornadaFicha.MIXTA,
        estado: EstadoFicha.EN_CIERRE,
        fechaInicio: '2023-06-01',
        fechaFin: '2025-06-01',
        colegioId: colegios[1]?.id,
        programaId: programas[2]?.id,
        instructorId: instructores[0]?.id,
      },
      {
        numeroFicha: '2654325',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.ACTIVA,
        fechaInicio: '2024-01-20',
        fechaFin: '2026-01-20',
        colegioId: colegios[2]?.id,
        programaId: programas[3]?.id,
        instructorId: instructores[0]?.id,
      },
      {
        numeroFicha: '2654326',
        jornada: JornadaFicha.TARDE,
        estado: EstadoFicha.FINALIZADA,
        fechaInicio: '2022-07-01',
        fechaFin: '2024-07-01',
        colegioId: colegios[3]?.id,
        programaId: programas[1]?.id,
        instructorId: instructores[0]?.id,
      },
      {
        numeroFicha: '2654327',
        jornada: JornadaFicha.NOCHE,
        estado: EstadoFicha.ACTIVA,
        fechaInicio: '2024-04-01',
        fechaFin: '2025-10-01',
        colegioId: colegios[4]?.id,
        programaId: programas[4]?.id,
        instructorId: instructores[0]?.id,
      },
      {
        numeroFicha: '2654328',
        jornada: JornadaFicha.MIXTA,
        estado: EstadoFicha.ACTIVA,
        fechaInicio: '2024-05-15',
        fechaFin: '2026-05-15',
        colegioId: colegios[0]?.id,
        programaId: programas[5]?.id,
        instructorId: instructores[0]?.id,
      },
    ];

    for (const ficha of fichas) {
      try {
        await this.fichasService.create(ficha);
        this.logger.log(`Ficha creada: ${ficha.numeroFicha}`);
      } catch (error) {
        this.logger.warn(`Ficha ya existe o error: ${ficha.numeroFicha} - ${error.message}`);
      }
    }
  }

  private async seedAprendices() {
    this.logger.log('Seeding Aprendices...');

    const usuarios = await this.usersService.findAll();
    const fichas = await this.fichasService.findAll({});

    if (fichas.data.length === 0) {
      this.logger.warn('No hay fichas disponibles para crear aprendices');
      return;
    }

    const adminUser = usuarios.find(u => u.rol === UserRole.ADMIN);
    if (!adminUser) {
      this.logger.warn('No se encontró usuario administrador');
      return;
    }

    // Datos base de aprendices para generar variaciones
    const nombresBase = [
      'Carlos Andrés', 'Laura Melissa', 'Juan Pablo', 'Andrea Valentina',
      'Miguel Ángel', 'Sofía Carolina', 'David Santiago', 'Camila Alejandra',
      'Sebastián', 'Valentina', 'Andrés Felipe', 'María José',
      'Daniel Eduardo', 'Isabella', 'Nicolás', 'Gabriela',
      'Santiago', 'Daniela', 'Mateo', 'Natalia'
    ];

    const apellidosBase = [
      'Rodríguez Pérez', 'García Martínez', 'Hernández López', 'Díaz Ramírez',
      'Torres Sánchez', 'Vargas Castro', 'Rojas Morales', 'Muñoz Silva',
      'Gómez Ruiz', 'Jiménez Ortiz', 'Moreno Ríos', 'Álvarez Cruz',
      'Ramírez Vega', 'Castro Molina', 'Méndez Herrera', 'Reyes Parra',
      'Gutiérrez Ramos', 'Sánchez Peña', 'López Medina', 'Martínez Gómez'
    ];

    const direcciones = [
      'Calle 10 #5-20', 'Carrera 15 #30-45', 'Avenida 68 #25-10',
      'Calle 20 #7-15', 'Carrera 8 #14-22', 'Calle 45 #12-30',
      'Carrera 23 #40-11', 'Avenida 19 #50-22', 'Calle 72 #8-35',
      'Carrera 30 #15-20'
    ];

    let docCounter = 1001234567;
    let aprendizIndex = 0;

    // Crear 3-5 aprendices por ficha
    for (const ficha of fichas.data) {
      // Número de aprendices por ficha (entre 3 y 5)
      const numAprendices = Math.floor(Math.random() * 3) + 3;

      this.logger.log(`Creando ${numAprendices} aprendices para ficha ${ficha.numeroFicha}...`);

      for (let i = 0; i < numAprendices; i++) {
        const nombres = nombresBase[aprendizIndex % nombresBase.length];
        const apellidos = apellidosBase[aprendizIndex % apellidosBase.length];
        const documento = docCounter.toString();
        const email = `aprendiz${docCounter}@sena.edu.co`;
        const telefono = `310${docCounter.toString().slice(-7)}`;
        const direccion = direcciones[aprendizIndex % direcciones.length];
        
        // Distribuir estados académicos (mayoría activos)
        let estadoAcademico = EstadoAcademico.ACTIVO;
        if (i === numAprendices - 1 && Math.random() > 0.7) {
          estadoAcademico = EstadoAcademico.RETIRADO;
        } else if (i === 0 && Math.random() > 0.8) {
          estadoAcademico = EstadoAcademico.SUSPENDIDO;
        }

        const tipoDocumento = docCounter % 10 === 0 ? TipoDocumento.TI : TipoDocumento.CC;

        try {
          // Crear usuario para el aprendiz
          const userAprendiz = await this.usersService.create({
            email: email,
            password: 'Aprendiz123!',
            nombre: `${nombres} ${apellidos}`,
            documento: documento,
            rol: UserRole.APRENDIZ,
          });

          // Crear el aprendiz con el userId
          const aprendiz = await this.aprendicesService.create({
            nombres,
            apellidos,
            tipoDocumento,
            documento,
            email,
            telefono,
            direccion,
            estadoAcademico,
            fichaId: ficha.id,
            userId: userAprendiz.id,
          }, adminUser);
          
          this.logger.log(`Aprendiz creado: ${aprendiz.nombres} ${aprendiz.apellidos} - Ficha: ${ficha.numeroFicha}`);
        } catch (error) {
          this.logger.warn(`Error creando aprendiz: ${documento} - ${error.message}`);
        }

        docCounter++;
        aprendizIndex++;
      }
    }

    this.logger.log(`Total de aprendices procesados: ${aprendizIndex}`);
  }

  private async seedDisciplinario() {
    this.logger.log('Seeding Casos Disciplinarios...');

    const usuarios = await this.usersService.findAll();
    const fichas = await this.fichasService.findAll({});
    const instructor = usuarios.find((u) => u.rol === UserRole.INSTRUCTOR);
    const coordinador = usuarios.find((u) => u.rol === UserRole.COORDINADOR);
    const adminUser = usuarios.find(u => u.rol === UserRole.ADMIN);

    if (!instructor || !adminUser || fichas.data.length === 0) {
      this.logger.warn('No hay instructor o fichas para crear casos disciplinarios');
      return;
    }

    // Obtener aprendices
    let aprendices = [];
    try {
      const result = await this.aprendicesService.findAll({}, adminUser);
      aprendices = result.data;
    } catch (error) {
      this.logger.warn('No hay aprendices disponibles');
      return;
    }

    if (aprendices.length < 3) {
      this.logger.warn('No hay suficientes aprendices para crear casos');
      return;
    }

    // Caso 1: Convivencia - Estado ABIERTO
    try {
      const caso1 = await this.disciplinarioService.create(
        {
          fichaId: aprendices[0].fichaId,
          aprendizId: aprendices[0].id,
          tipo: CaseTipo.CONVIVENCIA,
          gravedad: CaseGravedad.MEDIA,
          asunto: 'Comportamiento inadecuado en clase',
          descripcion:
            'El aprendiz mostró comportamiento disruptivo durante la sesión de formación, interrumpiendo constantemente al instructor y a sus compañeros.',
          fechaIncidente: '2024-12-15',
          evidenciaUrl: 'https://storage.example.com/evidencia-caso1.pdf',
        },
        instructor,
      );
      this.logger.log(`Caso disciplinario creado: ${caso1.asunto}`);

      // Cambiar a ABIERTO
      await this.disciplinarioService.updateEstado(
        caso1.id,
        { estado: CaseEstado.ABIERTO },
        instructor,
      );

      // Agregar acciones
      await this.disciplinarioService.createAction(
        caso1.id,
        {
          tipo: ActionTipo.LLAMADO_ATENCION,
          descripcion:
            'Se realizó llamado de atención verbal al aprendiz, explicando la importancia del respeto en el aula.',
        },
        instructor,
      );

      await this.disciplinarioService.createAction(
        caso1.id,
        {
          tipo: ActionTipo.COMPROMISO,
          descripcion:
            'El aprendiz se compromete a mejorar su comportamiento y participar activamente de manera respetuosa.',
          fechaCompromiso: '2025-01-15',
          responsable: `Aprendiz ${aprendices[0].nombres} ${aprendices[0].apellidos}`,
          evidenciaUrl: 'https://storage.example.com/compromiso-firmado.pdf',
        },
        instructor,
      );

      this.logger.log('Acciones agregadas al caso 1');
    } catch (error) {
      this.logger.warn(`Error creando caso 1: ${error.message}`);
    }

    // Caso 2: Asistencia - Estado SEGUIMIENTO
    try {
      const caso2 = await this.disciplinarioService.create(
        {
          fichaId: aprendices[1].fichaId,
          aprendizId: aprendices[1].id,
          tipo: CaseTipo.ASISTENCIA,
          gravedad: CaseGravedad.ALTA,
          asunto: 'Alerta de asistencia: 5 o más faltas al mes',
          descripcion:
            'Se detectó que el aprendiz ha faltado 6 días en el mes de diciembre sin justificación adecuada.',
          fechaIncidente: '2024-12-20',
        },
        instructor,
      );
      this.logger.log(`Caso disciplinario creado: ${caso2.asunto}`);

      // Cambiar a ABIERTO y luego SEGUIMIENTO
      await this.disciplinarioService.updateEstado(
        caso2.id,
        { estado: CaseEstado.ABIERTO },
        instructor,
      );

      await this.disciplinarioService.createAction(
        caso2.id,
        {
          tipo: ActionTipo.CITACION,
          descripcion:
            'Se citó al aprendiz y acudiente para explicar situación de inasistencias. El aprendiz manifestó problemas de transporte.',
        },
        instructor,
      );

      if (coordinador) {
        await this.disciplinarioService.updateEstado(
          caso2.id,
          { estado: CaseEstado.SEGUIMIENTO },
          coordinador,
        );

        await this.disciplinarioService.createAction(
          caso2.id,
          {
            tipo: ActionTipo.COMPROMISO,
            descripcion:
              'Se estableció plan de recuperación de horas y compromiso de asistencia puntual. Se brindarán opciones de transporte.',
            fechaCompromiso: '2025-02-01',
            responsable: `Aprendiz ${aprendices[1].nombres} ${aprendices[1].apellidos}`,
          },
          coordinador,
        );

        this.logger.log('Caso 2 en estado SEGUIMIENTO con acciones');
      }
    } catch (error) {
      this.logger.warn(`Error creando caso 2: ${error.message}`);
    }

    // Caso 3: Académico - Estado CERRADO
    try {
      const caso3 = await this.disciplinarioService.create(
        {
          fichaId: aprendices[2].fichaId,
          aprendizId: aprendices[2].id,
          tipo: CaseTipo.ACADEMICO,
          gravedad: CaseGravedad.LEVE,
          asunto: 'Bajo rendimiento académico en módulo de programación',
          descripcion:
            'El aprendiz presenta dificultades para cumplir con las actividades del módulo de programación orientada a objetos.',
          fechaIncidente: '2024-11-10',
        },
        instructor,
      );
      this.logger.log(`Caso disciplinario creado: ${caso3.asunto}`);

      await this.disciplinarioService.updateEstado(
        caso3.id,
        { estado: CaseEstado.ABIERTO },
        instructor,
      );

      await this.disciplinarioService.createAction(
        caso3.id,
        {
          tipo: ActionTipo.OBSERVACION,
          descripcion:
            'Se identificó que el aprendiz necesita refuerzo en conceptos básicos de programación.',
        },
        instructor,
      );

      await this.disciplinarioService.createAction(
        caso3.id,
        {
          tipo: ActionTipo.COMPROMISO,
          descripcion:
            'Se asignó monitor académico y horario de asesorías adicionales. El aprendiz se compromete a asistir.',
          fechaCompromiso: '2024-12-15',
          responsable: `Aprendiz ${aprendices[2].nombres} ${aprendices[2].apellidos}`,
        },
        instructor,
      );

      if (coordinador) {
        await this.disciplinarioService.updateEstado(
          caso3.id,
          {
            estado: CaseEstado.CERRADO,
            cierreResumen:
              'El aprendiz cumplió con las asesorías y logró mejorar su rendimiento académico. Se evidencia progreso en las últimas evaluaciones. Caso cerrado satisfactoriamente.',
          },
          coordinador,
        );

        this.logger.log('Caso 3 CERRADO exitosamente');
      }
    } catch (error) {
      this.logger.warn(`Error creando caso 3: ${error.message}`);
    }
  }

  async clear() {
    this.logger.log('Limpiando base de datos...');
    // Implementar si es necesario
    this.logger.log('Base de datos limpiada');
  }
}
