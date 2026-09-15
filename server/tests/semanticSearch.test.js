import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { searchSemanticChunks } from '../src/services/semanticSearchService.js';
import { semanticSearch } from '../src/controllers/searchController.js';
import * as qdrantService from '../src/services/qdrantService.js';
import * as embeddingService from '../src/services/embeddingService.js';
import DocumentChunk from '../src/models/DocumentChunk.js';
import StudyMaterial from '../src/models/StudyMaterial.js';
import Subject from '../src/models/Subject.js';
import Unit from '../src/models/Unit.js';
import Topic from '../src/models/Topic.js';

// Setup sample ObjectIds
const validUser1 = new mongoose.Types.ObjectId().toString();
const validUser2 = new mongoose.Types.ObjectId().toString();
const validSubject1 = new mongoose.Types.ObjectId().toString();
const validSubject2 = new mongoose.Types.ObjectId().toString();
const validUnit1 = new mongoose.Types.ObjectId().toString();
const validTopic1 = new mongoose.Types.ObjectId().toString();
const validMaterial1 = new mongoose.Types.ObjectId().toString();
const validChunk1 = new mongoose.Types.ObjectId().toString();
const validChunk2 = new mongoose.Types.ObjectId().toString();

// Save original model methods
const originalChunkFind = DocumentChunk.find;
const originalMaterialFind = StudyMaterial.find;
const originalMaterialFindOne = StudyMaterial.findOne;
const originalSubjectFind = Subject.find;
const originalSubjectFindOne = Subject.findOne;
const originalUnitFindById = Unit.findById;
const originalTopicFindById = Topic.findById;
const originalSearchVectors = qdrantService.searchVectors;
const originalGenerateEmbedding = embeddingService.generateEmbedding;

// Cleanup helper
const restoreOriginals = () => {
  DocumentChunk.find = originalChunkFind;
  StudyMaterial.find = originalMaterialFind;
  StudyMaterial.findOne = originalMaterialFindOne;
  Subject.find = originalSubjectFind;
  Subject.findOne = originalSubjectFindOne;
  Unit.findById = originalUnitFindById;
  Topic.findById = originalTopicFindById;
  embeddingService.setGenerateEmbeddingForTests(null);
  qdrantService.setQdrantClientForTests(null);
};

// Dummy embedding helper
const mockEmbedding = Array.from({ length: 384 }, (_, i) => i / 384);

console.log('Running Semantic Search Service & Protected Search API Tests...\n');

// ---------------------------------------------------------------------------
// TEST 1: Validation checks for searchSemanticChunks
// ---------------------------------------------------------------------------
{
  await assert.rejects(
    () => searchSemanticChunks({ query: '', userId: validUser1 }),
    (err) => err.statusCode === 400 && err.message.includes('non-empty string')
  );

  await assert.rejects(
    () => searchSemanticChunks({ query: 'a'.repeat(1001), userId: validUser1 }),
    (err) => err.statusCode === 400 && err.message.includes('1000 characters')
  );

  await assert.rejects(
    () => searchSemanticChunks({ query: 'Valid query', userId: '' }),
    (err) => err.statusCode === 401 && err.message.includes('Authenticated userId is required')
  );

  await assert.rejects(
    () => searchSemanticChunks({ query: 'Valid query', userId: validUser1, subjectId: 'invalid-id' }),
    (err) => err.statusCode === 400 && err.message.includes('Invalid subjectId format')
  );

  console.log('✓ TEST 1 Passed: Input validation rules enforced correctly');
}

// ---------------------------------------------------------------------------
// TEST 2: Ownership validation enforcement (Forbidden access to other user's resources)
// ---------------------------------------------------------------------------
{
  Subject.findOne = async ({ _id, userId }) => {
    if (_id === validSubject1 && userId === validUser1) {
      return { _id: validSubject1, userId: validUser1, name: 'Database Systems' };
    }
    return null; // Return null if subject doesn't belong to user
  };

  await assert.rejects(
    () => searchSemanticChunks({ query: 'What is B-Tree?', userId: validUser2, subjectId: validSubject1 }),
    (err) => err.statusCode === 403 && err.message.includes('Access denied')
  );

  console.log('✓ TEST 2 Passed: Ownership validation prevents unauthorized access to other users subjects');
}

