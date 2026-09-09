import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getTopicController } from '../controllers/topicController.js';

const router = express.Router();

router.get('/topics/:topicId', authenticateToken, getTopicController);

export default router;
