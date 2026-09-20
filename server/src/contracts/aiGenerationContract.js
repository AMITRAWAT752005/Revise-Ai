import { z } from 'zod';

/**
 * Phase 4D Task 1 - AI Generation Contract
 * Defines the structured JSON schemas for AI Content Generation.
 * These schemas validate both the request parameters for generation
 * and the output produced by the LLM (e.g., Groq/Gemini).
 */

// ─── 1. Content Type Definitions ──────────────────────────────────────────────

export const MCQSchema = z.object({
  type: z.literal('MCQ'),
  question: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).length(4, 'MCQs must have exactly 4 options'),
  answer: z.string().trim().min(1), // Must match one of the options
  explanation: z.string().trim().optional(),
  sourceChunkIds: z.array(z.string()).min(1, 'At least one source chunk must be referenced'),
});

export const FlashcardSchema = z.object({
  type: z.literal('Flashcard'),
  front: z.string().trim().min(1),
  back: z.string().trim().min(1),
  sourceChunkIds: z.array(z.string()).min(1),
});

export const TrueFalseSchema = z.object({
  type: z.literal('TrueFalse'),
  statement: z.string().trim().min(1),
  answer: z.boolean(),
  explanation: z.string().trim().optional(),
  sourceChunkIds: z.array(z.string()).min(1),
});

export const OneWordSchema = z.object({
  type: z.literal('OneWord'),
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  sourceChunkIds: z.array(z.string()).min(1),
});

export const FillInTheBlankSchema = z.object({
  type: z.literal('FillInTheBlank'),
  statement: z.string().trim().min(1).refine(
    (val) => val.includes('[BLANK]'), 
    { message: 'Statement must contain the exact string "[BLANK]"' }
  ),
  answer: z.string().trim().min(1),
  sourceChunkIds: z.array(z.string()).min(1),
});

export const MatchTheFollowingSchema = z.object({
  type: z.literal('MatchTheFollowing'),
  question: z.string().trim().min(1),
  pairs: z.array(
    z.object({
      left: z.string().trim().min(1),
      right: z.string().trim().min(1),
    })
  ).min(3, 'At least 3 pairs are required for matching'),
  sourceChunkIds: z.array(z.string()).min(1),
});

export const SequenceSchema = z.object({
  type: z.literal('Sequence'),
  question: z.string().trim().min(1),
  orderedItems: z.array(z.string().trim().min(1)).min(3, 'Sequence must have at least 3 items'),
  sourceChunkIds: z.array(z.string()).min(1),
});

export const SpotTheMistakeSchema = z.object({
  type: z.literal('SpotTheMistake'),
  statementWithMistake: z.string().trim().min(1),
  correction: z.string().trim().min(1),
  mistake: z.string().trim().min(1),
  sourceChunkIds: z.array(z.string()).min(1),
});

export const WhatHappensNextSchema = z.object({
  type: z.literal('WhatHappensNext'),
  scenario: z.string().trim().min(1),
  correctOutcome: z.string().trim().min(1),
  incorrectOutcomes: z.array(z.string().trim().min(1)).optional(), // Optional if evaluated subjectively
  sourceChunkIds: z.array(z.string()).min(1),
});

export const ShortAnswerSchema = z.object({
  type: z.literal('ShortAnswer'),
  question: z.string().trim().min(1),
  idealAnswer: z.string().trim().min(1),
  sourceChunkIds: z.array(z.string()).min(1),
});

// A union of all valid generated content schemas.
export const GeneratedContentItemSchema = z.discriminatedUnion('type', [
  MCQSchema,
  FlashcardSchema,
  TrueFalseSchema,
  OneWordSchema,
  FillInTheBlankSchema,
  MatchTheFollowingSchema,
  SequenceSchema,
  SpotTheMistakeSchema,
  WhatHappensNextSchema,
  ShortAnswerSchema,
]);

// ─── 2. AI Response Wrapper Schema ────────────────────────────────────────────

export const AIGenerationResponseSchema = z.object({
  generatedContent: z.array(GeneratedContentItemSchema)
    .min(1, 'AI must generate at least one content item'),
});

// ─── 3. Generation Request Parameters Schema ──────────────────────────────────

export const GenerationRequestSchema = z.object({
  context: z.object({
    userId: z.string().trim().min(1),
    subjectId: z.string().trim().min(1),
    unitId: z.string().trim().optional(),
    topicId: z.string().trim().optional(),
  }),
  // If empty, the system will rely solely on the hierarchical context for search filters
  sourceMaterials: z.array(z.string()).optional(),
  parameters: z.object({
    totalItems: z.number().int().min(1).max(50).default(10),
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).default('mixed'),
    requestedTypes: z.array(
      z.enum([
        'MCQ',
        'Flashcard',
        'TrueFalse',
        'OneWord',
        'FillInTheBlank',
        'MatchTheFollowing',
        'Sequence',
        'SpotTheMistake',
        'WhatHappensNext',
        'ShortAnswer'
      ])
    ).min(1, 'At least one content type must be requested'),
  }),
});
