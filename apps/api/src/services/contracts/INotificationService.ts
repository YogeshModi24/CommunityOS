import { Notification } from '@community-os/types';
import { Result } from '@community-os/utils';

export interface INotificationService {
  createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'],
    issueId?: string,
    metadata?: Record<string, any>
  ): Promise<Result<Notification, string>>;
  markAsRead(id: string, userId: string): Promise<Result<Notification, string>>;
  markAllAsRead(userId: string): Promise<Result<void, string>>;
  getUnreadCount(userId: string): Promise<Result<number, string>>;
  getRecentNotifications(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<Result<{ notifications: Notification[]; total: number }, string>>;
  deleteNotification(id: string, userId: string): Promise<Result<boolean, string>>;
  deleteExpiredNotifications(ttlMs: number): Promise<Result<number, string>>;
}
