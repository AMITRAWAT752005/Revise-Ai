import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import syllabusRoutes from './routes/syllabusRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import topicRoutes from './routes/topicRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import studyMaterialRoutes from './routes/studyMaterialRoutes.js';

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(currentDirectory, '../uploads');

// Security HTTP headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    callback(null, !origin || origin === allowedOrigin);
  },
  credentials: true,
}));

// Body Parser with 10KB request size limit
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));
app.use('/uploads', express.static(uploadsDirectory));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Authentication routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/materials', studyMaterialRoutes);
app.use('/api', unitRoutes);
app.use('/api', topicRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
