import cors from 'cors';
import express from 'express';

import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    callback(null, !origin || origin === allowedOrigin);
  },
  credentials: true,
}));
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

export default app;
