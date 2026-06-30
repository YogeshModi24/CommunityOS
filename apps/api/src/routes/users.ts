import { Router } from 'express';

import {
  approveMunicipalityRequest,
  getCitizenInsights,
  getDashboard,
  getLeaderboard,
  getMe,
  listMunicipalityRequests,
  login,
  logout,
  refresh,
  register,
  requestMunicipalityAccess,
  saveLocation,
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';
import { LoginLimiter, RefreshLimiter, RegisterLimiter } from '../middleware/rateLimiter';
import { rbacMiddleware } from '../middleware/rbac';

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

// POST /api/users/register
router.post('/register', RegisterLimiter, register);

// POST /api/users/municipality-request
router.post('/municipality-request', RegisterLimiter, requestMunicipalityAccess);

// GET /api/users/municipality-requests — auth & admin required
router.get(
  '/municipality-requests',
  authMiddleware,
  rbacMiddleware(['admin']),
  listMunicipalityRequests
);

// POST /api/users/municipality-requests/:id/approve — auth & admin required
router.post(
  '/municipality-requests/:id/approve',
  authMiddleware,
  rbacMiddleware(['admin']),
  approveMunicipalityRequest
);

export default router;
