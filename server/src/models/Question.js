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
      required: true,
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
    },
    options: {
      type: [String],
      default: undefined,
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

questionSchema.index({ userId: 1 });
questionSchema.index({ materialId: 1 });
questionSchema.index({ type: 1 });

const Question = mongoose.model('Question', questionSchema);

export { Question };
export default Question;
