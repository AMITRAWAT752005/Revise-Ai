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
  difficulty: 'easy',
  tags: ['arithmetic', 'basic-math'],
  source: 'AI',
  aiMetadata: {
    promptId: 'prompt-123',
    model: 'groq-llama',
    generatedAt: new Date('2026-09-20T12:00:00.000Z'),
  },
  status: 'active',
};

const validFlashcardPayload = {
  userId: validUserId,
  subjectId,
  materialId,
  sourceChunks: validChunks,
  front: 'What is TCP?',
  back: 'A reliable transport protocol.',
  difficulty: 'medium',
  tags: ['networking'],
  source: 'AI',
  aiMetadata: {
    promptId: 'flashcard-prompt-1',
    model: 'groq-llama',
    generatedAt: new Date('2026-09-20T12:05:00.000Z'),
  },
  status: 'active',
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

  const invalidDifficulty = { ...validQuestionPayload, difficulty: 'insane' };
  assert.equal(validateQuestion(invalidDifficulty).success, false);

  const invalidSource = { ...validQuestionPayload, source: 'robot' };
  assert.equal(validateQuestion(invalidSource).success, false);

  const invalidStatus = { ...validQuestionPayload, status: 'pending' };
  assert.equal(validateQuestion(invalidStatus).success, false);

  const incompleteAiMetadata = { ...validQuestionPayload, aiMetadata: { promptId: 'p1' } };
  assert.equal(validateQuestion(incompleteAiMetadata).success, false);
});

test('TEST 3 — flashcard validation strict cases', () => {
  assert.equal(validateFlashcard(validFlashcardPayload).success, true);

  const emptyFront = { ...validFlashcardPayload, front: '' };
  assert.equal(validateFlashcard(emptyFront).success, false);

  const emptyBack = { ...validFlashcardPayload, back: '   ' };
  assert.equal(validateFlashcard(emptyBack).success, false);

  const invalidDifficulty = { ...validFlashcardPayload, difficulty: 'expert' };
  assert.equal(validateFlashcard(invalidDifficulty).success, false);

  const invalidTags = { ...validFlashcardPayload, tags: ['   '] };
  assert.equal(validateFlashcard(invalidTags).success, false);

  const missingAiMetadata = { ...validFlashcardPayload, source: 'AI', aiMetadata: undefined };
  assert.equal(validateFlashcard(missingAiMetadata).success, false);
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
  assert.deepEqual(Question.schema.path('difficulty').enumValues, ['easy', 'medium', 'hard']);
  assert.deepEqual(Question.schema.path('source').enumValues, ['AI', 'manual']);
  assert.deepEqual(Question.schema.path('status').enumValues, ['active', 'archived', 'failed']);
  assert.ok(Question.schema.path('aiMetadata.promptId'));
  assert.ok(Question.schema.path('aiMetadata.model'));
  assert.ok(Question.schema.path('aiMetadata.generatedAt'));
  assert.deepEqual(Flashcard.schema.path('difficulty').enumValues, ['easy', 'medium', 'hard']);
  assert.deepEqual(Flashcard.schema.path('source').enumValues, ['AI', 'manual']);
  assert.deepEqual(Flashcard.schema.path('status').enumValues, ['active', 'archived', 'failed']);
  assert.ok(Flashcard.schema.path('aiMetadata.promptId'));
  assert.ok(Flashcard.schema.path('aiMetadata.model'));
  assert.ok(Flashcard.schema.path('aiMetadata.generatedAt'));
  assert.equal(typeof validateQuestion, 'function');
  assert.equal(typeof validateFlashcard, 'function');
  assert.equal(typeof saveQuestion, 'function');
  assert.equal(typeof saveFlashcard, 'function');
});

