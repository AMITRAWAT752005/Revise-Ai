import { z } from 'zod';

// Helper password regex: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,128}$/;
const PASSWORD_ERROR_MSG = 'Password must be at least 8 characters long and contain uppercase, lowercase, a number, and a special character.';

/**
 * Registration validation schema
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(100, { message: 'Name cannot exceed 100 characters.' }),
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .lowercase()
    .email({ message: 'Invalid email address format.' }),
  password: z
    .string({ required_error: 'Password is required.' })
    .regex(PASSWORD_REGEX, { message: PASSWORD_ERROR_MSG }),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .lowercase()
    .email({ message: 'Invalid email address format.' }),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, { message: 'Password cannot be empty.' }),
});

/**
 * Send OTP validation schema
 */
export const sendOtpSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .lowercase()
    .email({ message: 'Invalid email address format.' }),
  purpose: z.enum(['ACCOUNT_VERIFICATION', 'PASSWORD_RESET'], {
    errorMap: () => ({ message: 'Invalid OTP purpose.' }),
  }),
});

/**
 * Verify OTP validation schema
 */
export const verifyOtpSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .lowercase()
    .email({ message: 'Invalid email address format.' }),
  otp: z
    .string({ required_error: 'OTP is required.' })
    .trim()
    .regex(/^\d{6}$/, { message: 'OTP must be a 6-digit number.' }),
  purpose: z.enum(['ACCOUNT_VERIFICATION', 'PASSWORD_RESET'], {
    errorMap: () => ({ message: 'Invalid OTP purpose.' }),
  }),
});

/**
 * Reset Password validation schema
 */
export const resetPasswordSchema = z.object({
  newPassword: z
    .string({ required_error: 'New password is required.' })
    .regex(PASSWORD_REGEX, { message: PASSWORD_ERROR_MSG }),
});

/**
 * Google Auth credential validation schema
 */
export const googleAuthSchema = z.object({
  credential: z
    .string({ required_error: 'Google credential is required.' })
    .min(1, { message: 'Google credential cannot be empty.' }),
});

/**
 * User Commitment validation schema
 */
export const commitmentSchema = z.object({
  studentType: z
    .string({ required_error: 'Student type is required.' })
    .min(1, { message: 'Student type cannot be empty.' }),
  timePerDay: z
    .union([z.string(), z.number()])
    .refine((val) => val !== undefined && val !== null && val !== '', {
      message: 'Time per day is required.',
    }),
  flashcards: z
    .union([z.string(), z.number()])
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Flashcards must be a positive number.',
    }),
});
