import mongoose from 'mongoose';
import aiGenerationService from '../services/aiGenerationService.js';
import { validateHierarchyOwnership } from '../services/studyMaterialService.js';
import {
  resolveMaterialId,
  persistGeneratedItems,
} from '../services/generationPersistenceService.js';

export const VALID_DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'];
export const VALID_TYPES = [
  'MCQ',
  'Flashcard',
  'TrueFalse',
  'OneWord',
  'FillInTheBlank',
  'MatchTheFollowing',
  'Sequence',
  'SpotTheMistake',
  'WhatHappensNext',
  'ShortAnswer',
];

const isValidObjectId = (id) => typeof id === 'string' && id.trim().length > 0 && mongoose.Types.ObjectId.isValid(id.trim());

/**
 * Controller to handle AI Content Generation requests.
 * Route: POST /api/ai/generate
 * Protection: authenticateToken
 */
export const generateContentController = async (req, res) => {
  try {
    // 1. Obtain authenticated userId from auth middleware (never trust body.userId)
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Access token missing or invalid.',
      });
    }

    // 2. Extract parameters from body (supporting flat or nested structure)
    const body = req.body || {};
    const subjectId = (body.subjectId || body.context?.subjectId || '').trim();
    const unitId = (body.unitId || body.context?.unitId || '').trim() || undefined;
    const topicId = (body.topicId || body.context?.topicId || '').trim() || undefined;
    // Optional: caller may supply the materialId to pin which study material to
    // attribute the generated content to. When absent, auto-resolved at persistence time.
    const callerMaterialId = (body.materialId || body.context?.materialId || '').trim() || undefined;
    const sourceMaterials = Array.isArray(body.sourceMaterials) ? body.sourceMaterials : undefined;

    // Optional pre-resolved academic names for topic-aware RAG query building.
    const topicName = typeof (body.topicName || body.context?.topicName) === 'string'
      ? (body.topicName || body.context?.topicName).trim() || undefined
      : undefined;
    const unitName = typeof (body.unitName || body.context?.unitName) === 'string'
      ? (body.unitName || body.context?.unitName).trim() || undefined
      : undefined;
    const subjectName = typeof (body.subjectName || body.context?.subjectName) === 'string'
      ? (body.subjectName || body.context?.subjectName).trim() || undefined
      : undefined;
    const searchQuery = typeof (body.searchQuery || body.context?.searchQuery) === 'string'
      ? (body.searchQuery || body.context?.searchQuery).trim() || undefined
      : undefined;

    // 3. Subject / Unit / Topic ID Validation
    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: 'subjectId is required.',
      });
    }

    if (!isValidObjectId(subjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subjectId format.',
      });
    }

    if (unitId && !isValidObjectId(unitId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unitId format.',
      });
    }

    if (topicId) {
      if (!isValidObjectId(topicId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topicId format.',
        });
      }
      if (!unitId) {
        return res.status(400).json({
          success: false,
          message: 'unitId is required when topicId is provided.',
        });
      }
    }

    // 4. Validate Generation Parameters
    const rawParams = body.parameters || {};
    const totalItems = typeof rawParams.totalItems === 'number' ? rawParams.totalItems : 10;
    if (totalItems < 1 || totalItems > 50) {
      return res.status(400).json({
        success: false,
        message: 'totalItems must be an integer between 1 and 50.',
      });
    }

    const difficulty = typeof rawParams.difficulty === 'string' ? rawParams.difficulty.toLowerCase() : 'mixed';
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.`,
      });
    }

    let requestedTypes = Array.isArray(rawParams.requestedTypes) ? rawParams.requestedTypes : ['MCQ', 'Flashcard'];
    if (requestedTypes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'requestedTypes must contain at least one content type.',
      });
    }

    for (const type of requestedTypes) {
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid content type '${type}'. Must be one of: ${VALID_TYPES.join(', ')}.`,
        });
      }
    }

    // 5. Resource Ownership Verification
    try {
      await validateHierarchyOwnership(userId, subjectId, unitId, topicId);
    } catch (err) {
      const statusCode = err.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        message: err.message || 'Resource ownership validation failed.',
      });
    }

    // 6. Call AI Generation Service
    const generationResult = await aiGenerationService.generateContent({
      context: {
        userId: userId.toString(),
        subjectId,
        unitId,
        topicId,
        topicName,
        unitName,
        subjectName,
        searchQuery,
      },
      sourceMaterials,
      parameters: {
        totalItems,
        difficulty,
        requestedTypes,
      },
    });

    // 7. Persist validated AI output into MongoDB
    //    Resolve a materialId to attribute the generated content to the correct source.
    //    This is non-blocking: persistence failures are reported in the response but do
    //    NOT cause the API to return 500 — the generated content is still returned.
    let persistenceSummary = null;
    try {
      const resolvedMaterialId = await resolveMaterialId({
        userId: userId.toString(),
        subjectId,
        unitId,
        topicId,
        materialId: callerMaterialId,
      });

      if (resolvedMaterialId) {
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const generatedAt = new Date();
        const promptId = `gen-${generatedAt.toISOString()}`;

        persistenceSummary = await persistGeneratedItems(
          generationResult.generatedContent,
          {
            userId: userId.toString(),
            subjectId,
            unitId,
            topicId,
            materialId: resolvedMaterialId,
            difficulty,
            model,
            promptId,
            generatedAt,
          }
        );
      } else {
        // No completed study material found — skip persistence gracefully.
        persistenceSummary = {
          saved: 0,
          duplicates: 0,
          failed: 0,
          errors: [],
          savedIds: [],
          skipped: true,
          reason: 'No completed study material found for this subject/unit/topic. Upload and process a PDF first.',
        };
      }
    } catch (persistErr) {
      // Persistence layer error — log but do not fail the entire request.
      console.error('[aiController] Persistence error after generation:', persistErr?.message);
      persistenceSummary = {
        saved: 0,
        duplicates: 0,
        failed: generationResult.generatedContent.length,
        errors: [{ type: 'batch', error: persistErr?.message || 'Persistence batch error' }],
        savedIds: [],
      };
    }

    // 8. Standardized Success Response (enriched with persistence summary)
    return res.status(200).json({
      success: true,
      data: {
        ...generationResult,
        persistence: persistenceSummary,
      },
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : 'AI generation failed due to a server error. Please try again later.';
    
    if (statusCode >= 500) {
      console.error('[aiController] Error generating content:', error.message);
    }

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};

export default {
  generateContentController,
  VALID_TYPES,
  VALID_DIFFICULTIES,
};
