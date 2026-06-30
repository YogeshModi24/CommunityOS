import { authConfig } from '@community-os/config';
import { IMetrics } from '@community-os/logger';
import { IUserRepository, IUserSessionRepository } from '@community-os/repositories';
import {
  AuthEventType,
  AuthSessionDTO,
  ClientMetaDTO,
  JWTPayload,
  LoginRequestDTO,
  UserSession,
} from '@community-os/types';
import { Clock, Result } from '@community-os/utils';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { env } from '../env';
import { logger } from '../lib/logger';
import { IAuthService } from './contracts/IAuthService';

export class AuthService implements IAuthService {
  constructor(
    private userRepository: IUserRepository,
    private sessionRepository: IUserSessionRepository,
    private clock: Clock,
    private metrics: IMetrics
  ) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private timingSafeCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  }

  private generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: authConfig.jwtAccessExpiresIn,
    });
  }

  async login(
    data: LoginRequestDTO,
    clientMeta: ClientMetaDTO
  ): Promise<Result<AuthSessionDTO, string>> {
    const { email, password, tenantId = 'default' } = data;

    if (!email || !password) {
      logger.warn(`[AuthService] Login failed: Email and password required`, {
        event: AuthEventType.LoginFailed,
        tenantId,
      });
      this.metrics.increment(AuthEventType.LoginFailed, { tenantId });
      return Result.fail('Email and password required');
    }

    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user || !user.password) {
      logger.warn(`[AuthService] Login failed: Invalid email ${email}`, {
        event: AuthEventType.LoginFailed,
        tenantId,
      });
      this.metrics.increment(AuthEventType.LoginFailed, { tenantId });
      return Result.fail('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.warn(`[AuthService] Login failed: Password mismatch for email ${email}`, {
        event: AuthEventType.LoginFailed,
        tenantId,
      });
      this.metrics.increment(AuthEventType.LoginFailed, { tenantId });
      return Result.fail('Invalid credentials');
    }

    // Generate Refresh Token
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = this.hashToken(rawRefreshToken);

    const now = this.clock.now();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days matching jwtRefreshExpiresIn

    // Create UserSession
    const sessionData: Partial<UserSession> = {
      userId: user.id,
      tenantId,
      refreshTokenHash,
      device: {
        deviceName: clientMeta.deviceName,
        browser: clientMeta.browser,
        platform: clientMeta.platform,
        os: clientMeta.os,
        appVersion: clientMeta.appVersion,
      },
      ipAddress: clientMeta.ipAddress,
      isActive: true,
      version: 1,
      createdAt: now,
      lastUsedAt: now,
      lastActivityAt: now,
      expiresAt,
    };

    const session = await this.sessionRepository.createSession(sessionData);

    // Generate Access Token
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId,
      sessionId: session.id,
    };

    const accessToken = this.generateAccessToken(tokenPayload);

    logger.info(
      `[AuthService] User logged in successfully: ${user.email} (Session: ${session.id})`,
      {
        event: AuthEventType.LoginSuccess,
        userId: user.id,
        tenantId,
        sessionId: session.id,
      }
    );
    this.metrics.increment(AuthEventType.LoginSuccess, {
      userId: user.id,
      tenantId,
      sessionId: session.id,
    });

    logger.info(`[AuthService] Session created: ${session.id}`, {
      event: AuthEventType.SessionCreated,
      userId: user.id,
      tenantId,
      sessionId: session.id,
    });
    this.metrics.increment(AuthEventType.SessionCreated, {
      userId: user.id,
      tenantId,
      sessionId: session.id,
    });

    return Result.ok({
      accessToken,
      refreshToken: rawRefreshToken,
      expiresAt,
      session,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ward: user.ward,
        points: user.points || 0,
      },
    });
  }

  async refreshSession(
    rawRefreshToken: string,
    clientMeta: ClientMetaDTO
  ): Promise<Result<AuthSessionDTO, string>> {
    const hash = this.hashToken(rawRefreshToken);
    const session = await this.sessionRepository.findSessionByHash(hash);

    if (!session || !session.isActive || session.expiresAt.getTime() < this.clock.now().getTime()) {
      logger.warn(`[AuthService] Refresh failed: Invalid, revoked or expired session token`, {
        event: AuthEventType.RefreshFailed,
      });
      this.metrics.increment(AuthEventType.RefreshFailed);
      return Result.fail('Invalid session or refresh token');
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      logger.warn(`[AuthService] Refresh failed: User not found for session ${session.id}`, {
        event: AuthEventType.RefreshFailed,
      });
      this.metrics.increment(AuthEventType.RefreshFailed, { sessionId: session.id });
      return Result.fail('User not found');
    }

    // Token Rotation: Generate new refresh token
    const newRawRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = this.hashToken(newRawRefreshToken);

    const now = this.clock.now();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry
    const newVersion = session.version + 1;

    // Build updated device details and ip address
    const updatedDevice = {
      deviceName: clientMeta.deviceName || session.device.deviceName,
      browser: clientMeta.browser || session.device.browser,
      platform: clientMeta.platform || session.device.platform,
      os: clientMeta.os || session.device.os,
      appVersion: clientMeta.appVersion || session.device.appVersion,
    };
    const updatedIp = clientMeta.ipAddress || session.ipAddress;

    await this.sessionRepository.rotateRefreshToken(
      session.id,
      newRefreshTokenHash,
      expiresAt,
      newVersion,
      updatedDevice,
      updatedIp
    );

    // Generate new Access Token
    const tokenPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: session.tenantId,
      sessionId: session.id,
    };

    const accessToken = this.generateAccessToken(tokenPayload);

    // Return the updated session aggregate detail
    const updatedSession: UserSession = {
      ...session,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
      version: newVersion,
      device: updatedDevice,
      ipAddress: updatedIp,
      lastUsedAt: now,
      lastActivityAt: now,
    };

    logger.info(
      `[AuthService] Session refreshed: ${session.id} (Version rotated to ${newVersion})`,
      {
        event: AuthEventType.RefreshSuccess,
        userId: user.id,
        tenantId: session.tenantId,
        sessionId: session.id,
      }
    );
    this.metrics.increment(AuthEventType.RefreshSuccess, {
      userId: user.id,
      tenantId: session.tenantId,
      sessionId: session.id,
    });

    return Result.ok({
      accessToken,
      refreshToken: newRawRefreshToken,
      expiresAt,
      session: updatedSession,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ward: user.ward,
        points: user.points || 0,
      },
    });
  }

  async logout(sessionId: string): Promise<Result<void, string>> {
    const session = await this.sessionRepository.findSession(sessionId);
    if (!session) {
      return Result.fail('Session not found');
    }

    await this.sessionRepository.revokeSession(sessionId, 'logout');

    logger.info(`[AuthService] User logged out, session revoked: ${sessionId}`, {
      event: AuthEventType.Logout,
      userId: session.userId,
      tenantId: session.tenantId,
      sessionId,
    });
    this.metrics.increment(AuthEventType.Logout, {
      userId: session.userId,
      tenantId: session.tenantId,
      sessionId,
    });

    logger.info(`[AuthService] Session revoked: ${sessionId}`, {
      event: AuthEventType.SessionRevoked,
      userId: session.userId,
      tenantId: session.tenantId,
      sessionId,
    });
    this.metrics.increment(AuthEventType.SessionRevoked, {
      userId: session.userId,
      tenantId: session.tenantId,
      sessionId,
    });

    return Result.ok(undefined);
  }

  async logoutAll(userId: string): Promise<Result<void, string>> {
    await this.sessionRepository.revokeAllSessions(userId, 'logout-all');

    logger.info(`[AuthService] Revoked all sessions for user: ${userId}`, {
      event: AuthEventType.SessionRevoked,
      userId,
    });
    this.metrics.increment(AuthEventType.Logout, { userId });
    this.metrics.increment(AuthEventType.SessionRevoked, { userId });

    return Result.ok(undefined);
  }
}
