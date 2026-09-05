import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Session from '../models/Session.js';

/**
 * Generate a cryptographically random refresh token
 * @returns {string} Raw refresh token (32 bytes, hex-encoded = 64 chars)
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a refresh token for database storage
 * @param {string} token - Raw refresh token
 * @returns {Promise<string>} Hashed token
 */
export const hashRefreshToken = async (token) => {
  return bcrypt.hash(token, 10);
};

/**
 * Compare a raw token with a hashed token
 * @param {string} token - Raw refresh token
 * @param {string} hash - Hashed token from database
 * @returns {Promise<boolean>} True if tokens match
 */
export const compareRefreshToken = async (token, hash) => {
  return bcrypt.compare(token, hash);
};

/**
 * Create a new session for a user
 * @param {string} userId - User ID
 * @param {string} refreshToken - Raw refresh token
 * @param {Object} options - Additional options
 * @param {number} [options.refreshTokenTTL=604800000] - Refresh token TTL in milliseconds (default 7 days)
 * @param {string} [options.userAgent] - User agent from request
 * @param {string} [options.ipAddress] - IP address from request
 * @returns {Promise<Object>} Created session document
 */
export const createSession = async (userId, refreshToken, options = {}) => {
  const { 
    refreshTokenTTL = 604800000, // 7 days in ms
    userAgent = null,
    ipAddress = null,
  } = options;

  const tokenHash = await hashRefreshToken(refreshToken);
  const expiresAt = new Date(Date.now() + refreshTokenTTL);

  const session = await Session.create({
    userId,
    refreshTokenHash: tokenHash,
    expiresAt,
    userAgent,
    ipAddress,
    createdAt: new Date(),
  });

  return session;
};

/**
 * Validate a refresh token against a stored session
 * @param {string} refreshToken - Raw refresh token from client
 * @param {string} sessionId - Session ID to validate against
 * @returns {Promise<Object|null>} Session document if valid, null if invalid/expired/revoked
 */
export const validateRefreshToken = async (refreshToken, sessionId) => {
  if (!sessionId || !refreshToken) {
    return null;
  }

  try {
    const session = await Session.findById(sessionId);

    if (!session) {
      return null;
    }

    // Check if session is revoked
    if (session.revokedAt) {
      return null;
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return null;
    }

    // Verify token hash
    const isValid = await compareRefreshToken(refreshToken, session.refreshTokenHash);
    if (!isValid) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
};

/**
 * Update last used timestamp for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>} Updated session
 */
export const updateLastUsed = async (sessionId) => {
  try {
    return await Session.findByIdAndUpdate(
      sessionId,
      { lastUsedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    return null;
  }
};

/**
 * Revoke a specific session
 * @param {string} sessionId - Session ID to revoke
 * @returns {Promise<Object|null>} Updated session
 */
export const revokeSession = async (sessionId) => {
  try {
    return await Session.findByIdAndUpdate(
      sessionId,
      { revokedAt: new Date() },
      { new: true }
    );
  } catch (error) {
    return null;
  }
};

/**
 * Revoke all sessions for a user
 * Useful for password reset or account security events
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with number of revoked sessions
 */
export const revokeAllUserSessions = async (userId) => {
  try {
    const result = await Session.updateMany(
      { userId, revokedAt: null }, // Only revoke active sessions
      { revokedAt: new Date() }
    );
    return {
      success: true,
      revokedCount: result.modifiedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      revokedCount: 0,
    };
  }
};

/**
 * Get all active sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Active sessions
 */
export const getActiveSessions = async (userId) => {
  try {
    return await Session.find({
      userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .select('_id userAgent ipAddress createdAt lastUsedAt expiresAt')
      .sort({ lastUsedAt: -1 });
  } catch (error) {
    return [];
  }
};

/**
 * Clean up expired sessions (if TTL index doesn't work)
 * @returns {Promise<Object>} Result with number of deleted sessions
 */
export const cleanupExpiredSessions = async () => {
  try {
    const result = await Session.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      deletedCount: 0,
    };
  }
};
