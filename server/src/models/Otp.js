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

    otp: {
      type: String,
      required: true,
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

// Ensure one OTP per email (prevents duplicates)
otpSchema.index({ email: 1 }, { unique: true });

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;