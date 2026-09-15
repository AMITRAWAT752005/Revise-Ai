/**
 * ReviseAI — Chunk Embedding Pipeline
 * Phase 4C-3 (Bikram Singh Bisht)
 *
 * Orchestrates the embedding and vector-indexing stage that follows Phase 4B
 * document processing.  For every DocumentChunk produced by the processing
 * pipeline this module:
 *
 *   1. Generates a 384-dimensional embedding via embeddingService.
 *   2. Upserts the vector + metadata payload into Qdrant via qdrantService.
 *   3. Persists the result back onto the DocumentChunk (embeddingStatus).
 *
 * Design contracts:
 *  - DocumentChunks are NEVER deleted here, regardless of outcome.
 *  - A single chunk failure is isolated; remaining chunks continue processing.
 *  - Chunks already marked 'indexed' are skipped (idempotent on retry).
 *  - This module is intentionally ignorant of the HTTP request lifecycle;
 *    it is always called inside a fire-and-forget background promise.
 *  - Qdrant infrastructure (collection setup, client config) lives in
 *    qdrantService and is NOT duplicated here.
 *  - Semantic search, search APIs, and RAG are strictly out of scope.
 */

import { DocumentChunk } from '../models/DocumentChunk.js';
import { generateEmbedding } from './embeddingService.js';
import { upsertVector } from './qdrantService.js';

// ── Constants ──────────────────────────────────────────────────────────────────

const LOG_PREFIX = '[ChunkEmbeddingPipeline]';

/**
 * How many chunks to embed in parallel within a single material batch.
 * Kept at 3 to balance throughput vs. memory pressure from the transformer model.
 * Increase cautiously — each slot holds a full ONNX inference call in memory.
 */
const CONCURRENCY_LIMIT = 3;

// ── Internal helpers ───────────────────────────────────────────────────────────

/**
 * Processes an array of tasks with bounded concurrency.
 *
 * @template T
 * @param {T[]} items - Items to process.
 * @param {(item: T) => Promise<void>} fn - Async task function.
 * @param {number} concurrency - Maximum simultaneous in-flight tasks.
 * @returns {Promise<void>}
 */
const runWithConcurrency = async (items, fn, concurrency) => {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item !== undefined) {
        await fn(item);
      }
    }
  });
  await Promise.all(workers);
};

/**
 * Builds the Qdrant vector ID for a DocumentChunk.
 * Uses the MongoDB ObjectId string so every vector is directly traceable to its
 * source document without any secondary lookup.
 *
 * @param {import('mongoose').Document} chunk
 * @returns {string}
 */
const buildVectorId = (chunk) => chunk._id.toString();

/**
 * Builds the Qdrant payload object from a DocumentChunk.
 * All IDs are cast to strings so the payload schema matches
 * vectorMetadataService.buildVectorPayload expectations.
 *
 * @param {import('mongoose').Document} chunk
 * @returns {Object}
 */
const buildPayload = (chunk) => ({
  userId: chunk.userId.toString(),
  subjectId: chunk.subjectId.toString(),
  unitId: chunk.unitId ? chunk.unitId.toString() : null,
  topicId: chunk.topicId ? chunk.topicId.toString() : null,
  materialId: chunk.materialId.toString(),
  chunkId: chunk._id.toString(),
  chunkIndex: chunk.chunkIndex,
  pageStart: chunk.pageStart ?? null,
  pageEnd: chunk.pageEnd ?? null,
});

// ── Core pipeline ──────────────────────────────────────────────────────────────

/**
 * Generates an embedding for a single DocumentChunk and upserts it into Qdrant.
 * Updates `embeddingStatus` and (on failure) `embeddingError` in MongoDB.
 *
 * This function NEVER throws — errors are caught, logged, and written to the
 * chunk record so the caller can continue with remaining chunks.
 *
 * @param {import('mongoose').Document} chunk - A hydrated DocumentChunk document.
 * @returns {Promise<{ success: boolean, chunkId: string }>}
 */
