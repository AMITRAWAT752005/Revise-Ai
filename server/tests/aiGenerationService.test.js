import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { generateContent } from '../src/services/aiGenerationService.js';
import ragContextService from '../src/services/ragContextService.js';

describe('AI Generation Service - generateContent', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockSubjectId = new mongoose.Types.ObjectId().toString();

  const validRequest = {
    context: {
      userId: mockUserId,
      subjectId: mockSubjectId,
    },
    parameters: {
      totalItems: 3,
      difficulty: 'medium',
      requestedTypes: ['MCQ', 'Flashcard'],
    },
  };

  beforeEach(() => {
    mock.restoreAll();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  it('should throw an error for an invalid generation request', async () => {
    const invalidRequest = { ...validRequest, parameters: { ...validRequest.parameters, totalItems: 0 } };
    await assert.rejects(
      async () => {
        await generateContent(invalidRequest);
      },
      (err) => err.statusCode === 400 && err.message.includes('Invalid generation request')
    );
  });

  it('should throw an error if no RAG context is found', async () => {
    mock.method(ragContextService, 'buildRagContext', async () => ({
      contextText: '',
      sources: [],
      totalChunksIncluded: 0,
      isTruncated: false,
    }));

    await assert.rejects(
      async () => {
        await generateContent(validRequest);
      },
      (err) => err.statusCode === 400 && err.message.includes('Insufficient study material')
    );
  });

  it('should successfully generate content and validate the response', async () => {
    mock.method(ragContextService, 'buildRagContext', async () => ({
      contextText: 'The powerhouse of the cell is the mitochondria.',
      sources: [{ chunkId: 'chunk1', citation: 'Bio Book', subjectId: mockSubjectId }],
      totalChunksIncluded: 1,
      isTruncated: false,
    }));

    const mockAiResponse = {
      generatedContent: [
        {
          type: 'Flashcard',
          front: 'What is the powerhouse of the cell?',
          back: 'Mitochondria',
          sourceChunkIds: ['chunk1'],
        },
      ],
    };

    const fetchMock = mock.method(global, 'fetch', async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: JSON.stringify(mockAiResponse) }] } }],
      }),
    }));

    const result = await generateContent(validRequest);

    assert.strictEqual(result.generatedContent.length, 1);
    assert.strictEqual(result.generatedContent[0].type, 'Flashcard');
    assert.strictEqual(result.meta.totalItemsGenerated, 1);
    assert.strictEqual(result.meta.contextChunksUsed, 1);
    assert.strictEqual(fetchMock.mock.calls.length, 1);
  });

  it('should throw an error if the AI response fails schema validation', async () => {
    mock.method(ragContextService, 'buildRagContext', async () => ({
      contextText: 'Test text',
      sources: [{ chunkId: 'chunk1' }],
      totalChunksIncluded: 1,
      isTruncated: false,
    }));

    const invalidAiResponse = {
      generatedContent: [
        {
          type: 'MCQ', // Missing required MCQ fields
          sourceChunkIds: ['chunk1'],
        },
      ],
    };

    mock.method(global, 'fetch', async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: JSON.stringify(invalidAiResponse) }] } }],
      }),
    }));

    await assert.rejects(
      async () => {
        await generateContent(validRequest);
      },
      (err) => err.message.includes('AI response validation failed')
    );
  });
});
