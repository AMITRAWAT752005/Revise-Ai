import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    cardCommits: {
      type: Number,
      default: 0,
    },
    commitTime: {
      type: Date,
    },
    commitmentPending: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
export default User;
