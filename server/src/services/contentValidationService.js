import mongoose from 'mongoose';

const QUESTION_TYPES = ['MCQ', 'SHORT', 'LONG', 'TRUE_FALSE', 'FILL_BLANK'];

const createValidationError = (message, statusCode = 400, code = 'VALIDATION_ERROR') => ({
  success: false,
  error: {
    code,
    message,
    statusCode,
  },
});

const isValidObjectId = (value) => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && mongoose.Types.ObjectId.isValid(trimmed);
};

const ensureObjectId = (value, fieldName) => {
  if (!isValidObjectId(value)) {
    throw createValidationError(`Invalid ${fieldName} format.`, 400, 'INVALID_OBJECT_ID');
  }
  return value.trim();
};

const ensureOptionalObjectId = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (!isValidObjectId(value)) {
    throw createValidationError(`Invalid ${fieldName} format.`, 400, 'INVALID_OBJECT_ID');
  }
  return value.trim();
};

const ensureRequiredString = (value, fieldName) => {
  if (typeof value !== 'string') {
    throw createValidationError(`${fieldName} must be a string.`, 400, 'INVALID_STRING');
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw createValidationError(`${fieldName} is required.`, 400, 'REQUIRED_FIELD');
  }
  return trimmed;
};

const ensureOptionalString = (value, fieldName) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') {
    throw createValidationError(`${fieldName} must be a string.`, 400, 'INVALID_STRING');
  }
  const trimmed = value.trim();
  return trimmed || undefined;
};

const normalizeSourceChunks = (sourceChunks) => {
  if (!Array.isArray(sourceChunks) || sourceChunks.length === 0) {
    throw createValidationError('sourceChunks must be a non-empty array of valid ObjectIds.', 400, 'INVALID_SOURCE_CHUNKS');
  }

  const normalized = sourceChunks.map((chunkId) => {
    if (!isValidObjectId(chunkId)) {
      throw createValidationError('Each sourceChunks entry must be a valid ObjectId.', 400, 'INVALID_SOURCE_CHUNK');
    }
    return chunkId.trim();
  });

  return normalized;
};

const validateCommonMetadata = (data, entityName) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createValidationError(`${entityName} payload must be an object.`, 400, 'INVALID_PAYLOAD');
  }

  const userId = ensureObjectId(data.userId, 'userId');
  const subjectId = ensureObjectId(data.subjectId, 'subjectId');
  const materialId = ensureObjectId(data.materialId, 'materialId');
  const unitId = ensureOptionalObjectId(data.unitId, 'unitId');
  const topicId = ensureOptionalObjectId(data.topicId, 'topicId');

  return {
    userId,
    subjectId,
    materialId,
    unitId,
    topicId,
  };
};

export const validateQuestion = (data) => {
  try {
    const metadata = validateCommonMetadata(data, 'Question');
    const sourceChunks = normalizeSourceChunks(data.sourceChunks);

    const type = typeof data.type === 'string' ? data.type.trim().toUpperCase() : '';
    if (!QUESTION_TYPES.includes(type)) {
      throw createValidationError('Question type must be one of: MCQ, SHORT, LONG, TRUE_FALSE, FILL_BLANK.', 400, 'INVALID_QUESTION_TYPE');
    }

    const questionText = ensureRequiredString(data.questionText, 'questionText');
    const explanation = ensureOptionalString(data.explanation, 'explanation');

    let options;
    if (type === 'MCQ') {
      if (!Array.isArray(data.options) || data.options.length < 2) {
        throw createValidationError('MCQ questions require an options array with at least 2 entries.', 400, 'INVALID_MCQ_OPTIONS');
      }

      const normalizedOptions = data.options.map((option) => {
        if (typeof option !== 'string') {
          throw createValidationError('Each MCQ option must be a string.', 400, 'INVALID_MCQ_OPTION_TYPE');
        }
        const trimmed = option.trim();
        if (!trimmed) {
          throw createValidationError('MCQ options cannot be empty.', 400, 'EMPTY_MCQ_OPTION');
        }
        return trimmed;
      });

      options = normalizedOptions;
    }

    const rawCorrectAnswer = data.correctAnswer;
    if (rawCorrectAnswer === undefined || rawCorrectAnswer === null || rawCorrectAnswer === '') {
      throw createValidationError('correctAnswer is required.', 400, 'REQUIRED_FIELD');
    }

    let correctAnswer;
    if (type === 'MCQ') {
      if (typeof rawCorrectAnswer !== 'string') {
        throw createValidationError('MCQ correctAnswer must be a string matching one of the options.', 400, 'INVALID_MCQ_ANSWER');
      }
      const normalizedAnswer = rawCorrectAnswer.trim();
      if (!normalizedAnswer) {
        throw createValidationError('MCQ correctAnswer cannot be empty.', 400, 'EMPTY_MCQ_ANSWER');
      }
      if (!options.includes(normalizedAnswer)) {
        throw createValidationError('MCQ correctAnswer must match one of the provided options.', 400, 'MCQ_ANSWER_NOT_IN_OPTIONS');
      }
      correctAnswer = normalizedAnswer;
    } else if (type === 'TRUE_FALSE') {
      const normalizedAnswer = typeof rawCorrectAnswer === 'boolean' ? rawCorrectAnswer : String(rawCorrectAnswer).trim().toLowerCase();
      if (normalizedAnswer !== 'true' && normalizedAnswer !== 'false' && normalizedAnswer !== true && normalizedAnswer !== false) {
        throw createValidationError('TRUE_FALSE correctAnswer must be true or false.', 400, 'INVALID_TRUE_FALSE_ANSWER');
      }
      correctAnswer = normalizedAnswer === true || normalizedAnswer === 'true' ? 'true' : 'false';
    } else {
      if (typeof rawCorrectAnswer !== 'string') {
        throw createValidationError('correctAnswer must be a string for this question type.', 400, 'INVALID_ANSWER_TYPE');
      }
      const normalizedAnswer = rawCorrectAnswer.trim();
      if (!normalizedAnswer) {
        throw createValidationError('correctAnswer cannot be empty.', 400, 'EMPTY_ANSWER');
      }
      correctAnswer = normalizedAnswer;
    }

    return {
      success: true,
      data: {
        ...metadata,
        sourceChunks,
        type,
        questionText,
        ...(options ? { options } : {}),
        correctAnswer,
        ...(explanation ? { explanation } : {}),
      },
    };
  } catch (error) {
    if (error && error.success === false) {
      return error;
    }
    return createValidationError('Question validation failed.', 400, 'QUESTION_VALIDATION_FAILED');
  }
};

export const validateFlashcard = (data) => {
  try {
    const metadata = validateCommonMetadata(data, 'Flashcard');
    const sourceChunks = normalizeSourceChunks(data.sourceChunks);

    const front = ensureRequiredString(data.front, 'front');
    const back = ensureRequiredString(data.back, 'back');

    return {
      success: true,
      data: {
        ...metadata,
        sourceChunks,
        front,
        back,
      },
    };
  } catch (error) {
    if (error && error.success === false) {
      return error;
    }
    return createValidationError('Flashcard validation failed.', 400, 'FLASHCARD_VALIDATION_FAILED');
  }
};
