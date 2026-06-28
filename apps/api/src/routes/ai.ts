import { Router } from 'express';

import { citizenAssistantStream, copilotStream } from '../controllers/aiController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all AI routes
router.use(authMiddleware);

router.post('/assistant/citizen', citizenAssistantStream as any);
router.post('/assistant/copilot', requireRole(['admin', 'municipality']), copilotStream as any);

export default router;
