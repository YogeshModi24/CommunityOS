import { NotificationType } from '@community-os/types';
import { Document, Types } from 'mongoose';
export interface INotification extends Document {
    userId: Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    issueId?: Types.ObjectId;
    metadata?: Record<string, any>;
    read: boolean;
    createdAt: Date;
    readAt?: Date;
}
declare const _default: import("mongoose").Model<INotification, {}, {}, {}, Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map