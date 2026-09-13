import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    processingStatus: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
    },
    processingProgress: {
      type: Number,
      default: 0,
    },
    processingError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes to speed up queries by user and subject/unit/topic
studyMaterialSchema.index({ userId: 1 });
studyMaterialSchema.index({ subjectId: 1 });
studyMaterialSchema.index({ unitId: 1 });
studyMaterialSchema.index({ topicId: 1 });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

export { StudyMaterial };
export default StudyMaterial;