test('TEST 11 — A2 schema integrity and index coverage', () => {
  const questionIndexes = Question.schema.indexes().map((index) => Object.keys(index[0] || {}));
  const flashcardIndexes = Flashcard.schema.indexes().map((index) => Object.keys(index[0] || {}));

  assert.ok(questionIndexes.some((keys) => keys.includes('userId')));
  assert.ok(questionIndexes.some((keys) => keys.includes('subjectId')));
  assert.ok(questionIndexes.some((keys) => keys.includes('topicId')));
  assert.ok(questionIndexes.some((keys) => keys.includes('createdAt')));
  assert.ok(questionIndexes.some((keys) => keys.includes('userId') && keys.includes('subjectId')));
  assert.ok(questionIndexes.some((keys) => keys.includes('userId') && keys.includes('topicId')));
  assert.ok(questionIndexes.some((keys) => keys.includes('subjectId') && keys.includes('topicId')));
  assert.ok(questionIndexes.some((keys) => keys.includes('difficulty')));

  assert.ok(flashcardIndexes.some((keys) => keys.includes('userId')));
  assert.ok(flashcardIndexes.some((keys) => keys.includes('subjectId')));
  assert.ok(flashcardIndexes.some((keys) => keys.includes('topicId')));
  assert.ok(flashcardIndexes.some((keys) => keys.includes('createdAt')));
  assert.ok(flashcardIndexes.some((keys) => keys.includes('userId') && keys.includes('subjectId')));
  assert.ok(flashcardIndexes.some((keys) => keys.includes('userId') && keys.includes('topicId')));
  assert.ok(flashcardIndexes.some((keys) => keys.includes('subjectId') && keys.includes('topicId')));

  assert.equal(Question.schema.path('userId').isRequired, true);
  assert.equal(Question.schema.path('subjectId').isRequired, true);
  assert.equal(Question.schema.path('questionText').options.trim, true);
  assert.equal(Flashcard.schema.path('userId').isRequired, true);
  assert.equal(Flashcard.schema.path('subjectId').isRequired, true);
  assert.equal(Flashcard.schema.path('front').options.trim, true);
  assert.equal(Flashcard.schema.path('back').options.trim, true);
});


