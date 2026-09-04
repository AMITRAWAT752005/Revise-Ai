/**
 * Validation utilities for ReviseAI Authentication Core
 */

/**
 * Validates a user's name.
 * @param {string} name
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateName = (name) => {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { isValid: false, error: 'Full name is required.' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long.' };
  }
  return { isValid: true };
};

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { isValid: false, error: 'Email address is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true };
};

/**
 * Validates password requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 * @param {string} password
 * @returns {{ isValid: boolean, error?: string }}
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.' };
  }
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  const hasLowercase = /[a-z]/.test(password);
  if (!hasLowercase) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter.' };
  }
  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    return { isValid: false, error: 'Password must contain at least one number.' };
  }
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecialChar) {
    return { isValid: false, error: 'Password must contain at least one special character.' };
  }
  return { isValid: true };
};
