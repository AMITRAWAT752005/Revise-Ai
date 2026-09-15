import assert from 'node:assert/strict';
import {
  QDRANT_COLLECTION_NAME,
  QDRANT_VECTOR_SIZE,
  buildStableVectorId,
  checkCollectionExists,
  createCollection,
  initQdrant,
  setQdrantClientForTests,
  upsertChunkVector,
  upsertVector,
} from '../src/services/qdrantService.js';

const calls = [];
let collections = [];
const fakeClient = {
  async getCollections() {
    calls.push(['getCollections']);
    return { collections };
  },
  async createCollection(name, config) {
    calls.push(['createCollection', name, config]);
    collections = [{ name }];
    return true;
  },
  async upsert(name, request) {
    calls.push(['upsert', name, request]);
    return { status: 'acknowledged' };
  },
};

setQdrantClientForTests(fakeClient);
const created = await initQdrant(fakeClient);
assert.equal(created, fakeClient);
assert.equal(collections[0].name, QDRANT_COLLECTION_NAME);
const createCall = calls.find(([name]) => name === 'createCollection');
assert.ok(createCall);
assert.deepEqual(createCall[2], {
  vectors: { size: QDRANT_VECTOR_SIZE, distance: 'Cosine' },
});
assert.equal(await checkCollectionExists(fakeClient), true);

const vector = Array.from({ length: QDRANT_VECTOR_SIZE }, (_, index) => index / QDRANT_VECTOR_SIZE);
const materialId = 'material-1';
const chunkId = 'chunk-1';
const chunkIndex = 0;
const stableId = buildStableVectorId(materialId, chunkId, chunkIndex);
const sameStableId = buildStableVectorId(materialId, chunkId, chunkIndex);
assert.equal(stableId, sameStableId);
assert.notEqual(stableId, buildStableVectorId(materialId, chunkId, 1));

await upsertVector(stableId, vector, {
  userId: 'user-1',
  subjectId: 'subject-1',
  materialId,
  chunkId,
  chunkIndex,
});

const upsertCall = calls.find(([name]) => name === 'upsert');
assert.equal(upsertCall[1], QDRANT_COLLECTION_NAME);
assert.equal(upsertCall[2].points[0].id, stableId);
assert.equal(upsertCall[2].points[0].vector.length, QDRANT_VECTOR_SIZE);
assert.deepEqual(upsertCall[2].points[0].payload, {
  userId: 'user-1',
  subjectId: 'subject-1',
  unitId: null,
  topicId: null,
  materialId,
  chunkId,
  chunkIndex,
  pageStart: null,
  pageEnd: null,
});

const retryChunk = {
  userId: 'user-1',
  subjectId: 'subject-1',
  materialId,
  chunkId,
  chunkIndex,
  pageStart: 3,
  pageEnd: 4,
};
const retryUpsertId = await upsertChunkVector(retryChunk, vector);
assert.equal(retryUpsertId, stableId);

// TEST 1: transient failure retries successfully with one stable vector ID.
{
  let attempts = 0;
  const vectorIds = [];
  setQdrantClientForTests({
    async upsert(_name, request) {
      attempts += 1;
      vectorIds.push(request.points[0].id);
      if (attempts === 1) {
        throw new Error('transient Qdrant failure');
      }
      return { status: 'acknowledged' };
    },
  });

  const retryResult = await upsertVector(stableId, vector, {
    userId: 'user-1',
    subjectId: 'subject-1',
    materialId,
    chunkId,
    chunkIndex,
  }, { baseDelayMs: 0 });

  assert.equal(retryResult, stableId, 'Retry success must return the stable vector ID');
  assert.equal(attempts, 2, 'The failed first upsert must trigger exactly one retry');
  assert.deepEqual(new Set(vectorIds), new Set([stableId]), 'Retry must reuse one vector ID, not create a duplicate identity');
}

// TEST 2: only failed chunk IDs are retried; successful IDs are not duplicated.
{
  const chunks = Array.from({ length: 5 }, (_, index) => ({
    userId: 'user-1',
    subjectId: 'subject-1',
    materialId: 'material-partial',
    chunkId: `chunk-${index}`,
    chunkIndex: index,
    vector,
  }));
  const failedChunkIds = new Set(['chunk-1', 'chunk-3']);
  const storedVectorIds = new Set();
  const successfulWriteCounts = new Map();
  const initialAttempts = new Map();
  let retryMode = false;

  setQdrantClientForTests({
    async upsert(_name, request) {
      const point = request.points[0];
      const chunkIdFromPayload = point.payload.chunkId;
      const count = (initialAttempts.get(chunkIdFromPayload) || 0) + 1;
      initialAttempts.set(chunkIdFromPayload, count);

      if (!retryMode && failedChunkIds.has(chunkIdFromPayload)) {
        throw new Error(`failed ${chunkIdFromPayload}`);
      }

      storedVectorIds.add(point.id);
  successfulWriteCounts.set(point.id, (successfulWriteCounts.get(point.id) || 0) + 1);
      return { status: 'acknowledged' };
    },
  });

  const initialResults = await Promise.allSettled(chunks.map((chunk) => upsertChunkVector(chunk, vector, { baseDelayMs: 0 })));
  assert.equal(initialResults.filter((result) => result.status === 'fulfilled').length, 3);
  assert.equal(initialResults.filter((result) => result.status === 'rejected').length, 2);
  assert.equal(storedVectorIds.size, 3, 'Initial indexing must store exactly the three successful vectors');
  assert.equal(
    [...successfulWriteCounts.values()].reduce((total, count) => total + count, 0),
    3,
    'Exactly three successful upserts must occur initially'
  );

  retryMode = true;
  await Promise.all(
    chunks
      .filter((chunk) => failedChunkIds.has(chunk.chunkId))
      .map((chunk) => upsertChunkVector(chunk, vector, { baseDelayMs: 0 }))
  );

  assert.equal(storedVectorIds.size, 5, 'After retry, the vector store must contain exactly five unique vectors');
  assert.ok([...storedVectorIds].every((id) => typeof id === 'string'));
  assert.equal(
    [...successfulWriteCounts.values()].reduce((total, count) => total + count, 0),
    5,
    'The final successful-upsert total must be exactly five'
  );
  for (const chunk of chunks) {
    const vectorId = buildStableVectorId(chunk.materialId, chunk.chunkId, chunk.chunkIndex);
    assert.equal(successfulWriteCounts.get(vectorId), 1, `Chunk ${chunk.chunkId} must have exactly one successful upsert`);
  }
}

// TEST 3: complete Qdrant outage is surfaced as a bounded, structured error.
setQdrantClientForTests({
  async upsert() {
    throw new Error('Qdrant unavailable');
  },
});
await assert.rejects(
  () => upsertVector(stableId, vector, {
    userId: 'user-1',
    subjectId: 'subject-1',
    materialId,
    chunkId,
    chunkIndex,
  }, { maxRetries: 0, baseDelayMs: 0 }),
  (error) => error.message.includes('Qdrant upsert') && error.message.includes('Qdrant unavailable') && error.statusCode === 503
);

await assert.rejects(
  () => upsertVector('vector-2', [0, 1], { userId: 'user-1' }),
  /exactly 384 values/
);

console.log('Qdrant service infrastructure tests passed');