test('TEST 12 — validation of all 10 AI contract content types (valid & invalid cases)', () => {
  const baseMeta = {
    userId: validUserId,
    subjectId,
    materialId,
    sourceChunks: validChunks,
    difficulty: 'medium',
    tags: ['audit', 'fix-01'],
    source: 'AI',
    aiMetadata: {
      promptId: 'prompt-fix-01',
      model: 'gemini-2.5-flash',
      generatedAt: new Date(),
    },
    status: 'active',
  };

  // 1. MCQ
  const validMcq = {
    ...baseMeta,
    type: 'MCQ',
    question: 'What is the primary function of an OS?',
    options: ['Resource management', 'Compile code', 'Power CPU', 'Route packets'],
    answer: 'Resource management',
    explanation: 'The OS manages hardware and software resources.',
  };
  assert.equal(validateQuestion(validMcq).success, true);

  const invalidMcq = { ...validMcq, answer: 'Non-existent option' };
  assert.equal(validateQuestion(invalidMcq).success, false);

  // 2. Flashcard
  const validFlashcard = {
    ...baseMeta,
    type: 'Flashcard',
    front: 'Virtual Memory',
    back: 'An abstraction providing the illusion of a large contiguous memory space.',
  };
  assert.equal(validateQuestion(validFlashcard).success, true);
  assert.equal(validateFlashcard(validFlashcard).success, true);

  const invalidFlashcard = { ...validFlashcard, back: '   ' };
  assert.equal(validateQuestion(invalidFlashcard).success, false);
  assert.equal(validateFlashcard(invalidFlashcard).success, false);

  // 3. TrueFalse
  const validTrueFalse = {
    ...baseMeta,
    type: 'TrueFalse',
    statement: 'UDP is a connectionless protocol.',
    answer: true,
    explanation: 'UDP does not establish a handshake.',
  };
  assert.equal(validateQuestion(validTrueFalse).success, true);

  const invalidTrueFalse = { ...validTrueFalse, answer: 'maybe' };
  assert.equal(validateQuestion(invalidTrueFalse).success, false);

  // 4. OneWord
  const validOneWord = {
    ...baseMeta,
    type: 'OneWord',
    question: 'Which CPU register holds the address of the next instruction to execute?',
    answer: 'Program Counter',
  };
  assert.equal(validateQuestion(validOneWord).success, true);

  const invalidOneWord = { ...validOneWord, answer: '' };
  assert.equal(validateQuestion(invalidOneWord).success, false);

  // 5. FillInTheBlank
  const validFillBlank = {
    ...baseMeta,
    type: 'FillInTheBlank',
    statement: 'In networking, DNS translates hostnames to [BLANK] addresses.',
    answer: 'IP',
  };
  assert.equal(validateQuestion(validFillBlank).success, true);

  const invalidFillBlank = {
    ...baseMeta,
    type: 'FillInTheBlank',
    statement: 'Statement without the blank token.',
    answer: 'Missing',
  };
  assert.equal(validateQuestion(invalidFillBlank).success, false);

  // 6. MatchTheFollowing
  const validMatch = {
    ...baseMeta,
    type: 'MatchTheFollowing',
    question: 'Match OSI layers to their standard protocols:',
    pairs: [
      { left: 'Application', right: 'HTTP' },
      { left: 'Transport', right: 'TCP' },
      { left: 'Network', right: 'IP' },
    ],
  };
  assert.equal(validateQuestion(validMatch).success, true);

  const invalidMatchTooFew = {
    ...validMatch,
    pairs: [
      { left: 'Application', right: 'HTTP' },
      { left: 'Transport', right: 'TCP' },
    ],
  };
  assert.equal(validateQuestion(invalidMatchTooFew).success, false);

  // 7. Sequence
  const validSequence = {
    ...baseMeta,
    type: 'Sequence',
    question: 'Arrange TCP three-way handshake in correct chronological order:',
    orderedItems: ['SYN sent by client', 'SYN-ACK sent by server', 'ACK sent by client'],
  };
  assert.equal(validateQuestion(validSequence).success, true);

  const invalidSequence = {
    ...validSequence,
    orderedItems: ['SYN sent', 'ACK sent'], // only 2 items
  };
  assert.equal(validateQuestion(invalidSequence).success, false);

  // 8. SpotTheMistake
  const validSpotMistake = {
    ...baseMeta,
    type: 'SpotTheMistake',
    statementWithMistake: 'TCP is an unreliable protocol that guarantees fast streaming.',
    mistake: 'unreliable',
    correction: 'reliable',
  };
  assert.equal(validateQuestion(validSpotMistake).success, true);

  const invalidSpotMistake = {
    ...validSpotMistake,
    mistake: '   ',
  };
  assert.equal(validateQuestion(invalidSpotMistake).success, false);

  // 9. WhatHappensNext
  const validWhatNext = {
    ...baseMeta,
    type: 'WhatHappensNext',
    scenario: 'A process initiates an I/O disk read operation.',
    correctOutcome: 'The CPU switches state from Running to Blocked/Waiting.',
    incorrectOutcomes: ['The process immediately terminates', 'The process preempts the kernel'],
  };
  assert.equal(validateQuestion(validWhatNext).success, true);

  const invalidWhatNext = {
    ...validWhatNext,
    correctOutcome: '',
  };
  assert.equal(validateQuestion(invalidWhatNext).success, false);

  // 10. ShortAnswer
  const validShortAnswer = {
    ...baseMeta,
    type: 'ShortAnswer',
    question: 'Explain the difference between a process and a thread.',
    idealAnswer: 'A process is an executing program with isolated address space, while a thread is a lightweight unit of execution sharing the process address space.',
  };
  assert.equal(validateQuestion(validShortAnswer).success, true);

  const invalidShortAnswer = {
    ...validShortAnswer,
    idealAnswer: undefined,
    correctAnswer: undefined,
  };
  assert.equal(validateQuestion(invalidShortAnswer).success, false);
});

