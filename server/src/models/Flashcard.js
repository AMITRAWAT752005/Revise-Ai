import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
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
    front: {
      type: String,
      required: true,
      trim: true,
    },
    back: {
      type: String,
      required: true,
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

flashcardSchema.index({ userId: 1 });
flashcardSchema.index({ subjectId: 1 });
flashcardSchema.index({ topicId: 1 });
flashcardSchema.index({ userId: 1, subjectId: 1, topicId: 1, materialId: 1 });
flashcardSchema.index({ userId: 1, materialId: 1, status: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export { Flashcard };
export default Flashcard;
