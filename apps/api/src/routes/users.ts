import { Router } from 'express';

import {
  getCitizenInsights,
  getDashboard,
  getLeaderboard,
  getMe,
  login,
  logout,
  refresh,
  saveLocation,
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

// Get current user profile
router.get('/me', authMiddleware, getMe);

// Get current user insights
router.get('/me/insights', authMiddleware, getCitizenInsights);

// PATCH /api/users/locations — auth required
router.patch('/locations', authMiddleware, saveLocation);

export default router;
