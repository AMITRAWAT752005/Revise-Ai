import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema(
  {
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      required: true,
    },
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
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    pageStart: {
      type: Number,
    },
    pageEnd: {
      type: Number,
    },
    tokenCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast retrieval by ownership and context
documentChunkSchema.index({ userId: 1 });
documentChunkSchema.index({ materialId: 1 });
documentChunkSchema.index({ subjectId: 1 });
documentChunkSchema.index({ topicId: 1 });
documentChunkSchema.index({ materialId: 1, chunkIndex: 1 });

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);

export { DocumentChunk };
export default DocumentChunk;
