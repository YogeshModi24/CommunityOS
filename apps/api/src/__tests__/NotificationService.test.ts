import { Notification } from '@community-os/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationService } from '../services/NotificationService';

const mockNotificationRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findByUser: vi.fn(),
  findUnread: vi.fn(),
  markRead: vi.fn(),
  markAllRead: vi.fn(),
  delete: vi.fn(),
  deleteExpired: vi.fn(),
  countUnread: vi.fn(),
};

const mockEventBus = {
  publish: vi.fn(),
  subscribe: vi.fn(),
};

const mockMetrics = {
  increment: vi.fn(),
};

describe('NotificationService', () => {
  let notificationService: NotificationService;
  const userId = 'user-123';
  const otherUserId = 'user-456';

  const mockNotification: Notification = {
    id: 'notif-1',
    userId,
    title: 'Test Notification',
    message: 'Hello World',
    type: 'system',
    read: false,
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    notificationService = new NotificationService(
      mockNotificationRepo as any,
      mockEventBus as any,
      mockMetrics as any
    );
  });

  describe('createNotification', () => {
    it('should create a notification, publish event, and record metrics', async () => {
      mockNotificationRepo.create.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification(
        userId,
        'Test Notification',
        'Hello World',
        'system',
        'issue-789',
        { custom: 'data' }
      );

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(mockNotification);
      expect(mockNotificationRepo.create).toHaveBeenCalledWith({
        userId,
        title: 'Test Notification',
        message: 'Hello World',
        type: 'system',
        issueId: 'issue-789',
        metadata: { custom: 'data' },
        read: false,
      });
      expect(mockMetrics.increment).toHaveBeenCalledWith('notification.created');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NotificationCreated',
          payload: expect.objectContaining({
            userId,
            title: 'Test Notification',
            message: 'Hello World',
          }),
        })
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification read if owned by the user', async () => {
      mockNotificationRepo.findById.mockResolvedValue(mockNotification);
      mockNotificationRepo.markRead.mockResolvedValue({ ...mockNotification, read: true });

      const result = await notificationService.markAsRead('notif-1', userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value.read).toBe(true);
      expect(mockMetrics.increment).toHaveBeenCalledWith('notification.read');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NotificationRead',
          payload: { notificationId: 'notif-1', userId },
        })
      );
    });

    it('should return error if not found', async () => {
      mockNotificationRepo.findById.mockResolvedValue(null);

      const result = await notificationService.markAsRead('notif-1', userId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Notification not found');
    });

    it('should block read action if notification owned by different user', async () => {
      mockNotificationRepo.findById.mockResolvedValue(mockNotification); // Owned by 'user-123'

      const result = await notificationService.markAsRead('notif-1', otherUserId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Unauthorized to access this notification');
    });
  });

  describe('getUnreadCount', () => {
    it('should retrieve unread notification counts', async () => {
      mockNotificationRepo.countUnread.mockResolvedValue(5);

      const result = await notificationService.getUnreadCount(userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(5);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification if owner is verified', async () => {
      mockNotificationRepo.findById.mockResolvedValue(mockNotification);
      mockNotificationRepo.delete.mockResolvedValue(true);

      const result = await notificationService.deleteNotification('notif-1', userId);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(true);
      expect(mockMetrics.increment).toHaveBeenCalledWith('notification.deleted');
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'NotificationDeleted',
          payload: { notificationId: 'notif-1', userId },
        })
      );
    });

    it('should block deletion if user ID does not match owner', async () => {
      mockNotificationRepo.findById.mockResolvedValue(mockNotification);

      const result = await notificationService.deleteNotification('notif-1', otherUserId);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Unauthorized to delete this notification');
    });
  });
});
