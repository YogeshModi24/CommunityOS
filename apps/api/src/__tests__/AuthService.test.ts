import {
  AuthEventType,
  ClientMetaDTO,
  LoginRequestDTO,
  User,
  UserSession,
} from '@community-os/types';
import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthService } from '../services/AuthService';

// Mock dependencies
const mockUserRepo = {
  findByEmail: vi.fn(),
  findByEmailWithPassword: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  updatePoints: vi.fn(),
  getLeaderboard: vi.fn(),
};

const mockSessionRepo = {
  createSession: vi.fn(),
  findSession: vi.fn(),
  findSessionByHash: vi.fn(),
  updateLastUsed: vi.fn(),
  rotateRefreshToken: vi.fn(),
  revokeSession: vi.fn(),
  revokeAllSessions: vi.fn(),
  cleanupExpiredSessions: vi.fn(),
};

const mockClock = {
  now: vi.fn(),
};

const mockMetrics = {
  increment: vi.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  const mockNow = new Date('2026-06-26T12:00:00.000Z');

  beforeEach(() => {
    vi.clearAllMocks();
    mockClock.now.mockReturnValue(mockNow);
    authService = new AuthService(
      mockUserRepo as any,
      mockSessionRepo as any,
      mockClock as any,
      mockMetrics as any
    );
  });

  describe('login', () => {
    const loginData: LoginRequestDTO = {
      email: 'user@example.com',
      password: 'password123',
      tenantId: 'default',
    };

    const clientMeta: ClientMetaDTO = {
      deviceName: 'Chrome Web',
      browser: 'Chrome',
      platform: 'Web',
      os: 'macOS',
      appVersion: '1.0.0',
      ipAddress: '127.0.0.1',
    };

    it('should login successfully with valid credentials', async () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'user@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'citizen',
        points: 0,
        issues_reported: 0,
        createdAt: mockNow,
        updatedAt: mockNow,
        achievements: [],
        savedLocations: [],
      };

      const mockSession: UserSession = {
        id: 'session-123',
        userId: 'user-123',
        tenantId: 'default',
        refreshTokenHash: 'hashed-token',
        device: clientMeta,
        ipAddress: '127.0.0.1',
        isActive: true,
        version: 1,
        createdAt: mockNow,
        lastUsedAt: mockNow,
        lastActivityAt: mockNow,
        expiresAt: new Date(mockNow.getTime() + 7 * 24 * 60 * 60 * 1000),
      };

      mockUserRepo.findByEmailWithPassword.mockResolvedValue(mockUser);
      mockSessionRepo.createSession.mockResolvedValue(mockSession);

      const result = await authService.login(loginData, clientMeta);

      expect(result.isSuccess).toBe(true);
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
      expect(result.value.user.id).toBe('user-123');

      // Verify metrics logged
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        AuthEventType.LoginSuccess,
        expect.any(Object)
      );
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        AuthEventType.SessionCreated,
        expect.any(Object)
      );
    });

    it('should fail login if password mismatch occurs', async () => {
      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'user@example.com',
        password: await bcrypt.hash('different-password', 10),
        role: 'citizen',
        points: 0,
        issues_reported: 0,
        createdAt: mockNow,
        updatedAt: mockNow,
        achievements: [],
        savedLocations: [],
      };

      mockUserRepo.findByEmailWithPassword.mockResolvedValue(mockUser);

      const result = await authService.login(loginData, clientMeta);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Invalid credentials');
      expect(mockMetrics.increment).toHaveBeenCalledWith(AuthEventType.LoginFailed, {
        tenantId: 'default',
      });
    });
  });

  describe('refreshSession', () => {
    const clientMeta: ClientMetaDTO = {
      deviceName: 'Chrome Web',
      browser: 'Chrome',
      platform: 'Web',
      os: 'macOS',
      appVersion: '1.0.0',
      ipAddress: '127.0.0.1',
    };

    it('should rotate token and increment version on successful refresh', async () => {
      const mockSession: UserSession = {
        id: 'session-123',
        userId: 'user-123',
        tenantId: 'default',
        refreshTokenHash: 'old-hash',
        device: { deviceName: 'Old device' },
        ipAddress: '127.0.0.1',
        isActive: true,
        version: 2,
        createdAt: mockNow,
        lastUsedAt: mockNow,
        lastActivityAt: mockNow,
        expiresAt: new Date(mockNow.getTime() + 1000 * 60 * 60), // not expired
      };

      const mockUser: User = {
        id: 'user-123',
        name: 'John Doe',
        email: 'user@example.com',
        role: 'citizen',
        points: 0,
        issues_reported: 0,
        createdAt: mockNow,
        updatedAt: mockNow,
        achievements: [],
        savedLocations: [],
      };

      mockSessionRepo.findSessionByHash.mockResolvedValue(mockSession);
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await authService.refreshSession('raw-token-here', clientMeta);

      expect(result.isSuccess).toBe(true);
      expect(result.value.accessToken).toBeDefined();
      expect(result.value.refreshToken).toBeDefined();
      expect(result.value.session.version).toBe(3); // Incremented version

      // Verify repository rotation call includes the version increment and updated device details
      expect(mockSessionRepo.rotateRefreshToken).toHaveBeenCalledWith(
        'session-123',
        expect.any(String),
        expect.any(Date),
        3,
        expect.objectContaining({ deviceName: 'Chrome Web' }),
        '127.0.0.1'
      );

      expect(mockMetrics.increment).toHaveBeenCalledWith(
        AuthEventType.RefreshSuccess,
        expect.any(Object)
      );
    });

    it('should fail refresh if session is inactive or expired', async () => {
      const mockExpiredSession: UserSession = {
        id: 'session-123',
        userId: 'user-123',
        tenantId: 'default',
        refreshTokenHash: 'hash',
        device: {},
        isActive: true,
        version: 1,
        createdAt: mockNow,
        lastUsedAt: mockNow,
        lastActivityAt: mockNow,
        expiresAt: new Date(mockNow.getTime() - 1000 * 60), // expired 1 minute ago
      };

      mockSessionRepo.findSessionByHash.mockResolvedValue(mockExpiredSession);

      const result = await authService.refreshSession('raw-token-here', clientMeta);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Invalid session or refresh token');
      expect(mockMetrics.increment).toHaveBeenCalledWith(AuthEventType.RefreshFailed);
    });
  });

  describe('logout', () => {
    it('should revoke session and log success', async () => {
      const mockSession: UserSession = {
        id: 'session-123',
        userId: 'user-123',
        tenantId: 'default',
        refreshTokenHash: 'hash',
        device: {},
        isActive: true,
        version: 1,
        createdAt: mockNow,
        lastUsedAt: mockNow,
        lastActivityAt: mockNow,
        expiresAt: new Date(mockNow.getTime() + 1000 * 60),
      };

      mockSessionRepo.findSession.mockResolvedValue(mockSession);

      const result = await authService.logout('session-123');

      expect(result.isSuccess).toBe(true);
      expect(mockSessionRepo.revokeSession).toHaveBeenCalledWith('session-123', 'logout');
      expect(mockMetrics.increment).toHaveBeenCalledWith(AuthEventType.Logout, expect.any(Object));
      expect(mockMetrics.increment).toHaveBeenCalledWith(
        AuthEventType.SessionRevoked,
        expect.any(Object)
      );
    });
  });
});
