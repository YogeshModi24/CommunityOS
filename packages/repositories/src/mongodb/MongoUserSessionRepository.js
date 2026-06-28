"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserSessionRepository = void 0;
const mappers_1 = require("./mappers");
const UserSession_1 = __importDefault(require("./models/UserSession"));
class MongoUserSessionRepository {
    async createSession(sessionData) {
        const doc = await UserSession_1.default.create({
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
        return (0, mappers_1.mapMongoUserSession)(doc.toObject());
    }
    async findSession(id) {
        const doc = await UserSession_1.default.findById(id).lean();
        return doc ? (0, mappers_1.mapMongoUserSession)(doc) : null;
    }
    async findSessionByHash(hash) {
        const doc = await UserSession_1.default.findOne({ refreshTokenHash: hash }).lean();
        return doc ? (0, mappers_1.mapMongoUserSession)(doc) : null;
    }
    async updateLastUsed(id, ip) {
        const update = {
            lastUsedAt: new Date(),
            lastActivityAt: new Date(),
        };
        if (ip) {
            update.ipAddress = ip;
        }
        await UserSession_1.default.findByIdAndUpdate(id, update);
    }
    async rotateRefreshToken(id, newHash, expiresAt, newVersion, device, ipAddress) {
        const update = {
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
        await UserSession_1.default.findByIdAndUpdate(id, update);
    }
    async revokeSession(id, reason) {
        await UserSession_1.default.findByIdAndUpdate(id, {
            $set: {
                isActive: false,
                revokedAt: new Date(),
                revokedReason: reason ?? 'logout',
            },
            $inc: { version: 1 },
        });
    }
    async revokeAllSessions(userId, reason) {
        await UserSession_1.default.updateMany({ userId, isActive: true }, {
            $set: {
                isActive: false,
                revokedAt: new Date(),
                revokedReason: reason ?? 'logout-all',
            },
            $inc: { version: 1 },
        });
    }
    async cleanupExpiredSessions() {
        await UserSession_1.default.updateMany({ expiresAt: { $lt: new Date() }, isActive: true }, {
            isActive: false,
            revokedAt: new Date(),
            revokedReason: 'expired',
        });
    }
}
exports.MongoUserSessionRepository = MongoUserSessionRepository;
