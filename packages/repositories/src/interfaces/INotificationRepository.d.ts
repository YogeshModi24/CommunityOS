import { Notification } from '@community-os/types';
export interface INotificationRepository {
    create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
    findById(id: string): Promise<Notification | null>;
    findByUser(userId: string, options?: {
        page?: number;
        limit?: number;
    }): Promise<{
        notifications: Notification[];
        total: number;
    }>;
    findUnread(userId: string): Promise<Notification[]>;
    markRead(id: string): Promise<Notification | null>;
    markAllRead(userId: string): Promise<void>;
    delete(id: string): Promise<boolean>;
    deleteExpired(ttlMs: number): Promise<number>;
    countUnread(userId: string): Promise<number>;
}
//# sourceMappingURL=INotificationRepository.d.ts.map