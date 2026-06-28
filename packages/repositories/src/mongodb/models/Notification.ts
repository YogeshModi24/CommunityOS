import { NotificationType } from '@community-os/types';
import { Document, model, Schema, Types } from 'mongoose';

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

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'nearby_issue',
        'ai_completed',
        'status_changed',
        'resolved',
        'assignment',
        'promotion',
        'system',
      ],
      required: true,
    },
    issueId: { type: Schema.Types.ObjectId, ref: 'Issue' },
    metadata: { type: Schema.Types.Map, of: Schema.Types.Mixed },
    read: { type: Boolean, default: false, required: true },
    readAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Indexes for high performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default model<INotification>('Notification', NotificationSchema);
