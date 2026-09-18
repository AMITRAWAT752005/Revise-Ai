import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { buildRagContext } from '../src/services/ragContextService.js';
import * as semanticSearchService from '../src/services/semanticSearchService.js';
import { mock } from 'node:test';

describe('RAG Context Service - buildRagContext', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockQuery = 'photosynthesis process';

  beforeEach(() => {
    mock.restoreAll();
  });

  it('should throw an error if query is missing', async () => {
    await assert.rejects(
      async () => {
        await buildRagContext({ userId: mockUserId, query: '' });
      },
      (err) => err.message === 'Query is required to build RAG context' && err.statusCode === 400
    );
  });

  it('should throw an error if userId is missing', async () => {
    await assert.rejects(
      async () => {
        await buildRagContext({ query: mockQuery });
      },
      (err) => err.message === 'Authenticated userId is required to build RAG context' && err.statusCode === 401
    );
  });

  it('should return empty context if no chunks are found', async () => {
    mock.method(semanticSearchService, 'searchSemanticChunks', async () => []);

    const result = await buildRagContext({ userId: mockUserId, query: mockQuery });

    assert.deepStrictEqual(result, {
      contextText: '',
      sources: [],
      totalChunksIncluded: 0,
      isTruncated: false,
    });
  });

  it('should build context string and deduplicate chunks', async () => {
    const mockChunks = [
      {
        chunkId: 'chunk1',
        materialId: 'mat1',
        subjectId: 'sub1',
        text: 'First chunk of text.',
        similarityScore: 0.9,
        citation: 'Source 1, Page 1',
      },
      {
        chunkId: 'chunk1', // Duplicate chunkId
        materialId: 'mat1',
        subjectId: 'sub1',
        text: 'First chunk of text.',
        similarityScore: 0.9,
        citation: 'Source 1, Page 1',
      },
      {
        chunkId: 'chunk2',
        materialId: 'mat2',
        subjectId: 'sub1',
        text: 'Second chunk of text.',
        similarityScore: 0.85,
        citation: 'Source 2, Page 5',
      },
    ];

    mock.method(semanticSearchService, 'searchSemanticChunks', async () => mockChunks);

    const result = await buildRagContext({ userId: mockUserId, query: mockQuery });

    assert.strictEqual(result.totalChunksIncluded, 2);
    assert.strictEqual(result.contextText, 'First chunk of text.\n\n---\n\nSecond chunk of text.');
    assert.strictEqual(result.sources.length, 2);
    assert.strictEqual(result.sources[0].chunkId, 'chunk1');
    assert.strictEqual(result.sources[1].chunkId, 'chunk2');
    assert.strictEqual(result.isTruncated, false);
  });

  it('should enforce maxContextChars limit and set isTruncated', async () => {
    const mockChunks = [
      {
        chunkId: 'chunk1',
        text: 'Short text.',
        similarityScore: 0.9,
      },
      {
        chunkId: 'chunk2',
        text: 'This is a very long text that exceeds the limit.', // 48 chars
        similarityScore: 0.85,
      },
      {
        chunkId: 'chunk3',
        text: 'This should be ignored.',
        similarityScore: 0.8,
      },
    ];

    mock.method(semanticSearchService, 'searchSemanticChunks', async () => mockChunks);

    const result = await buildRagContext({
      userId: mockUserId,
      query: mockQuery,
      maxContextChars: 50,
    });

    assert.strictEqual(result.totalChunksIncluded, 1);
    assert.strictEqual(result.contextText, 'Short text.');
    assert.strictEqual(result.sources.length, 1);
    assert.strictEqual(result.isTruncated, true);
  });

  it('should handle a single chunk that exceeds maxContextChars', async () => {
    const mockChunks = [
      {
        chunkId: 'chunk1',
        text: 'This is a very long text that exceeds the limit right from the start.',
        similarityScore: 0.9,
      },
    ];

    mock.method(semanticSearchService, 'searchSemanticChunks', async () => mockChunks);

    const result = await buildRagContext({
      userId: mockUserId,
      query: mockQuery,
      maxContextChars: 20,
    });

    assert.strictEqual(result.totalChunksIncluded, 1);
    assert.strictEqual(result.contextText, 'This is a very long ...');
    assert.strictEqual(result.sources.length, 1);
    assert.strictEqual(result.isTruncated, true);
  });
});
