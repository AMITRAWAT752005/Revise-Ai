import mongoose from 'mongoose';

/**
 * Session Model for managing refresh tokens and user sessions
 * Stores hashed refresh tokens (never raw tokens)
 * Supports session revocation and expiry tracking
 */
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      // TTL index: automatically delete expired sessions after 7 days
      expires: 604800, // 7 days in seconds
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  { 
    timestamps: false, // We manage createdAt manually
  }
);

// Compound index for finding active sessions for a user
sessionSchema.index({ userId: 1, revokedAt: 1, expiresAt: 1 });

const Session = mongoose.model('Session', sessionSchema);

export default Session;
