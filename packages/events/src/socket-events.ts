export const SocketEvents = {
  ISSUE_CREATED: 'issue.created.v1',
  ISSUE_UPDATED: 'issue.updated.v1',
  ISSUE_RESOLVED: 'issue.resolved.v1',
  VOTE_ADDED: 'vote.added.v1',
  VOTE_REMOVED: 'vote.removed.v1',
  NOTIFICATION_CREATED: 'notification.created.v1',
  NOTIFICATION_READ: 'notification.read.v1',
  NOTIFICATION_DELETED: 'notification.deleted.v1',
  DASHBOARD_INVALIDATED: 'dashboard.invalidated.v1',
} as const;

export type SocketEventType = typeof SocketEvents[keyof typeof SocketEvents];
