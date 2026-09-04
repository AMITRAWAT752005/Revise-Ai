import { sendOtp, verifyOtp } from '../services/otpService.js';
import User from '../models/User.js';

/**
 * Controller to handle sending OTP requests
 */
export const sendOtpController = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ error: 'Email and purpose are required.' });
    }

    if (!['ACCOUNT_VERIFICATION', 'PASSWORD_RESET'].includes(purpose)) {
      return res.status(400).json({ error: 'Invalid OTP purpose.' });
    }

    // Additional validations based on purpose
    if (purpose === 'PASSWORD_RESET') {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        // Return a generic success to prevent email enumeration, or specific error based on project specs
        return res.status(404).json({ error: 'No account found with this email.' });
      }
    } else if (purpose === 'ACCOUNT_VERIFICATION') {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
    }

    const result = await sendOtp(email, purpose);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controller to handle OTP verification requests
 */
export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!email || !otp || !purpose) {
      return res.status(400).json({ error: 'Email, OTP, and purpose are required.' });
    }

    if (!['ACCOUNT_VERIFICATION', 'PASSWORD_RESET'].includes(purpose)) {
      return res.status(400).json({ error: 'Invalid OTP purpose.' });
    }

    const result = await verifyOtp(email, otp, purpose);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
