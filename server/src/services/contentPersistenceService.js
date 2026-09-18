import mongoose from 'mongoose';
import { Question } from '../models/Question.js';
import { Flashcard } from '../models/Flashcard.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Subject } from '../models/Subject.js';
import { Unit } from '../models/Unit.js';
import { Topic } from '../models/Topic.js';

const normalizeText = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

const createPersistenceError = (message, code = 'PERSISTENCE_ERROR', statusCode = 400) => ({
  success: false,
  duplicate: false,
  status: 'error',
  data: null,
  error: {
    message,
    code,
    statusCode,
  },
  errorMessage: message,
});

const createSuccessResponse = (document, duplicate = false) => ({
  success: true,
  duplicate,
  status: duplicate ? 'duplicate' : 'success',
  data: document,
  error: null,
  errorMessage: null,
});

const validateHierarchy = async ({ userId, subjectId, unitId, topicId, materialId }) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw createPersistenceError('Subject not found.', 'SUBJECT_NOT_FOUND', 404);
  }
  if (subject.userId.toString() !== userId.toString()) {
    throw createPersistenceError('Unauthorized subject access.', 'UNAUTHORIZED_SUBJECT', 403);
  }

  const material = await StudyMaterial.findById(materialId);
  if (!material) {
    throw createPersistenceError('Study material not found.', 'MATERIAL_NOT_FOUND', 404);
  }
  if (material.userId.toString() !== userId.toString()) {
    throw createPersistenceError('Unauthorized material access.', 'UNAUTHORIZED_MATERIAL', 403);
  }
  if (material.subjectId && material.subjectId.toString() !== subjectId.toString()) {
    throw createPersistenceError('Material does not belong to the specified subject.', 'INVALID_SUBJECT_HIERARCHY', 400);
  }

  if (unitId) {
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      throw createPersistenceError('Invalid unitId format.', 'INVALID_UNIT_ID', 400);
    }
    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw createPersistenceError('Unit not found.', 'UNIT_NOT_FOUND', 404);
    }
    if (unit.subjectId.toString() !== subjectId.toString()) {
      throw createPersistenceError('Unit does not belong to the specified subject.', 'INVALID_UNIT_HIERARCHY', 400);
    }
    if (material.unitId && material.unitId.toString() !== unitId.toString()) {
      throw createPersistenceError('Material unit mismatch.', 'MATERIAL_UNIT_MISMATCH', 400);
    }
  }

  if (topicId) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      throw createPersistenceError('Invalid topicId format.', 'INVALID_TOPIC_ID', 400);
    }
    const topic = await Topic.findById(topicId);
    if (!topic) {
      throw createPersistenceError('Topic not found.', 'TOPIC_NOT_FOUND', 404);
    }
    if (!unitId) {
      throw createPersistenceError('topicId requires unitId.', 'TOPIC_REQUIRES_UNIT', 400);
    }
    if (topic.unitId.toString() !== unitId.toString()) {
      throw createPersistenceError('Topic does not belong to the specified unit.', 'INVALID_TOPIC_HIERARCHY', 400);
    }
    if (material.topicId && material.topicId.toString() !== topicId.toString()) {
      throw createPersistenceError('Material topic mismatch.', 'MATERIAL_TOPIC_MISMATCH', 400);
    }
  }

  if (material.unitId && !unitId) {
    throw createPersistenceError('Material hierarchy requires unitId when unit exists.', 'MISSING_UNIT_ID', 400);
  }

  if (material.topicId && !topicId) {
    throw createPersistenceError('Material hierarchy requires topicId when topic exists.', 'MISSING_TOPIC_ID', 400);
  }
};

export const saveQuestion = async (data, authenticatedUserId) => {
  try {
    if (!data || typeof data !== 'object') {
      return createPersistenceError('Question payload must be an object.', 'INVALID_PAYLOAD', 400);
    }

    if (authenticatedUserId !== data.userId) {
      const error = createPersistenceError('Unauthorized user access', 'USER_ID_MISMATCH', 403);
      error.status = 'error';
      return error;
    }

    const material = await StudyMaterial.findById(data.materialId);
    if (!material || material.userId.toString() !== data.userId.toString()) {
      return createPersistenceError('Unauthorized material access', 'UNAUTHORIZED_MATERIAL', 403);
    }

    await validateHierarchy({
      userId: data.userId,
      subjectId: data.subjectId,
      unitId: data.unitId,
      topicId: data.topicId,
      materialId: data.materialId,
    });

    const normalizedText = normalizeText(data.questionText);
    const existing = await Question.findOne({
      userId: data.userId,
      materialId: data.materialId,
      questionText: { $regex: `^${normalizedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (existing) {
      return createSuccessResponse(existing, true);
    }

    const created = await Question.create(data);
    return createSuccessResponse(created, false);
  } catch (err) {
    if (err && err.status === 'error' && err.error) {
      return err;
    }

    return createPersistenceError(err && err.message ? err.message : 'Failed to save question', 'QUESTION_SAVE_FAILED', 500);
  }
};

export const saveFlashcard = async (data, authenticatedUserId) => {
  try {
    if (!data || typeof data !== 'object') {
      return createPersistenceError('Flashcard payload must be an object.', 'INVALID_PAYLOAD', 400);
    }

    if (authenticatedUserId !== data.userId) {
      const error = createPersistenceError('Unauthorized user access', 'USER_ID_MISMATCH', 403);
      error.status = 'error';
      return error;
    }

    const material = await StudyMaterial.findById(data.materialId);
    if (!material || material.userId.toString() !== data.userId.toString()) {
      return createPersistenceError('Unauthorized material access', 'UNAUTHORIZED_MATERIAL', 403);
    }

    await validateHierarchy({
      userId: data.userId,
      subjectId: data.subjectId,
      unitId: data.unitId,
      topicId: data.topicId,
      materialId: data.materialId,
    });

    const normalizedFront = normalizeText(data.front);
    const existing = await Flashcard.findOne({
      userId: data.userId,
      materialId: data.materialId,
      front: { $regex: `^${normalizedFront.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });

    if (existing) {
      return createSuccessResponse(existing, true);
    }

    const created = await Flashcard.create(data);
    return createSuccessResponse(created, false);
  } catch (err) {
    if (err && err.status === 'error' && err.error) {
      return err;
    }

    return createPersistenceError(err && err.message ? err.message : 'Failed to save flashcard', 'FLASHCARD_SAVE_FAILED', 500);
  }
};
