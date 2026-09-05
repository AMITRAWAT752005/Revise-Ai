import express from 'express';
import {
  sendOtpController,
  verifyOtpController,
  registerController,
  loginController,
  googleLoginController,
  getProfileController,
  logoutController,
  resetPasswordController,
  updateCommitmentController,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  loginIpLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Public Authentication Routes
router.post('/register', otpSendLimiter, registerController);
router.post('/login', loginIpLimiter, loginController);
router.post('/google', googleLoginController);
router.post('/logout', logoutController);
router.post('/reset-password', passwordResetLimiter, resetPasswordController);

// OTP Routes
router.post('/otp/send', otpSendLimiter, sendOtpController);
router.post('/otp/verify', otpVerifyLimiter, verifyOtpController);

// Protected Routes (Require valid JWT Bearer token)
router.get('/profile', authenticateToken, getProfileController);
router.get('/me', authenticateToken, getProfileController);
router.post('/commitment', authenticateToken, updateCommitmentController);
router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Access granted to protected route!',
    userId: req.userId,
    user: req.user,
  });
});

export default router;
