import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit',
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      required: true,
    },
    sourceChunks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'DocumentChunk',
      default: [],
    },
    type: {
      type: String,
      enum: [
        'MCQ',
        'Flashcard',
        'TrueFalse',
        'OneWord',
        'FillInTheBlank',
        'MatchTheFollowing',
        'Sequence',
        'SpotTheMistake',
        'WhatHappensNext',
        'ShortAnswer',
        'SHORT',
        'LONG',
        'TRUE_FALSE',
        'FILL_BLANK',
      ],
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    options: {
      type: [String],
      default: undefined,
      validate: {
        validator(value) {
          if (this.type !== 'MCQ') {
            return value === undefined || value === null || value.length === 0;
          }
          if (!Array.isArray(value) || value.length < 2) {
            return false;
          }
          return value.every((option) => typeof option === 'string' && option.trim().length > 0);
        },
        message: 'MCQ questions require at least two non-empty option strings.',
      },
    },
    correctAnswer: {
      type: String,
      trim: true,
      validate: {
        validator(value) {
          if (['MatchTheFollowing', 'Sequence', 'Flashcard'].includes(this.type)) {
            return true;
          }
          return typeof value === 'string' && value.trim().length > 0;
        },
        message: 'correctAnswer is required for this question type.',
      },
    },
    explanation: {
      type: String,
      trim: true,
      minlength: 1,
    },
    pairs: {
      type: [
        {
          left: { type: String, required: true, trim: true },
          right: { type: String, required: true, trim: true },
        },
      ],
      default: undefined,
      validate: {
        validator(value) {
          if (this.type !== 'MatchTheFollowing') {
            return value === undefined || value === null || value.length === 0;
          }
          return Array.isArray(value) && value.length >= 3;
        },
        message: 'MatchTheFollowing questions require at least 3 pairs.',
      },
    },
    orderedItems: {
      type: [String],
      default: undefined,
      validate: {
        validator(value) {
          if (this.type !== 'Sequence') {
            return value === undefined || value === null || value.length === 0;
          }
          return (
            Array.isArray(value) &&
            value.length >= 3 &&
            value.every((item) => typeof item === 'string' && item.trim().length > 0)
          );
        },
        message: 'Sequence questions require at least 3 non-empty ordered items.',
      },
    },
    statementWithMistake: {
      type: String,
      trim: true,
    },
    mistake: {
      type: String,
      trim: true,
    },
    correction: {
      type: String,
      trim: true,
    },
    scenario: {
      type: String,
      trim: true,
    },
    correctOutcome: {
      type: String,
      trim: true,
    },
    incorrectOutcomes: {
      type: [String],
      default: undefined,
    },
    idealAnswer: {
      type: String,
      trim: true,
    },
    statement: {
      type: String,
      trim: true,
    },
    front: {
      type: String,
      trim: true,
    },
    back: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.every((tag) => typeof tag === 'string' && tag.trim().length > 0);
        },
        message: 'tags must be a list of non-empty strings.',
      },
    },
    source: {
      type: String,
      enum: ['AI', 'manual'],
      required: true,
      default: 'AI',
    },
    aiMetadata: {
      promptId: {
        type: String,
        required: true,
        trim: true,
      },
      model: {
        type: String,
        required: true,
        trim: true,
      },
      generatedAt: {
        type: Date,
        required: true,
      },
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'failed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

questionSchema.index({ userId: 1 });
questionSchema.index({ subjectId: 1 });
questionSchema.index({ topicId: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ userId: 1, subjectId: 1 });
questionSchema.index({ userId: 1, topicId: 1 });
questionSchema.index({ subjectId: 1, topicId: 1 });
questionSchema.index({ userId: 1, subjectId: 1, topicId: 1, materialId: 1 });
questionSchema.index({ userId: 1, materialId: 1, status: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ type: 1 });

const Question = mongoose.model('Question', questionSchema);

export { Question };
export default Question;
