import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getUnitController, listUnitsController } from '../controllers/unitController.js';
import { listTopicsController } from '../controllers/topicController.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/subjects/:subjectId/units', listUnitsController);
router.get('/units/:unitId', getUnitController);
router.get('/units/:unitId/topics', listTopicsController);

export default router;
