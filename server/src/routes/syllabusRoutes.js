import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  confirmSyllabusController,
  getSyllabusImportController,
  uploadSyllabusController,
} from '../controllers/syllabusController.js';

const router = express.Router();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(currentDirectory, '../../uploads/syllabus');
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedExtensions = new Set(['.pdf', '.docx', '.txt']);
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      const error = new Error('Only PDF, DOCX, and TXT syllabus files are supported.');
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
router.post('/upload', handleUpload, uploadSyllabusController);
router.get('/:importId', getSyllabusImportController);
router.post('/:importId/confirm', confirmSyllabusController);

export default router;
