"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSessionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    tenantId: { type: String, required: true, default: 'default' },
    refreshTokenHash: { type: String, required: true },
    device: {
        deviceName: String,
        browser: String,
        platform: String,
        os: String,
        appVersion: String,
    },
    ipAddress: String,
    isActive: { type: Boolean, required: true, default: true },
    version: { type: Number, required: true, default: 1 },
    lastUsedAt: { type: Date, required: true, default: Date.now },
    lastActivityAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: mongoose_1.Schema.Types.Date, required: true },
    revokedAt: Date,
    revokedReason: String,
}, { timestamps: true });
// Indexes for query performance
UserSessionSchema.index({ refreshTokenHash: 1 });
UserSessionSchema.index({ userId: 1 });
UserSessionSchema.index({ expiresAt: 1 });
exports.default = (0, mongoose_1.model)('UserSession', UserSessionSchema);
