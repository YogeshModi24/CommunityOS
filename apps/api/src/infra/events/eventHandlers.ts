import { logger } from '../../lib/logger';

export function registerEventHandlers(eventBus: any, io: any, container: any): void {
  // 1. Live Notification Event Transmissions
  eventBus.subscribe('NotificationCreated', (event: any) => {
    try {
      const { userId, notificationId, title, message, type, issueId } = event.payload;
      io.to(`user:${userId}`).emit('notification.created', {
        id: notificationId,
        userId,
        title,
        message,
        type,
        issueId,
        read: false,
        createdAt: event.occurredAt,
      });
      logger.info(`[SocketBroadcast] Broadcasted notification.created to user ${userId}`, {
        event: 'NotificationDelivered',
        notificationId,
        userId,
      });
    } catch (err: any) {
      logger.error('[SocketBroadcast] Failed to deliver notification.created', err, {
        event: 'NotificationDeliveryFailed',
        notificationId: event.payload?.notificationId,
      });
    }
  });

  eventBus.subscribe('NotificationRead', (event: any) => {
    try {
      const { userId, notificationId } = event.payload;
      io.to(`user:${userId}`).emit('notification.read', { notificationId });
      logger.info(`[SocketBroadcast] Broadcasted notification.read to user ${userId}`);
    } catch (err) {
      logger.error('[SocketBroadcast] Failed to deliver notification.read', err);
    }
  });

  eventBus.subscribe('NotificationDeleted', (event: any) => {
    try {
      const { userId, notificationId } = event.payload;
      io.to(`user:${userId}`).emit('notification.deleted', { notificationId });
      logger.info(`[SocketBroadcast] Broadcasted notification.deleted to user ${userId}`);
    } catch (err) {
      logger.error('[SocketBroadcast] Failed to deliver notification.deleted', err);
    }
  });

  // 2. Domain Events -> Persistent Notification Generation
  eventBus.subscribe('IssueCreated', async (event: any) => {
    try {
      const { issueId, reporterId, category } = event.payload;
      const issueService = container.resolve('issueService');
      const notificationService = container.resolve('notificationService');
      const userRepository = container.resolve('userRepository');

      const issueRes = await issueService.getIssue(issueId);
      if (!issueRes.isSuccess) return;
      const issue = issueRes.value;

      if (issue.ward) {
        const nearbyUsers = await userRepository.findByWard(issue.ward);
        for (const user of nearbyUsers) {
          if (user.id !== reporterId) {
            await notificationService.createNotification(
              user.id,
              'New Issue Nearby',
              `A new issue "${issue.title}" was reported in your ward ${issue.ward}.`,
              'nearby_issue',
              issueId
            );
          }
        }
      }
    } catch (err) {
      logger.error('[EventHandler] Failed to process IssueCreated event', err);
    }
  });

  eventBus.subscribe('IssueAnalyzed', async (event: any) => {
    try {
      const { issueId, category, severity } = event.payload;
      const issueService = container.resolve('issueService');
      const notificationService = container.resolve('notificationService');

      const issueRes = await issueService.getIssue(issueId);
      if (!issueRes.isSuccess) return;
      const issue = issueRes.value;
      const reporterId =
        typeof issue.reporter_id === 'object' ? issue.reporter_id.id : issue.reporter_id;

      // Broadcast issue:new over socket (existing legacy behavior)
      io.emit('issue:new', { issue });
      logger.info(`[SocketBroadcast] Broadcasted issue:new for analyzed issue ${issueId}`);

      if (reporterId) {
        await notificationService.createNotification(
          reporterId,
          'AI Analysis Completed',
          `Your reported issue "${issue.title}" has been analyzed. Category: ${category}, Severity: ${severity}/5.`,
          'ai_completed',
          issueId
        );
      }
    } catch (err) {
      logger.error('[EventHandler] Failed to process IssueAnalyzed event', err);
    }
  });

  eventBus.subscribe('IssueResolved', async (event: any) => {
    try {
      const { issueId, resolutionNote } = event.payload;
      const issueService = container.resolve('issueService');
      const notificationService = container.resolve('notificationService');

      const issueRes = await issueService.getIssue(issueId);
      if (!issueRes.isSuccess) return;
      const issue = issueRes.value;
      const reporterId =
        typeof issue.reporter_id === 'object' ? issue.reporter_id.id : issue.reporter_id;

      if (reporterId) {
        await notificationService.createNotification(
          reporterId,
          'Issue Resolved',
          `Your reported issue "${issue.title}" has been resolved! Note: ${resolutionNote || 'Issue resolved successfully.'}`,
          'resolved',
          issueId
        );
      }
    } catch (err) {
      logger.error('[EventHandler] Failed to process IssueResolved event', err);
    }
  });

  eventBus.subscribe('IssuePriorityUpdated', async (event: any) => {
    try {
      const { issueId, priorityScore } = event.payload;
      const issueService = container.resolve('issueService');
      const notificationService = container.resolve('notificationService');

      const issueRes = await issueService.getIssue(issueId);
      if (!issueRes.isSuccess) return;
      const issue = issueRes.value;
      const reporterId =
        typeof issue.reporter_id === 'object' ? issue.reporter_id.id : issue.reporter_id;

      // Broadcast issue:voted over socket (existing legacy behavior)
      io.emit('issue:voted', {
        issueId: issue.id,
        votes: issue.votes,
        priority_score: issue.priority_score,
      });
      logger.info(`[SocketBroadcast] Broadcasted issue:voted for issue ${issueId}`);

      // Upvote milestone triggers
      if (issue.votes === 5 || issue.votes === 10 || issue.votes === 25 || issue.votes === 50) {
        if (reporterId) {
          await notificationService.createNotification(
            reporterId,
            'Upvote Milestone Reached',
            `Your reported issue "${issue.title}" has reached ${issue.votes} upvotes!`,
            'promotion',
            issueId
          );
        }
      }
    } catch (err) {
      logger.error('[EventHandler] Failed to process IssuePriorityUpdated event', err);
    }
  });
}
