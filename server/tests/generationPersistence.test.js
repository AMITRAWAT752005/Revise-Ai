/**
 * generationPersistence.test.js
 * FIX-04 — Phase 4E + 4F
 *
 * Tests the generationPersistenceService which bridges AI-generated content
 * to MongoDB persistence via contentPersistenceService.
 *
 * Strategy: dependency injection via the `deps` parameter instead of
 * mock.method on named exports (which Node's mock runner cannot redefine
 * for live ESM bindings).
 */

import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';

import {
  resolveMaterialId,
  persistGeneratedItems,
  mapItemToPayload,
} from '../src/services/generationPersistenceService.js';
import { StudyMaterial } from '../src/models/StudyMaterial.js';

// ─── Shared test constants ────────────────────────────────────────────────────

const userId     = new mongoose.Types.ObjectId().toString();
const subjectId  = new mongoose.Types.ObjectId().toString();
const unitId     = new mongoose.Types.ObjectId().toString();
const topicId    = new mongoose.Types.ObjectId().toString();
const materialId = new mongoose.Types.ObjectId().toString();
const chunkId1   = new mongoose.Types.ObjectId().toString();
const chunkId2   = new mongoose.Types.ObjectId().toString();

const sharedMeta = {
  userId,
  subjectId,
  unitId,
  topicId,
  materialId,
  difficulty: 'medium',
  model: 'gemini-2.5-flash',
  promptId: 'gen-2026-10-30T16:00:00.000Z',
  generatedAt: new Date('2026-10-30T16:00:00.000Z'),
};

const makeDocId = () => new mongoose.Types.ObjectId();
const successResult = (docId) => ({
  success: true, duplicate: false, status: 'success',
  data: { _id: docId || makeDocId() }, error: null, errorMessage: null,
});
const duplicateResult = () => ({
  success: true, duplicate: true, status: 'duplicate',
  data: { _id: makeDocId() }, error: null, errorMessage: null,
});
const failResult = (msg) => ({
  success: false, duplicate: false, status: 'error',
  data: null, error: { message: msg }, errorMessage: msg,
});

// ─── Suite 1: resolveMaterialId ───────────────────────────────────────────────

describe('resolveMaterialId — FIX-04', () => {
  beforeEach(() => mock.restoreAll());

  it('returns caller-supplied materialId when ownership and hierarchy match', async () => {
    mock.method(StudyMaterial, 'findById', () => ({
      lean: async () => ({ _id: materialId, userId, subjectId, unitId }),
    }));

    const result = await resolveMaterialId({ userId, subjectId, unitId, topicId, materialId });
    assert.strictEqual(result, materialId.trim());
  });

  it('rejects caller-supplied materialId belonging to a different user', async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();
    mock.method(StudyMaterial, 'findById', () => ({
      lean: async () => ({ _id: materialId, userId: otherUserId, subjectId }),
    }));
    const result = await resolveMaterialId({ userId, subjectId, materialId });
    assert.strictEqual(result, null);
  });

  it('rejects caller-supplied materialId belonging to a different subject', async () => {
    const otherSubjectId = new mongoose.Types.ObjectId().toString();
    mock.method(StudyMaterial, 'findById', () => ({
      lean: async () => ({ _id: materialId, userId, subjectId: otherSubjectId }),
    }));
    const result = await resolveMaterialId({ userId, subjectId, materialId });
    assert.strictEqual(result, null);
  });

  it('auto-resolves the most recent completed material when no materialId supplied', async () => {
    const autoId = new mongoose.Types.ObjectId().toString();
    mock.method(StudyMaterial, 'findOne', () => ({
      sort: () => ({ select: () => ({ lean: async () => ({ _id: autoId }) }) }),
    }));
    const result = await resolveMaterialId({ userId, subjectId, unitId, topicId });
    assert.strictEqual(result, autoId.toString());
  });

  it('returns null when no completed material exists for the hierarchy', async () => {
    mock.method(StudyMaterial, 'findOne', () => ({
      sort: () => ({ select: () => ({ lean: async () => null }) }),
    }));
    const result = await resolveMaterialId({ userId, subjectId });
    assert.strictEqual(result, null);
  });
});

// ─── Suite 2: mapItemToPayload — field mapping ───────────────────────────────

