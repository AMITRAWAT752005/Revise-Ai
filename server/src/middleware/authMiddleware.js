import { verifyAccessToken, verifyToken, generateAccessToken } from '../utils/tokenUtils.js';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, getCookie, setAuthCookie } from '../utils/authCookie.js';
import { validateRefreshToken, updateLastUsed } from '../services/sessionService.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate requests using the HttpOnly auth cookie.
 * 
 * Implements access token + refresh token architecture:
 * 1. Validates short-lived access token (15 minutes)
 * 2. If access token expired, attempts to refresh using refresh token
 * 3. Refresh token stored in database (revocable)
 * 4. If both tokens invalid/expired, returns 401
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Try to get access token from cookie
    const accessToken = getCookie(req, AUTH_COOKIE_NAME);

    // If no access token, try to refresh
    if (!accessToken) {
      return await refreshAccessToken(req, res, next);
    }

    try {
      // Validate access token
      const decoded = verifyAccessToken(accessToken);
      const userId = decoded.userId || decoded.id;

      if (!userId) {
        return res.status(401).json({ error: 'Invalid token payload.' });
      }

      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(401).json({ error: 'User account no longer exists.' });
      }

      req.user = user;
      req.userId = user._id;
      req.sessionId = decoded.sessionId;
      
      return next();
    } catch (error) {
      // Access token validation failed
      if (error.name === 'TokenExpiredError') {
        // Try to refresh the access token
        return await refreshAccessToken(req, res, next);
      }
      
      // Invalid token format or other JWT error
      return res.status(401).json({ error: 'Invalid or malformed authentication token.' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Authentication error.' });
  }
};

/**
 * Attempt to refresh access token using refresh token
 * @private
 */
async function refreshAccessToken(req, res, next) {
  try {
    const refreshTokenJWT = getCookie(req, REFRESH_COOKIE_NAME);

    if (!refreshTokenJWT) {
      return res.status(401).json({ error: 'Access token required. Please log in.' });
    }

    try {
      // Decode refresh token JWT (doesn't verify expiry yet)
      const decoded = verifyToken(refreshTokenJWT);

      if (!decoded.sessionId || !decoded.userId) {
        return res.status(401).json({ error: 'Invalid refresh token payload.' });
      }

      // Validate refresh token against database session
      const session = await validateRefreshToken(refreshTokenJWT, decoded.sessionId);

      if (!session) {
        return res.status(401).json({ 
          error: 'Refresh token is invalid, expired, or revoked. Please log in again.' 
        });
      }

      // Get user
      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ error: 'User account no longer exists.' });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: user._id,
        email: user.email,
        sessionId: session._id,
      });

      // Update last used timestamp for session
      await updateLastUsed(session._id);

      // Set new access token cookie
      setAuthCookie(res, newAccessToken);

      // Attach user to request
      req.user = user;
      req.userId = user._id;
      req.sessionId = session._id;

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Refresh token expired. Please log in again.' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid refresh token format.' });
      }
      return res.status(401).json({ error: 'Token refresh failed. Please log in again.' });
    }
  } catch (error) {
    return res.status(401).json({ error: 'Authentication error during token refresh.' });
  }
}
