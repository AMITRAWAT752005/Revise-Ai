import mongoose from 'mongoose';

/**
 * @typedef {'pending'|'indexed'|'failed'} EmbeddingStatus
 *
 * pending  — chunk saved but not yet embedded (initial state)
 * indexed  — embedding generated and successfully upserted into Qdrant
 * failed   — embedding generation or Qdrant upsert failed; chunk is preserved
 */

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
    // ── Phase 4C-3: Embedding status tracking ─────────────────────────────────
    // Tracks whether this chunk has been successfully embedded and indexed in
    // Qdrant. The chunk document is NEVER deleted on embedding failure; only
    // this field is updated so the state is visible and retryable.
    embeddingStatus: {
      type: String,
      enum: ['pending', 'indexed', 'failed'],
      default: 'pending',
      required: true,
    },
    // Human-readable error stored when embeddingStatus === 'failed'.
    // Cleared to undefined when a retry succeeds.
    embeddingError: {
      type: String,
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
// Phase 4C-3: enables efficient retry queries (find all pending/failed chunks for a material)
documentChunkSchema.index({ materialId: 1, embeddingStatus: 1 });

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema);

export { DocumentChunk };
export default DocumentChunk;
