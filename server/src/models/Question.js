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
      enum: ['MCQ', 'SHORT', 'LONG', 'TRUE_FALSE', 'FILL_BLANK'],
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
      required: true,
      trim: true,
      minlength: 1,
    },
    explanation: {
      type: String,
      trim: true,
      minlength: 1,
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
