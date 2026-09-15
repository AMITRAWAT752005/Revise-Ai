import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { semanticSearch } from '../controllers/searchController.js';

const router = Router();

/**
 * Protected semantic search endpoint
 * POST /api/search
 */
router.post('/', authenticateToken, semanticSearch);

export default router;
