import { Document, Types } from 'mongoose';
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
declare const _default: import("mongoose").Model<IUserSession, {}, {}, {}, Document<unknown, {}, IUserSession, {}, {}> & IUserSession & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=UserSession.d.ts.map