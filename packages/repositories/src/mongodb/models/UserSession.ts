import { Document, model, Schema, Types } from 'mongoose';

export interface IUserSession extends Document {
  userId: Types.ObjectId;
  tenantId: string;
  refreshTokenHash: string;
  device: {
    deviceName?: string;
    browser?: string;
    platform?: string;
    os?: string;
    appVersion?: string;
  };
  ipAddress?: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  lastUsedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
    expiresAt: { type: Schema.Types.Date, required: true },
    revokedAt: Date,
    revokedReason: String,
  },
  { timestamps: true }
);

// Indexes for query performance
UserSessionSchema.index({ refreshTokenHash: 1 });
UserSessionSchema.index({ userId: 1 });
UserSessionSchema.index({ expiresAt: 1 });

export default model<IUserSession>('UserSession', UserSessionSchema);
