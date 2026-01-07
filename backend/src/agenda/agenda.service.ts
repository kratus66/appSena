import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, IsNull } from 'typeorm';
import { CalendarEvent, EventStatus } from './entities/calendar-event.entity';
import { Reminder, ReminderStatus, ReminderChannel } from './entities/reminder.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventEstadoDto } from './dto/update-event-estado.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { FichasService } from '../fichas/fichas.service';
import { AprendicesService } from '../aprendices/aprendices.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { NotificationType } from '../notificaciones/entities/notification.entity';

@Injectable()
export class AgendaService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventRepository: Repository<CalendarEvent>,
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    private readonly fichasService: FichasService,
    private readonly aprendicesService: AprendicesService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  // ==================== EVENTOS ====================

  async createEvent(createEventDto: CreateEventDto, user: User): Promise<CalendarEvent> {
    // Validar fechas
    const fechaInicio = new Date(createEventDto.fechaInicio);
    if (createEventDto.fechaFin) {
      const fechaFin = new Date(createEventDto.fechaFin);
      if (fechaFin < fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    // Validar permisos según ficha
    if (createEventDto.fichaId) {
      await this.validateFichaPermission(createEventDto.fichaId, user);
    }

    // Validar que aprendiz pertenece a la ficha (si ambos vienen)
    if (createEventDto.aprendizId && createEventDto.fichaId) {
      const aprendiz = await this.aprendicesService.findOne(createEventDto.aprendizId, user.id);
      if (aprendiz.fichaId !== createEventDto.fichaId) {
        throw new BadRequestException('El aprendiz no pertenece a la ficha especificada');
      }
    }

    // Si solo viene aprendiz, derivar la ficha
    if (createEventDto.aprendizId && !createEventDto.fichaId) {
      const aprendiz = await this.aprendicesService.findOne(createEventDto.aprendizId, user.id);
      createEventDto.fichaId = aprendiz.fichaId;
      await this.validateFichaPermission(createEventDto.fichaId, user);
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      fechaInicio,
      fechaFin: createEventDto.fechaFin ? new Date(createEventDto.fechaFin) : null,
      createdByUserId: user.id,
      estado: createEventDto.estado || EventStatus.PROGRAMADO,
    });

    const savedEvent = await this.eventRepository.save(event);

    // Crear notificación si hay usuario asignado
    if (savedEvent.assignedToId && savedEvent.assignedToId !== user.id) {
      await this.notificacionesService.create({
        userId: savedEvent.assignedToId,
        titulo: `Nuevo evento asignado: ${savedEvent.titulo}`,
        mensaje: `Se te ha asignado un evento de tipo ${savedEvent.tipo} programado para ${this.formatDate(savedEvent.fechaInicio)}`,
        tipo: NotificationType.EVENTO_CREADO,
        entityType: 'CalendarEvent',
        entityId: savedEvent.id,
      });
    }

    return savedEvent;
  }

  async findAll(queryDto: QueryEventsDto, user: User) {
    const { desde, hasta, fichaId, aprendizId, tipo, estado, search, page, limit } = queryDto;

    const skip = (page - 1) * limit;

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.ficha', 'ficha')
      .leftJoinAndSelect('event.aprendiz', 'aprendiz')
      .leftJoinAndSelect('event.createdByUser', 'createdByUser')
      .leftJoinAndSelect('event.assignedTo', 'assignedTo');

    // Filtro por rango de fechas
    qb.where('event.fechaInicio BETWEEN :desde AND :hasta', {
      desde: new Date(desde),
      hasta: new Date(hasta),
    });

    // Permisos: INSTRUCTOR solo ve eventos de sus fichas o creados por él
    if (user.rol === UserRole.INSTRUCTOR) {
      qb.andWhere(
        '(ficha.instructorId = :userId OR event.createdByUserId = :userId OR event.assignedToId = :userId)',
        { userId: user.id },
      );
    }

    // Filtros opcionales
    if (fichaId) {
      qb.andWhere('event.fichaId = :fichaId', { fichaId });
    }

    if (aprendizId) {
      qb.andWhere('event.aprendizId = :aprendizId', { aprendizId });
    }

    if (tipo) {
      qb.andWhere('event.tipo = :tipo', { tipo });
    }

    if (estado) {
      qb.andWhere('event.estado = :estado', { estado });
    }

    if (search) {
      qb.andWhere('(event.titulo ILIKE :search OR event.descripcion ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [eventos, total] = await qb
      .orderBy('event.fechaInicio', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: eventos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMyEvents(queryDto: QueryEventsDto, user: User) {
    const { desde, hasta, tipo, estado, page, limit } = queryDto;

    const skip = (page - 1) * limit;

    const qb = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.ficha', 'ficha')
      .leftJoinAndSelect('event.aprendiz', 'aprendiz')
      .leftJoinAndSelect('event.createdByUser', 'createdByUser')
      .leftJoinAndSelect('event.assignedTo', 'assignedTo')
      .where('event.fechaInicio BETWEEN :desde AND :hasta', {
        desde: new Date(desde),
        hasta: new Date(hasta),
      })
      .andWhere('(event.createdByUserId = :userId OR event.assignedToId = :userId)', {
        userId: user.id,
      });

    if (tipo) {
      qb.andWhere('event.tipo = :tipo', { tipo });
    }

    if (estado) {
      qb.andWhere('event.estado = :estado', { estado });
    }

    const [eventos, total] = await qb
      .orderBy('event.fechaInicio', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: eventos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: User): Promise<CalendarEvent> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: [
        'ficha',
        'ficha.instructor',
        'aprendiz',
        'createdByUser',
        'assignedTo',
        'recordatorios',
      ],
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    await this.validateEventPermission(event, user);

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, user: User): Promise<CalendarEvent> {
    const event = await this.findOne(id, user);

    // Validar fechas si se actualizan
    if (updateEventDto.fechaInicio || updateEventDto.fechaFin) {
      const fechaInicio = updateEventDto.fechaInicio
        ? new Date(updateEventDto.fechaInicio)
        : event.fechaInicio;
      const fechaFin = updateEventDto.fechaFin
        ? new Date(updateEventDto.fechaFin)
        : event.fechaFin;

      if (fechaFin && fechaFin < fechaInicio) {
        throw new BadRequestException('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    }

    Object.assign(event, updateEventDto);

    if (updateEventDto.fechaInicio) {
      event.fechaInicio = new Date(updateEventDto.fechaInicio);
    }

    if (updateEventDto.fechaFin) {
      event.fechaFin = new Date(updateEventDto.fechaFin);
    }

    const updated = await this.eventRepository.save(event);

    // Notificar a usuario asignado si cambió
    if (
      updateEventDto.assignedToId &&
      updateEventDto.assignedToId !== event.assignedToId &&
      updateEventDto.assignedToId !== user.id
    ) {
      await this.notificacionesService.create({
        userId: updateEventDto.assignedToId,
        titulo: `Evento actualizado: ${updated.titulo}`,
        mensaje: `El evento ha sido actualizado`,
        tipo: NotificationType.EVENTO_ACTUALIZADO,
        entityType: 'CalendarEvent',
        entityId: updated.id,
      });
    }

    return updated;
  }

  async updateEstado(
    id: string,
    updateEstadoDto: UpdateEventEstadoDto,
    user: User,
  ): Promise<CalendarEvent> {
    const event = await this.findOne(id, user);

    event.estado = updateEstadoDto.estado;

    // Si se cancela, cancelar recordatorios pendientes
    if (updateEstadoDto.estado === EventStatus.CANCELADO) {
      await this.reminderRepository.update(
        { eventId: id, estado: ReminderStatus.PENDIENTE },
        { estado: ReminderStatus.CANCELADO },
      );

      // Notificar cancelación
      if (event.assignedToId && event.assignedToId !== user.id) {
        await this.notificacionesService.create({
          userId: event.assignedToId,
          titulo: `Evento cancelado: ${event.titulo}`,
          mensaje: `El evento programado para ${this.formatDate(event.fechaInicio)} ha sido cancelado`,
          tipo: NotificationType.EVENTO_CANCELADO,
          entityType: 'CalendarEvent',
          entityId: event.id,
        });
      }
    }

    return this.eventRepository.save(event);
  }

  // ==================== RECORDATORIOS ====================

  async createReminder(eventId: string, createReminderDto: CreateReminderDto, user: User) {
    const event = await this.findOne(eventId, user);

    const remindAt = new Date(createReminderDto.remindAt);

    // Validar que remindAt <= fechaInicio
    if (remindAt > event.fechaInicio) {
      throw new BadRequestException(
        'La fecha del recordatorio debe ser anterior o igual a la fecha del evento',
      );
    }

    const reminder = this.reminderRepository.create({
      eventId,
      remindAt,
      canal: createReminderDto.canal || ReminderChannel.IN_APP,
      mensaje: createReminderDto.mensaje,
    });

    return this.reminderRepository.save(reminder);
  }

  async findEventReminders(eventId: string, user: User) {
    await this.findOne(eventId, user); // Valida permisos

    return this.reminderRepository.find({
      where: { eventId },
      order: { remindAt: 'ASC' },
    });
  }

  async cancelReminder(id: string, user: User) {
    const reminder = await this.reminderRepository.findOne({
      where: { id },
      relations: ['event'],
    });

    if (!reminder) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    await this.validateEventPermission(reminder.event, user);

    reminder.estado = ReminderStatus.CANCELADO;
    return this.reminderRepository.save(reminder);
  }

  async markReminderAsSent(id: string, user: User) {
    const reminder = await this.reminderRepository.findOne({
      where: { id },
      relations: ['event', 'event.assignedTo', 'event.createdByUser'],
    });

    if (!reminder) {
      throw new NotFoundException('Recordatorio no encontrado');
    }

    if (reminder.estado === ReminderStatus.ENVIADO) {
      throw new BadRequestException('El recordatorio ya fue enviado');
    }

    reminder.estado = ReminderStatus.ENVIADO;
    reminder.sentAt = new Date();

    const updated = await this.reminderRepository.save(reminder);

    // Crear notificación para el usuario destinatario
    const targetUserId = reminder.event.assignedToId || reminder.event.createdByUserId;

    await this.notificacionesService.create({
      userId: targetUserId,
      titulo: `Recordatorio: ${reminder.event.titulo}`,
      mensaje:
        reminder.mensaje ||
        `Tienes un evento de tipo ${reminder.event.tipo} programado para ${this.formatDate(reminder.event.fechaInicio)}`,
      tipo: NotificationType.RECORDATORIO,
      entityType: 'CalendarEvent',
      entityId: reminder.event.id,
    });

    return updated;
  }

  // ==================== HELPERS ====================

  private async validateFichaPermission(fichaId: string, user: User) {
    if (user.rol === UserRole.ADMIN) {
      return; // Admin tiene acceso total
    }

    const ficha = await this.fichasService.findOne(fichaId);

    if (user.rol === UserRole.INSTRUCTOR && ficha.instructorId !== user.id) {
      throw new ForbiddenException('No tienes permisos para crear eventos en esta ficha');
    }

    // COORDINADOR: puede crear en fichas de su colegio (si existe esa lógica)
    // Por ahora permitimos
  }

  private async validateEventPermission(event: CalendarEvent, user: User) {
    if (user.rol === UserRole.ADMIN) {
      return;
    }

    const isOwner = event.createdByUserId === user.id;
    const isAssigned = event.assignedToId === user.id;
    const isInstructor = event.ficha?.instructorId === user.id;

    if (!isOwner && !isAssigned && !isInstructor) {
      throw new ForbiddenException('No tienes permisos para acceder a este evento');
    }
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }
}
