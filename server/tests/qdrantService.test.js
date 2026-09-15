import assert from 'node:assert/strict';
import {
  QDRANT_COLLECTION_NAME,
  QDRANT_VECTOR_SIZE,
  checkCollectionExists,
  createCollection,
  initQdrant,
  setQdrantClientForTests,
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
await upsertVector('vector-1', vector, {
  userId: 'user-1',
  subjectId: 'subject-1',
  materialId: 'material-1',
  chunkId: 'chunk-1',
  chunkIndex: 0,
});

const upsertCall = calls.find(([name]) => name === 'upsert');
assert.equal(upsertCall[1], QDRANT_COLLECTION_NAME);
assert.equal(upsertCall[2].points[0].vector.length, QDRANT_VECTOR_SIZE);
assert.deepEqual(upsertCall[2].points[0].payload, {
  userId: 'user-1',
  subjectId: 'subject-1',
  unitId: null,
  topicId: null,
  materialId: 'material-1',
  chunkId: 'chunk-1',
  chunkIndex: 0,
  pageStart: null,
  pageEnd: null,
});

await assert.rejects(
  () => upsertVector('vector-2', [0, 1], { userId: 'user-1' }),
  /exactly 384 values/
);

console.log('Qdrant service infrastructure tests passed');
