import { verifyToken } from '../utils/jwtUtils.js';
import { AUTH_COOKIE_NAME, getCookie } from '../utils/authCookie.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate requests using the HttpOnly auth cookie.
 * Bearer tokens remain supported temporarily for migration compatibility.
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = getCookie(req, AUTH_COOKIE_NAME)
      || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

    if (!token) {
      return res.status(401).json({ error: 'Access token required. Please log in.' });
    }

    const decoded = verifyToken(token);
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
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid or malformed authentication token.' });
  }
};
