import mongoose from 'mongoose';
import aiGenerationService from '../services/aiGenerationService.js';
import { validateHierarchyOwnership } from '../services/studyMaterialService.js';

const VALID_DIFFICULTIES = ['easy', 'medium', 'hard', 'mixed'];
const VALID_TYPES = [
  'MCQ',
  'Flashcard',
  'TrueFalse',
  'OneWord',
  'FillInTheBlank',
  'MatchTheFollowing',
  'Sequence',
  'SpotTheMistake',
  'WhatHappensNext',
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
    const sourceMaterials = Array.isArray(body.sourceMaterials) ? body.sourceMaterials : undefined;

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
      },
      sourceMaterials,
      parameters: {
        totalItems,
        difficulty,
        requestedTypes,
      },
    });

    // 7. Standardized Success Response
    return res.status(200).json({
      success: true,
      data: generationResult,
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
};
