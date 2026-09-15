import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

const makeChunk = (id, chunkIndex, text, embeddingStatus = 'pending') => ({
  _id: { toString: () => id },
  materialId: { toString: () => 'material-real-test' },
  userId: { toString: () => 'user-real-test' },
  subjectId: { toString: () => 'subject-real-test' },
  unitId: null,
  topicId: null,
  chunkIndex,
  text,
  pageStart: 1,
  pageEnd: 1,
  embeddingStatus,
});

const chunks = [
  makeChunk('chunk-real-0', 0, 'healthy 0'),
  makeChunk('chunk-real-1', 1, 'failed 1'),
  makeChunk('chunk-real-2', 2, 'healthy 2'),
  makeChunk('chunk-real-3', 3, 'failed 3'),
  makeChunk('chunk-real-4', 4, 'healthy 4'),
];

const chunkStore = chunks.map((chunk) => ({ ...chunk }));
const upsertCalls = [];
const successfulUpsertIds = [];
let qdrantOutage = false;
const failOnceChunkIds = new Set(['chunk-real-1', 'chunk-real-3']);
const material = {
  processingStatus: 'processing',
  processingError: null,
  async save() {},
};

const documentChunkMock = {
  find: ({ embeddingStatus }) => ({
    sort: async () => chunkStore.filter((chunk) => embeddingStatus.$in.includes(chunk.embeddingStatus)),
  }),
  countDocuments: async () => chunkStore.length,
  updateOne: async (filter, update) => {
    const chunk = chunkStore.find((item) => item._id.toString() === filter._id.toString());
    if (update.$set) Object.assign(chunk, update.$set);
    if (update.$unset) {
      for (const key of Object.keys(update.$unset)) delete chunk[key];
    }
    return { modifiedCount: 1 };
  },
};

const studyMaterialMock = {
  findById: async () => material,
};

const embeddingServiceMock = {
  generateEmbedding: async () => Array.from({ length: 384 }, () => 0.1),
};

const qdrantServiceMock = {
  buildStableVectorId: (materialId, chunkId, chunkIndex) => `${materialId}:${chunkId}:${chunkIndex}`,
  upsertVector: async (vectorId, vector, payload) => {
    upsertCalls.push({ vectorId, vector, payload });
    if (qdrantOutage) {
      throw new Error('Qdrant unavailable');
    }
    if (failOnceChunkIds.has(payload.chunkId)) {
      failOnceChunkIds.delete(payload.chunkId);
      throw new Error(`Qdrant failure for ${payload.chunkId}`);
    }
    successfulUpsertIds.push(vectorId);
    return vectorId;
  },
};

mock.module('../src/models/DocumentChunk.js', {
  namedExports: { DocumentChunk: documentChunkMock },
  defaultExport: documentChunkMock,
});
mock.module('../src/models/StudyMaterial.js', {
  namedExports: { StudyMaterial: studyMaterialMock },
  defaultExport: studyMaterialMock,
});
mock.module('../src/services/embeddingService.js', {
  namedExports: { generateEmbedding: embeddingServiceMock.generateEmbedding },
  defaultExport: embeddingServiceMock,
});
mock.module('../src/services/qdrantService.js', {
  namedExports: qdrantServiceMock,
  defaultExport: qdrantServiceMock,
});

const { embedChunksForMaterial } = await import('../src/services/chunkEmbeddingPipeline.js?real-test=1');

test('real pipeline retries only failed chunks and performs exactly five successful upserts', async () => {
  const firstRun = await embedChunksForMaterial('material-real-test');

  assert.equal(firstRun.total, 5);
  assert.equal(firstRun.indexed, 3);
  assert.equal(firstRun.failed, 2);
  assert.equal(successfulUpsertIds.length, 3, 'Initial run must have exactly three successful upserts');

  const firstSuccessfulIds = new Set(successfulUpsertIds);
  assert.equal(firstSuccessfulIds.size, 3);

  material.processingStatus = 'processing';
  material.processingError = null;
  const retryStart = successfulUpsertIds.length;
  const retryRun = await embedChunksForMaterial('material-real-test');

  assert.equal(retryRun.total, 2, 'Retry must fetch only the two failed chunks');
  assert.equal(retryRun.indexed, 2);
  assert.equal(retryRun.failed, 0);
  assert.equal(successfulUpsertIds.length, 5, 'Final successful-upsert total must be exactly five');

  const retriedIds = successfulUpsertIds.slice(retryStart);
  assert.equal(retriedIds.length, 2);
  assert.equal(new Set(retriedIds).size, 2);
  assert.ok(retriedIds.every((id) => !firstSuccessfulIds.has(id)), 'Successful chunks must not be duplicated on retry');
  assert.equal(new Set(successfulUpsertIds).size, 5, 'Final vector IDs must be unique');
});

test('real pipeline preserves chunks and records failed processing status during Qdrant outage', async () => {
  for (const chunk of chunkStore) {
    chunk.embeddingStatus = 'pending';
    delete chunk.embeddingError;
  }
  successfulUpsertIds.length = 0;
  upsertCalls.length = 0;
  material.processingStatus = 'processing';
  material.processingError = null;
  qdrantOutage = true;

  const result = await embedChunksForMaterial('material-real-test');

  assert.equal(result.indexed, 0);
  assert.equal(result.failed, 5);
  assert.equal(chunkStore.length, 5, 'No DocumentChunk may be deleted');
  assert.ok(chunkStore.every((chunk) => chunk.embeddingStatus === 'failed'));
  assert.equal(material.processingStatus, 'failed');
  assert.notEqual(material.processingStatus, 'completed');
  assert.ok(material.processingError.includes('5 chunk(s) failed Qdrant indexing'));
  assert.ok(chunkStore.every((chunk) => chunk.embeddingError.includes('Qdrant unavailable')));
});