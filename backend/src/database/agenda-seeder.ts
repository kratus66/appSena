import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEvent, EventType, EventStatus, EventPriority } from '../agenda/entities/calendar-event.entity';
import { Reminder, ReminderChannel, ReminderStatus } from '../agenda/entities/reminder.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Ficha } from '../fichas/entities/ficha.entity';
import { Aprendiz } from '../aprendices/entities/aprendiz.entity';

@Injectable()
export class AgendaSeeder {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventRepository: Repository<CalendarEvent>,
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Ficha)
    private readonly fichaRepository: Repository<Ficha>,
    @InjectRepository(Aprendiz)
    private readonly aprendizRepository: Repository<Aprendiz>,
  ) {}

  async seed() {
    console.log('🌱 Seeding Agenda data...');

    // Buscar usuarios, fichas y aprendices existentes
    const instructor = await this.userRepository.findOne({
      where: { rol: UserRole.INSTRUCTOR },
    });

    if (!instructor) {
      console.log('⚠️ No se encontró instructor, saltando seed de agenda');
      return;
    }

    const ficha = await this.fichaRepository.findOne({
      where: { instructorId: instructor.id },
    });

    if (!ficha) {
      console.log('⚠️ No se encontró ficha para el instructor, saltando seed de agenda');
      return;
    }

    const aprendiz = await this.aprendizRepository.findOne({
      where: { fichaId: ficha.id },
    });

    // Limpiar datos anteriores
    await this.reminderRepository.delete({});
    await this.eventRepository.delete({});

    // Crear eventos de prueba
    const now = new Date();
    const hoyMas2Horas = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const hoyMas3Horas = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const manana = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const manana2pm = new Date(manana);
    manana2pm.setHours(14, 0, 0, 0);
    const manana3pm = new Date(manana);
    manana3pm.setHours(15, 0, 0, 0);

    const proxSemana = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    proxSemana.setHours(10, 0, 0, 0);
    const proxSemanaFin = new Date(proxSemana);
    proxSemanaFin.setHours(11, 0, 0, 0);

    // Evento 1: Reunión de seguimiento (hoy)
    const evento1 = this.eventRepository.create({
      titulo: 'Reunión de seguimiento académico',
      descripcion: 'Revisión del rendimiento académico del primer trimestre',
      tipo: EventType.REUNION,
      fechaInicio: hoyMas2Horas,
      fechaFin: hoyMas3Horas,
      allDay: false,
      estado: EventStatus.PROGRAMADO,
      prioridad: EventPriority.ALTA,
      fichaId: ficha.id,
      aprendizId: aprendiz?.id,
      createdByUserId: instructor.id,
      assignedToId: instructor.id,
    });

    const savedEvento1 = await this.eventRepository.save(evento1);

    // Recordatorio para evento 1 (15 minutos antes)
    const recordatorio1 = this.reminderRepository.create({
      eventId: savedEvento1.id,
      remindAt: new Date(hoyMas2Horas.getTime() - 15 * 60 * 1000),
      canal: ReminderChannel.IN_APP,
      estado: ReminderStatus.PENDIENTE,
      mensaje: 'Recuerda tu reunión de seguimiento en 15 minutos',
    });

    await this.reminderRepository.save(recordatorio1);

    // Evento 2: Clase programada (mañana)
    const evento2 = this.eventRepository.create({
      titulo: 'Clase: Introducción a TypeScript',
      descripcion: 'Primera sesión del módulo de programación avanzada',
      tipo: EventType.CLASE,
      fechaInicio: manana2pm,
      fechaFin: manana3pm,
      allDay: false,
      estado: EventStatus.PROGRAMADO,
      prioridad: EventPriority.MEDIA,
      fichaId: ficha.id,
      createdByUserId: instructor.id,
    });

    const savedEvento2 = await this.eventRepository.save(evento2);

    // 2 Recordatorios para evento 2
    const recordatorio2a = this.reminderRepository.create({
      eventId: savedEvento2.id,
      remindAt: new Date(manana2pm.getTime() - 24 * 60 * 60 * 1000), // 1 día antes
      canal: ReminderChannel.IN_APP,
      estado: ReminderStatus.PENDIENTE,
      mensaje: 'Mañana tienes clase de TypeScript a las 14:00',
    });

    const recordatorio2b = this.reminderRepository.create({
      eventId: savedEvento2.id,
      remindAt: new Date(manana2pm.getTime() - 30 * 60 * 1000), // 30 min antes
      canal: ReminderChannel.IN_APP,
      estado: ReminderStatus.PENDIENTE,
      mensaje: 'Tu clase empieza en 30 minutos',
    });

    await this.reminderRepository.save([recordatorio2a, recordatorio2b]);

    // Evento 3: Citación (próxima semana)
    const evento3 = this.eventRepository.create({
      titulo: 'Citación con acudiente',
      descripcion: aprendiz
        ? `Reunión con acudiente de ${aprendiz.nombres} ${aprendiz.apellidos} para tratar tema académico`
        : 'Reunión con acudiente',
      tipo: EventType.CITACION,
      fechaInicio: proxSemana,
      fechaFin: proxSemanaFin,
      allDay: false,
      estado: EventStatus.PROGRAMADO,
      prioridad: EventPriority.ALTA,
      fichaId: ficha.id,
      aprendizId: aprendiz?.id,
      createdByUserId: instructor.id,
    });

    await this.eventRepository.save(evento3);

    console.log('✅ Agenda seeded: 3 eventos y 3 recordatorios creados');
  }
}
