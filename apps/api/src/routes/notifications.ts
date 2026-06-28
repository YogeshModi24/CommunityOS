import { RequestHandler, Router } from 'express';

import {
  deleteNotification,
  getRecentNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protect all routes
router.use(authMiddleware as RequestHandler);

// GET /api/notifications
router.get('/', getRecentNotifications);

// GET /api/notifications/unread-count
router.get('/unread-count', getUnreadCount);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', markAsRead);

// POST /api/notifications/read-all
router.post('/read-all', markAllAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', deleteNotification);

export default router;
