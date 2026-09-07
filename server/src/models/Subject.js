import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },

    colour: {
      type: String,
      default: 'indigo', // could be indigo, teal, purple based on UI theme
    },

    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    totalUnits: {
      type: Number,
      default: 0,
    },

    totalTopics: {
      type: Number,
      default: 0,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Subject = mongoose.model('Subject', subjectSchema);

export { Subject };
export default Subject;