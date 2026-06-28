import { UserSession } from '@community-os/types';

import { IUserSessionRepository } from '../interfaces/IUserSessionRepository';
import { mapMongoUserSession } from './mappers';
import UserSessionMongoose from './models/UserSession';

export class MongoUserSessionRepository implements IUserSessionRepository {
  async createSession(sessionData: Partial<UserSession>): Promise<UserSession> {
    const doc = await UserSessionMongoose.create({
      userId: sessionData.userId,
      tenantId: sessionData.tenantId ?? 'default',
      refreshTokenHash: sessionData.refreshTokenHash,
      device: sessionData.device ?? {},
      ipAddress: sessionData.ipAddress,
      isActive: true,
      version: 1,
      lastUsedAt: sessionData.lastUsedAt ?? new Date(),
      lastActivityAt: sessionData.lastActivityAt ?? new Date(),
      expiresAt: sessionData.expiresAt,
    });
    return mapMongoUserSession(doc.toObject());
  }

  async findSession(id: string): Promise<UserSession | null> {
    const doc = await UserSessionMongoose.findById(id).lean();
    return doc ? mapMongoUserSession(doc) : null;
  }

  async findSessionByHash(hash: string): Promise<UserSession | null> {
    const doc = await UserSessionMongoose.findOne({ refreshTokenHash: hash }).lean();
    return doc ? mapMongoUserSession(doc) : null;
  }

  async updateLastUsed(id: string, ip?: string): Promise<void> {
    const update: any = {
      lastUsedAt: new Date(),
      lastActivityAt: new Date(),
    };
    if (ip) {
      update.ipAddress = ip;
    }
    await UserSessionMongoose.findByIdAndUpdate(id, update);
  }

  async rotateRefreshToken(
    id: string,
    newHash: string,
    expiresAt: Date,
    newVersion: number,
    device?: Partial<UserSession['device']>,
    ipAddress?: string
  ): Promise<void> {
    const update: any = {
      refreshTokenHash: newHash,
      expiresAt,
      version: newVersion,
      lastUsedAt: new Date(),
      lastActivityAt: new Date(),
    };
    if (device) {
      update.device = device;
    }
    if (ipAddress) {
      update.ipAddress = ipAddress;
    }
    await UserSessionMongoose.findByIdAndUpdate(id, update);
  }

  async revokeSession(id: string, reason?: string): Promise<void> {
    await UserSessionMongoose.findByIdAndUpdate(id, {
      $set: {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: reason ?? 'logout',
      },
      $inc: { version: 1 },
    });
  }

  async revokeAllSessions(userId: string, reason?: string): Promise<void> {
    await UserSessionMongoose.updateMany(
      { userId, isActive: true },
      {
        $set: {
          isActive: false,
          revokedAt: new Date(),
          revokedReason: reason ?? 'logout-all',
        },
        $inc: { version: 1 },
      }
    );
  }

  async cleanupExpiredSessions(): Promise<void> {
    await UserSessionMongoose.updateMany(
      { expiresAt: { $lt: new Date() }, isActive: true },
      {
        isActive: false,
        revokedAt: new Date(),
        revokedReason: 'expired',
      }
    );
  }
}
