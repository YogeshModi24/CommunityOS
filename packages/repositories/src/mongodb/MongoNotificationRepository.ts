import { Notification } from '@community-os/types';
import { Types } from 'mongoose';

import { INotificationRepository } from '../interfaces/INotificationRepository';
import { mapMongoNotification } from './mappers';
import NotificationMongoose from './models/Notification';

export class MongoNotificationRepository implements INotificationRepository {
  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const doc = await NotificationMongoose.create({
      userId: new Types.ObjectId(notification.userId),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      issueId: notification.issueId ? new Types.ObjectId(notification.issueId) : undefined,
      metadata: notification.metadata,
      read: notification.read,
      readAt: notification.readAt,
    });
    return mapMongoNotification(doc);
  }

  async findById(id: string): Promise<Notification | null> {
    try {
      const doc = await NotificationMongoose.findById(id).lean();
      return doc ? mapMongoNotification(doc) : null;
    } catch {
      return null;
    }
  }

  async findByUser(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<{ notifications: Notification[]; total: number }> {
    const limit = options?.limit ?? 10;
    const page = options?.page ?? 1;
    const skip = (page - 1) * limit;

    const query = { userId: new Types.ObjectId(userId) };

    const docs = await NotificationMongoose.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await NotificationMongoose.countDocuments(query);

    return {
      notifications: docs.map(mapMongoNotification),
      total,
    };
  }

  async findUnread(userId: string): Promise<Notification[]> {
    const docs = await NotificationMongoose.find({
      userId: new Types.ObjectId(userId),
      read: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    return docs.map(mapMongoNotification);
  }

  async markRead(id: string): Promise<Notification | null> {
    try {
      const doc = await NotificationMongoose.findByIdAndUpdate(
        id,
        { $set: { read: true, readAt: new Date() } },
        { new: true }
      ).lean();
      return doc ? mapMongoNotification(doc) : null;
    } catch {
      return null;
    }
  }

  async markAllRead(userId: string): Promise<void> {
    await NotificationMongoose.updateMany(
      { userId: new Types.ObjectId(userId), read: false },
      { $set: { read: true, readAt: new Date() } }
    );
  }

  async delete(id: string): Promise<boolean> {
    try {
      const res = await NotificationMongoose.deleteOne({ _id: new Types.ObjectId(id) });
      return res.deletedCount > 0;
    } catch {
      return false;
    }
  }

  async deleteExpired(ttlMs: number): Promise<number> {
    const cutoff = new Date(Date.now() - ttlMs);
    const res = await NotificationMongoose.deleteMany({
      createdAt: { $lt: cutoff },
    });
    return res.deletedCount ?? 0;
  }

  async countUnread(userId: string): Promise<number> {
    return await NotificationMongoose.countDocuments({
      userId: new Types.ObjectId(userId),
      read: false,
    });
  }
}
