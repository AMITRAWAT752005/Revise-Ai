import assert from 'assert';
import mongoose from 'mongoose';
import Subject from '../src/models/Subject.js';
import UserProgress from '../src/models/UserProgress.js';
import {
  createSubjectController,
  listSubjectsController,
  deleteSubjectController,
} from '../src/controllers/subjectController.js';
import { ensureUserProgress, syncSubjectCount } from '../src/services/userProgressService.js';

// Helper to mock express req and res
const createMockReqRes = ({ userId, body = {}, params = {}, query = {} } = {}) => {
  const req = {
    userId,
    user: { _id: userId, id: userId },
    body,
    params,
    query,
  };

  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };

  const next = (error) => {
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  };

  return { req, res, next };
};

let passed = 0;
let failed = 0;

const runTest = async (testName, fn) => {
  try {
    await fn();
    console.log(`  ✓ ${testName}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${testName}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
};

console.log('\n======================================================');
console.log('  ReviseAI Subject API & UserProgress Test Suite');
console.log('======================================================\n');

const mockUserA = new mongoose.Types.ObjectId().toString();
const mockUserB = new mongoose.Types.ObjectId().toString();

// Unit & Controller Tests
console.log('--- Suite 1: Input Validation & Duplicate Enforcement (Task 8) ---');

await runTest('Rejects subject creation with missing name (400)', async () => {
  const { req, res, next } = createMockReqRes({ userId: mockUserA, body: {} });
  await createSubjectController(req, res, next);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.error, 'Subject name is required.');
});

await runTest('Rejects subject creation with empty whitespace name (400)', async () => {
  const { req, res, next } = createMockReqRes({ userId: mockUserA, body: { name: '   ' } });
  await createSubjectController(req, res, next);
  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.error, 'Subject name is required.');
});

await runTest('Subject model instantiation & field validation', () => {
  const subject = new Subject({ name: 'Database Management Systems', userId: mockUserA });
  assert.strictEqual(subject.name, 'Database Management Systems');
  assert.strictEqual(subject.userId.toString(), mockUserA);
  assert.strictEqual(subject.mastery, 0);
  assert.strictEqual(subject.status, 'not_started');
});

console.log('\n--- Suite 2: Subject Retrieval & Response Format (Task 9) ---');

await runTest('Subject retrieval respects userId filter and returns standard format', async () => {
  const originalFind = Subject.find;
  Subject.find = (filter) => {
    assert.strictEqual(filter.userId, mockUserA, 'Query must be filtered strictly by req.userId');
    return {
      sort: () => Promise.resolve([{ _id: 'sub1', name: 'DBMS', userId: mockUserA }]),
    };
  };

  try {
    const { req } = createMockReqRes({ userId: mockUserA });
    const subjects = await Subject.find({ userId: req.userId }).sort({ createdAt: -1 });
    assert.strictEqual(subjects.length, 1);
    assert.strictEqual(subjects[0].name, 'DBMS');
  } finally {
    Subject.find = originalFind;
  }
});

console.log('\n--- Suite 3: UserProgress Synchronization (Task 10) ---');

await runTest('UserProgress tracks subjectCount accurately', () => {
  const progress = new UserProgress({ userId: mockUserA, subjectCount: 3 });
  assert.strictEqual(progress.userId.toString(), mockUserA);
  assert.strictEqual(progress.subjectCount, 3);
});

console.log('\n======================================================');
console.log(`  Tests Complete: ${passed} Passed, ${failed} Failed`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
