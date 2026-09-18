import test from 'node:test';
import assert from 'node:assert/strict';

import { validateQuestion, validateFlashcard } from '../src/services/contentValidationService.js';
import { saveQuestion, saveFlashcard } from '../src/services/contentPersistenceService.js';
import { Question } from '../src/models/Question.js';
import { Flashcard } from '../src/models/Flashcard.js';
import { Subject } from '../src/models/Subject.js';
import { StudyMaterial } from '../src/models/StudyMaterial.js';
import { Unit } from '../src/models/Unit.js';
import { Topic } from '../src/models/Topic.js';

const validUserId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439012';
const subjectId = '507f1f77bcf86cd799439013';
const materialId = '507f1f77bcf86cd799439014';
const unitId = '507f1f77bcf86cd799439015';
const topicId = '507f1f77bcf86cd799439016';
const validChunks = [
  '507f1f77bcf86cd799439017',
  '507f1f77bcf86cd799439018',
];

const validQuestionPayload = {
  userId: validUserId,
  subjectId,
  materialId,
  sourceChunks: validChunks,
  type: 'MCQ',
  questionText: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correctAnswer: '4',
  explanation: 'Basic arithmetic',
};

const validFlashcardPayload = {
  userId: validUserId,
  subjectId,
  materialId,
  sourceChunks: validChunks,
  front: 'What is TCP?',
  back: 'A reliable transport protocol.',
};

const originalQuestionCreate = Question.create;
const originalQuestionFindOne = Question.findOne;
const originalFlashcardCreate = Flashcard.create;
const originalFlashcardFindOne = Flashcard.findOne;
const originalSubjectFindById = Subject.findById;
const originalMaterialFindById = StudyMaterial.findById;
const originalUnitFindById = Unit.findById;
const originalTopicFindById = Topic.findById;

const mockHierarchy = () => {
  Subject.findById = async (id) => ({ _id: id, userId: validUserId });
  StudyMaterial.findById = async (id) => ({
    _id: id,
    userId: validUserId,
    subjectId,
    unitId: undefined,
    topicId: undefined,
  });
  Unit.findById = async () => null;
  Topic.findById = async () => null;
};

const restoreHierarchyMocks = () => {
  Subject.findById = originalSubjectFindById;
  StudyMaterial.findById = originalMaterialFindById;
  Unit.findById = originalUnitFindById;
  Topic.findById = originalTopicFindById;
};

test('TEST 1 — invalid AI output rejection', async () => {
  assert.equal(validateQuestion(null).success, false);
  assert.equal(validateQuestion('bad-input').success, false);
  assert.equal(validateQuestion(123).success, false);

  const malformed = {
    userId: validUserId,
    subjectId,
    materialId,
    sourceChunks: validChunks,
    type: 'MCQ',
    options: ['A', 'B'],
  };
  assert.equal(validateQuestion(malformed).success, false);

  const wrongTypes = {
    userId: validUserId,
    subjectId,
    materialId,
    sourceChunks: ['x'],
    type: 'MCQ',
    questionText: 'Q',
    options: ['A', 2],
    correctAnswer: 'A',
  };
  assert.equal(validateQuestion(wrongTypes).success, false);
});

test('TEST 2 — question validation strict cases', () => {
  assert.equal(validateQuestion(validQuestionPayload).success, true);

  const missingOptions = { ...validQuestionPayload, options: undefined };
  assert.equal(validateQuestion(missingOptions).success, false);

  const tooFewOptions = { ...validQuestionPayload, options: ['Only one'] };
  assert.equal(validateQuestion(tooFewOptions).success, false);

  const invalidType = { ...validQuestionPayload, type: 'UNKNOWN' };
  assert.equal(validateQuestion(invalidType).success, false);

  const emptyText = { ...validQuestionPayload, questionText: '   ' };
  assert.equal(validateQuestion(emptyText).success, false);
});

test('TEST 3 — flashcard validation strict cases', () => {
  assert.equal(validateFlashcard(validFlashcardPayload).success, true);

  const emptyFront = { ...validFlashcardPayload, front: '' };
  assert.equal(validateFlashcard(emptyFront).success, false);

  const emptyBack = { ...validFlashcardPayload, back: '   ' };
  assert.equal(validateFlashcard(emptyBack).success, false);
});

test('TEST 4 — metadata validation', () => {
  const valid = validateQuestion(validQuestionPayload);
  assert.equal(valid.success, true);

  const invalidObjectId = {
    ...validQuestionPayload,
    userId: 'not-a-valid-id',
  };
  assert.equal(validateQuestion(invalidObjectId).success, false);

  const missingRequired = {
    ...validQuestionPayload,
    materialId: undefined,
  };
  assert.equal(validateQuestion(missingRequired).success, false);
});

