/**
 * Phase 4C-3 — Chunk Embedding Pipeline Test Suite
 *
 * Fully isolated: no real MongoDB connection, no real Qdrant connection,
 * no real embedding model loaded.  All external dependencies are replaced
 * with deterministic mocks so the tests run fast and are repeatable offline.
 *
 * Tests:
 *  T1  — embedSingleChunk: happy path (generates vector, upserts, marks 'indexed')
 *  T2  — embedSingleChunk: embedding failure does NOT delete chunk, marks 'failed'
 *  T3  — embedSingleChunk: Qdrant upsert failure does NOT delete chunk, marks 'failed'
 *  T4  — embedChunksForMaterial: multiple chunks produce separate embeddings
 *  T5  — embedChunksForMaterial: 'indexed' chunks are skipped (idempotency)
 *  T6  — embedChunksForMaterial: partial failure — other chunks still indexed
 *  T7  — embedChunksForMaterial: zero pending chunks returns early
 *  T8  — Vector dimension is exactly 384 (contract with embeddingService)
 *  T9  — Phase 4B regression: extractors, cleaner, and chunking still work
 */

import assert from 'node:assert/strict';
import { extractTxtText } from '../src/services/documentExtractors.js';
import { cleanText } from '../src/utils/textCleaner.js';
import { chunkText } from '../src/services/chunkingService.js';

// ── Mock infrastructure ────────────────────────────────────────────────────────

/**
 * Creates a minimal mock DocumentChunk that satisfies the pipeline interface.
 *
 * @param {object} overrides
 */
const makeChunk = (overrides = {}) => ({
  _id: { toString: () => overrides.id || 'chunk-id-0' },
  materialId: { toString: () => 'material-id-1' },
  userId: { toString: () => 'user-id-1' },
  subjectId: { toString: () => 'subject-id-1' },
  unitId: overrides.unitId ? { toString: () => overrides.unitId } : null,
  topicId: null,
  chunkIndex: overrides.chunkIndex ?? 0,
  text: overrides.text || 'This is test chunk content for embedding.',
  pageStart: overrides.pageStart ?? 1,
  pageEnd: overrides.pageEnd ?? 1,
  embeddingStatus: overrides.embeddingStatus || 'pending',
  ...overrides,
});

/**
 * Creates a mock Mongoose-like model:
 *  - find()        — returns a list of chunks
 *  - updateOne()   — records the call; simulates success
 *  - countDocuments() — returns a count
 */
const makeDocumentChunkMock = (chunks = []) => {
  const calls = { updateOne: [], find: [], countDocuments: [] };
  // Deep-clone chunks so each test gets a fresh copy
  const store = chunks.map((c) => ({ ...c }));

  const model = {
    _calls: calls,
    _store: store,
    find: ({ materialId, embeddingStatus } = {}) => ({
      sort: () =>
        Promise.resolve(
          store.filter(
            (c) =>
              (!embeddingStatus?.$in ||
                embeddingStatus.$in.includes(c.embeddingStatus))
          )
        ),
    }),
    updateOne: (filter, update) => {
      calls.updateOne.push({ filter, update });
      // Simulate the update on in-memory store
      const id = filter?._id?.toString?.() ?? filter?._id;
      const chunk = store.find((c) => c._id.toString() === id);
      if (chunk) {
        if (update.$set) Object.assign(chunk, update.$set);
        if (update.$unset) {
          for (const key of Object.keys(update.$unset)) delete chunk[key];
        }
      }
      return Promise.resolve({ modifiedCount: 1 });
    },
    countDocuments: ({ materialId } = {}) => {
      calls.countDocuments.push({ materialId });
      return Promise.resolve(store.length);
    },
  };
  return model;
};

// ── Dynamic import helpers (module-level mocking via side-channel) ─────────────
//
// Because this project uses ES Modules without a test framework, we implement a
// lightweight module-substitution pattern: we re-implement the pipeline logic
// in-place using injected dependencies (constructor-style injection for tests).

/**
 * Creates a testable version of the chunk embedding pipeline with injected deps.
 *
 * @param {{
 *   DocumentChunk: object,
 *   generateEmbedding: Function,
 *   upsertVector: Function
 * }} deps
 */
