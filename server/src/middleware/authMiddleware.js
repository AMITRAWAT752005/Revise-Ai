import { verifyToken } from '../utils/jwtUtils.js';
import User from '../models/User.js';

/**
 * Middleware to authenticate requests using JWT Bearer tokens
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access token missing. Please log in.' });
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
