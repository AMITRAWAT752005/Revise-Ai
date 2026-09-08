import fs from 'node:fs/promises';
import mongoose from 'mongoose';
import SyllabusImport from '../models/SyllabusImport.js';
import Subject from '../models/Subject.js';
import { createSubject } from './subjectService.js';
import { extractSyllabusText, getSafeFileName } from './syllabusExtractionService.js';
import { extractSubjectsWithAI } from './aiSubjectService.js';

const serviceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateImportId = (importId) => {
  if (!mongoose.Types.ObjectId.isValid(importId)) {
    throw serviceError('Invalid syllabus import ID format.', 400);
  }
};

export const createSyllabusImport = async (userId, file) => {
  if (!file) throw serviceError('A syllabus file is required.', 400);
  const fileType = file.originalname.toLowerCase().endsWith('.pdf')
    ? 'pdf'
    : file.originalname.toLowerCase().endsWith('.docx')
      ? 'docx'
      : 'txt';

  return SyllabusImport.create({
    userId,
    fileName: getSafeFileName(file.originalname),
    fileType,
    fileReference: file.path,
    status: 'uploaded',
  });
};

export const processSyllabusImport = async (importId) => {
  const syllabusImport = await SyllabusImport.findById(importId).select('+fileReference');
  if (!syllabusImport) return;

  await SyllabusImport.updateOne({ _id: importId }, { $set: { status: 'processing', error: undefined } });
  try {
    const { text } = await extractSyllabusText(syllabusImport.fileReference, syllabusImport.fileType);
    const result = await extractSubjectsWithAI(text);
    await SyllabusImport.updateOne(
      { _id: importId },
      {
        $set: {
          status: 'completed',
          detectedSubjects: result.subjects,
          completedAt: new Date(),
        },
        $unset: { error: 1 },
      },
    );
  } catch (error) {
    await SyllabusImport.updateOne(
      { _id: importId },
      { $set: { status: 'failed', error: error.message.slice(0, 1000) } },
    );
  } finally {
    await fs.unlink(syllabusImport.fileReference).catch(() => {});
  }
};

export const getSyllabusImport = async (userId, importId) => {
  validateImportId(importId);
  const record = await SyllabusImport.findOne({ _id: importId, userId }).select('-fileReference');
  if (!record) throw serviceError('Syllabus import not found.', 404);
  return record;
};

export const confirmSyllabusSubjects = async (userId, importId, confirmedSubjects = []) => {
  validateImportId(importId);
  if (!Array.isArray(confirmedSubjects) || confirmedSubjects.length === 0) {
    throw serviceError('Select at least one subject to continue.', 400);
  }

  const syllabusImport = await SyllabusImport.findOne({ _id: importId, userId });
  if (!syllabusImport) throw serviceError('Syllabus import not found.', 404);
  if (syllabusImport.status !== 'completed') {
    throw serviceError('Only a completed syllabus import can be confirmed.', 400);
  }

  const detectedNames = new Set(syllabusImport.detectedSubjects.map(({ name }) => name.toLocaleLowerCase()));
  const seen = new Set();
  const names = confirmedSubjects.map((subject) => {
    if (!subject || typeof subject.name !== 'string') throw serviceError('Each confirmed subject needs a valid name.', 400);
    const name = subject.name.trim().replace(/\s+/g, ' ');
    const key = name.toLocaleLowerCase();
    if (name.length < 2 || name.length > 200 || !detectedNames.has(key) || seen.has(key)) {
      throw serviceError('Confirmed subjects must be valid, detected, and unique.', 400);
    }
    seen.add(key);
    return { name, description: typeof subject.description === 'string' ? subject.description : undefined, colour: typeof subject.colour === 'string' ? subject.colour : undefined };
  });

  const existing = await Subject.find({ userId }).select('name');
  const existingNames = new Set(existing.map(({ name }) => name.toLocaleLowerCase()));
  if (names.some(({ name }) => existingNames.has(name.toLocaleLowerCase()))) {
    throw serviceError('One or more confirmed subjects already exist.', 400);
  }

  const createdSubjects = [];
  for (const subject of names) {
    const result = await createSubject(userId, subject);
    createdSubjects.push(result.subject);
  }

  return { subjects: createdSubjects };
};
