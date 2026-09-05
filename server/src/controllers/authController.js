import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOtp, verifyOtp } from '../services/otpService.js';
import { generateToken, verifyToken } from '../utils/jwtUtils.js';
import { validateName, validateEmail, validatePassword } from '../utils/validationUtils.js';
import { isAccountLoginThrottled, recordFailedLogin, resetFailedLogin } from '../middleware/rateLimiter.js';
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

    const normalizedEmail = email.trim().toLowerCase();

    // Additional validations based on purpose
    if (purpose === 'PASSWORD_RESET') {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (!existingUser) {
        return res.status(404).json({ error: 'No account found with this email.' });
      }
    } else if (purpose === 'ACCOUNT_VERIFICATION') {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser && existingUser.isVerified) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }
    }

    const result = await sendOtp(normalizedEmail, purpose);
    
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

    const normalizedEmail = email.trim().toLowerCase();
    const result = await verifyOtp(normalizedEmail, otp, purpose);
    
    let token = null;
    let authUser = null;

    // If verifying account registration, update user record in database if it exists
    if (purpose === 'ACCOUNT_VERIFICATION') {
      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        user.isVerified = true;
        await user.save();
        
        // Generate JWT token so they are logged in automatically
        token = generateToken({ userId: user._id, email: user.email });
        authUser = {
          id: user._id,
          name: user.name,
          email: user.email,
          type: user.type,
          isVerified: user.isVerified,
          commitmentPending: user.commitmentPending,
        };
      }
    } else if (purpose === 'PASSWORD_RESET') {
      // Generate a temporary token to authorize the reset-password endpoint
      token = generateToken({ email: normalizedEmail, temporary: true }, '15m');
    }

    res.status(200).json({ ...result, token, user: authUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Controller to handle user registration
 */
export const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate inputs
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      return res.status(400).json({ error: nameValidation.error });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.error });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      type: 'local',
      isVerified: false,
      commitmentPending: true,
    });

    // Automatically send OTP for account verification
    await sendOtp(normalizedEmail, 'ACCOUNT_VERIFICATION');

    res.status(201).json({
      message: 'Registration successful. A verification OTP has been sent to your email.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        type: newUser.type,
        isVerified: newUser.isVerified,
        commitmentPending: newUser.commitmentPending,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
};

/**
 * Controller to handle user login & JWT token issuance
 */
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check account-level brute-force throttling
    const throttleCheck = isAccountLoginThrottled(normalizedEmail);
    if (throttleCheck.throttled) {
      res.setHeader('Retry-After', throttleCheck.retryAfterSeconds);
      return res.status(429).json({
        error: `Too many failed login attempts. Please try again in ${Math.ceil(throttleCheck.retryAfterSeconds / 60)} minutes.`,
      });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      recordFailedLogin(normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      recordFailedLogin(normalizedEmail);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Successful login: reset failed attempt counter
    resetFailedLogin(normalizedEmail);

    // Generate JWT token
    const token = generateToken({ userId: user._id, email: user.email });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        isVerified: user.isVerified,
        commitmentPending: user.commitmentPending,
        cardCommits: user.cardCommits,
        commitTime: user.commitTime,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error during login.' });
  }
};

/**
 * Validate a Google ID token and sign in or create the matching user.
 */
export const googleLoginController = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== 'string') {
      return res.status(400).json({ error: 'Google credential is required.' });
    }

    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!googleResponse.ok) {
      return res.status(401).json({ error: 'Invalid Google credential.' });
    }

    const googleUser = await googleResponse.json();
    if (googleUser.email_verified !== 'true' || !googleUser.email) {
      return res.status(401).json({ error: 'Google account email is not verified.' });
    }

    if (process.env.GOOGLE_CLIENT_ID && googleUser.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Google credential was issued for another application.' });
    }

    const normalizedEmail = googleUser.email.trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: googleUser.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10),
        type: 'google',
        isVerified: true,
        commitmentPending: true,
      });
    } else if (user.type !== 'google') {
      user.type = 'google';
      user.isVerified = true;
      await user.save();
    }

    const token = generateToken({ userId: user._id, email: user.email });
    return res.status(200).json({
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        isVerified: user.isVerified,
        commitmentPending: user.commitmentPending,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error during Google login.' });
  }
};

/**
 * Controller to get current authenticated user profile
 */
export const getProfileController = async (req, res) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error retrieving profile.' });
  }
};

/**
 * Controller to handle logout (stateless JWT acknowledgment)
 */
export const logoutController = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
};

export const resetPasswordController = async (req, res) => {
  try {
    const { newPassword } = req.body;

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Password reset token required.' });
    }

    const decoded = verifyToken(authHeader.slice(7));
    if (!decoded.temporary || !decoded.email) {
      return res.status(401).json({ error: 'Invalid password reset token.' });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired password reset token.' });
    }
    return res.status(500).json({ error: error.message || 'Server error during password reset.' });
  }
};

/**
 * Controller to handle saving user commitment
 * Saves studentType, timePerDay, flashcardsPerDay to DB and clears commitmentPending
 */
export const updateCommitmentController = async (req, res) => {
  try {
    const { studentType, timePerDay, flashcards } = req.body;

    if (!studentType || !timePerDay || !flashcards) {
      return res.status(400).json({ error: 'All commitment fields are required.' });
    }

    // req.userId is set by authenticateToken middleware
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.studentType = studentType;
    user.commitTime = timePerDay;       // e.g. "30 min" — daily study time
    user.cardCommits = Number(flashcards); // e.g. 20 — flashcards per session
    user.commitmentPending = false;
    user.hasCompletedCommitment = true;

    await user.save();

    res.status(200).json({
      message: 'Commitment saved successfully.',
      user: {
        id: user._id,
        name: user.name,
        studentType: user.studentType,
        commitTime: user.commitTime,
        cardCommits: user.cardCommits,
        hasCompletedCommitment: user.hasCompletedCommitment,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server error saving commitment.' });
  }
};
