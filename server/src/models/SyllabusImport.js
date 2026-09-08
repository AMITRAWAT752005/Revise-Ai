import mongoose from 'mongoose';

const detectedSubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    category: {
      type: String,
      trim: true,
      maxlength: 50,
    },
  },
  { _id: false },
);

const syllabusImportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt'],
      required: true,
    },
    fileReference: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
      index: true,
    },
    detectedSubjects: {
      type: [detectedSubjectSchema],
      default: [],
    },
    error: {
      type: String,
      maxlength: 1000,
    },
    completedAt: Date,
  },
  { timestamps: true },
);

syllabusImportSchema.index({ userId: 1, createdAt: -1 });

const SyllabusImport = mongoose.model('SyllabusImport', syllabusImportSchema);

export { SyllabusImport };
export default SyllabusImport;
