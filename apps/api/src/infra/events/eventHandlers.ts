import { EventBus, SocketEvents } from '@community-os/events';
import { Server } from 'socket.io';

import { logger } from '../../lib/logger';

export function registerEventHandlers(eventBus: EventBus, io: Server, container: any): void {
  // 1. Live Notification Event Transmissions
  eventBus.subscribe('NotificationCreated', (event: any) => {
    try {
      const { userId, notificationId, title, message, type, issueId } = event.payload;
      io.to(`User:${userId}`).emit(SocketEvents.NOTIFICATION_CREATED, {
        id: notificationId,
        userId,
        title,
        message,
        type,
        issueId,
        read: false,
        createdAt: event.occurredAt,
      });
      logger.info(`[SocketBroadcast] Broadcasted notification.created.v1 to User:${userId}`);
    } catch (err: any) {
      logger.error('[SocketBroadcast] Failed to deliver notification.created.v1', err);
    }
  });

  eventBus.subscribe('NotificationRead', (event: any) => {
    try {
      const { userId, notificationId } = event.payload;
      io.to(`User:${userId}`).emit(SocketEvents.NOTIFICATION_READ, { notificationId });
      logger.info(`[SocketBroadcast] Broadcasted notification.read.v1 to User:${userId}`);
    } catch (err) {
      logger.error('[SocketBroadcast] Failed to deliver notification.read.v1', err);
    }
  });

  eventBus.subscribe('NotificationDeleted', (event: any) => {
    try {
      const { userId, notificationId } = event.payload;
      io.to(`User:${userId}`).emit(SocketEvents.NOTIFICATION_DELETED, { notificationId });
      logger.info(`[SocketBroadcast] Broadcasted notification.deleted.v1 to User:${userId}`);
    } catch (err) {
      logger.error('[SocketBroadcast] Failed to deliver notification.deleted.v1', err);
    }
  });

  // 2. Domain Events -> Room Broadcasts & Notifications
  eventBus.subscribe('IssueCreated', async (event: any) => {
    try {
      const { issueId, reporterId } = event.payload;
      const issueService = container.resolve('issueService');
      const notificationService = container.resolve('notificationService');
      const userRepository = container.resolve('userRepository');

      const issueRes = await issueService.getIssue(issueId);
      if (!issueRes.isSuccess) return;
      const issue = issueRes.value;

      // Broadcast to Citizens and Municipality
      io.to('Citizens').emit(SocketEvents.ISSUE_CREATED, event.payload);
      io.to('Municipality').emit(SocketEvents.ISSUE_CREATED, event.payload);
      io.to('Municipality').emit(SocketEvents.DASHBOARD_INVALIDATED, { reason: 'IssueCreated' });
      logger.info(`[SocketBroadcast] Broadcasted issue.created.v1 for issue ${issueId}`);

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
      const { issueId, category, severity, department } = event.payload;
      const issueService = container.resolve('issueService');
      const notificationService = container.resolve('notificationService');

      const issueRes = await issueService.getIssue(issueId);
      if (!issueRes.isSuccess) return;
      const issue = issueRes.value;
      const reporterId =
        typeof issue.reporter_id === 'object' ? issue.reporter_id.id : issue.reporter_id;

      // Broadcast issue.updated.v1 for analysis completed
      io.to('Citizens').emit(SocketEvents.ISSUE_UPDATED, { issueId, category, severity, department });
      io.to('Municipality').emit(SocketEvents.ISSUE_UPDATED, { issueId, category, severity, department });
      io.to('Municipality').emit(SocketEvents.DASHBOARD_INVALIDATED, { reason: 'IssueAnalyzed' });
      if (department) {
        io.to(`Department:${department}`).emit(SocketEvents.ISSUE_UPDATED, { issueId, category, severity, department });
      }

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

      // Broadcast
      io.to('Citizens').emit(SocketEvents.ISSUE_RESOLVED, event.payload);
      io.to('Municipality').emit(SocketEvents.ISSUE_RESOLVED, event.payload);
      io.to('Municipality').emit(SocketEvents.DASHBOARD_INVALIDATED, { reason: 'IssueResolved' });

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

  eventBus.subscribe('VoteAdded', async (event: any) => {
    try {
      const { issueId, newVoteCount } = event.payload;
      const issueService = container.resolve('issueService');
      const notificationService = container.resolve('notificationService');

      const issueRes = await issueService.getIssue(issueId);
      if (!issueRes.isSuccess) return;
      const issue = issueRes.value;
      const reporterId =
        typeof issue.reporter_id === 'object' ? issue.reporter_id.id : issue.reporter_id;

      // Broadcast vote
      io.to('Citizens').emit(SocketEvents.VOTE_ADDED, event.payload);
      io.to('Municipality').emit(SocketEvents.VOTE_ADDED, event.payload);

      // Upvote milestone triggers
      if (newVoteCount === 5 || newVoteCount === 10 || newVoteCount === 25 || newVoteCount === 50) {
        if (reporterId) {
          await notificationService.createNotification(
            reporterId,
            'Upvote Milestone Reached',
            `Your reported issue "${issue.title}" has reached ${newVoteCount} upvotes!`,
            'promotion',
            issueId
          );
        }
      }
    } catch (err) {
      logger.error('[EventHandler] Failed to process VoteAdded event', err);
    }
  });

  eventBus.subscribe('VoteRemoved', async (event: any) => {
    try {
      io.to('Citizens').emit(SocketEvents.VOTE_REMOVED, event.payload);
      io.to('Municipality').emit(SocketEvents.VOTE_REMOVED, event.payload);
    } catch (err) {
      logger.error('[EventHandler] Failed to process VoteRemoved event', err);
    }
  });

  eventBus.subscribe('IssuePriorityUpdated', async (event: any) => {
    try {
      io.to('Citizens').emit(SocketEvents.ISSUE_UPDATED, { issueId: event.payload.issueId, priorityScore: event.payload.priorityScore });
      io.to('Municipality').emit(SocketEvents.ISSUE_UPDATED, { issueId: event.payload.issueId, priorityScore: event.payload.priorityScore });
    } catch (err) {
      logger.error('[EventHandler] Failed to process IssuePriorityUpdated event', err);
    }
  });
}
