import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import { syncSubjectCount } from './userProgressService.js';

const SUBJECT_FIELDS = 'name description colour status mastery totalUnits totalTopics totalQuestions createdAt updatedAt';

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateSubjectId = (subjectId) => {
  if (!mongoose.Types.ObjectId.isValid(subjectId)) {
    throw createServiceError('Invalid subject ID format.', 400);
  }
};

const validateName = (name) => {
  const trimmedName = typeof name === 'string' ? name.trim() : '';
  if (!trimmedName) {
    throw createServiceError('Subject name is required.', 400);
  }
  if (trimmedName.length < 2) {
    throw createServiceError('Subject name must be at least 2 characters long.', 400);
  }
  return trimmedName;
};

const validateDescription = (description) => {
  if (description === undefined) return undefined;
  if (typeof description !== 'string' || description.trim().length > 200) {
    throw createServiceError('Description must be a string with a maximum length of 200 characters.', 400);
  }
  return description.trim();
};

const duplicateNameFilter = (userId, name, excludeId) => ({
  userId,
  name: new RegExp(`^${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, 'i'),
  ...(excludeId ? { _id: { $ne: excludeId } } : {}),
});

const runSubjectCountSync = async (userId, session = null) => syncSubjectCount(userId, session);

export const createSubject = async (userId, data = {}) => {
  const name = validateName(data.name);
  const duplicate = await Subject.findOne(duplicateNameFilter(userId, name));
  if (duplicate) {
    throw createServiceError('A subject with this name already exists.', 400);
  }

  let subject;
  const description = validateDescription(data.description);
  try {
    subject = await Subject.create({
      name,
      userId,
      ...(description !== undefined ? { description } : {}),
      ...(typeof data.colour === 'string' ? { colour: data.colour } : {}),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw createServiceError('A subject with this name already exists.', 400);
    }
    throw error;
  }
  const progress = await runSubjectCountSync(userId);

  return { subject, progress };
};

export const listSubjects = async (userId) => {
  const subjects = await Subject.find({ userId }).select(SUBJECT_FIELDS).sort({ createdAt: -1 });
  const progress = await runSubjectCountSync(userId);
  return { subjects: subjects || [], progress };
};

export const getSubject = async (userId, subjectId) => {
  validateSubjectId(subjectId);
  const subject = await Subject.findOne({ _id: subjectId, userId }).select(SUBJECT_FIELDS);
  if (!subject) throw createServiceError('Subject not found.', 404);
  return subject;
};

export const updateSubject = async (userId, subjectId, data = {}) => {
  validateSubjectId(subjectId);
  const updates = {};

  if (data.name !== undefined) updates.name = validateName(data.name);
  if (data.description !== undefined) updates.description = validateDescription(data.description);
  if (data.colour !== undefined) {
    if (typeof data.colour !== 'string' || !data.colour.trim()) {
      throw createServiceError('Colour must be a non-empty string.', 400);
    }
    updates.colour = data.colour.trim();
  }
  if (updates.name) {
    const duplicate = await Subject.findOne(duplicateNameFilter(userId, updates.name, subjectId));
    if (duplicate) throw createServiceError('A subject with this name already exists.', 400);
  }

  let subject;
  try {
    subject = await Subject.findOneAndUpdate(
      { _id: subjectId, userId },
      { $set: updates },
      { new: true, runValidators: true },
    ).select(SUBJECT_FIELDS);
  } catch (error) {
    if (error.code === 11000) {
      throw createServiceError('A subject with this name already exists.', 400);
    }
    throw error;
  }

  if (!subject) throw createServiceError('Subject not found.', 404);
  return subject;
};

export const deleteSubject = async (userId, subjectId) => {
  validateSubjectId(subjectId);
  const subject = await Subject.findOne({ _id: subjectId, userId });
  if (!subject) throw createServiceError('Subject not found.', 404);

  await Subject.deleteOne({ _id: subjectId, userId });
  const progress = await runSubjectCountSync(userId);
  return { progress };
};

