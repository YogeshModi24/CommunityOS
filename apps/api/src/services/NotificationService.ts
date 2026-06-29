import { DomainEvent, NotificationCreatedV1Payload, NotificationDeletedV1Payload,NotificationReadV1Payload } from '@community-os/events';
import { IMetrics } from '@community-os/logger';
import { INotificationRepository } from '@community-os/repositories';
import {
  Notification,
} from '@community-os/types';
import { Result } from '@community-os/utils';

import { logger } from '../lib/logger';
import { IEventBus } from './contracts/IEventBus';
import { INotificationService } from './contracts/INotificationService';

export class NotificationService implements INotificationService {
  constructor(
    private notificationRepository: INotificationRepository,
    private eventBus: IEventBus,
    private metrics: IMetrics
  ) {}

  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    issueId?: string,
    metadata?: Record<string, any>
  ): Promise<Result<Notification, string>> {
    try {
      const notification = await this.notificationRepository.create({
        userId,
        title,
        message,
        type,
        issueId,
        metadata,
        read: false,
      });

      this.metrics.increment('notification.created');

      logger.info(
        `[NotificationCreated] persistent notification ${notification.id} created for user ${userId}`,
        {
          event: 'NotificationCreated',
          notificationId: notification.id,
          userId,
          type,
        }
      );

      const event: DomainEvent<NotificationCreatedV1Payload> = {
        type: 'NotificationCreated',
        occurredAt: new Date(),
        payload: {
          notificationId: notification.id,
          userId,
          title,
          message,
          type,
          issueId,
        },
      };
      this.eventBus.publish(event);

      return Result.ok(notification);
    } catch (err: any) {
      this.metrics.increment('notification.delivery.failed');
      logger.error(
        `[NotificationDeliveryFailed] failed to create notification for user ${userId}`,
        err,
        {
          event: 'NotificationDeliveryFailed',
          userId,
        }
      );
      return Result.fail(err.message || 'Failed to create notification');
    }
  }

  async markAsRead(id: string, userId: string): Promise<Result<Notification, string>> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      return Result.fail('Notification not found');
    }

    if (notification.userId !== userId) {
      return Result.fail('Unauthorized to access this notification');
    }

    const updated = await this.notificationRepository.markRead(id);
    if (!updated) {
      return Result.fail('Failed to update notification status');
    }

    this.metrics.increment('notification.read');

    logger.info(`[NotificationRead] notification ${id} read by user ${userId}`, {
      event: 'NotificationRead',
      notificationId: id,
      userId,
    });

    const event: DomainEvent<NotificationReadV1Payload> = {
      type: 'NotificationRead',
      occurredAt: new Date(),
      payload: {
        notificationId: id,
        userId,
      },
    };
    this.eventBus.publish(event);

    return Result.ok(updated);
  }

  async markAllAsRead(userId: string): Promise<Result<void, string>> {
    try {
      await this.notificationRepository.markAllRead(userId);
      return Result.ok(undefined);
    } catch (err: any) {
      return Result.fail(err.message || 'Failed to mark all as read');
    }
  }

  async getUnreadCount(userId: string): Promise<Result<number, string>> {
    try {
      const count = await this.notificationRepository.countUnread(userId);
      return Result.ok(count);
    } catch (err: any) {
      return Result.fail(err.message || 'Failed to fetch unread count');
    }
  }

  async getRecentNotifications(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<Result<{ notifications: Notification[]; total: number }, string>> {
    try {
      const result = await this.notificationRepository.findByUser(userId, { page, limit });
      return Result.ok(result);
    } catch (err: any) {
      return Result.fail(err.message || 'Failed to fetch notifications');
    }
  }

  async deleteNotification(id: string, userId: string): Promise<Result<boolean, string>> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      return Result.fail('Notification not found');
    }

    if (notification.userId !== userId) {
      return Result.fail('Unauthorized to delete this notification');
    }

    const success = await this.notificationRepository.delete(id);
    if (!success) {
      return Result.fail('Failed to delete notification');
    }

    this.metrics.increment('notification.deleted');

    logger.info(`[NotificationDeleted] notification ${id} deleted by user ${userId}`, {
      event: 'NotificationDeleted',
      notificationId: id,
      userId,
    });

    const event: DomainEvent<NotificationDeletedV1Payload> = {
      type: 'NotificationDeleted',
      occurredAt: new Date(),
      payload: {
        notificationId: id,
        userId,
      },
    };
    this.eventBus.publish(event);

    return Result.ok(true);
  }

  async deleteExpiredNotifications(ttlMs: number): Promise<Result<number, string>> {
    try {
      const count = await this.notificationRepository.deleteExpired(ttlMs);
      return Result.ok(count);
    } catch (err: any) {
      return Result.fail(err.message || 'Failed to delete expired notifications');
    }
  }
}
