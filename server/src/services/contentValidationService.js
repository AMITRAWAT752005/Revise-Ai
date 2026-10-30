import mongoose from 'mongoose';

const CANONICAL_QUESTION_TYPES = [
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

const LEGACY_QUESTION_TYPES = ['SHORT', 'LONG', 'TRUE_FALSE', 'FILL_BLANK'];

const ALL_QUESTION_TYPES = [...CANONICAL_QUESTION_TYPES, ...LEGACY_QUESTION_TYPES];

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

const ensureRequiredString = (value, fieldName, minLength = 1) => {
  if (typeof value !== 'string') {
    throw createValidationError(`${fieldName} must be a string.`, 400, 'INVALID_STRING');
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw createValidationError(`${fieldName} is required.`, 400, 'REQUIRED_FIELD');
  }
  if (trimmed.length < minLength) {
    throw createValidationError(`${fieldName} must be at least ${minLength} characters long.`, 400, 'INVALID_STRING_LENGTH');
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

const normalizeSourceChunks = (sourceChunks, sourceChunkIds) => {
  const rawChunks = Array.isArray(sourceChunks) && sourceChunks.length > 0
    ? sourceChunks
    : Array.isArray(sourceChunkIds) && sourceChunkIds.length > 0
      ? sourceChunkIds
      : sourceChunks;

  if (!Array.isArray(rawChunks) || rawChunks.length === 0) {
    throw createValidationError('sourceChunks must be a non-empty array of valid ObjectIds.', 400, 'INVALID_SOURCE_CHUNKS');
  }

  const normalized = rawChunks.map((chunkId) => {
    if (!isValidObjectId(chunkId)) {
      throw createValidationError('Each sourceChunks entry must be a valid ObjectId.', 400, 'INVALID_SOURCE_CHUNK');
    }
    return chunkId.trim();
  });

  return normalized;
};

const normalizeDifficulty = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!['easy', 'medium', 'hard'].includes(normalized)) {
    throw createValidationError('difficulty must be one of: easy, medium, hard.', 400, 'INVALID_DIFFICULTY');
  }
  return normalized;
};

const normalizeTags = (value, fieldName) => {
  if (!Array.isArray(value) || value.length === 0) {
    throw createValidationError(`${fieldName} must be a non-empty array of strings.`, 400, 'INVALID_TAGS');
  }

  const normalized = value.map((tag) => {
    if (typeof tag !== 'string') {
      throw createValidationError(`${fieldName} entries must be strings.`, 400, 'INVALID_TAG_TYPE');
    }
    const trimmed = tag.trim();
    if (!trimmed) {
      throw createValidationError(`${fieldName} entries cannot be empty.`, 400, 'EMPTY_TAG');
    }
    return trimmed;
  });

  return normalized;
};

const normalizeSource = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (normalized === 'AI') return 'AI';
  if (normalized === 'manual') return 'manual';
  if (normalized.toLowerCase() === 'ai') return 'AI';
  if (normalized.toLowerCase() === 'manual') return 'manual';
  throw createValidationError('source must be either AI or manual.', 400, 'INVALID_SOURCE');
};

const normalizeAiMetadata = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw createValidationError('aiMetadata must be an object with promptId, model, and generatedAt.', 400, 'INVALID_AI_METADATA');
  }

  const promptId = ensureRequiredString(value.promptId, 'aiMetadata.promptId');
  const model = ensureRequiredString(value.model, 'aiMetadata.model');
  const generatedAt = value.generatedAt;
  if (generatedAt === undefined || generatedAt === null || generatedAt === '') {
    throw createValidationError('aiMetadata.generatedAt is required.', 400, 'REQUIRED_FIELD');
  }

  const parsedDate = new Date(generatedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    throw createValidationError('aiMetadata.generatedAt must be a valid date.', 400, 'INVALID_AI_METADATA_DATE');
  }

  return {
    promptId,
    model,
    generatedAt: parsedDate,
  };
};

