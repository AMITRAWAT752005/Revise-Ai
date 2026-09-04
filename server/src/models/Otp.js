import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ['ACCOUNT_VERIFICATION', 'PASSWORD_RESET'],
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    // ⏱️ For expiry (TTL index)
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // auto delete after 5 minutes
    },

    // ⛔ Cooldown control (resend restriction)
    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // we only need createdAt
  }
);

// Ensure one OTP per email per purpose (prevents duplicates of the same type)
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;