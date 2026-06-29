import { RequestHandler, Router } from 'express';
import multer from 'multer';

import {
  analyzeImage,
  assignIssue,
  createIssue,
  getIssue,
  getNearbyIssues,
  listIssues,
  updateStatus,
} from '../controllers/issueController';
import { uploadImageHandler } from '../controllers/uploadController';
import { toggleVote } from '../controllers/voteController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// ============================================================
// CRITICAL: /analyze, /nearby, and /upload MUST be registered BEFORE /:id
// Otherwise Express matches them as issue IDs
// ============================================================

// POST /api/issues/upload  — auth required, handles file uploads
router.post('/upload', authMiddleware as RequestHandler, upload.single('file'), uploadImageHandler);

// GET /api/issues/analyze?url=   — synchronous AI preview for form
// router.get('/analyze', analyzeImage); // Wait, this was already router.get('/analyze', ...)
router.get('/analyze', analyzeImage);

// GET /api/issues/nearby?lat=&lng=&radius=
router.get('/nearby', getNearbyIssues);

// GET /api/issues
router.get('/', listIssues);

// POST /api/issues  — auth optional (demo fallback)
router.post('/', authMiddleware as RequestHandler, createIssue);

// GET /api/issues/:id
router.get('/:id', getIssue);

// PATCH /api/issues/:id/status  — auth required
router.patch('/:id/status', authMiddleware, updateStatus);

// POST /api/issues/:id/assign — auth required
router.post('/:id/assign', authMiddleware, assignIssue);

// POST /api/issues/:id/vote  — auth required
router.post('/:id/vote', authMiddleware, toggleVote);

export default router;
