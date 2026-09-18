import mongoose from 'mongoose';
import { Question } from '../models/Question.js';
import { Flashcard } from '../models/Flashcard.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Subject } from '../models/Subject.js';
import { Unit } from '../models/Unit.js';
import { Topic } from '../models/Topic.js';

const createPersistenceError = (message, statusCode = 400, code = 'PERSISTENCE_ERROR') => ({
  success: false,
  error: {
    code,
    message,
    statusCode,
  },
});

const validateHierarchy = async ({ userId, subjectId, unitId, topicId, materialId }) => {
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    throw createPersistenceError('Subject not found.', 404, 'SUBJECT_NOT_FOUND');
  }
  if (subject.userId.toString() !== userId.toString()) {
    throw createPersistenceError('Unauthorized subject access.', 403, 'UNAUTHORIZED_SUBJECT');
  }

  const material = await StudyMaterial.findById(materialId);
  if (!material) {
    throw createPersistenceError('Study material not found.', 404, 'MATERIAL_NOT_FOUND');
  }
  if (material.userId.toString() !== userId.toString()) {
    throw createPersistenceError('Unauthorized material access.', 403, 'UNAUTHORIZED_MATERIAL');
  }
  if (material.subjectId.toString() !== subjectId.toString()) {
    throw createPersistenceError('Material does not belong to the specified subject.', 400, 'INVALID_SUBJECT_HIERARCHY');
  }

  if (unitId) {
    if (!mongoose.Types.ObjectId.isValid(unitId)) {
      throw createPersistenceError('Invalid unitId format.', 400, 'INVALID_UNIT_ID');
    }
    const unit = await Unit.findById(unitId);
    if (!unit) {
      throw createPersistenceError('Unit not found.', 404, 'UNIT_NOT_FOUND');
    }
    if (unit.subjectId.toString() !== subjectId.toString()) {
      throw createPersistenceError('Unit does not belong to the specified subject.', 400, 'INVALID_UNIT_HIERARCHY');
    }
    if (material.unitId && material.unitId.toString() !== unitId.toString()) {
      throw createPersistenceError('Material unit mismatch.', 400, 'MATERIAL_UNIT_MISMATCH');
    }
  }

  if (topicId) {
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      throw createPersistenceError('Invalid topicId format.', 400, 'INVALID_TOPIC_ID');
    }
    const topic = await Topic.findById(topicId);
    if (!topic) {
      throw createPersistenceError('Topic not found.', 404, 'TOPIC_NOT_FOUND');
    }
    if (!unitId) {
      throw createPersistenceError('topicId requires unitId.', 400, 'TOPIC_REQUIRES_UNIT');
    }
    if (topic.unitId.toString() !== unitId.toString()) {
      throw createPersistenceError('Topic does not belong to the specified unit.', 400, 'INVALID_TOPIC_HIERARCHY');
    }
    if (material.topicId && material.topicId.toString() !== topicId.toString()) {
      throw createPersistenceError('Material topic mismatch.', 400, 'MATERIAL_TOPIC_MISMATCH');
    }
  }

  if (material.unitId && !unitId) {
    throw createPersistenceError('Material hierarchy requires unitId when unit exists.', 400, 'MISSING_UNIT_ID');
  }

  if (material.topicId && !topicId) {
    throw createPersistenceError('Material hierarchy requires topicId when topic exists.', 400, 'MISSING_TOPIC_ID');
  }
};

const isDuplicateQuestion = async ({ userId, materialId, questionText }) => {
  const existing = await Question.findOne({
    userId,
    materialId,
    questionText: { $regex: `^${questionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
  }).lean();

  return existing;
};

const isDuplicateFlashcard = async ({ userId, materialId, front }) => {
  const existing = await Flashcard.findOne({
    userId,
    materialId,
    front: { $regex: `^${front.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
  }).lean();

  return existing;
};

export const saveQuestion = async (validatedData, authenticatedUserId) => {
  try {
    if (!validatedData || typeof validatedData !== 'object') {
      return createPersistenceError('Question payload must be an object.', 400, 'INVALID_PAYLOAD');
    }

    if (validatedData.userId !== authenticatedUserId) {
      return createPersistenceError('User mismatch: authenticated user does not match payload userId.', 403, 'USER_ID_MISMATCH');
    }

    await validateHierarchy({
      userId: validatedData.userId,
      subjectId: validatedData.subjectId,
      unitId: validatedData.unitId,
      topicId: validatedData.topicId,
      materialId: validatedData.materialId,
    });

    const duplicate = await isDuplicateQuestion({
      userId: validatedData.userId,
      materialId: validatedData.materialId,
      questionText: validatedData.questionText,
    });

    if (duplicate) {
      return { success: true, data: duplicate, duplicate: true };
    }

    const document = await Question.create({
      userId: validatedData.userId,
      subjectId: validatedData.subjectId,
      ...(validatedData.unitId ? { unitId: validatedData.unitId } : {}),
      ...(validatedData.topicId ? { topicId: validatedData.topicId } : {}),
      materialId: validatedData.materialId,
      sourceChunks: validatedData.sourceChunks,
      type: validatedData.type,
      questionText: validatedData.questionText,
      ...(validatedData.options ? { options: validatedData.options } : {}),
      correctAnswer: validatedData.correctAnswer,
      ...(validatedData.explanation ? { explanation: validatedData.explanation } : {}),
    });

    return { success: true, data: document, duplicate: false };
  } catch (error) {
    if (error && error.success === false) {
      return error;
    }
    return createPersistenceError('Failed to save question.', 500, 'QUESTION_SAVE_FAILED');
  }
};

export const saveFlashcard = async (validatedData, authenticatedUserId) => {
  try {
    if (!validatedData || typeof validatedData !== 'object') {
      return createPersistenceError('Flashcard payload must be an object.', 400, 'INVALID_PAYLOAD');
    }

    if (validatedData.userId !== authenticatedUserId) {
      return createPersistenceError('User mismatch: authenticated user does not match payload userId.', 403, 'USER_ID_MISMATCH');
    }

    await validateHierarchy({
      userId: validatedData.userId,
      subjectId: validatedData.subjectId,
      unitId: validatedData.unitId,
      topicId: validatedData.topicId,
      materialId: validatedData.materialId,
    });

    const duplicate = await isDuplicateFlashcard({
      userId: validatedData.userId,
      materialId: validatedData.materialId,
      front: validatedData.front,
    });

    if (duplicate) {
      return { success: true, data: duplicate, duplicate: true };
    }

    const document = await Flashcard.create({
      userId: validatedData.userId,
      subjectId: validatedData.subjectId,
      ...(validatedData.unitId ? { unitId: validatedData.unitId } : {}),
      ...(validatedData.topicId ? { topicId: validatedData.topicId } : {}),
      materialId: validatedData.materialId,
      sourceChunks: validatedData.sourceChunks,
      front: validatedData.front,
      back: validatedData.back,
    });

    return { success: true, data: document, duplicate: false };
  } catch (error) {
    if (error && error.success === false) {
      return error;
    }
    return createPersistenceError('Failed to save flashcard.', 500, 'FLASHCARD_SAVE_FAILED');
  }
};
