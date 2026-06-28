import { UserSession } from '@community-os/types';

export interface IUserSessionRepository {
  createSession(sessionData: Partial<UserSession>): Promise<UserSession>;
  findSession(id: string): Promise<UserSession | null>;
  findSessionByHash(hash: string): Promise<UserSession | null>;
  updateLastUsed(id: string, ip?: string): Promise<void>;
  rotateRefreshToken(
    id: string,
    newHash: string,
    expiresAt: Date,
    newVersion: number,
    device?: Partial<UserSession['device']>,
    ipAddress?: string
  ): Promise<void>;
  revokeSession(id: string, reason?: string): Promise<void>;
  revokeAllSessions(userId: string, reason?: string): Promise<void>;
  cleanupExpiredSessions(): Promise<void>;
}
