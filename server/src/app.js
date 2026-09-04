import cors from 'cors';
import express from 'express';

import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Authentication routes
app.use('/api/auth', authRoutes);

export default app;