test('TEST 13 — legacy question type backward compatibility', () => {
  const legacyBase = {
    userId: validUserId,
    subjectId,
    materialId,
    sourceChunks: validChunks,
    difficulty: 'easy',
    tags: ['legacy'],
    source: 'manual',
    aiMetadata: {
      promptId: 'legacy-p1',
      model: 'manual-entry',
      generatedAt: new Date(),
    },
    status: 'active',
  };

  // SHORT
  const shortQ = {
    ...legacyBase,
    type: 'SHORT',
    questionText: 'What is semaphore in OS?',
    correctAnswer: 'A synchronization variable used for mutual exclusion.',
  };
  assert.equal(validateQuestion(shortQ).success, true);

  // LONG
  const longQ = {
    ...legacyBase,
    type: 'LONG',
    questionText: 'Describe paging and segmentation with diagrams and trade-offs.',
    correctAnswer: 'Paging divides memory into fixed blocks; segmentation into logical units.',
  };
  assert.equal(validateQuestion(longQ).success, true);

  // TRUE_FALSE
  const tfQ = {
    ...legacyBase,
    type: 'TRUE_FALSE',
    questionText: 'HTTP is a stateless protocol.',
    correctAnswer: 'true',
  };
  assert.equal(validateQuestion(tfQ).success, true);

  // FILL_BLANK
  const fbQ = {
    ...legacyBase,
    type: 'FILL_BLANK',
    questionText: 'A process waiting indefinitely for an event experiences starvation.',
    correctAnswer: 'starvation',
  };
  assert.equal(validateQuestion(fbQ).success, true);
});

