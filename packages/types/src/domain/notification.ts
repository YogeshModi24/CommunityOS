export type NotificationType =
  | 'nearby_issue'
  | 'ai_completed'
  | 'status_changed'
  | 'resolved'
  | 'assignment'
  | 'promotion'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  issueId?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}
