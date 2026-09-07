import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getDashboardController } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', authenticateToken, getDashboardController);

export default router;
