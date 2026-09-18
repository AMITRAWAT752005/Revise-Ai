import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  AIGenerationResponseSchema, 
  GenerationRequestSchema 
} from '../src/contracts/aiGenerationContract.js';

describe('AI Generation Contract Schemas', () => {
  it('should validate a correct generation request', () => {
    const validRequest = {
      context: {
        userId: '507f1f77bcf86cd799439011',
        subjectId: '507f191e810c19729de860ea',
      },
      parameters: {
        totalItems: 5,
        difficulty: 'medium',
        requestedTypes: ['MCQ', 'TrueFalse'],
      },
    };
    const result = GenerationRequestSchema.safeParse(validRequest);
    assert.strictEqual(result.success, true);
  });

  it('should validate a correct AI response with mixed content types', () => {
    const validResponse = {
      generatedContent: [
        {
          type: 'MCQ',
          question: 'What is 2+2?',
          options: ['3', '4', '5', '6'],
          answer: '4',
          sourceChunkIds: ['chunk1'],
        },
        {
          type: 'Sequence',
          question: 'Order these events chronologically',
          orderedItems: ['Event A', 'Event B', 'Event C'],
          sourceChunkIds: ['chunk2'],
        },
        {
          type: 'FillInTheBlank',
          statement: 'The capital of France is [BLANK].',
          answer: 'Paris',
          sourceChunkIds: ['chunk3'],
        }
      ]
    };
    const result = AIGenerationResponseSchema.safeParse(validResponse);
    if (!result.success) {
      console.error(result.error);
    }
    assert.strictEqual(result.success, true);
  });

  it('should fail validation for an invalid MCQ', () => {
    const invalidResponse = {
      generatedContent: [
        {
          type: 'MCQ',
          question: 'Missing options and answer?',
          sourceChunkIds: ['chunk1'],
        }
      ]
    };
    const result = AIGenerationResponseSchema.safeParse(invalidResponse);
    assert.strictEqual(result.success, false);
  });
});
