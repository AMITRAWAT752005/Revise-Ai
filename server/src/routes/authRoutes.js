import express from 'express';
import {
  sendOtpController,
  verifyOtpController,
  registerController,
  loginController,
  getProfileController,
  logoutController,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Routes
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', logoutController);

// OTP Routes
router.post('/otp/send', sendOtpController);
router.post('/otp/verify', verifyOtpController);

// Protected Routes (Require valid JWT Bearer token)
router.get('/profile', authenticateToken, getProfileController);
router.get('/me', authenticateToken, getProfileController);
router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Access granted to protected route!',
    userId: req.userId,
    user: req.user,
  });
});

export default router;