// ---------------------------------------------------------------------------
// TEST 3: Happy path semantic search execution with filters and payload hydration
// ---------------------------------------------------------------------------
{
  let capturedQueryText = '';
  let capturedQdrantFilter = null;
  let capturedLimit = 0;

  // Mock embedding service
  embeddingService.setGenerateEmbeddingForTests(async (queryText) => {
    capturedQueryText = queryText;
    return mockEmbedding;
  });

  // Mock Qdrant client
  qdrantService.setQdrantClientForTests({
    async search(_collection, request) {
      capturedQdrantFilter = request.filter;
      capturedLimit = request.limit;
      return [
        {
          id: 'stable-vec-id-1',
          score: 0.89542,
          payload: {
            userId: validUser1,
            subjectId: validSubject1,
            unitId: validUnit1,
            topicId: validTopic1,
            materialId: validMaterial1,
            chunkId: validChunk1,
            chunkIndex: 0,
            pageStart: 1,
            pageEnd: 2,
          },
        },
        {
          id: 'stable-vec-id-2',
          score: 0.74129,
          payload: {
            userId: validUser1,
            subjectId: validSubject1,
            unitId: validUnit1,
            topicId: validTopic1,
            materialId: validMaterial1,
            chunkId: validChunk2,
            chunkIndex: 1,
            pageStart: 2,
            pageEnd: 3,
          },
        },
      ];
    },
  });

  // Mock MongoDB models
  Subject.findOne = async () => ({ _id: validSubject1, userId: validUser1, name: 'Database Systems' });
  Subject.find = async () => [{ _id: validSubject1, userId: validUser1, name: 'Database Systems' }];
  
  StudyMaterial.find = async () => [
    { _id: validMaterial1, title: 'Normalization Notes', userId: validUser1 },
  ];

  DocumentChunk.find = async () => [
    {
      _id: validChunk1,
      materialId: validMaterial1,
      subjectId: validSubject1,
      unitId: validUnit1,
      topicId: validTopic1,
      userId: validUser1,
      text: 'First Normal Form (1NF) requires atomic values.',
      chunkIndex: 0,
      pageStart: 1,
      pageEnd: 2,
    },
    {
      _id: validChunk2,
      materialId: validMaterial1,
      subjectId: validSubject1,
      unitId: validUnit1,
      topicId: validTopic1,
      userId: validUser1,
      text: 'Second Normal Form (2NF) eliminates partial dependencies.',
      chunkIndex: 1,
      pageStart: 2,
      pageEnd: 3,
    },
  ];

  const results = await searchSemanticChunks({
    query: 'normalization rules',
    userId: validUser1,
    subjectId: validSubject1,
    limit: 10,
  });

  assert.equal(capturedQueryText, 'normalization rules');
  assert.equal(capturedLimit, 10);

  // Assert Qdrant filter must include userId and subjectId
  assert.deepEqual(capturedQdrantFilter, {
    must: [
      { key: 'userId', match: { value: validUser1 } },
      { key: 'subjectId', match: { value: validSubject1 } },
    ],
  });

  // Assert response formatting
  assert.equal(results.length, 2);

  const firstHit = results[0];
  assert.equal(firstHit.chunkId, validChunk1);
  assert.equal(firstHit.materialId, validMaterial1);
  assert.equal(firstHit.subjectId, validSubject1);
  assert.equal(firstHit.similarityScore, 0.8954);
  assert.equal(firstHit.text, 'First Normal Form (1NF) requires atomic values.');
  assert.equal(firstHit.materialTitle, 'Normalization Notes');
  assert.equal(firstHit.subjectName, 'Database Systems');
  assert.equal(firstHit.citation, '[Normalization Notes, pp. 1-2, Chunk #0]');

  // Ensure raw vectors and internal Qdrant IDs are not present
  assert.equal(firstHit.vector, undefined);
  assert.equal(firstHit.id, undefined);
  assert.equal(firstHit.payload, undefined);

  console.log('✓ TEST 3 Passed: Happy path semantic search returning hydrated & formatted chunks');
}

// ---------------------------------------------------------------------------
// TEST 4: Protected Search Controller Endpoint Test
// ---------------------------------------------------------------------------
{
  // Mocks for controller invocation
  let statusResult = null;
  let jsonResult = null;

  const mockReq = {
    userId: validUser1,
    body: {
      query: 'explain 1NF',
      subjectId: validSubject1,
      limit: 3,
      userId: validUser2, // Spoofed body userId (must be ignored!)
    },
  };

  const mockRes = {
    status(code) {
      statusResult = code;
      return this;
    },
    json(data) {
      jsonResult = data;
      return this;
    },
  };

  let nextCalledWithError = null;
  const mockNext = (err) => {
    nextCalledWithError = err;
  };

  await semanticSearch(mockReq, mockRes, mockNext);

  assert.equal(nextCalledWithError, null);
  assert.equal(statusResult, 200);
  assert.equal(jsonResult.success, true);
  assert.ok(Array.isArray(jsonResult.results));
  assert.equal(jsonResult.results.length, 2);

  // Test unauthenticated controller request
  let unauthError = null;
  await semanticSearch({ body: { query: 'test' } }, mockRes, (err) => {
    unauthError = err;
  });

  assert.ok(unauthError);
  assert.equal(unauthError.statusCode, 401);

  console.log('✓ TEST 4 Passed: Protected controller enforces authentication & returns standard success payload');
}

// Restore originals
restoreOriginals();

console.log('\nAll Semantic Search Service & Protected Search API tests passed successfully!');
