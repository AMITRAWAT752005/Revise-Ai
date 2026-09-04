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
      type: String, // e.g. '30 min', '1 hour' — daily study time commitment
      default: null,
    },
    studentType: {
      type: String,
      enum: ['College Student', 'School Student', 'Professional'],
      default: null,
    },
    commitmentPending: {
      type: Boolean,
      default: false,
    },
    hasCompletedCommitment: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
export default User;
