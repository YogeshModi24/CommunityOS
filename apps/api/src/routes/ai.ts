import { Router } from 'express';

import { citizenAssistantStream } from '../controllers/aiController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all AI routes
router.use(authMiddleware);

router.post('/assistant/citizen', citizenAssistantStream as any);

export default router;
