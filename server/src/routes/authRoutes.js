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
  refreshTokenController,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateMiddleware.js';
import {
  loginIpLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  googleAuthSchema,
  commitmentSchema,
} from '../schemas/authSchemas.js';

const router = express.Router();

// Public Authentication Routes
router.post('/register', otpSendLimiter, validateRequest(registerSchema), registerController);
router.post('/login', loginIpLimiter, validateRequest(loginSchema), loginController);
router.post('/google', validateRequest(googleAuthSchema), googleLoginController);
router.post('/logout', logoutController);
router.post('/refresh', refreshTokenController);
router.post('/reset-password', passwordResetLimiter, validateRequest(resetPasswordSchema), resetPasswordController);

// OTP Routes
router.post('/otp/send', otpSendLimiter, validateRequest(sendOtpSchema), sendOtpController);
router.post('/otp/verify', otpVerifyLimiter, validateRequest(verifyOtpSchema), verifyOtpController);

// Protected Routes (Require a valid authentication cookie or Bearer token)
router.get('/profile', authenticateToken, getProfileController);
router.get('/me', authenticateToken, getProfileController);
router.post('/commitment', authenticateToken, validateRequest(commitmentSchema), updateCommitmentController);
router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    message: 'Access granted to protected route!',
    userId: req.userId,
    user: req.user,
  });
});

export default router;
