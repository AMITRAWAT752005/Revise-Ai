import mongoose from 'mongoose';

import { Subject } from '../models/Subject.js';
import { Unit } from '../models/Unit.js';
import { Topic } from '../models/Topic.js';
import { StudyMaterial } from '../models/StudyMaterial.js';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access.') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 403;
  }
}

export class InvalidHierarchyError extends Error {
  constructor(message = 'Invalid hierarchy relation detected.') {
    super(message);
    this.name = 'InvalidHierarchyError';
    this.statusCode = 400;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found.') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

const isValidObjectId = (value) => {
  if (value === undefined || value === null || value === '') return false;
  if (typeof value !== 'string' && typeof value !== 'object') return false;
  return mongoose.Types.ObjectId.isValid(value.toString());
};

const normalizeId = (value, label) => {
  if (!isValidObjectId(value)) {
    throw new NotFoundError(`${label} is missing or invalid.`);
  }
  return value.toString();
};

export const validateOwnership = async (userId, subjectId) => {
  const normalizedUserId = normalizeId(userId, 'userId');
  const normalizedSubjectId = normalizeId(subjectId, 'subjectId');

  const subject = await Subject.findById(normalizedSubjectId);
  if (!subject) {
    throw new NotFoundError('Subject not found.');
  }

  if (subject.userId?.toString() !== normalizedUserId) {
    throw new UnauthorizedError('User does not own this subject.');
  }

  return subject;
};

export const validateUnitHierarchy = async (subjectId, unitId) => {
  const normalizedSubjectId = normalizeId(subjectId, 'subjectId');
  const normalizedUnitId = normalizeId(unitId, 'unitId');

  const subject = await Subject.findById(normalizedSubjectId);
  if (!subject) {
    throw new NotFoundError('Subject not found.');
  }

  const unit = await Unit.findById(normalizedUnitId);
  if (!unit) {
    throw new NotFoundError('Unit not found.');
  }

  if (unit.subjectId?.toString() !== normalizedSubjectId) {
    throw new InvalidHierarchyError('Unit does not belong to the provided subject.');
  }

  return unit;
};

export const validateTopicHierarchy = async (unitId, topicId) => {
  const normalizedUnitId = normalizeId(unitId, 'unitId');
  const normalizedTopicId = normalizeId(topicId, 'topicId');

  const unit = await Unit.findById(normalizedUnitId);
  if (!unit) {
    throw new NotFoundError('Unit not found.');
  }

  const topic = await Topic.findById(normalizedTopicId);
  if (!topic) {
    throw new NotFoundError('Topic not found.');
  }

  if (topic.unitId?.toString() !== normalizedUnitId) {
    throw new InvalidHierarchyError('Topic does not belong to the provided unit.');
  }

  return topic;
};

export const validateMaterialHierarchy = async (topicId, materialId) => {
  const normalizedTopicId = normalizeId(topicId, 'topicId');
  const normalizedMaterialId = normalizeId(materialId, 'materialId');

  const topic = await Topic.findById(normalizedTopicId);
  if (!topic) {
    throw new NotFoundError('Topic not found.');
  }

  const material = await StudyMaterial.findById(normalizedMaterialId);
  if (!material) {
    throw new NotFoundError('Material not found.');
  }

  if (material.topicId?.toString() !== normalizedTopicId) {
    throw new InvalidHierarchyError('Material does not belong to the provided topic.');
  }

  return material;
};

export const validateFullHierarchy = async (userId, subjectId, unitId, topicId, materialId) => {
  const subject = await validateOwnership(userId, subjectId);

  let unit = null;
  if (unitId) {
    unit = await validateUnitHierarchy(subjectId, unitId);
  }

  let topic = null;
  if (topicId) {
    if (!unitId) {
      throw new InvalidHierarchyError('unitId is required when topicId is provided.');
    }
    topic = await validateTopicHierarchy(unitId, topicId);
  }

  let material = null;
  if (materialId) {
    if (!topicId) {
      throw new InvalidHierarchyError('topicId is required when materialId is provided.');
    }
    material = await validateMaterialHierarchy(topicId, materialId);
  }

  return {
    subject,
    ...(unit ? { unit } : {}),
    ...(topic ? { topic } : {}),
    ...(material ? { material } : {}),
    userId: subject.userId,
    subjectId: subject._id,
    ...(unit ? { unitId: unit._id } : {}),
    ...(topic ? { topicId: topic._id } : {}),
    ...(material ? { materialId: material._id } : {}),
  };
};