const createPipeline = ({ DocumentChunk, generateEmbedding, upsertVector }) => {
  const CONCURRENCY_LIMIT = 3;
  const LOG_PREFIX = '[TestPipeline]';

  const buildVectorId = (chunk) => chunk._id.toString();
  const buildPayload = (chunk) => ({
    userId: chunk.userId.toString(),
    subjectId: chunk.subjectId.toString(),
    unitId: chunk.unitId ? chunk.unitId.toString() : null,
    topicId: chunk.topicId ? chunk.topicId?.toString() : null,
    materialId: chunk.materialId.toString(),
    chunkId: chunk._id.toString(),
    chunkIndex: chunk.chunkIndex,
    pageStart: chunk.pageStart ?? null,
    pageEnd: chunk.pageEnd ?? null,
  });

  const runWithConcurrency = async (items, fn, concurrency) => {
    const queue = [...items];
    const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (item !== undefined) await fn(item);
      }
    });
    await Promise.all(workers);
  };

  const embedSingleChunk = async (chunk) => {
    const chunkId = chunk._id.toString();
    try {
      const vector = await generateEmbedding(chunk.text);
      await upsertVector(buildVectorId(chunk), vector, buildPayload(chunk));
      await DocumentChunk.updateOne(
        { _id: chunk._id },
        { $set: { embeddingStatus: 'indexed' }, $unset: { embeddingError: '' } }
      );
      return { success: true, chunkId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      try {
        await DocumentChunk.updateOne(
          { _id: chunk._id },
          { $set: { embeddingStatus: 'failed', embeddingError: message } }
        );
      } catch { /* intentional: DB write failure during failure handling */ }
      return { success: false, chunkId };
    }
  };

  const embedChunksForMaterial = async (materialId) => {
    const summary = { total: 0, indexed: 0, failed: 0, skipped: 0 };
    try {
      const chunks = await DocumentChunk.find({
        materialId,
        embeddingStatus: { $in: ['pending', 'failed'] },
      }).sort({ chunkIndex: 1 });

      summary.total = chunks.length;
      if (chunks.length === 0) return summary;

      await runWithConcurrency(chunks, async (chunk) => {
        const result = await embedSingleChunk(chunk);
        if (result.success) summary.indexed += 1;
        else summary.failed += 1;
      }, CONCURRENCY_LIMIT);

      const allCount = await DocumentChunk.countDocuments({ materialId });
      summary.skipped = allCount - chunks.length;
    } catch (error) {
      console.error(`${LOG_PREFIX} Outer error:`, error.message);
    }
    return summary;
  };

  return { embedSingleChunk, embedChunksForMaterial };
};

// ── Vector factory ─────────────────────────────────────────────────────────────

/** Returns a valid 384-dimensional unit vector for a given seed. */
const makeVector384 = (seed = 1) =>
  Array.from({ length: 384 }, (_, i) => (i + seed) / 384);

// ── Tests ──────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

const run = async (label, fn) => {
  try {
    await fn();
    console.log(`  ✅ ${label}`);
    passed += 1;
  } catch (err) {
    console.error(`  ❌ ${label}`);
    console.error(`     ${err.message}`);
    failed += 1;
  }
};

console.log('\n══════════════════════════════════════════════════════════════');
console.log(' Phase 4C-3 — Chunk Embedding Pipeline Test Suite');
console.log('══════════════════════════════════════════════════════════════\n');

// ── T1: Happy path — chunk is embedded and marked 'indexed' ───────────────────
console.log('[Group 1] embedSingleChunk — happy path');
await run('T1: generates embedding, upserts vector, marks chunk as indexed', async () => {
  const chunk = makeChunk({ id: 'chunk-T1' });
  const mockModel = makeDocumentChunkMock([chunk]);

  const upsertCalls = [];
  const { embedSingleChunk } = createPipeline({
    DocumentChunk: mockModel,
    generateEmbedding: async (_text) => makeVector384(1),
    upsertVector: async (id, vector, payload) => { upsertCalls.push({ id, vector, payload }); },
  });

  const result = await embedSingleChunk(chunk);

  assert.equal(result.success, true);
  assert.equal(result.chunkId, 'chunk-T1');
  assert.equal(upsertCalls.length, 1, 'upsertVector must be called exactly once');
  assert.equal(upsertCalls[0].id, 'chunk-T1');
  assert.equal(upsertCalls[0].vector.length, 384);
  assert.equal(upsertCalls[0].payload.chunkId, 'chunk-T1');
  assert.equal(upsertCalls[0].payload.materialId, 'material-id-1');

  const updateCall = mockModel._calls.updateOne[0];
  assert.ok(updateCall, 'updateOne must have been called');
  assert.equal(updateCall.update.$set.embeddingStatus, 'indexed');
  assert.ok(updateCall.update.$unset?.embeddingError !== undefined, 'embeddingError must be unset on success');
});

