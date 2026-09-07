import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    subjectCount: {
      type: Number,
      default: 0,
    },

    xp: {
      type: Number,
      default: 0,
    },

    level: {
      type: Number,
      default: 1,
    },

    streak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    totalQuestionsAnswered: {
      type: Number,
      default: 0,
    },

    totalQuestionsCorrect: {
      type: Number,
      default: 0,
    },

    totalStudyTime: {
      type: Number, // store in seconds
      default: 0,
    },

    dailyRevisionGoal: {
      type: Number,
      default: 0,
    },

    dailyRevisionCompleted: {
      type: Number,
      default: 0,
    },

    lastActivityAt: {
      type: Date,
    },

    lastRevisionAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export { UserProgress };
export default UserProgress;