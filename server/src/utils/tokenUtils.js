import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'reviseai_default_jwt_secret_dev_key_2026';

/**
 * Access token configuration
 * Short-lived token for API authentication
 */
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

/**
 * Refresh token configuration
 * Long-lived token for session extension
 */
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate an access token
 * @param {Object} payload - Token payload
 * @param {string} [expiresIn] - Optional custom expiration (overrides config)
 * @returns {string} Signed access token
 */
export const generateAccessToken = (payload, expiresIn = ACCESS_TOKEN_EXPIRES_IN) => {
  return jwt.sign(
    { ...payload, tokenType: 'access' },
    JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Generate a refresh token (separate from access token)
 * This is primarily a JSON payload, the actual refresh token value
 * is generated separately via crypto.randomBytes()
 * @param {Object} payload - Token payload
 * @param {string} [expiresIn] - Optional custom expiration (overrides config)
 * @returns {string} Signed refresh token
 */
export const generateRefreshTokenJWT = (payload, expiresIn = REFRESH_TOKEN_EXPIRES_IN) => {
  return jwt.sign(
    { ...payload, tokenType: 'refresh' },
    JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verify and decode an access token
 * @param {string} token - Access token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  
  if (decoded.tokenType !== 'access') {
    throw new Error('Invalid token type. Expected access token.');
  }
  
  return decoded;
};

/**
 * Verify and decode a refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshTokenJWT = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  
  if (decoded.tokenType !== 'refresh') {
    throw new Error('Invalid token type. Expected refresh token.');
  }
  
  return decoded;
};

/**
 * Legacy: Verify a token without type checking (for backward compatibility)
 * DO NOT use for new code - use verifyAccessToken or verifyRefreshTokenJWT instead
 * @deprecated Use verifyAccessToken or verifyRefreshTokenJWT
 * @param {string} token - Token to verify
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Generate both access and refresh tokens
 * Convenience function for login/registration
 * @param {Object} payload - Payload for tokens
 * @returns {Object} { accessToken, refreshToken }
 */
export const generateTokenPair = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshTokenJWT(payload),
  };
};
