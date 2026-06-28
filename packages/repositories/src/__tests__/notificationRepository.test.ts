import { beforeEach, describe, expect, it, vi } from 'vitest';

import NotificationMongoose from '../mongodb/models/Notification';
import { MongoNotificationRepository } from '../mongodb/MongoNotificationRepository';

vi.mock('../mongodb/models/Notification', () => {
  return {
    default: {
      create: vi.fn(),
      findById: vi.fn(),
      find: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      updateMany: vi.fn(),
      deleteOne: vi.fn(),
      deleteMany: vi.fn(),
      countDocuments: vi.fn(),
    },
  };
});

describe('MongoNotificationRepository', () => {
  let notificationRepo: MongoNotificationRepository;

  beforeEach(() => {
    notificationRepo = new MongoNotificationRepository();
    vi.clearAllMocks();
  });

  it('should create notification and map correctly', async () => {
    const mockDoc = {
      _id: '60d5ec49f1b2c71048888888',
      userId: '60d5ec49f1b2c71048888888',
      title: 'Alert',
      message: 'New message',
      type: 'system',
      read: false,
      createdAt: new Date(),
    };

    vi.mocked(NotificationMongoose.create).mockResolvedValue(mockDoc as any);

    const result = await notificationRepo.create({
      userId: '60d5ec49f1b2c71048888888',
      title: 'Alert',
      message: 'New message',
      type: 'system',
      read: false,
    });

    expect(result).not.toBeNull();
    expect(result.id).toBe('60d5ec49f1b2c71048888888');
    expect(result.title).toBe('Alert');
    expect(result.read).toBe(false);
  });

  it('should find unread notifications', async () => {
    const mockDocs = [
      {
        _id: '60d5ec49f1b2c71048888888',
        userId: '60d5ec49f1b2c71048888888',
        title: 'A',
        message: 'M',
        type: 'system',
        read: false,
      },
    ];

    vi.mocked(NotificationMongoose.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockDocs),
      }),
    } as any);

    const result = await notificationRepo.findUnread('60d5ec49f1b2c71048888888');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('60d5ec49f1b2c71048888888');
  });

  it('should count unread notifications', async () => {
    vi.mocked(NotificationMongoose.countDocuments).mockResolvedValue(3);

    const result = await notificationRepo.countUnread('60d5ec49f1b2c71048888888');
    expect(result).toBe(3);
  });

  it('should mark notification read', async () => {
    const mockDoc = {
      _id: '60d5ec49f1b2c71048888888',
      userId: '60d5ec49f1b2c71048888888',
      title: 'Alert',
      message: 'New message',
      type: 'system',
      read: true,
      createdAt: new Date(),
    };

    vi.mocked(NotificationMongoose.findByIdAndUpdate).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockDoc),
    } as any);

    const result = await notificationRepo.markRead('60d5ec49f1b2c71048888888');
    expect(result).not.toBeNull();
    expect(result!.read).toBe(true);
  });

  it('should mark all notifications read', async () => {
    await notificationRepo.markAllRead('60d5ec49f1b2c71048888888');
    expect(NotificationMongoose.updateMany).toHaveBeenCalled();
  });

  it('should delete expired notifications', async () => {
    vi.mocked(NotificationMongoose.deleteMany).mockResolvedValue({ deletedCount: 5 } as any);
    const count = await notificationRepo.deleteExpired(10000);
    expect(count).toBe(5);
  });
});
