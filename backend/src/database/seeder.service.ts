import { Injectable, Logger } from '@nestjs/common';
import { ColegiosService } from '../colegios/colegios.service';
import { ProgramasService } from '../programas/programas.service';
import { UsersService } from '../users/users.service';
import { FichasService } from '../fichas/fichas.service';
import { UserRole } from '../users/entities/user.entity';
import { JornadaFicha, EstadoFicha } from '../fichas/entities/ficha.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly colegiosService: ColegiosService,
    private readonly programasService: ProgramasService,
    private readonly usersService: UsersService,
    private readonly fichasService: FichasService,
  ) {}

  async seed() {
    this.logger.log('Iniciando seeders...');

    await this.seedUsers();
    await this.seedColegios();
    await this.seedProgramas();
    await this.seedFichas();

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

  async clear() {
    this.logger.log('Limpiando base de datos...');
    // Implementar si es necesario
    this.logger.log('Base de datos limpiada');
  }
}
