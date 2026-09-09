import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import Unit from '../models/Unit.js';
import Topic from '../models/Topic.js';

const UNIT_FIELDS = 'subjectId name description order totalTopics completedTopics mastery createdAt updatedAt';
const TOPIC_FIELDS = 'unitId name description order mastery status createdAt updatedAt';

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createServiceError(`Invalid ${label} ID format.`, 400);
  }
};

const requireOwnedSubject = async (userId, subjectId) => {
  validateId(subjectId, 'subject');
  const subject = await Subject.findOne({ _id: subjectId, userId }).select('_id');
  if (!subject) throw createServiceError('Subject not found.', 404);
  return subject;
};

const requireOwnedUnit = async (userId, unitId) => {
  validateId(unitId, 'unit');
  const unit = await Unit.findOne({ _id: unitId }).select('_id subjectId');
  if (!unit) throw createServiceError('Unit not found.', 404);
  await requireOwnedSubject(userId, unit.subjectId);
  return unit;
};

const requireOwnedTopic = async (userId, topicId) => {
  validateId(topicId, 'topic');
  const topic = await Topic.findOne({ _id: topicId }).select('_id unitId');
  if (!topic) throw createServiceError('Topic not found.', 404);
  await requireOwnedUnit(userId, topic.unitId);
  return topic;
};

export const listUnits = async (userId, subjectId) => {
  await requireOwnedSubject(userId, subjectId);
  return Unit.find({ subjectId }).select(UNIT_FIELDS).sort({ order: 1 });
};

export const getUnit = async (userId, unitId) => {
  const unit = await requireOwnedUnit(userId, unitId);
  return Unit.findById(unit._id).select(UNIT_FIELDS);
};

export const listTopics = async (userId, unitId) => {
  await requireOwnedUnit(userId, unitId);
  return Topic.find({ unitId }).select(TOPIC_FIELDS).sort({ order: 1 });
};

export const getTopic = async (userId, topicId) => {
  const topic = await requireOwnedTopic(userId, topicId);
  return Topic.findById(topic._id).select(TOPIC_FIELDS);
};