test('TEST 14 — Mongoose model schema validation across all supported types', async () => {
  const baseDoc = {
    userId: validUserId,
    subjectId,
    materialId,
    sourceChunks: validChunks,
    difficulty: 'medium',
    tags: ['schema-test'],
    source: 'AI',
    aiMetadata: {
      promptId: 'p-14',
      model: 'gemini-2.5-flash',
      generatedAt: new Date(),
    },
    status: 'active',
  };

  // 1. MCQ
  const mcqDoc = new Question({
    ...baseDoc,
    type: 'MCQ',
    questionText: 'Which protocol is connection-oriented?',
    options: ['TCP', 'UDP', 'ICMP', 'IGMP'],
    correctAnswer: 'TCP',
  });
  await mcqDoc.validate();

  // 2. TrueFalse
  const tfDoc = new Question({
    ...baseDoc,
    type: 'TrueFalse',
    questionText: 'DNS uses UDP for standard queries.',
    correctAnswer: 'true',
  });
  await tfDoc.validate();

  // 3. OneWord
  const oneWordDoc = new Question({
    ...baseDoc,
    type: 'OneWord',
    questionText: 'Name the fastest memory in the computer hierarchy.',
    correctAnswer: 'Register',
  });
  await oneWordDoc.validate();

  // 4. FillInTheBlank
  const fillDoc = new Question({
    ...baseDoc,
    type: 'FillInTheBlank',
    questionText: 'The process table entry is stored in the [BLANK].',
    correctAnswer: 'PCB',
  });
  await fillDoc.validate();

  // 5. MatchTheFollowing
  const matchDoc = new Question({
    ...baseDoc,
    type: 'MatchTheFollowing',
    questionText: 'Match protocols to default ports:',
    pairs: [
      { left: 'HTTP', right: '80' },
      { left: 'HTTPS', right: '443' },
      { left: 'SSH', right: '22' },
    ],
  });
  await matchDoc.validate();

  // Invalid Match (fewer than 3 pairs)
  const invalidMatchDoc = new Question({
    ...baseDoc,
    type: 'MatchTheFollowing',
    questionText: 'Match pairs:',
    pairs: [{ left: 'A', right: '1' }],
  });
  await assert.rejects(async () => invalidMatchDoc.validate());

  // 6. Sequence
  const seqDoc = new Question({
    ...baseDoc,
    type: 'Sequence',
    questionText: 'Arrange compile stages:',
    orderedItems: ['Lexical Analysis', 'Syntax Analysis', 'Semantic Analysis'],
  });
  await seqDoc.validate();

  // Invalid Sequence (fewer than 3 items)
  const invalidSeqDoc = new Question({
    ...baseDoc,
    type: 'Sequence',
    questionText: 'Order items:',
    orderedItems: ['Item 1'],
  });
  await assert.rejects(async () => invalidSeqDoc.validate());

  // 7. SpotTheMistake
  const spotDoc = new Question({
    ...baseDoc,
    type: 'SpotTheMistake',
    questionText: 'RAM is non-volatile primary storage.',
    statementWithMistake: 'RAM is non-volatile primary storage.',
    mistake: 'non-volatile',
    correction: 'volatile',
    correctAnswer: 'volatile',
  });
  await spotDoc.validate();

  // 8. WhatHappensNext
  const whatNextDoc = new Question({
    ...baseDoc,
    type: 'WhatHappensNext',
    questionText: 'A timer interrupt occurs during CPU execution.',
    scenario: 'A timer interrupt occurs during CPU execution.',
    correctOutcome: 'The scheduler runs and may context switch.',
    correctAnswer: 'The scheduler runs and may context switch.',
    incorrectOutcomes: ['System shuts down immediately'],
  });
  await whatNextDoc.validate();

  // 9. ShortAnswer
  const shortDoc = new Question({
    ...baseDoc,
    type: 'ShortAnswer',
    questionText: 'What is thrashing in OS virtual memory?',
    idealAnswer: 'Excessive paging where CPU spends more time swapping pages than executing instructions.',
    correctAnswer: 'Excessive paging where CPU spends more time swapping pages than executing instructions.',
  });
  await shortDoc.validate();

  // 10. Flashcard model
  const flashcardDoc = new Flashcard({
    ...baseDoc,
    front: 'TLB',
    back: 'Translation Lookaside Buffer caching virtual to physical address translations.',
  });
  await flashcardDoc.validate();
});

test('TEST 15 — saveQuestion and saveFlashcard persistence with contract fields and sourceChunkIds', async () => {
  mockHierarchy();

  let createdDoc = null;
  Question.findOne = async () => null;
  Question.create = async (payload) => {
    createdDoc = { _id: 'created-q-id', ...payload };
    return createdDoc;
  };

  const contractQuestionPayload = {
    userId: validUserId,
    subjectId,
    materialId,
    sourceChunkIds: validChunks, // Contract field
    type: 'Sequence',
    question: 'Arrange memory access times from fastest to slowest:', // Contract field
    orderedItems: ['Registers', 'L1 Cache', 'Main Memory'],
    difficulty: 'hard',
    tags: ['computer-architecture'],
    source: 'AI',
    aiMetadata: {
      promptId: 'contract-prompt-1',
      model: 'gemini-2.5-flash',
      generatedAt: new Date(),
    },
    status: 'active',
  };

  const result = await saveQuestion(contractQuestionPayload, validUserId);
  assert.equal(result.success, true);
  assert.equal(result.duplicate, false);
  assert.ok(createdDoc);
  assert.equal(createdDoc.questionText, 'Arrange memory access times from fastest to slowest:');
  assert.deepEqual(createdDoc.sourceChunks, validChunks);
  assert.equal(createdDoc.type, 'Sequence');
  assert.deepEqual(createdDoc.orderedItems, ['Registers', 'L1 Cache', 'Main Memory']);

  Question.create = originalQuestionCreate;
  Question.findOne = originalQuestionFindOne;
  restoreHierarchyMocks();
});