const embedSingleChunk = async (chunk) => {
  const chunkId = chunk._id.toString();

  try {
    // 1. Generate embedding vector (384 dimensions, L2-normalized)
    const vector = await generateEmbedding(chunk.text);

    // 2. Upsert into Qdrant — uses Amit's qdrantService which owns the
    //    collection config and client lifecycle.
    const vectorId = buildVectorId(chunk);
    const payload = buildPayload(chunk);
    await upsertVector(vectorId, vector, payload);

    // 3. Persist success state — clears any previous embeddingError
    await DocumentChunk.updateOne(
      { _id: chunk._id },
      { $set: { embeddingStatus: 'indexed' }, $unset: { embeddingError: '' } }
    );

    console.log(`${LOG_PREFIX} Indexed chunk ${chunkId} (index=${chunk.chunkIndex})`);
    return { success: true, chunkId };

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${LOG_PREFIX} Failed to index chunk ${chunkId}:`, message);

    // Preserve the chunk — only update the status fields.
    // The DocumentChunk itself is the source of truth and must not be deleted.
    try {
      await DocumentChunk.updateOne(
        { _id: chunk._id },
        { $set: { embeddingStatus: 'failed', embeddingError: message } }
      );
    } catch (dbError) {
      console.error(
        `${LOG_PREFIX} Could not persist failure status for chunk ${chunkId}:`,
        dbError.message
      );
    }

    return { success: false, chunkId };
  }
};

/**
 * Embeds all unindexed DocumentChunks for a given material and upserts them
 * into Qdrant.
 *
 * Behaviour:
 *  - Skips chunks already in `embeddingStatus: 'indexed'` (idempotent).
 *  - Processes up to CONCURRENCY_LIMIT chunks simultaneously.
 *  - Individual chunk failures do NOT stop the batch.
 *  - Returns a summary object for observability/logging.
 *
 * This function is designed to be called inside a fire-and-forget context
 * after document processing completes. It NEVER throws — all errors are
 * contained and logged so the outer background promise does not reject.
 *
 * @param {string|import('mongoose').Types.ObjectId} materialId
 * @returns {Promise<{ total: number, indexed: number, failed: number, skipped: number }>}
 */
export const embedChunksForMaterial = async (materialId) => {
  const summary = { total: 0, indexed: 0, failed: 0, skipped: 0 };

  try {
    // Fetch only chunks that still need embedding — either 'pending' (fresh) or
    // 'failed' (retrying after a previous partial failure).
    const chunks = await DocumentChunk.find({
      materialId,
      embeddingStatus: { $in: ['pending', 'failed'] },
    }).sort({ chunkIndex: 1 });

    summary.total = chunks.length;

    if (chunks.length === 0) {
      console.log(`${LOG_PREFIX} No unindexed chunks found for material ${materialId} — skipping.`);
      return summary;
    }

    console.log(
      `${LOG_PREFIX} Starting embedding for material ${materialId}: ` +
      `${chunks.length} chunk(s) to index (concurrency=${CONCURRENCY_LIMIT}).`
    );

    await runWithConcurrency(
      chunks,
      async (chunk) => {
        const result = await embedSingleChunk(chunk);
        if (result.success) {
          summary.indexed += 1;
        } else {
          summary.failed += 1;
        }
      },
      CONCURRENCY_LIMIT
    );

    // Skipped = already 'indexed' before this run.
    // We can compute it from total docs vs. what we fetched.
    const allCount = await DocumentChunk.countDocuments({ materialId });
    summary.skipped = allCount - chunks.length;

    console.log(
      `${LOG_PREFIX} Completed embedding for material ${materialId}: ` +
      `indexed=${summary.indexed}, failed=${summary.failed}, skipped=${summary.skipped}.`
    );

  } catch (error) {
    // Outer catch covers unexpected failures (e.g. MongoDB query error).
    // We log and return the partial summary so the caller is aware but not blocked.
    console.error(
      `${LOG_PREFIX} Unexpected error during embedding for material ${materialId}:`,
      error instanceof Error ? error.message : error
    );
  }

  return summary;
};