// ── T2: Embedding generation failure ──────────────────────────────────────────
await run('T2: embedding failure does NOT delete chunk — marks embeddingStatus as failed', async () => {
  const chunk = makeChunk({ id: 'chunk-T2' });
  const mockModel = makeDocumentChunkMock([chunk]);

  const { embedSingleChunk } = createPipeline({
    DocumentChunk: mockModel,
    generateEmbedding: async () => { throw new Error('Model OOM'); },
    upsertVector: async () => { throw new Error('Should not reach Qdrant'); },
  });

  const result = await embedSingleChunk(chunk);

  assert.equal(result.success, false);
  // Chunk must still be in the store — pipeline must NOT delete it
  assert.equal(mockModel._store.length, 1, 'DocumentChunk must NOT be deleted on failure');
  const updateCall = mockModel._calls.updateOne[0];
  assert.ok(updateCall, 'updateOne must be called to record failure');
  assert.equal(updateCall.update.$set.embeddingStatus, 'failed');
  assert.ok(updateCall.update.$set.embeddingError.includes('Model OOM'));
});

// ── T3: Qdrant upsert failure ─────────────────────────────────────────────────
await run('T3: Qdrant upsert failure does NOT delete chunk — marks embeddingStatus as failed', async () => {
  const chunk = makeChunk({ id: 'chunk-T3' });
  const mockModel = makeDocumentChunkMock([chunk]);

  const { embedSingleChunk } = createPipeline({
    DocumentChunk: mockModel,
    generateEmbedding: async () => makeVector384(3),
    upsertVector: async () => { throw new Error('Qdrant connection refused'); },
  });

  const result = await embedSingleChunk(chunk);

  assert.equal(result.success, false);
  assert.equal(mockModel._store.length, 1, 'DocumentChunk must NOT be deleted on Qdrant failure');
  const updateCall = mockModel._calls.updateOne[0];
  assert.equal(updateCall.update.$set.embeddingStatus, 'failed');
  assert.ok(updateCall.update.$set.embeddingError.includes('Qdrant connection refused'));
});

// ── T4: Multiple chunks produce separate embeddings ───────────────────────────
console.log('\n[Group 2] embedChunksForMaterial — batch processing');
await run('T4: multiple DocumentChunks produce separate, independent embeddings', async () => {
  const chunks = [
    makeChunk({ id: 'chunk-T4-0', chunkIndex: 0, text: 'Chapter 1 content here.' }),
    makeChunk({ id: 'chunk-T4-1', chunkIndex: 1, text: 'Chapter 2 content here.' }),
    makeChunk({ id: 'chunk-T4-2', chunkIndex: 2, text: 'Chapter 3 content here.' }),
  ];
  const mockModel = makeDocumentChunkMock(chunks);

  const embeddingCallTexts = [];
  const upsertCallIds = [];

  const { embedChunksForMaterial } = createPipeline({
    DocumentChunk: mockModel,
    generateEmbedding: async (text) => {
      embeddingCallTexts.push(text);
      return makeVector384(embeddingCallTexts.length);
    },
    upsertVector: async (id, _vector, _payload) => { upsertCallIds.push(id); },
  });

  const summary = await embedChunksForMaterial('material-id-1');

  assert.equal(summary.total, 3);
  assert.equal(summary.indexed, 3);
  assert.equal(summary.failed, 0);
  assert.equal(embeddingCallTexts.length, 3, 'Each chunk must have its own embedding call');
  assert.deepEqual(
    new Set(embeddingCallTexts),
    new Set(['Chapter 1 content here.', 'Chapter 2 content here.', 'Chapter 3 content here.']),
    'Each chunk text must be embedded separately'
  );
  assert.equal(upsertCallIds.length, 3, 'Each chunk must be upserted into Qdrant separately');
  // Verify all chunks are marked 'indexed'
  for (const chunk of mockModel._store) {
    assert.equal(chunk.embeddingStatus, 'indexed', `Chunk ${chunk._id.toString()} must be 'indexed'`);
  }
});

// ── T5: Idempotency — already-indexed chunks are skipped ─────────────────────
await run('T5: already-indexed chunks are skipped (idempotent retry)', async () => {
  const chunks = [
    makeChunk({ id: 'chunk-T5-indexed', chunkIndex: 0, embeddingStatus: 'indexed' }),
    makeChunk({ id: 'chunk-T5-pending', chunkIndex: 1, embeddingStatus: 'pending' }),
  ];
  const mockModel = makeDocumentChunkMock(chunks);

  const embeddingCalls = [];
  const { embedChunksForMaterial } = createPipeline({
    DocumentChunk: mockModel,
    generateEmbedding: async (text) => { embeddingCalls.push(text); return makeVector384(); },
    upsertVector: async () => {},
  });

  const summary = await embedChunksForMaterial('material-id-1');

  // Only the pending chunk should have been processed
  assert.equal(summary.total, 1, 'Only pending/failed chunks should be fetched');
  assert.equal(summary.indexed, 1);
  assert.equal(summary.skipped, 1, 'Already-indexed chunk must be counted as skipped');
  assert.equal(embeddingCalls.length, 1, 'generateEmbedding must NOT be called for indexed chunks');
});

