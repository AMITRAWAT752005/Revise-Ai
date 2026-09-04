import Otp from '../models/Otp.js';
import { sendVerificationEmail } from './emailService.js';
import crypto from 'crypto';

const MAX_ATTEMPTS = 5;
const COOLDOWN_SECONDS = 30;

/**
 * Generates a random 6-digit numeric OTP
 * @returns {string} 6-digit OTP
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Sends an OTP to the given email for the specified purpose
 * @param {string} email - The user's email
 * @param {string} purpose - 'ACCOUNT_VERIFICATION' or 'PASSWORD_RESET'
 * @returns {Promise<Object>} Success status and message
 */
export const sendOtp = async (email, purpose) => {
  // Check if an OTP already exists for this email and purpose to enforce cooldown
  const existingOtp = await Otp.findOne({ email, purpose });

  if (existingOtp) {
    const timeSinceLastSent = (Date.now() - existingOtp.lastSentAt.getTime()) / 1000;
    
    if (timeSinceLastSent < COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(COOLDOWN_SECONDS - timeSinceLastSent);
      throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP.`);
    }

    // Delete the old OTP record before creating a new one
    await Otp.deleteOne({ _id: existingOtp._id });
  }

  const otpCode = generateOtp();

  // Create new OTP record
  const newOtp = new Otp({
    email,
    otp: otpCode, // In a production app, consider hashing this before saving
    purpose,
    attempts: 0,
    lastSentAt: new Date(),
  });

  await newOtp.save();

  // Send the OTP via email
  await sendVerificationEmail(email, otpCode, purpose);

  return { success: true, message: 'OTP sent successfully.' };
};

/**
 * Verifies the provided OTP for the given email and purpose
 * @param {string} email - The user's email
 * @param {string} otpCode - The 6-digit OTP entered by the user
 * @param {string} purpose - 'ACCOUNT_VERIFICATION' or 'PASSWORD_RESET'
 * @returns {Promise<Object>} Success status and message
 */
export const verifyOtp = async (email, otpCode, purpose) => {
  const otpRecord = await Otp.findOne({ email, purpose });

  if (!otpRecord) {
    throw new Error('OTP has expired or does not exist. Please request a new one.');
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new Error('Maximum attempts exceeded. Please request a new OTP.');
  }

  if (otpRecord.otp !== otpCode) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    
    const attemptsLeft = MAX_ATTEMPTS - otpRecord.attempts;
    if (attemptsLeft === 0) {
      await Otp.deleteOne({ _id: otpRecord._id });
      throw new Error('Maximum attempts exceeded. Please request a new OTP.');
    }
    
    throw new Error(`Invalid OTP. You have ${attemptsLeft} attempts left.`);
  }

  // OTP is correct
  await Otp.deleteOne({ _id: otpRecord._id });

  return { success: true, message: 'OTP verified successfully.' };
};
