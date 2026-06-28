import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserSessionMongoose from '../mongodb/models/UserSession';
import { MongoUserSessionRepository } from '../mongodb/MongoUserSessionRepository';

vi.mock('../mongodb/models/UserSession', () => {
  return {
    default: {
      create: vi.fn(),
      findById: vi.fn(),
      findOne: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      updateMany: vi.fn(),
    },
  };
});

describe('MongoUserSessionRepository', () => {
  let sessionRepo: MongoUserSessionRepository;

  beforeEach(() => {
    sessionRepo = new MongoUserSessionRepository();
    vi.clearAllMocks();
  });

  it('should create session and map correctly', async () => {
    const mockSessionDoc = {
      _id: 'session-123',
      userId: 'user-123',
      tenantId: 'default',
      refreshTokenHash: 'hash-abc',
      device: { deviceName: 'iPhone' },
      ipAddress: '192.168.1.1',
      isActive: true,
      version: 1,
      lastUsedAt: new Date(),
      lastActivityAt: new Date(),
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(UserSessionMongoose.create).mockResolvedValue({
      toObject: vi.fn().mockReturnValue(mockSessionDoc),
    } as any);

    const result = await sessionRepo.createSession({
      userId: 'user-123',
      refreshTokenHash: 'hash-abc',
      device: { deviceName: 'iPhone' },
      ipAddress: '192.168.1.1',
      expiresAt: new Date(),
    });

    expect(result).not.toBeNull();
    expect(result.id).toBe('session-123');
    expect(result.device.deviceName).toBe('iPhone');
    expect(result.version).toBe(1);
  });

  it('should rotate refresh token correctly', async () => {
    const expiresAt = new Date();
    const device = { deviceName: 'iPad' };
    const ipAddress = '10.0.0.1';

    await sessionRepo.rotateRefreshToken(
      'session-123',
      'new-hash',
      expiresAt,
      5,
      device,
      ipAddress
    );

    expect(UserSessionMongoose.findByIdAndUpdate).toHaveBeenCalledWith(
      'session-123',
      expect.objectContaining({
        refreshTokenHash: 'new-hash',
        expiresAt,
        version: 5,
        device,
        ipAddress,
      })
    );
  });

  it('should revoke session and increment version', async () => {
    await sessionRepo.revokeSession('session-123', 'manual-logout');

    expect(UserSessionMongoose.findByIdAndUpdate).toHaveBeenCalledWith('session-123', {
      $set: {
        isActive: false,
        revokedAt: expect.any(Date),
        revokedReason: 'manual-logout',
      },
      $inc: { version: 1 },
    });
  });

  it('should revoke all active sessions for a user and increment version', async () => {
    await sessionRepo.revokeAllSessions('user-123', 'logout-all-devices');

    expect(UserSessionMongoose.updateMany).toHaveBeenCalledWith(
      { userId: 'user-123', isActive: true },
      {
        $set: {
          isActive: false,
          revokedAt: expect.any(Date),
          revokedReason: 'logout-all-devices',
        },
        $inc: { version: 1 },
      }
    );
  });
});
