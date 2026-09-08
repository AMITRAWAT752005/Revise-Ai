import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  createSubjectController,
  listSubjectsController,
  getSubjectByIdController,
  updateSubjectController,
  deleteSubjectController,
} from '../controllers/subjectController.js';

const router = express.Router();

router.use(authenticateToken);
router.get('/', listSubjectsController);
router.get('/:subjectId', getSubjectByIdController);
router.post('/', createSubjectController);
router.put('/:subjectId', updateSubjectController);
router.delete('/:subjectId', deleteSubjectController);

export default router;