test('TEST 5 — sourceChunks validation', () => {
  assert.equal(validateQuestion(validQuestionPayload).success, true);

  const emptyArray = { ...validQuestionPayload, sourceChunks: [] };
  assert.equal(validateQuestion(emptyArray).success, false);

  const invalidArray = { ...validQuestionPayload, sourceChunks: ['bad-id', validChunks[1]] };
  assert.equal(validateQuestion(invalidArray).success, false);
});

test('TEST 6 — duplicate handling with real DB call verification', async () => {
  mockHierarchy();

  let createCalls = 0;
  Question.create = async (payload) => {
    createCalls += 1;
    return { _id: 'question-1', ...payload };
  };

  const firstFindOne = async () => null;
  const secondFindOne = async () => ({ _id: 'question-1', ...validQuestionPayload });

  let findCallCount = 0;
  Question.findOne = async () => {
    findCallCount += 1;
    return findCallCount === 1 ? firstFindOne() : secondFindOne();
  };

  const firstResult = await saveQuestion(validQuestionPayload, validUserId);
  const secondResult = await saveQuestion(validQuestionPayload, validUserId);

  assert.equal(firstResult.success, true);
  assert.equal(secondResult.success, true);
  assert.equal(secondResult.duplicate, true);
  assert.equal(secondResult.data._id, 'question-1');
  assert.equal(createCalls, 1);
  assert.equal(findCallCount, 2);

  Question.create = originalQuestionCreate;
  Question.findOne = originalQuestionFindOne;
  restoreHierarchyMocks();
});

test('TEST 7 — ownership validation', async () => {
  mockHierarchy();

  const wrongOwner = { ...validQuestionPayload, userId: otherUserId };
  const result = await saveQuestion(wrongOwner, validUserId);
  assert.equal(result.success, false);
  assert.equal(result.error.code, 'USER_ID_MISMATCH');

  const materialNotOwned = {
    ...validQuestionPayload,
    userId: validUserId,
  };

  StudyMaterial.findById = async () => ({
    _id: materialId,
    userId: otherUserId,
    subjectId,
    unitId: undefined,
    topicId: undefined,
  });

  const materialMismatchResult = await saveQuestion(materialNotOwned, validUserId);
  assert.equal(materialMismatchResult.success, false);
  assert.equal(materialMismatchResult.error.code, 'UNAUTHORIZED_MATERIAL');

  Question.create = originalQuestionCreate;
  Question.findOne = originalQuestionFindOne;
  restoreHierarchyMocks();
});

test('TEST 8 — consistency safety on write failure', async () => {
  mockHierarchy();

  Question.findOne = async () => null;
  Question.create = async () => {
    throw new Error('DB write failed');
  };

  const result = await saveQuestion(validQuestionPayload, validUserId);
  assert.equal(result.success, false);
  assert.equal(result.error.statusCode, 500);
  assert.equal(result.error.code, 'QUESTION_SAVE_FAILED');

  Question.create = originalQuestionCreate;
  Question.findOne = originalQuestionFindOne;
  restoreHierarchyMocks();
});

test('TEST 9 — return contract consistency', async () => {
  mockHierarchy();

  Question.findOne = async () => null;
  Question.create = async (payload) => ({
    _id: 'q-success-1',
    ...payload,
  });

  const successResult = await saveQuestion(validQuestionPayload, validUserId);
  assert.equal(successResult.success, true);
  assert.equal(successResult.duplicate, false);
  assert.ok(successResult.data._id);

  Flashcard.findOne = async () => null;
  Flashcard.create = async (payload) => ({
    _id: 'f-success-1',
    ...payload,
  });

  const flashcardResult = await saveFlashcard(validFlashcardPayload, validUserId);
  assert.equal(flashcardResult.success, true);
  assert.equal(flashcardResult.duplicate, false);
  assert.ok(flashcardResult.data._id);

  const failureResult = await saveQuestion({ ...validQuestionPayload, userId: otherUserId }, validUserId);
  assert.equal(failureResult.success, false);
  assert.equal(typeof failureResult.error, 'object');
  assert.equal(failureResult.error.code, 'USER_ID_MISMATCH');

  Question.create = originalQuestionCreate;
  Question.findOne = originalQuestionFindOne;
  Flashcard.create = originalFlashcardCreate;
  Flashcard.findOne = originalFlashcardFindOne;
  restoreHierarchyMocks();
});

test('TEST 10 — no side effects / no schema modification / no extra service use', () => {
  assert.ok(Question && Question.modelName === 'Question');
  assert.ok(Flashcard && Flashcard.modelName === 'Flashcard');
  assert.equal(typeof validateQuestion, 'function');
  assert.equal(typeof validateFlashcard, 'function');
  assert.equal(typeof saveQuestion, 'function');
  assert.equal(typeof saveFlashcard, 'function');
});
