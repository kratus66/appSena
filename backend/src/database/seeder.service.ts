import { Injectable, Logger } from '@nestjs/common';
import { ColegiosService } from '../colegios/colegios.service';
import { ProgramasService } from '../programas/programas.service';
import { UsersService } from '../users/users.service';
import { FichasService } from '../fichas/fichas.service';
import { AprendicesService } from '../aprendices/aprendices.service';
import { DisciplinarioService } from '../disciplinario/disciplinario.service';
import { AmbientesService } from '../ambientes/ambientes.service';
import { EstadoAmbiente, TipoAmbiente } from '../ambientes/entities/ambiente.entity';
import { AgendaSeeder } from './agenda-seeder';
import { DependenciaInstructor, EstadoDisponibilidad, UserRole } from '../users/entities/user.entity';
import { DependenciaFicha, JornadaFicha, EstadoFicha, ModalidadArticulacion } from '../fichas/entities/ficha.entity';
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
    private readonly ambientesService: AmbientesService,
    private readonly agendaSeeder: AgendaSeeder,
  ) {}

  async seed() {
    this.logger.log('Iniciando seeders...');

    await this.seedUsers();
    await this.seedColegios();
    await this.seedProgramas();
    await this.seedFichas();
    await this.seedAmbientes();
    await this.seedAprendices();
    await this.agendaSeeder.seed();
    await this.seedDisciplinario();

    this.logger.log('Seeders completados exitosamente');
  }

  private async seedUsers() {
    this.logger.log('Seeding Users...');

    const users = [
      // ── Admin, Coordinador y Desarrollador ────────────────────────────────
      {
        nombre: 'Administrador del Sistema',
        email: 'admin@sena.edu.co',
        documento: '1234567890',
        telefono: '3001111111',
        password: 'Admin123!',
        rol: UserRole.ADMIN,
      },
      {
        nombre: 'María Coordinadora',
        email: 'coordinador@sena.edu.co',
        documento: '5555555555',
        telefono: '3003333333',
        password: 'Coordinador123!',
        rol: UserRole.COORDINADOR,
      },
      {
        nombre: 'Desarrollador AppSena',
        email: 'dev@sena.edu.co',
        documento: '9999999999',
        telefono: '3009999999',
        password: 'Dev123!',
        rol: UserRole.DESARROLLADOR,
      },
      // ── Instructores Titulada ────────────────────────────────────────────
      {
        nombre: 'Juan Carlos Herrera',
        email: 'instructor@sena.edu.co',
        documento: '9876543210',
        telefono: '3002222222',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Ingeniero de Sistemas',
        dependencia: DependenciaInstructor.TITULADA,
        area: 'Software y TIC',
        tipoPrograma: 'Tecnólogo',
        sede: 'Chapinero',
        localidad: 'Chapinero',
        fechaInicioContrato: '2022-01-15',
        fechaFinContrato: '2026-12-31',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      {
        nombre: 'Laura Milena Torres',
        email: 'laura.torres@sena.edu.co',
        documento: '1020304050',
        telefono: '3100044591',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Contadora Pública',
        dependencia: DependenciaInstructor.TITULADA,
        area: 'Administración y Finanzas',
        tipoPrograma: 'Tecnólogo',
        sede: 'Chapinero',
        localidad: 'Chapinero',
        fechaInicioContrato: '2021-06-01',
        fechaFinContrato: '2026-05-31',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      {
        nombre: 'Carlos Andrés Moreno',
        email: 'carlos.moreno@sena.edu.co',
        documento: '1020304051',
        telefono: '3100047515',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Ingeniero Industrial',
        dependencia: DependenciaInstructor.TITULADA,
        area: 'Logística y Transporte',
        tipoPrograma: 'Tecnólogo',
        sede: 'Chapinero',
        localidad: 'Usaquén',
        fechaInicioContrato: '2020-03-01',
        fechaFinContrato: '2025-02-28',
        estadoDisponibilidad: EstadoDisponibilidad.PARCIAL,
      },
      {
        nombre: 'Paola Andrea Gómez',
        email: 'paola.gomez@sena.edu.co',
        documento: '1020304052',
        telefono: '3100046053',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Diseñadora Gráfica',
        dependencia: DependenciaInstructor.TITULADA,
        area: 'Diseño y Comunicación Visual',
        tipoPrograma: 'Tecnólogo',
        sede: 'Chapinero',
        localidad: 'Teusaquillo',
        fechaInicioContrato: '2022-08-01',
        fechaFinContrato: '2027-07-31',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      {
        nombre: 'Andrés Felipe Vargas',
        email: 'andres.vargas@sena.edu.co',
        documento: '1020304053',
        telefono: '3100048977',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Chef Profesional',
        dependencia: DependenciaInstructor.TITULADA,
        area: 'Gastronomía',
        tipoPrograma: 'Técnico',
        sede: 'Chapinero',
        localidad: 'Fontibón',
        fechaInicioContrato: '2023-01-15',
        fechaFinContrato: '2025-12-31',
        estadoDisponibilidad: EstadoDisponibilidad.SATURADO,
      },
      {
        nombre: 'Ricardo Fabian Ruiz',
        email: 'ricardo.ruiz@sena.edu.co',
        documento: '1020304054',
        telefono: '3100049012',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Ingeniero Electrónico',
        dependencia: DependenciaInstructor.TITULADA,
        area: 'Electrónica',
        tipoPrograma: 'Técnico',
        sede: 'Chapinero',
        localidad: 'Kennedy',
        fechaInicioContrato: '2021-09-01',
        fechaFinContrato: '2026-08-31',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      {
        nombre: 'Felipe Ernesto Soto',
        email: 'felipe.soto@sena.edu.co',
        documento: '1020304055',
        telefono: '3100045210',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Administrador de Empresas',
        dependencia: DependenciaInstructor.TITULADA,
        area: 'Administración',
        tipoPrograma: 'Técnico',
        sede: 'Chapinero',
        localidad: 'Suba',
        fechaInicioContrato: '2022-04-01',
        fechaFinContrato: '2026-03-31',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      // ── Instructores Articulación ────────────────────────────────────────
      {
        nombre: 'Sandra Viviana Peña',
        email: 'sandra.pena@sena.edu.co',
        documento: '1020304056',
        telefono: '3110056781',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Licenciada en Matemáticas',
        dependencia: DependenciaInstructor.ARTICULACION,
        area: 'Matemáticas y Ciencias',
        tipoPrograma: 'Técnico',
        sede: 'Chapinero',
        localidad: 'Chapinero',
        colegioArticulacion: 'IED La Candelaria',
        modalidadArticulacion: 'Compartida',
        jornadaArticulacion: 'AM',
        fechaInicioContrato: '2023-02-01',
        fechaFinContrato: '2025-12-31',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      {
        nombre: 'Jorge Armando Díaz',
        email: 'jorge.diaz@sena.edu.co',
        documento: '1020304057',
        telefono: '3110067892',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Ingeniero de Sistemas',
        dependencia: DependenciaInstructor.ARTICULACION,
        area: 'Software y TIC',
        tipoPrograma: 'Técnico',
        sede: 'Chapinero',
        localidad: 'Santa Fe',
        colegioArticulacion: 'Colegio San Marcos',
        modalidadArticulacion: 'Unica',
        jornadaArticulacion: 'PM',
        fechaInicioContrato: '2022-07-01',
        fechaFinContrato: '2026-06-30',
        estadoDisponibilidad: EstadoDisponibilidad.PARCIAL,
      },
      {
        nombre: 'Claudia Patricia Rojas',
        email: 'claudia.rojas@sena.edu.co',
        documento: '1020304058',
        telefono: '3110078903',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Economista',
        dependencia: DependenciaInstructor.ARTICULACION,
        area: 'Administración y Finanzas',
        tipoPrograma: 'Técnico',
        sede: 'Chapinero',
        localidad: 'Barrios Unidos',
        colegioArticulacion: 'IED Simón Bolívar',
        modalidadArticulacion: 'Colegio privado',
        jornadaArticulacion: 'AM',
        fechaInicioContrato: '2021-03-01',
        fechaFinContrato: '2025-02-28',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      // ── Instructores Complementaria ──────────────────────────────────────
      {
        nombre: 'William Alexander Castro',
        email: 'william.castro@sena.edu.co',
        documento: '1020304059',
        telefono: '3120089014',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Psicólogo',
        dependencia: DependenciaInstructor.COMPLEMENTARIA,
        area: 'Habilidades Blandas',
        tipoPrograma: 'Complementario',
        sede: 'Chapinero',
        localidad: 'Chapinero',
        fechaInicioContrato: '2023-05-01',
        fechaFinContrato: '2025-04-30',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      {
        nombre: 'Mónica Isabel Serrano',
        email: 'monica.serrano@sena.edu.co',
        documento: '1020304060',
        telefono: '3120090125',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Comunicadora Social',
        dependencia: DependenciaInstructor.COMPLEMENTARIA,
        area: 'Comunicación',
        tipoPrograma: 'Complementario',
        sede: 'Chapinero',
        localidad: 'Usaquén',
        fechaInicioContrato: '2022-10-01',
        fechaFinContrato: '2026-09-30',
        estadoDisponibilidad: EstadoDisponibilidad.PARCIAL,
      },
      {
        nombre: 'Hernando José Medina',
        email: 'hernando.medina@sena.edu.co',
        documento: '1020304061',
        telefono: '3120091236',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Especialista en SST',
        dependencia: DependenciaInstructor.COMPLEMENTARIA,
        area: 'Salud y Seguridad',
        tipoPrograma: 'Complementario',
        sede: 'Chapinero',
        localidad: 'Puente Aranda',
        fechaInicioContrato: '2021-11-15',
        fechaFinContrato: '2025-11-14',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
      {
        nombre: 'Beatriz Elena García',
        email: 'beatriz.garcia@sena.edu.co',
        documento: '1020304062',
        telefono: '3120092347',
        password: 'Instructor123!',
        rol: UserRole.INSTRUCTOR,
        profesion: 'Ingeniera Ambiental',
        dependencia: DependenciaInstructor.COMPLEMENTARIA,
        area: 'Medio Ambiente',
        tipoPrograma: 'Complementario',
        sede: 'Chapinero',
        localidad: 'Bosa',
        fechaInicioContrato: '2023-01-01',
        fechaFinContrato: '2026-12-31',
        estadoDisponibilidad: EstadoDisponibilidad.DISPONIBLE,
      },
    ];

    for (const user of users) {
      try {
        await this.usersService.create(user as any);
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

    const colegios = await this.colegiosService.findAll(true);
    const programas = await this.programasService.findAll(true);
    const usuarios = await this.usersService.findAll();

    const instructores = usuarios.filter((u) => u.rol === UserRole.INSTRUCTOR);

    if (programas.length === 0 || instructores.length === 0) {
      this.logger.warn('No hay programas o instructores disponibles para crear fichas');
      return;
    }

    // Mapa: cada programa tiene su instructor correspondiente por área
    // programas[0] = ADS  → instructor Software (idx 0 = Juan Carlos)
    // programas[1] = T.Sistemas → instructor Software (idx 0)
    // programas[2] = Contabilidad → instructor Finanzas (idx 1 = Laura)
    // programas[3] = Asistencia Adm → instructor Adm (idx 6 = Felipe)
    // programas[4] = Diseño Gráfico → instructor Diseño (idx 3 = Paola)
    // programas[5] = Cocina → instructor Gastro (idx 4 = Andrés)
    // programas[6] = Logística → instructor Logística (idx 2 = Carlos)
    // programas[7] = Electrónica → instructor Electro (idx 5 = Ricardo)
    const findInstructor = (email: string) =>
      instructores.find((i) => i.email === email) ?? instructores[0];

    const instructorPorPrograma: Record<number, string> = {
      0: 'instructor@sena.edu.co',         // ADS → Juan Carlos
      1: 'instructor@sena.edu.co',         // Técnico Sistemas → Juan Carlos
      2: 'laura.torres@sena.edu.co',       // Contabilidad → Laura
      3: 'felipe.soto@sena.edu.co',        // Asistencia Adm → Felipe
      4: 'paola.gomez@sena.edu.co',        // Diseño Gráfico → Paola
      5: 'andres.vargas@sena.edu.co',      // Cocina → Andrés
      6: 'carlos.moreno@sena.edu.co',      // Logística → Carlos
      7: 'ricardo.ruiz@sena.edu.co',       // Electrónica → Ricardo
    };

    const fichas = [
      // ── TITULADA ─────────────────────────────────────────────────────────
      {
        numeroFicha: '2654321',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.TITULADA,
        tipoProgramaFormacion: 'Tecnólogo en ADSI',
        cupoEsperado: 30,
        sede: 'Chapinero',
        fechaInicio: '2024-01-15',
        fechaFin: '2026-01-15',
        colegioId: colegios[0]?.id,
        programaId: programas[0]?.id,
        instructorId: findInstructor(instructorPorPrograma[0]).id,
      },
      {
        numeroFicha: '2654322',
        jornada: JornadaFicha.TARDE,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.TITULADA,
        tipoProgramaFormacion: 'Técnico en Sistemas',
        cupoEsperado: 28,
        sede: 'Chapinero',
        fechaInicio: '2024-02-01',
        fechaFin: '2026-02-01',
        colegioId: colegios[0]?.id,
        programaId: programas[1]?.id,
        instructorId: findInstructor(instructorPorPrograma[1]).id,
      },
      {
        numeroFicha: '2654323',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.TITULADA,
        tipoProgramaFormacion: 'Tecnólogo en Contabilidad',
        cupoEsperado: 30,
        sede: 'Chapinero',
        fechaInicio: '2024-03-10',
        fechaFin: '2026-03-10',
        colegioId: colegios[1]?.id,
        programaId: programas[2]?.id,
        instructorId: findInstructor(instructorPorPrograma[2]).id,
      },
      {
        numeroFicha: '2654324',
        jornada: JornadaFicha.TARDE,
        estado: EstadoFicha.EN_CIERRE,
        dependencia: DependenciaFicha.TITULADA,
        tipoProgramaFormacion: 'Técnico en Asistencia Administrativa',
        cupoEsperado: 25,
        sede: 'Chapinero',
        fechaInicio: '2023-06-01',
        fechaFin: '2025-06-01',
        colegioId: colegios[1]?.id,
        programaId: programas[3]?.id,
        instructorId: findInstructor(instructorPorPrograma[3]).id,
      },
      {
        numeroFicha: '2654325',
        jornada: JornadaFicha.NOCHE,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.TITULADA,
        tipoProgramaFormacion: 'Tecnólogo en Diseño Gráfico',
        cupoEsperado: 22,
        sede: 'Chapinero',
        fechaInicio: '2024-01-20',
        fechaFin: '2026-01-20',
        colegioId: colegios[2]?.id,
        programaId: programas[4]?.id,
        instructorId: findInstructor(instructorPorPrograma[4]).id,
      },
      {
        numeroFicha: '2654326',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.FINALIZADA,
        dependencia: DependenciaFicha.TITULADA,
        tipoProgramaFormacion: 'Técnico en Cocina',
        cupoEsperado: 20,
        sede: 'Chapinero',
        fechaInicio: '2022-07-01',
        fechaFin: '2024-07-01',
        colegioId: colegios[3]?.id,
        programaId: programas[5]?.id,
        instructorId: findInstructor(instructorPorPrograma[5]).id,
      },
      {
        numeroFicha: '2654327',
        jornada: JornadaFicha.TARDE,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.TITULADA,
        tipoProgramaFormacion: 'Tecnólogo en Gestión Logística',
        cupoEsperado: 30,
        sede: 'Chapinero',
        fechaInicio: '2024-04-01',
        fechaFin: '2026-04-01',
        colegioId: colegios[4]?.id,
        programaId: programas[6]?.id,
        instructorId: findInstructor(instructorPorPrograma[6]).id,
      },
      {
        numeroFicha: '2654328',
        jornada: JornadaFicha.NOCHE,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.TITULADA,
        tipoProgramaFormacion: 'Técnico en Mantenimiento Electrónico',
        cupoEsperado: 24,
        sede: 'Chapinero',
        fechaInicio: '2024-05-15',
        fechaFin: '2026-05-15',
        colegioId: colegios[0]?.id,
        programaId: programas[7]?.id,
        instructorId: findInstructor(instructorPorPrograma[7]).id,
      },
      // ── ARTICULACIÓN ─────────────────────────────────────────────────────
      {
        numeroFicha: '3011000',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.ARTICULACION,
        tipoProgramaFormacion: 'Técnico en Sistemas',
        cupoEsperado: 35,
        modalidadArticulacion: ModalidadArticulacion.COMPARTIDA,
        localidad: 'Chapinero',
        ambiente: 'Aula 201',
        fechaInicio: '2024-02-05',
        fechaFin: '2025-11-30',
        colegioId: colegios[0]?.id,
        programaId: programas[1]?.id,
        instructorId: findInstructor('sandra.pena@sena.edu.co').id,
      },
      {
        numeroFicha: '3011001',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.ARTICULACION,
        tipoProgramaFormacion: 'Técnico en Sistemas',
        cupoEsperado: 35,
        modalidadArticulacion: ModalidadArticulacion.UNICA,
        localidad: 'Santa Fe',
        ambiente: 'Lab Informática',
        fechaInicio: '2024-02-05',
        fechaFin: '2025-11-30',
        colegioId: colegios[1]?.id,
        programaId: programas[1]?.id,
        instructorId: findInstructor('jorge.diaz@sena.edu.co').id,
      },
      {
        numeroFicha: '3011002',
        jornada: JornadaFicha.TARDE,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.ARTICULACION,
        tipoProgramaFormacion: 'Técnico en Asistencia Administrativa',
        cupoEsperado: 30,
        modalidadArticulacion: ModalidadArticulacion.COLEGIO_PRIVADO,
        localidad: 'Barrios Unidos',
        ambiente: 'Aula 105',
        fechaInicio: '2024-03-01',
        fechaFin: '2025-12-15',
        colegioId: colegios[2]?.id,
        programaId: programas[3]?.id,
        instructorId: findInstructor('claudia.rojas@sena.edu.co').id,
      },
      {
        numeroFicha: '3011003',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.ARTICULACION,
        tipoProgramaFormacion: 'Técnico en Asistencia Administrativa',
        cupoEsperado: 28,
        modalidadArticulacion: ModalidadArticulacion.COMPARTIDA,
        localidad: 'Chapinero',
        fechaInicio: '2024-02-15',
        fechaFin: '2025-11-15',
        colegioId: colegios[3]?.id,
        programaId: programas[3]?.id,
        instructorId: findInstructor('jorge.diaz@sena.edu.co').id,
      },
      // ── COMPLEMENTARIA ───────────────────────────────────────────────────
      {
        numeroFicha: '4020001',
        jornada: JornadaFicha.TARDE,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.COMPLEMENTARIA,
        tipoProgramaFormacion: 'Habilidades para la Vida',
        cupoEsperado: 40,
        sede: 'Chapinero',
        ambiente: 'Auditorio',
        fechaInicio: '2024-06-01',
        fechaFin: '2025-05-31',
        programaId: programas[3]?.id,
        instructorId: findInstructor('william.castro@sena.edu.co').id,
      },
      {
        numeroFicha: '4020002',
        jornada: JornadaFicha.MAÑANA,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.COMPLEMENTARIA,
        tipoProgramaFormacion: 'Comunicación Asertiva',
        cupoEsperado: 35,
        sede: 'Chapinero',
        fechaInicio: '2024-07-01',
        fechaFin: '2025-06-30',
        programaId: programas[3]?.id,
        instructorId: findInstructor('monica.serrano@sena.edu.co').id,
      },
      {
        numeroFicha: '4020003',
        jornada: JornadaFicha.TARDE,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.COMPLEMENTARIA,
        tipoProgramaFormacion: 'Seguridad y Salud en el Trabajo',
        cupoEsperado: 45,
        sede: 'Chapinero',
        ambiente: 'Aula 301',
        fechaInicio: '2024-08-01',
        fechaFin: '2025-07-31',
        programaId: programas[0]?.id,
        instructorId: findInstructor('hernando.medina@sena.edu.co').id,
      },
      {
        numeroFicha: '4020004',
        jornada: JornadaFicha.NOCHE,
        estado: EstadoFicha.ACTIVA,
        dependencia: DependenciaFicha.COMPLEMENTARIA,
        tipoProgramaFormacion: 'Gestión Ambiental Empresarial',
        cupoEsperado: 30,
        sede: 'Chapinero',
        fechaInicio: '2024-09-01',
        fechaFin: '2025-08-31',
        programaId: programas[6]?.id,
        instructorId: findInstructor('beatriz.garcia@sena.edu.co').id,
      },
    ];

    for (const ficha of fichas) {
      try {
        await this.fichasService.create(ficha as any);
        this.logger.log(`Ficha creada: ${ficha.numeroFicha}`);
      } catch (error) {
        this.logger.warn(`Ficha ya existe o error: ${(ficha as any).numeroFicha} - ${error.message}`);
      }
    }
  }

  private async seedAmbientes() {
    this.logger.log('Seeding Ambientes...');

    const adminUsers = await this.usersService.findAll();
    const admin = adminUsers.find(u => u.rol === UserRole.ADMIN);
    if (!admin) { this.logger.warn('No se encontró admin para seedAmbientes'); return; }

    const ambientes = [
      // ── Sede Chapinero ─────────────────────────────────────────────────
      { nombre: 'Sala 4', sede: 'Chapinero', capacidad: 30, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Proyector' },
      { nombre: 'Sala 5', sede: 'Chapinero', capacidad: 30, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Tablero digital' },
      { nombre: 'Laboratorio 2', sede: 'Chapinero', capacidad: 28, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Router, Switch' },
      { nombre: 'Laboratorio 3', sede: 'Chapinero', capacidad: 25, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Impresoras' },
      { nombre: 'Sala TIC 1', sede: 'Chapinero', capacidad: 30, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Proyector, Internet' },
      { nombre: 'Ambiente B-12', sede: 'Chapinero', capacidad: 24, tipo: TipoAmbiente.COMPLEMENTARIA, equipamiento: 'Sillas, Tablero' },
      { nombre: 'Ambiente C-08', sede: 'Chapinero', capacidad: 25, tipo: TipoAmbiente.COMPLEMENTARIA, equipamiento: 'Sillas, Videobeam' },
      { nombre: 'Aula 101', sede: 'Chapinero', capacidad: 35, tipo: TipoAmbiente.COMPLEMENTARIA, equipamiento: 'Tablero, Sillas universitarias' },
      // ── Sede Corferias ─────────────────────────────────────────────────
      { nombre: 'Sala 2', sede: 'Corferias', capacidad: 30, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Proyector' },
      { nombre: 'Sala 3', sede: 'Corferias', capacidad: 30, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Tablero digital' },
      { nombre: 'Laboratorio 6', sede: 'Corferias', capacidad: 28, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Servidores' },
      { nombre: 'Sala TIC 3', sede: 'Corferias', capacidad: 30, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Internet fibra' },
      { nombre: 'Ambiente F-03', sede: 'Corferias', capacidad: 24, tipo: TipoAmbiente.COMPLEMENTARIA, equipamiento: 'Sillas, Tablero' },
      { nombre: 'Ambiente G-09', sede: 'Corferias', capacidad: 25, tipo: TipoAmbiente.COMPLEMENTARIA, equipamiento: 'Mesas, Sillas, Videobeam' },
      // ── Sede Kennedy ───────────────────────────────────────────────────
      { nombre: 'Aula 201', sede: 'Kennedy', capacidad: 32, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Proyector' },
      { nombre: 'Aula 202', sede: 'Kennedy', capacidad: 32, tipo: TipoAmbiente.TITULADA, equipamiento: 'Computadores, Tablero' },
      { nombre: 'Lab Electrónica 1', sede: 'Kennedy', capacidad: 20, tipo: TipoAmbiente.TITULADA, equipamiento: 'Osciloscopios, Multímetros, Fuentes de poder' },
      { nombre: 'Ambiente K-05', sede: 'Kennedy', capacidad: 22, tipo: TipoAmbiente.COMPLEMENTARIA, equipamiento: 'Sillas, Tablero acrílico' },
      { nombre: 'Ambiente K-06', sede: 'Kennedy', capacidad: 28, tipo: TipoAmbiente.COMPLEMENTARIA, equipamiento: 'Mesas grupales, Videobeam' },
      { nombre: 'Sala de Diseño', sede: 'Kennedy', capacidad: 25, tipo: TipoAmbiente.TITULADA, equipamiento: 'iMac, Tabletas gráficas, Impresora laser' },
    ];

    for (const amb of ambientes) {
      try {
        await this.ambientesService.create(
          { ...amb, estado: EstadoAmbiente.ACTIVO },
          admin,
        );
        this.logger.log(`Ambiente creado: ${amb.nombre} (${amb.sede})`);
      } catch (error) {
        this.logger.warn(`Ambiente ya existe o error: ${amb.nombre} - ${error.message}`);
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
