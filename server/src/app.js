import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const app = express();

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

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

export default app;
