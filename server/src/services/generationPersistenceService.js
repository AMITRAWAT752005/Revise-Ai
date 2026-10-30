/**
 * generationPersistenceService.js
 *
 * FIX-04 — Phase 4E + 4F
 * Bridges the gap between validated AI-generated content (from aiGenerationService)
 * and MongoDB persistence (via contentPersistenceService).
 *
 * Responsibilities:
 *   1. Resolve materialId from the request hierarchy when not supplied by caller.
 *   2. Map AI contract output items → persistence service payload format.
 *   3. Route Flashcard items to saveFlashcard, all others to saveQuestion.
 *   4. Aggregate per-item outcomes (saved / duplicate / failed) without throwing.
 *   5. Never persist unvalidated AI output.
 */

import mongoose from 'mongoose';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { saveQuestion, saveFlashcard } from './contentPersistenceService.js';

const isValidObjectId = (id) =>
  typeof id === 'string' && id.trim().length > 0 && mongoose.Types.ObjectId.isValid(id.trim());

// ─── 1. materialId resolution ─────────────────────────────────────────────────

/**
 * Resolves a materialId for the given user + hierarchy.
 *
 * Priority:
 *   1. Caller-supplied materialId — validated for ownership and hierarchy match.
 *   2. Auto-resolve: most recent "completed" StudyMaterial for userId+subjectId
 *      (narrowed by unitId/topicId when provided).
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.subjectId
 * @param {string|undefined} params.unitId
 * @param {string|undefined} params.topicId
 * @param {string|undefined} params.materialId  - Caller-supplied; validated if present.
 * @param {object} [deps]  - Optional injected dependencies (for testing).
 * @param {Function} [deps.findMaterialById]
 * @param {Function} [deps.findLatestMaterial]
 * @returns {Promise<string|null>}  Resolved materialId string, or null if none found.
 */
export const resolveMaterialId = async (
  { userId, subjectId, unitId, topicId, materialId },
  deps = {}
) => {
  const findMaterialById = deps.findMaterialById
    ?? ((id) => StudyMaterial.findById(id).lean());
  const findLatestMaterial = deps.findLatestMaterial
    ?? ((filter) => StudyMaterial.findOne(filter).sort({ createdAt: -1 }).select('_id').lean());

  // 1a. Caller supplied a materialId — validate ownership and hierarchy.
  if (materialId && isValidObjectId(materialId)) {
    const material = await findMaterialById(materialId);
    if (!material) return null;
    if (material.userId.toString() !== userId.toString()) return null;
    if (material.subjectId.toString() !== subjectId.toString()) return null;
    // If the material has a unitId it must match the request unitId (if provided).
    if (unitId && material.unitId && material.unitId.toString() !== unitId.toString()) return null;
    return materialId.trim();
  }

  // 1b. Auto-resolve — pick the most recently created "completed" material.
  const filter = {
    userId,
    subjectId,
    processingStatus: 'completed',
  };
  if (unitId) filter.unitId = unitId;
  if (topicId) filter.topicId = topicId;

  const material = await findLatestMaterial(filter);
  return material ? material._id.toString() : null;
};

// ─── 2. AI contract → persistence payload mapping ────────────────────────────

/**
 * Maps a single AI-generated content item to the persistence service payload.
 * All fields come from the already-validated (Zod-passed) item.
 *
 * @param {object} item       - Validated AI contract item (e.g. MCQSchema output).
 * @param {object} meta       - Shared metadata for this generation batch.
 * @param {string} meta.userId
 * @param {string} meta.subjectId
 * @param {string} meta.unitId
 * @param {string} meta.topicId
 * @param {string} meta.materialId
 * @param {string} meta.difficulty   - Batch difficulty ('easy'|'medium'|'hard'|'mixed').
 * @param {string} meta.model        - Gemini model identifier string.
 * @param {string} meta.promptId     - Batch-level prompt identifier (generation timestamp).
 * @param {Date}   meta.generatedAt  - Generation timestamp.
 * @returns {object} Persistence payload.
 */
