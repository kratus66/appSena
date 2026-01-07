import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { User } from '../users/entities/user.entity';

interface CreateNotificationData {
  userId: string;
  titulo: string;
  mensaje: string;
  tipo: NotificationType;
  entityType?: string;
  entityId?: string;
}

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async findAll(queryDto: QueryNotificationsDto, user: User) {
    const { read, page, limit } = queryDto;

    const skip = (page - 1) * limit;

    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId: user.id });

    if (read !== undefined) {
      qb.andWhere('notification.read = :read', { read });
    }

    const [notifications, total] = await qb
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount: read === undefined ? await this.getUnreadCount(user.id) : undefined,
    };
  }

  async findOne(id: string, user: User): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId: user.id },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return notification;
  }

  async markAsRead(id: string, user: User): Promise<Notification> {
    const notification = await this.findOne(id, user);

    if (notification.read) {
      return notification;
    }

    notification.read = true;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(user: User): Promise<{ affected: number }> {
    const result = await this.notificationRepository.update(
      { userId: user.id, read: false },
      { read: true, readAt: new Date() },
    );

    return { affected: result.affected || 0 };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, read: false },
    });
  }
}
