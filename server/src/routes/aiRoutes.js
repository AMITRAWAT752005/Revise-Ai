import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { generateContentController } from '../controllers/aiController.js';

const router = Router();

/**
 * Protected AI Content Generation Endpoint
 * POST /api/ai/generate
 */
router.post('/generate', authenticateToken, generateContentController);

export default router;
