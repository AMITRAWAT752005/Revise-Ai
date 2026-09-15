import assert from 'node:assert/strict';
import {
  buildVectorPayload,
  validateVectorPayload,
  mapVectorToSource,
  formatSourceCitation,
  hydrateSourceMapping,
  resolveSourceChain,
} from '../src/services/vectorMetadataService.js';

// Test 1: buildVectorPayload with complete DocumentChunk
const mockChunk = {
  _id: '507f1f77bcf86cd799439011',
  userId: '507f1f77bcf86cd799439012',
  subjectId: '507f1f77bcf86cd799439013',
  unitId: '507f1f77bcf86cd799439014',
  topicId: '507f1f77bcf86cd799439015',
  materialId: '507f1f77bcf86cd799439016',
  chunkIndex: 2,
  text: 'Operating systems manage computer hardware and software resources.',
  pageStart: 3,
  pageEnd: 4,
  tokenCount: 150,
};

const payload = buildVectorPayload(mockChunk);
assert.deepEqual(payload, {
  userId: '507f1f77bcf86cd799439012',
  subjectId: '507f1f77bcf86cd799439013',
  unitId: '507f1f77bcf86cd799439014',
  topicId: '507f1f77bcf86cd799439015',
  materialId: '507f1f77bcf86cd799439016',
  chunkId: '507f1f77bcf86cd799439011',
  chunkIndex: 2,
  pageStart: 3,
  pageEnd: 4,
});
console.log('✓ buildVectorPayload extracts full schema correctly');

// Test 2: buildVectorPayload with context fallbacks
const chunkWithoutIds = {
  chunkId: 'chunk-99',
  chunkIndex: 0,
  text: 'Sample text',
};
const context = {
  userId: 'user-99',
  subjectId: 'subj-99',
  materialId: 'mat-99',
};
const fallbackPayload = buildVectorPayload(chunkWithoutIds, context);
assert.equal(fallbackPayload.userId, 'user-99');
assert.equal(fallbackPayload.subjectId, 'subj-99');
assert.equal(fallbackPayload.materialId, 'mat-99');
assert.equal(fallbackPayload.chunkId, 'chunk-99');
assert.equal(fallbackPayload.unitId, null);
assert.equal(fallbackPayload.topicId, null);
assert.equal(fallbackPayload.pageStart, null);
assert.equal(fallbackPayload.pageEnd, null);
console.log('✓ buildVectorPayload handles context fallbacks');

// Test 3: validateVectorPayload error handling
assert.throws(
  () => validateVectorPayload({ ...payload, userId: '' }),
  /missing required field: userId/
);
assert.throws(
  () => validateVectorPayload({ ...payload, materialId: null }),
  /missing required field: materialId/
);
assert.throws(
  () => validateVectorPayload({ ...payload, chunkIndex: -1 }),
  /chunkIndex must be a non-negative integer/
);
assert.throws(
  () => validateVectorPayload({ ...payload, pageStart: 5, pageEnd: 2 }),
  /pageEnd cannot be less than pageStart/
);
console.log('✓ validateVectorPayload catches schema violations');

// Test 4: mapVectorToSource
const mappedSource = mapVectorToSource(payload, { vectorId: 'vec-123', score: 0.89 });
assert.equal(mappedSource.chunkId, '507f1f77bcf86cd799439011');
assert.equal(mappedSource.materialId, '507f1f77bcf86cd799439016');
assert.equal(mappedSource.userId, '507f1f77bcf86cd799439012');
assert.equal(mappedSource.vectorId, 'vec-123');
assert.equal(mappedSource.score, 0.89);
console.log('✓ mapVectorToSource creates proper source reference');

// Test 5: formatSourceCitation
const citation1 = formatSourceCitation({
  materialTitle: 'OS Architecture Notes',
  pageStart: 5,
  pageEnd: 7,
  chunkIndex: 1,
});
assert.equal(citation1, '[OS Architecture Notes, pp. 5-7, Chunk #1]');

const citation2 = formatSourceCitation({
  materialTitle: 'Quick Reference',
  pageStart: 3,
  pageEnd: 3,
  chunkIndex: 0,
});
assert.equal(citation2, '[Quick Reference, p. 3, Chunk #0]');

const citation3 = formatSourceCitation({
  materialId: 'mat-123',
  chunkIndex: 4,
});
assert.equal(citation3, '[Material mat-123, Chunk #4]');
console.log('✓ formatSourceCitation formats citations accurately');

// Test 6: hydrateSourceMapping
const hydrated = hydrateSourceMapping(mappedSource, {
  chunkDoc: { text: mockChunk.text, tokenCount: 150 },
  materialDoc: { title: 'OS Lecture 1', fileName: 'os_lec1.pdf', fileType: 'application/pdf', fileUrl: 'https://storage/os.pdf' },
  subjectDoc: { name: 'Operating Systems' },
});
assert.equal(hydrated.text, mockChunk.text);
assert.equal(hydrated.tokenCount, 150);
assert.equal(hydrated.materialTitle, 'OS Lecture 1');
assert.equal(hydrated.materialFileName, 'os_lec1.pdf');
assert.equal(hydrated.subjectName, 'Operating Systems');
assert.equal(hydrated.citation, '[OS Lecture 1, pp. 3-4, Chunk #2]');
console.log('✓ hydrateSourceMapping populates complete provenance');

// Test 7: resolveSourceChain with strict user isolation
const mockModels = {
  DocumentChunk: {
    async findOne({ _id, userId }) {
      if (userId === 'user-1' && _id === 'chunk-1') {
        return { _id: 'chunk-1', text: 'Sample chunk text', tokenCount: 50 };
      }
      return null;
    },
  },
  StudyMaterial: {
    async findOne({ _id, userId }) {
      if (userId === 'user-1' && _id === 'mat-1') {
        return { _id: 'mat-1', title: 'Data Structures' };
      }
      return null;
    },
  },
  Subject: {
    async findOne({ _id, userId }) {
      if (userId === 'user-1' && _id === 'subj-1') {
        return { _id: 'subj-1', name: 'Computer Science' };
      }
      return null;
    },
  },
};

const userPayload = {
  userId: 'user-1',
  subjectId: 'subj-1',
  materialId: 'mat-1',
  chunkId: 'chunk-1',
  chunkIndex: 0,
  pageStart: 1,
  pageEnd: 1,
};

const resolved = await resolveSourceChain(userPayload, 'user-1', mockModels);
assert.equal(resolved.text, 'Sample chunk text');
assert.equal(resolved.materialTitle, 'Data Structures');
assert.equal(resolved.subjectName, 'Computer Science');

// Strict user isolation rejection when userId does not match authenticated user
await assert.rejects(
  () => resolveSourceChain(userPayload, 'attacker-user', mockModels),
  /Access denied: Vector metadata belongs to a different user/
);
console.log('✓ resolveSourceChain enforces user data isolation');

console.log('\nAll Vector Metadata & Source Mapping tests passed successfully!');
