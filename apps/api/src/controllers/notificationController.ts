import { ValidationError } from '@community-os/errors';
import { NextFunction, Response } from 'express';

import { container } from '../infra/container';
import { AuthRequest } from '../middleware/auth';
import { DeleteNotificationUseCase } from '../use-cases/DeleteNotificationUseCase';
import { GetRecentNotificationsUseCase } from '../use-cases/GetRecentNotificationsUseCase';
import { GetUnreadCountUseCase } from '../use-cases/GetUnreadCountUseCase';
import { MarkAllNotificationsReadUseCase } from '../use-cases/MarkAllNotificationsReadUseCase';
import { MarkNotificationReadUseCase } from '../use-cases/MarkNotificationReadUseCase';

// GET /api/notifications
export async function getRecentNotifications(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

    const useCase = container.resolve<GetRecentNotificationsUseCase>(GetRecentNotificationsUseCase);
    const result = await useCase.execute(req.userId, page, limit);

    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    res.status(200).json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/notifications/unread-count
export async function getUnreadCount(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }

    const useCase = container.resolve<GetUnreadCountUseCase>(GetUnreadCountUseCase);
    const result = await useCase.execute(req.userId);

    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    res.status(200).json({ success: true, data: { count: result.value } });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/notifications/:id/read
export async function markAsRead(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Notification ID required');
    }

    const useCase = container.resolve<MarkNotificationReadUseCase>(MarkNotificationReadUseCase);
    const result = await useCase.execute(id, req.userId);

    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    res.status(200).json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// POST /api/notifications/read-all
export async function markAllAsRead(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }

    const useCase = container.resolve<MarkAllNotificationsReadUseCase>(
      MarkAllNotificationsReadUseCase
    );
    const result = await useCase.execute(req.userId);

    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/notifications/:id
export async function deleteNotification(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const id = req.params.id;
    if (!id) {
      throw new ValidationError('Notification ID required');
    }

    const useCase = container.resolve<DeleteNotificationUseCase>(DeleteNotificationUseCase);
    const result = await useCase.execute(id, req.userId);

    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    res.status(200).json({ success: true, data: { deleted: result.value } });
  } catch (err) {
    next(err);
  }
}
