import express from 'express';
import { sendOtpController, verifyOtpController } from '../controllers/authController.js';

const router = express.Router();

// Route to request a new OTP
router.post('/otp/send', sendOtpController);

// Route to verify an OTP
router.post('/otp/verify', verifyOtpController);

export default router;
