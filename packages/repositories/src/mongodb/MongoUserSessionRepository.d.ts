import { UserSession } from '@community-os/types';
import { IUserSessionRepository } from '../interfaces/IUserSessionRepository';
export declare class MongoUserSessionRepository implements IUserSessionRepository {
    createSession(sessionData: Partial<UserSession>): Promise<UserSession>;
    findSession(id: string): Promise<UserSession | null>;
    findSessionByHash(hash: string): Promise<UserSession | null>;
    updateLastUsed(id: string, ip?: string): Promise<void>;
    rotateRefreshToken(id: string, newHash: string, expiresAt: Date, newVersion: number, device?: Partial<UserSession['device']>, ipAddress?: string): Promise<void>;
    revokeSession(id: string, reason?: string): Promise<void>;
    revokeAllSessions(userId: string, reason?: string): Promise<void>;
    cleanupExpiredSessions(): Promise<void>;
}
//# sourceMappingURL=MongoUserSessionRepository.d.ts.map