describe('mapItemToPayload — FIX-04', () => {
  it('maps MCQ fields correctly', () => {
    const item = {
      type: 'MCQ',
      question: 'What is the CPU?',
      options: ['Memory', 'Processor', 'Storage', 'GPU'],
      answer: 'Processor',
      explanation: 'The CPU is the brain.',
      sourceChunkIds: [chunkId1, chunkId2],
    };
    const payload = mapItemToPayload(item, sharedMeta);
    assert.strictEqual(payload.type, 'MCQ');
    assert.strictEqual(payload.questionText, 'What is the CPU?');
    assert.deepStrictEqual(payload.options, item.options);
    assert.strictEqual(payload.correctAnswer, 'Processor');
    assert.strictEqual(payload.explanation, 'The CPU is the brain.');
    assert.strictEqual(payload.source, 'AI');
    assert.strictEqual(payload.userId, userId);
    assert.strictEqual(payload.materialId, materialId);
    assert.deepStrictEqual(payload.sourceChunks, [chunkId1, chunkId2]);
  });

  it('maps Flashcard fields correctly', () => {
    const item = { type: 'Flashcard', front: 'What is RAM?', back: 'Random Access Memory', sourceChunkIds: [chunkId1] };
    const payload = mapItemToPayload(item, sharedMeta);
    assert.strictEqual(payload.front, 'What is RAM?');
    assert.strictEqual(payload.back, 'Random Access Memory');
    assert.strictEqual(payload.questionText, 'What is RAM?');
    assert.strictEqual(payload.correctAnswer, 'Random Access Memory');
  });

  it('maps TrueFalse answer from boolean to string', () => {
    const item = { type: 'TrueFalse', statement: 'Sky is blue.', answer: true, sourceChunkIds: [chunkId1] };
    const payload = mapItemToPayload(item, sharedMeta);
    assert.strictEqual(payload.correctAnswer, 'true');
    assert.strictEqual(payload.statement, 'Sky is blue.');
  });

  it('maps FillInTheBlank correctly', () => {
    const item = { type: 'FillInTheBlank', statement: 'The [BLANK] is blue.', answer: 'sky', sourceChunkIds: [chunkId1] };
    const payload = mapItemToPayload(item, sharedMeta);
    assert.strictEqual(payload.questionText, 'The [BLANK] is blue.');
    assert.strictEqual(payload.correctAnswer, 'sky');
  });

  it('maps SpotTheMistake: sets correctAnswer = correction', () => {
    const item = {
      type: 'SpotTheMistake',
      statementWithMistake: 'Sun is a planet.',
      mistake: 'planet',
      correction: 'star',
      sourceChunkIds: [chunkId1],
    };
    const payload = mapItemToPayload(item, sharedMeta);
    assert.strictEqual(payload.correctAnswer, 'star');
    assert.strictEqual(payload.mistake, 'planet');
    assert.strictEqual(payload.statementWithMistake, 'Sun is a planet.');
  });

  it('maps ShortAnswer: sets correctAnswer = idealAnswer', () => {
    const item = { type: 'ShortAnswer', question: 'Explain RAM.', idealAnswer: 'RAM is volatile memory.', sourceChunkIds: [chunkId1] };
    const payload = mapItemToPayload(item, sharedMeta);
    assert.strictEqual(payload.questionText, 'Explain RAM.');
    assert.strictEqual(payload.idealAnswer, 'RAM is volatile memory.');
    assert.strictEqual(payload.correctAnswer, 'RAM is volatile memory.');
  });

  it('converts mixed difficulty to medium per item', () => {
    const mixedMeta = { ...sharedMeta, difficulty: 'mixed' };
    const item = { type: 'OneWord', question: 'Q?', answer: 'A', sourceChunkIds: [chunkId1] };
    const payload = mapItemToPayload(item, mixedMeta);
    assert.strictEqual(payload.difficulty, 'medium');
  });

  it('includes aiMetadata with model, promptId, generatedAt', () => {
    const item = { type: 'OneWord', question: 'Q?', answer: 'A', sourceChunkIds: [chunkId1] };
    const payload = mapItemToPayload(item, sharedMeta);
    assert.strictEqual(payload.aiMetadata.model, 'gemini-2.5-flash');
    assert.strictEqual(payload.aiMetadata.promptId, sharedMeta.promptId);
    assert.deepStrictEqual(payload.aiMetadata.generatedAt, sharedMeta.generatedAt);
  });
});

