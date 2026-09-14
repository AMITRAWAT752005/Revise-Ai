import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  uploadMaterial,
  getMaterialsBySubject,
  getMaterialById,
  deleteMaterial,
  retryProcessing
} from '../controllers/studyMaterialController.js';

const router = express.Router();

const allowedExtensions = new Set(['.pdf', '.docx', '.txt']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB limit
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      const error = new Error('Only PDF, DOCX, and TXT files are supported.');
      error.statusCode = 400;
      return callback(error);
    }
    return callback(null, true);
  },
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') error.statusCode = 413;
      return next(error);
    }
    return next();
  });
};

router.use(authenticateToken);

router.post('/upload', handleUpload, uploadMaterial);
router.get('/subject/:subjectId', getMaterialsBySubject); // /api/materials/subject/:subjectId
router.get('/:materialId', getMaterialById); // /api/materials/:materialId
router.post('/:materialId/retry', retryProcessing); // /api/materials/:materialId/retry
router.delete('/:materialId', deleteMaterial); // /api/materials/:materialId

export default router;