export const mapItemToPayload = (item, meta) => {
  // Resolve the effective difficulty: 'mixed' from the batch means we default to 'medium'
  // per item (the AI doesn't label individual item difficulty in the current contract).
  const effectiveDifficulty =
    meta.difficulty === 'mixed' ? 'medium' : (meta.difficulty || 'medium');

  const base = {
    userId: meta.userId,
    subjectId: meta.subjectId,
    unitId: meta.unitId,
    topicId: meta.topicId,
    materialId: meta.materialId,
    type: item.type,
    sourceChunks: item.sourceChunkIds,  // AI contract field
    sourceChunkIds: item.sourceChunkIds, // alias — persistence service accepts both
    difficulty: effectiveDifficulty,
    tags: [item.type, meta.difficulty].filter(Boolean),
    source: 'AI',
    aiMetadata: {
      promptId: meta.promptId,
      model: meta.model,
      generatedAt: meta.generatedAt,
    },
    status: 'active',
  };

  // Type-specific field mapping (mirrors contentValidationService switch cases).
  switch (item.type) {
    case 'MCQ':
      return {
        ...base,
        questionText: item.question,
        options: item.options,
        correctAnswer: item.answer,
        explanation: item.explanation,
      };

    case 'Flashcard':
      return {
        ...base,
        front: item.front,
        back: item.back,
        questionText: item.front,
        correctAnswer: item.back,
      };

    case 'TrueFalse':
      return {
        ...base,
        questionText: item.statement,
        statement: item.statement,
        // TrueFalse answer is boolean in AI contract; string in persistence schema.
        correctAnswer: String(item.answer),
        explanation: item.explanation,
      };

    case 'OneWord':
      return {
        ...base,
        questionText: item.question,
        correctAnswer: item.answer,
      };

    case 'FillInTheBlank':
      return {
        ...base,
        questionText: item.statement,
        statement: item.statement,
        correctAnswer: item.answer,
      };

    case 'MatchTheFollowing':
      return {
        ...base,
        questionText: item.question,
        pairs: item.pairs,
      };

    case 'Sequence':
      return {
        ...base,
        questionText: item.question,
        orderedItems: item.orderedItems,
      };

    case 'SpotTheMistake':
      return {
        ...base,
        questionText: item.statementWithMistake,
        statementWithMistake: item.statementWithMistake,
        mistake: item.mistake,
        correction: item.correction,
        correctAnswer: item.correction,
      };

    case 'WhatHappensNext':
      return {
        ...base,
        questionText: item.scenario,
        scenario: item.scenario,
        correctOutcome: item.correctOutcome,
        incorrectOutcomes: item.incorrectOutcomes,
        correctAnswer: item.correctOutcome,
      };

    case 'ShortAnswer':
      return {
        ...base,
        questionText: item.question,
        idealAnswer: item.idealAnswer,
        correctAnswer: item.idealAnswer,
      };

    default:
      // Unreachable given Zod discriminated union, but guard anyway.
      return { ...base, questionText: JSON.stringify(item) };
  }
};

// ─── 3. Batch persistence orchestrator ───────────────────────────────────────

/**
 * @typedef {object} PersistenceOutcome
 * @property {number} saved       - Items newly inserted into MongoDB.
 * @property {number} duplicates  - Items already existing (skipped, not re-saved).
 * @property {number} failed      - Items that produced a persistence error.
 * @property {object[]} errors    - Error details per failed item.
 * @property {string[]} savedIds  - MongoDB _id strings of newly saved documents.
 */

/**
 * Persists an array of validated AI-generated items into MongoDB.
 *
 * Each item is processed independently — a failure on one item does NOT abort
 * the remaining items (partial-success semantics).
 *
 * @param {object[]} validatedItems   - Items from AIGenerationResponseSchema.generatedContent.
 * @param {object}   meta             - Shared generation metadata (see mapItemToPayload).
 * @param {object}   [deps]           - Optional injected dependencies (for testing).
 * @param {Function} [deps.saveQuestion]
 * @param {Function} [deps.saveFlashcard]
 * @returns {Promise<PersistenceOutcome>}
 */
export const persistGeneratedItems = async (validatedItems, meta, deps = {}) => {
  const _saveQuestion  = deps.saveQuestion  ?? saveQuestion;
  const _saveFlashcard = deps.saveFlashcard ?? saveFlashcard;

  const outcome = {
    saved: 0,
    duplicates: 0,
    failed: 0,
    errors: [],
    savedIds: [],
  };

  for (const item of validatedItems) {
    try {
      const payload = mapItemToPayload(item, meta);

      let result;
      if (item.type === 'Flashcard') {
        result = await _saveFlashcard(payload, meta.userId);
      } else {
        result = await _saveQuestion(payload, meta.userId);
      }

      if (!result.success) {
        outcome.failed += 1;
        outcome.errors.push({
          type: item.type,
          error: result.error?.message || result.errorMessage || 'Unknown persistence error',
        });
      } else if (result.duplicate) {
        outcome.duplicates += 1;
      } else {
        outcome.saved += 1;
        if (result.data?._id) {
          outcome.savedIds.push(result.data._id.toString());
        }
      }
    } catch (err) {
      // Unexpected/uncaught error — treat as individual failure.
      outcome.failed += 1;
      outcome.errors.push({
        type: item.type,
        error: err?.message || 'Unexpected error during persistence',
      });
    }
  }

  return outcome;
};
