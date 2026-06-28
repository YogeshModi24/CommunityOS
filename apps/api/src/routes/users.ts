import { Router } from 'express';

import {
  getDashboard,
  getLeaderboard,
  getMe,
  login,
  logout,
  refresh,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { LoginLimiter, RefreshLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/users/login  — called by NextAuth credentials provider
router.post('/login', LoginLimiter, login);

// POST /api/users/refresh
router.post('/refresh', RefreshLimiter, refresh);

// POST /api/users/logout  — auth required
router.post('/logout', authMiddleware, logout);

// GET /api/users/leaderboard
router.get('/leaderboard', getLeaderboard);

// GET /api/users/dashboard  — auth required
router.get('/dashboard', authMiddleware, getDashboard);

// GET /api/users/me  — auth required
router.get('/me', authMiddleware, getMe);

export default router;
