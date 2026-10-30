import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { generateContent, buildSemanticRagQuery } from '../src/services/aiGenerationService.js';
import ragContextService from '../src/services/ragContextService.js';
import Topic from '../src/models/Topic.js';
import Unit from '../src/models/Unit.js';
import Subject from '../src/models/Subject.js';

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

// ─── FIX-03: Topic-Aware RAG Query Builder Tests ──────────────────────────────

describe('buildSemanticRagQuery — FIX-03 topic-aware retrieval', () => {
  beforeEach(() => {
    mock.restoreAll();
  });

  it('returns explicit searchQuery verbatim when provided', async () => {
    const context = {
      userId: 'u1',
      subjectId: 's1',
      searchQuery: 'CPU Scheduling Algorithms',
    };
    const query = await buildSemanticRagQuery(context, {});
    assert.strictEqual(query, 'CPU Scheduling Algorithms');
  });

  it('builds topic-aware query from pre-resolved names without DB lookup', async () => {
    // Spy on model methods to ensure no DB call is made.
    const topicSpy = mock.method(Topic, 'findById', async () => { throw new Error('Should not call DB'); });
    const unitSpy  = mock.method(Unit,  'findById', async () => { throw new Error('Should not call DB'); });
    const subjectSpy = mock.method(Subject, 'findById', async () => { throw new Error('Should not call DB'); });

    const context = {
      userId: 'u1',
      subjectId: 's1',
      topicName: 'CPU Scheduling',
      unitName: 'Operating Systems',
      subjectName: 'Computer Science',
    };

    const query = await buildSemanticRagQuery(context, {});

    // DB must NOT have been called because names were pre-resolved.
    assert.strictEqual(topicSpy.mock.calls.length, 0);
    assert.strictEqual(unitSpy.mock.calls.length,  0);
    assert.strictEqual(subjectSpy.mock.calls.length, 0);

    // Query must contain the academic topic names.
    assert.ok(query.includes('CPU Scheduling'), `Expected "CPU Scheduling" in query. Got: "${query}"`);
    assert.ok(query.includes('Operating Systems'), `Expected "Operating Systems" in query. Got: "${query}"`);
    assert.ok(query.includes('Computer Science'), `Expected "Computer Science" in query. Got: "${query}"`);
    // Query must include the academic suffix.
    assert.ok(query.includes('key concepts'), `Expected "key concepts" in query. Got: "${query}"`);
  });

  it('performs DB lookup when IDs are given but no names are pre-resolved', async () => {
    const mockTopicId   = new mongoose.Types.ObjectId().toString();
    const mockUnitId    = new mongoose.Types.ObjectId().toString();
    const mockSubjectId = new mongoose.Types.ObjectId().toString();

    mock.method(Topic, 'findById', (_id) => ({
      select: () => ({ lean: async () => ({ name: 'Deadlock Prevention' }) }),
    }));
    mock.method(Unit, 'findById', (_id) => ({
      select: () => ({ lean: async () => ({ name: 'Concurrency' }) }),
    }));
    mock.method(Subject, 'findById', (_id) => ({
      select: () => ({ lean: async () => ({ name: 'Operating Systems' }) }),
    }));

    const context = {
      userId: 'u1',
      subjectId: mockSubjectId,
      unitId: mockUnitId,
      topicId: mockTopicId,
    };

    const query = await buildSemanticRagQuery(context, {});

    assert.ok(query.includes('Deadlock Prevention'), `Expected topic name in query. Got: "${query}"`);
    assert.ok(query.includes('Concurrency'),         `Expected unit name in query.  Got: "${query}"`);
    assert.ok(query.includes('Operating Systems'),   `Expected subject name in query. Got: "${query}"`);
  });

  it('falls back gracefully when DB lookup throws (e.g. test env without DB)', async () => {
    mock.method(Topic,   'findById', () => { throw new Error('DB unavailable'); });
    mock.method(Unit,    'findById', () => { throw new Error('DB unavailable'); });
    mock.method(Subject, 'findById', () => { throw new Error('DB unavailable'); });

    const context = {
      userId: 'u1',
      subjectId: new mongoose.Types.ObjectId().toString(),
      topicId:   new mongoose.Types.ObjectId().toString(),
    };

    // Must not throw — should fall back to generic academic query.
    const query = await buildSemanticRagQuery(context, {});
    assert.ok(typeof query === 'string' && query.length > 0, 'Should return a non-empty fallback string');
    assert.ok(query.includes('Key concepts'), `Expected fallback phrase. Got: "${query}"`);
  });

  it('falls back to generic query when no context information is available at all', async () => {
    const context = {
      userId: 'u1',
      subjectId: 's1',
      // No topicId, unitId, topicName, unitName, subjectName, or searchQuery.
    };

    const query = await buildSemanticRagQuery(context, {});
    assert.strictEqual(query, 'Key concepts, core definitions, principles, and fundamental explanations');
  });

  it('generateContent uses topic-aware query when topicName is in context', async () => {
    // Intercept ragContextService.buildRagContext to capture the query it receives.
    let capturedQuery = null;
    mock.method(ragContextService, 'buildRagContext', async (params) => {
      capturedQuery = params.query;
      return {
        contextText: 'Some study material text.',
        sources: [{ chunkId: 'c1', citation: 'Notes p.1' }],
        totalChunksIncluded: 1,
        isTruncated: false,
      };
    });

    mock.method(global, 'fetch', async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                generatedContent: [{
                  type: 'Flashcard',
                  front: 'Q?',
                  back: 'A',
                  sourceChunkIds: ['c1'],
                }],
              }),
            }],
          },
        }],
      }),
    }));

    const userId    = new mongoose.Types.ObjectId().toString();
    const subjectId = new mongoose.Types.ObjectId().toString();

    await generateContent({
      context: {
        userId,
        subjectId,
        topicName: 'Photosynthesis',
        unitName: 'Plant Biology',
        subjectName: 'Biology',
      },
      parameters: {
        totalItems: 1,
        difficulty: 'easy',
        requestedTypes: ['Flashcard'],
      },
    });

    assert.ok(capturedQuery !== null, 'ragContextService.buildRagContext should have been called');
    assert.ok(
      capturedQuery.includes('Photosynthesis'),
      `RAG query should include the topic name. Got: "${capturedQuery}"`
    );
    assert.ok(
      capturedQuery.includes('Plant Biology'),
      `RAG query should include the unit name. Got: "${capturedQuery}"`
    );
    // Crucially: must NOT be the old generic generation instruction.
    assert.ok(
      !capturedQuery.startsWith('Generate'),
      `RAG query must not be the legacy generation instruction. Got: "${capturedQuery}"`
    );
  });
});