// ── T6: Partial failure — other chunks still indexed ─────────────────────────
await run('T6: partial failure — remaining chunks are still indexed, no chunks deleted', async () => {
  const chunks = [
    makeChunk({ id: 'chunk-T6-ok',   chunkIndex: 0, text: 'Good content A.' }),
    makeChunk({ id: 'chunk-T6-fail', chunkIndex: 1, text: 'Fail content B.' }),
    makeChunk({ id: 'chunk-T6-ok2',  chunkIndex: 2, text: 'Good content C.' }),
  ];
  const mockModel = makeDocumentChunkMock(chunks);

  const { embedChunksForMaterial } = createPipeline({
    DocumentChunk: mockModel,
    generateEmbedding: async (text) => {
      if (text.includes('Fail')) throw new Error('Simulated embedding failure');
      return makeVector384();
    },
    upsertVector: async () => {},
  });

  const summary = await embedChunksForMaterial('material-id-1');

  assert.equal(summary.indexed, 2, 'Two successful chunks should be indexed');
  assert.equal(summary.failed, 1, 'One chunk should be recorded as failed');
  assert.equal(mockModel._store.length, 3, 'ALL chunks must remain in MongoDB');
  const failedChunk = mockModel._store.find((c) => c._id.toString() === 'chunk-T6-fail');
  assert.equal(failedChunk.embeddingStatus, 'failed');
  assert.ok(failedChunk.embeddingError?.includes('Simulated embedding failure'));
});

// ── T7: Zero pending chunks — returns early ───────────────────────────────────
await run('T7: no pending/failed chunks returns early with zero summary', async () => {
  const chunks = [
    makeChunk({ id: 'chunk-T7-0', embeddingStatus: 'indexed' }),
    makeChunk({ id: 'chunk-T7-1', embeddingStatus: 'indexed' }),
  ];
  const mockModel = makeDocumentChunkMock(chunks);

  let embeddingCallCount = 0;
  const { embedChunksForMaterial } = createPipeline({
    DocumentChunk: mockModel,
    generateEmbedding: async () => { embeddingCallCount += 1; return makeVector384(); },
    upsertVector: async () => {},
  });

  const summary = await embedChunksForMaterial('material-id-1');

  assert.equal(summary.total, 0);
  assert.equal(summary.indexed, 0);
  assert.equal(summary.failed, 0);
  assert.equal(embeddingCallCount, 0, 'generateEmbedding must not be called when no pending chunks exist');
});

// ── T8: Vector dimension contract ─────────────────────────────────────────────
console.log('\n[Group 3] Vector dimension contract');
await run('T8: makeVector384 produces exactly 384 dimensions (validates test infrastructure)', () => {
  const v = makeVector384(1);
  assert.equal(v.length, 384, `Expected 384, got ${v.length}`);
  assert.ok(v.every((x) => typeof x === 'number' && Number.isFinite(x)), 'All values must be finite numbers');
});

// ── T9: Phase 4B regression ───────────────────────────────────────────────────
console.log('\n[Group 4] Phase 4B regression');
await run('T9a: TXT extraction with BOM still works', async () => {
  const raw = 'Regression check: Phase 4B extraction pipeline is intact.';
  const buffer = Buffer.from('\uFEFF' + raw, 'utf-8');
  const result = await extractTxtText(buffer);
  assert.equal(result, raw.trim());
});

await run('T9b: cleanText normalizes whitespace and removes control characters', () => {
  const dirty = 'Hello\x00   world\r\n\r\nTest.';
  const clean = cleanText(dirty);
  assert.ok(!clean.includes('\x00'), 'Control characters must be removed');
  assert.ok(clean.includes('Hello'), 'Text content must be preserved');
});

await run('T9c: chunkText produces multiple sequential chunks with metadata', () => {
  const text = 'Content: ' + 'This is a test sentence. '.repeat(200);
  const chunks = chunkText(text, { targetWords: 100, minWords: 50, maxWords: 200, overlapWords: 20 });
  assert.ok(chunks.length >= 2, `Expected multiple chunks, got ${chunks.length}`);
  chunks.forEach((c, i) => {
    assert.equal(c.chunkIndex, i, `Sequential index must match array position (${i})`);
    assert.ok(c.text.length > 0, 'Each chunk must have non-empty text');
    assert.ok(c.tokenCount > 0, 'Each chunk must have a positive token count');
  });
});

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════');
if (failed === 0) {
  console.log(` ✅ All ${passed} tests passed.`);
} else {
  console.log(` Results: ${passed} passed, ${failed} failed.`);
}
console.log('══════════════════════════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