// ─── Suite 3: persistGeneratedItems — routing & outcome aggregation ───────────
// Uses dependency injection (deps.saveQuestion / deps.saveFlashcard) so that
// ESM named export bindings (which cannot be redefined by mock.method) are bypassed.

describe('persistGeneratedItems — FIX-04', () => {
  it('routes Flashcard items to saveFlashcard and others to saveQuestion', async () => {
    const saveQuestionCalls = [];
    const saveFlashcardCalls = [];

    const deps = {
      saveQuestion:  async (p, u) => { saveQuestionCalls.push({ p, u });  return successResult(); },
      saveFlashcard: async (p, u) => { saveFlashcardCalls.push({ p, u }); return successResult(); },
    };

    const items = [
      { type: 'MCQ',      question: 'Q?', options: ['a','b','c','d'], answer: 'a', sourceChunkIds: [chunkId1] },
      { type: 'Flashcard', front: 'F?', back: 'B',                                 sourceChunkIds: [chunkId1] },
      { type: 'TrueFalse', statement: 'Sky is blue.', answer: true,                sourceChunkIds: [chunkId2] },
    ];

    const outcome = await persistGeneratedItems(items, sharedMeta, deps);

    assert.strictEqual(saveQuestionCalls.length,  2, 'MCQ + TrueFalse → saveQuestion');
    assert.strictEqual(saveFlashcardCalls.length, 1, 'Flashcard → saveFlashcard');
    assert.strictEqual(outcome.saved,   3);
    assert.strictEqual(outcome.failed,  0);
  });

  it('counts duplicates correctly without treating them as failures', async () => {
    const deps = {
      saveQuestion:  async () => duplicateResult(),
      saveFlashcard: async () => duplicateResult(),
    };

    const items = [
      { type: 'MCQ', question: 'Q?', options: ['a','b','c','d'], answer: 'a', sourceChunkIds: [chunkId1] },
      { type: 'Flashcard', front: 'F?', back: 'B',                            sourceChunkIds: [chunkId1] },
    ];

    const outcome = await persistGeneratedItems(items, sharedMeta, deps);
    assert.strictEqual(outcome.duplicates, 2);
    assert.strictEqual(outcome.saved,  0);
    assert.strictEqual(outcome.failed, 0);
  });

  it('counts failed items without aborting remaining items (partial-success)', async () => {
    let callIndex = 0;
    const deps = {
      saveQuestion: async () => {
        callIndex += 1;
        return callIndex === 1 ? failResult('DB write error') : successResult();
      },
      saveFlashcard: async () => successResult(),
    };

    const items = [
      { type: 'MCQ',     question: 'Q1?', options: ['a','b','c','d'], answer: 'a', sourceChunkIds: [chunkId1] },
      { type: 'OneWord', question: 'Q2?', answer: 'foo',                           sourceChunkIds: [chunkId2] },
    ];

    const outcome = await persistGeneratedItems(items, sharedMeta, deps);
    assert.strictEqual(outcome.failed, 1);
    assert.strictEqual(outcome.saved,  1);
    assert.strictEqual(outcome.errors.length, 1);
    assert.ok(outcome.errors[0].error.includes('DB write error'));
  });

  it('handles unexpected thrown errors per-item without aborting batch', async () => {
    let callCount = 0;
    const deps = {
      saveQuestion: async () => {
        callCount += 1;
        if (callCount === 1) throw new Error('Unexpected crash');
        return successResult();
      },
      saveFlashcard: async () => successResult(),
    };

    const items = [
      { type: 'ShortAnswer', question: 'Q1?', idealAnswer: 'A1', sourceChunkIds: [chunkId1] },
      { type: 'ShortAnswer', question: 'Q2?', idealAnswer: 'A2', sourceChunkIds: [chunkId2] },
    ];

    const outcome = await persistGeneratedItems(items, sharedMeta, deps);
    assert.strictEqual(outcome.failed, 1, 'First item crash counted as failed');
    assert.strictEqual(outcome.saved,  1, 'Second item still saved');
    assert.ok(outcome.errors[0].error.includes('Unexpected crash'));
  });

  it('passes userId to saveQuestion and saveFlashcard from meta', async () => {
    const capturedUids = [];
    const deps = {
      saveQuestion:  async (_, uid) => { capturedUids.push(uid); return successResult(); },
      saveFlashcard: async (_, uid) => { capturedUids.push(uid); return successResult(); },
    };

    const items = [
      { type: 'OneWord',   question: 'Q?', answer: 'A', sourceChunkIds: [chunkId1] },
      { type: 'Flashcard', front: 'F?',   back: 'B',   sourceChunkIds: [chunkId1] },
    ];

    await persistGeneratedItems(items, sharedMeta, deps);
    assert.ok(capturedUids.every((uid) => uid === userId), 'All calls must use meta.userId');
  });

  it('sets savedIds for newly persisted documents', async () => {
    const docId = new mongoose.Types.ObjectId();
    const deps = {
      saveQuestion:  async () => successResult(docId),
      saveFlashcard: async () => successResult(),
    };

    const items = [{ type: 'OneWord', question: 'Q?', answer: 'A', sourceChunkIds: [chunkId1] }];

    const outcome = await persistGeneratedItems(items, sharedMeta, deps);
    assert.strictEqual(outcome.savedIds.length, 1);
    assert.strictEqual(outcome.savedIds[0], docId.toString());
  });

  it('maps and persists all 10 AI contract types without failing', async () => {
    const deps = {
      saveQuestion:  async () => successResult(),
      saveFlashcard: async () => successResult(),
    };

    const allTypes = [
      { type: 'MCQ',              question: 'Q?', options: ['a','b','c','d'], answer: 'a',                                          sourceChunkIds: [chunkId1] },
      { type: 'Flashcard',        front: 'F?',    back: 'B',                                                                        sourceChunkIds: [chunkId1] },
      { type: 'TrueFalse',        statement: 'Sky is blue.', answer: true,                                                          sourceChunkIds: [chunkId1] },
      { type: 'OneWord',          question: 'Capital of France?', answer: 'Paris',                                                   sourceChunkIds: [chunkId1] },
      { type: 'FillInTheBlank',   statement: 'The [BLANK] is blue.', answer: 'sky',                                                 sourceChunkIds: [chunkId1] },
      { type: 'MatchTheFollowing', question: 'Match:', pairs: [{left:'A',right:'1'},{left:'B',right:'2'},{left:'C',right:'3'}],      sourceChunkIds: [chunkId1] },
      { type: 'Sequence',          question: 'Order:', orderedItems: ['Step 1','Step 2','Step 3'],                                   sourceChunkIds: [chunkId1] },
      { type: 'SpotTheMistake',    statementWithMistake: 'Sun is a planet.', mistake: 'planet', correction: 'star',                 sourceChunkIds: [chunkId1] },
      { type: 'WhatHappensNext',   scenario: 'If you heat water...', correctOutcome: 'It boils.',                                   sourceChunkIds: [chunkId1] },
      { type: 'ShortAnswer',       question: 'Explain RAM.', idealAnswer: 'RAM is volatile memory.',                                sourceChunkIds: [chunkId1] },
    ];

    const outcome = await persistGeneratedItems(allTypes, sharedMeta, deps);
    assert.strictEqual(outcome.failed, 0, `Expected 0 failures. Errors: ${JSON.stringify(outcome.errors)}`);
    assert.strictEqual(outcome.saved, 10);
  });
});

