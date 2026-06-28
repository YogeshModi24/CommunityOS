"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const UserSession_1 = __importDefault(require("../mongodb/models/UserSession"));
const MongoUserSessionRepository_1 = require("../mongodb/MongoUserSessionRepository");
vitest_1.vi.mock('../mongodb/models/UserSession', () => {
    return {
        default: {
            create: vitest_1.vi.fn(),
            findById: vitest_1.vi.fn(),
            findOne: vitest_1.vi.fn(),
            findByIdAndUpdate: vitest_1.vi.fn(),
            updateMany: vitest_1.vi.fn(),
        },
    };
});
(0, vitest_1.describe)('MongoUserSessionRepository', () => {
    let sessionRepo;
    (0, vitest_1.beforeEach)(() => {
        sessionRepo = new MongoUserSessionRepository_1.MongoUserSessionRepository();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should create session and map correctly', async () => {
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
        vitest_1.vi.mocked(UserSession_1.default.create).mockResolvedValue({
            toObject: vitest_1.vi.fn().mockReturnValue(mockSessionDoc),
        });
        const result = await sessionRepo.createSession({
            userId: 'user-123',
            refreshTokenHash: 'hash-abc',
            device: { deviceName: 'iPhone' },
            ipAddress: '192.168.1.1',
            expiresAt: new Date(),
        });
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.id).toBe('session-123');
        (0, vitest_1.expect)(result.device.deviceName).toBe('iPhone');
        (0, vitest_1.expect)(result.version).toBe(1);
    });
    (0, vitest_1.it)('should rotate refresh token correctly', async () => {
        const expiresAt = new Date();
        const device = { deviceName: 'iPad' };
        const ipAddress = '10.0.0.1';
        await sessionRepo.rotateRefreshToken('session-123', 'new-hash', expiresAt, 5, device, ipAddress);
        (0, vitest_1.expect)(UserSession_1.default.findByIdAndUpdate).toHaveBeenCalledWith('session-123', vitest_1.expect.objectContaining({
            refreshTokenHash: 'new-hash',
            expiresAt,
            version: 5,
            device,
            ipAddress,
        }));
    });
    (0, vitest_1.it)('should revoke session and increment version', async () => {
        await sessionRepo.revokeSession('session-123', 'manual-logout');
        (0, vitest_1.expect)(UserSession_1.default.findByIdAndUpdate).toHaveBeenCalledWith('session-123', {
            $set: {
                isActive: false,
                revokedAt: vitest_1.expect.any(Date),
                revokedReason: 'manual-logout',
            },
            $inc: { version: 1 },
        });
    });
    (0, vitest_1.it)('should revoke all active sessions for a user and increment version', async () => {
        await sessionRepo.revokeAllSessions('user-123', 'logout-all-devices');
        (0, vitest_1.expect)(UserSession_1.default.updateMany).toHaveBeenCalledWith({ userId: 'user-123', isActive: true }, {
            $set: {
                isActive: false,
                revokedAt: vitest_1.expect.any(Date),
                revokedReason: 'logout-all-devices',
            },
            $inc: { version: 1 },
        });
    });
});
