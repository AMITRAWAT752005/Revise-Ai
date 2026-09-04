import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reviseai_default_jwt_secret_dev_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT for a given payload
 * @param {Object} payload - Data to encode into the token
 * @param {string} [expiresIn] - Optional custom expiration time
 * @returns {string} Signed JWT string
 */
export const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify and decode a JWT
 * @param {string} token - The JWT string to verify
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