const validateStatus = (value) => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (!['active', 'archived', 'failed'].includes(normalized)) {
    throw createValidationError('status must be one of: active, archived, failed.', 400, 'INVALID_STATUS');
  }
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
    const sourceChunks = normalizeSourceChunks(data.sourceChunks, data.sourceChunkIds);

    const rawType = typeof data.type === 'string' ? data.type.trim() : '';
    const matchedType = ALL_QUESTION_TYPES.find((t) => t.toLowerCase() === rawType.toLowerCase());
    if (!matchedType) {
      throw createValidationError(
        `Question type must be one of: ${ALL_QUESTION_TYPES.join(', ')}.`,
        400,
        'INVALID_QUESTION_TYPE',
      );
    }
    const type = matchedType;

    const explanation = ensureOptionalString(data.explanation, 'explanation');
    const difficulty = normalizeDifficulty(data.difficulty);
    const tags = normalizeTags(data.tags, 'tags');
    const source = normalizeSource(data.source);
    const aiMetadata = normalizeAiMetadata(data.aiMetadata);
    const status = validateStatus(data.status ?? 'active');

    let questionText;
    let correctAnswer;
    let options;
    let pairs;
    let orderedItems;
    let statementWithMistake;
    let mistake;
    let correction;
    let scenario;
    let correctOutcome;
    let incorrectOutcomes;
    let idealAnswer;
    let statement;
    let front;
    let back;

    switch (type) {
      case 'MCQ': {
        questionText = ensureRequiredString(data.questionText || data.question, 'questionText', 3);

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

        const rawAnswer = data.correctAnswer !== undefined ? data.correctAnswer : data.answer;
        if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') {
          throw createValidationError('correctAnswer is required.', 400, 'REQUIRED_FIELD');
        }
        if (typeof rawAnswer !== 'string') {
          throw createValidationError('MCQ correctAnswer must be a string matching one of the options.', 400, 'INVALID_MCQ_ANSWER');
        }
        const normalizedAnswer = rawAnswer.trim();
        if (!normalizedAnswer) {
          throw createValidationError('MCQ correctAnswer cannot be empty.', 400, 'EMPTY_MCQ_ANSWER');
        }
        if (!options.includes(normalizedAnswer)) {
          throw createValidationError('MCQ correctAnswer must match one of the provided options.', 400, 'MCQ_ANSWER_NOT_IN_OPTIONS');
        }
        correctAnswer = normalizedAnswer;
        break;
      }

      case 'TrueFalse':
      case 'TRUE_FALSE': {
        questionText = ensureRequiredString(data.questionText || data.statement || data.question, 'questionText', 3);
        statement = data.statement || questionText;

        const rawAnswer = data.correctAnswer !== undefined ? data.correctAnswer : data.answer;
        if (rawAnswer === undefined || rawAnswer === null || rawAnswer === '') {
          throw createValidationError('correctAnswer is required.', 400, 'REQUIRED_FIELD');
        }

        const normalizedAnswer = typeof rawAnswer === 'boolean' ? rawAnswer : String(rawAnswer).trim().toLowerCase();
        if (normalizedAnswer !== true && normalizedAnswer !== false && normalizedAnswer !== 'true' && normalizedAnswer !== 'false') {
          throw createValidationError('TrueFalse correctAnswer must be true or false.', 400, 'INVALID_TRUE_FALSE_ANSWER');
        }
        correctAnswer = (normalizedAnswer === true || normalizedAnswer === 'true') ? 'true' : 'false';
        break;
      }

      case 'OneWord': {
        questionText = ensureRequiredString(data.questionText || data.question, 'questionText', 3);
        const rawAnswer = data.correctAnswer !== undefined ? data.correctAnswer : data.answer;
        correctAnswer = ensureRequiredString(rawAnswer, 'correctAnswer', 1);
        break;
      }

      case 'FillInTheBlank':
      case 'FILL_BLANK': {
        questionText = ensureRequiredString(data.questionText || data.statement || data.question, 'questionText', 3);
        statement = data.statement || questionText;

        if (type === 'FillInTheBlank' && !questionText.includes('[BLANK]')) {
          throw createValidationError('FillInTheBlank statement must contain the exact string "[BLANK]".', 400, 'INVALID_FILL_BLANK_STATEMENT');
        }

        const rawAnswer = data.correctAnswer !== undefined ? data.correctAnswer : data.answer;
        correctAnswer = ensureRequiredString(rawAnswer, 'correctAnswer', 1);
        break;
      }

      case 'MatchTheFollowing': {
        questionText = ensureRequiredString(data.questionText || data.question, 'questionText', 3);

        if (!Array.isArray(data.pairs) || data.pairs.length < 3) {
          throw createValidationError('MatchTheFollowing requires a pairs array with at least 3 entries.', 400, 'INVALID_MATCH_PAIRS');
        }

        pairs = data.pairs.map((p, idx) => {
          if (!p || typeof p !== 'object' || Array.isArray(p)) {
            throw createValidationError(`Pair at index ${idx} must be an object with left and right properties.`, 400, 'INVALID_PAIR_FORMAT');
          }
          const left = ensureRequiredString(p.left, `pairs[${idx}].left`, 1);
          const right = ensureRequiredString(p.right, `pairs[${idx}].right`, 1);
          return { left, right };
        });

        if (data.correctAnswer !== undefined && data.correctAnswer !== null) {
          correctAnswer = ensureOptionalString(data.correctAnswer, 'correctAnswer');
        }
        break;
      }

      case 'Sequence': {
        questionText = ensureRequiredString(data.questionText || data.question, 'questionText', 3);

        if (!Array.isArray(data.orderedItems) || data.orderedItems.length < 3) {
          throw createValidationError('Sequence requires an orderedItems array with at least 3 entries.', 400, 'INVALID_SEQUENCE_ITEMS');
        }

        orderedItems = data.orderedItems.map((item, idx) => {
          return ensureRequiredString(item, `orderedItems[${idx}]`, 1);
        });

        if (data.correctAnswer !== undefined && data.correctAnswer !== null) {
          correctAnswer = ensureOptionalString(data.correctAnswer, 'correctAnswer');
        }
        break;
      }

      case 'SpotTheMistake': {
        questionText = ensureRequiredString(data.questionText || data.statementWithMistake || data.question, 'questionText', 3);
        statementWithMistake = ensureRequiredString(data.statementWithMistake || questionText, 'statementWithMistake', 3);
        mistake = ensureRequiredString(data.mistake, 'mistake', 1);
        correction = ensureRequiredString(data.correction, 'correction', 1);
        correctAnswer = data.correctAnswer ? ensureRequiredString(data.correctAnswer, 'correctAnswer', 1) : correction;
        break;
      }

      case 'WhatHappensNext': {
        questionText = ensureRequiredString(data.questionText || data.scenario || data.question, 'questionText', 3);
        scenario = ensureRequiredString(data.scenario || questionText, 'scenario', 3);
        const rawOutcome = data.correctOutcome || data.correctAnswer || data.answer;
        correctOutcome = ensureRequiredString(rawOutcome, 'correctOutcome', 1);
        correctAnswer = correctOutcome;

        if (data.incorrectOutcomes !== undefined && data.incorrectOutcomes !== null) {
          if (!Array.isArray(data.incorrectOutcomes)) {
            throw createValidationError('incorrectOutcomes must be an array of strings.', 400, 'INVALID_INCORRECT_OUTCOMES');
          }
          incorrectOutcomes = data.incorrectOutcomes.map((item, idx) => ensureRequiredString(item, `incorrectOutcomes[${idx}]`, 1));
        }
        break;
      }

      case 'ShortAnswer':
      case 'SHORT':
      case 'LONG': {
        questionText = ensureRequiredString(data.questionText || data.question, 'questionText', 3);
        const rawAnswer = data.idealAnswer || data.correctAnswer || data.answer;
        correctAnswer = ensureRequiredString(rawAnswer, 'correctAnswer', 1);
        if (data.idealAnswer) {
          idealAnswer = ensureRequiredString(data.idealAnswer, 'idealAnswer', 1);
        }
        break;
      }

      case 'Flashcard': {
        front = ensureRequiredString(data.front || data.questionText || data.question, 'front', 3);
        back = ensureRequiredString(data.back || data.correctAnswer || data.answer, 'back', 3);
        questionText = front;
        correctAnswer = back;
        break;
      }

      default: {
        throw createValidationError(`Unsupported question type '${type}'.`, 400, 'UNSUPPORTED_QUESTION_TYPE');
      }
    }

    return {
      success: true,
      data: {
        ...metadata,
        sourceChunks,
        type,
        questionText,
        ...(options ? { options } : {}),
        ...(correctAnswer !== undefined ? { correctAnswer } : {}),
        ...(explanation ? { explanation } : {}),
        ...(pairs ? { pairs } : {}),
        ...(orderedItems ? { orderedItems } : {}),
        ...(statementWithMistake ? { statementWithMistake } : {}),
        ...(mistake ? { mistake } : {}),
        ...(correction ? { correction } : {}),
        ...(scenario ? { scenario } : {}),
        ...(correctOutcome ? { correctOutcome } : {}),
        ...(incorrectOutcomes ? { incorrectOutcomes } : {}),
        ...(idealAnswer ? { idealAnswer } : {}),
        ...(statement ? { statement } : {}),
        ...(front ? { front } : {}),
        ...(back ? { back } : {}),
        difficulty,
        tags,
        source,
        aiMetadata,
        status,
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
    const sourceChunks = normalizeSourceChunks(data.sourceChunks, data.sourceChunkIds);

    const front = ensureRequiredString(data.front || data.questionText, 'front', 3);
    const back = ensureRequiredString(data.back || data.correctAnswer, 'back', 3);
    const difficulty = normalizeDifficulty(data.difficulty);
    const tags = normalizeTags(data.tags, 'tags');
    const source = normalizeSource(data.source);
    const aiMetadata = normalizeAiMetadata(data.aiMetadata);
    const status = validateStatus(data.status ?? 'active');

    return {
      success: true,
      data: {
        ...metadata,
        type: 'Flashcard',
        sourceChunks,
        front,
        back,
        difficulty,
        tags,
        source,
        aiMetadata,
        status,
      },
    };
  } catch (error) {
    if (error && error.success === false) {
      return error;
    }
    return createValidationError('Flashcard validation failed.', 400, 'FLASHCARD_VALIDATION_FAILED');
  }
};
