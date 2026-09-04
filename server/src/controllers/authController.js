import bcrypt from 'bcryptjs';
import { sendOtp, verifyOtp } from '../services/otpService.js';
import { generateToken } from '../utils/jwtUtils.js';
import { validateName, validateEmail, validatePassword } from '../utils/validationUtils.js';
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
    
    // If verifying account registration, update user record in database if it exists
    if (purpose === 'ACCOUNT_VERIFICATION') {
      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        user.isVerified = true;
        await user.save();
      }
    }

    res.status(200).json(result);
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

    res.status(201).json({
      message: 'Registration successful. Please verify your email with OTP.',
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

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

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