/*
 * ─── REAL DATABASE VERIFICATION INSTRUCTIONS (BLOCKED without live MongoDB) ──
 *
 * To verify end-to-end persistence in a real MongoDB environment:
 *
 * 1. Set MONGODB_URI in server/.env to a test database (e.g. reviseai_test).
 * 2. Start the server: node server/src/index.js
 * 3. Authenticate: POST /api/auth/login  → capture JWT token
 * 4. Upload a PDF: POST /api/studymaterials  (multipart/form-data)
 * 5. Trigger processing (embedding pipeline runs automatically after upload).
 * 6. Call: POST /api/ai/generate
 *    Authorization: Bearer <token>
 *    Body: {
 *      "subjectId": "<id>",
 *      "parameters": { "totalItems": 3, "difficulty": "easy", "requestedTypes": ["MCQ","Flashcard"] }
 *    }
 * 7. Verify response: data.persistence.saved > 0
 * 8. Query MongoDB:
 *    db.questions.find({ userId: ObjectId("<userId>"), subjectId: ObjectId("<subjectId>") })
 *    db.flashcards.find({ userId: ObjectId("<userId>"), subjectId: ObjectId("<subjectId>") })
 *
 * Status: BLOCKED — no live MongoDB instance is available in this sandboxed environment.
 *         The complete persistence wiring is verified by the mocked unit tests above.
 */
