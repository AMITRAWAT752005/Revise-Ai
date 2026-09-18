import semanticSearchService from './semanticSearchService.js';

/**
 * Builds a structured RAG context from retrieved semantic chunks.
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated user ID (mandatory)
 * @param {string} params.query - Search query
 * @param {string} [params.subjectId] - Optional subject filter
 * @param {string} [params.unitId] - Optional unit filter
 * @param {string} [params.topicId] - Optional topic filter
 * @param {string} [params.materialId] - Optional material filter
 * @param {number} [params.limit=10] - Number of top chunks to retrieve
 * @param {number} [params.maxContextChars=15000] - Maximum characters in the final context
 * @returns {Promise<Object>} Structured context for LLM
 */
export const buildRagContext = async ({
  userId,
  query,
  subjectId,
  unitId,
  topicId,
  materialId,
  limit = 10,
  maxContextChars = 15000,
}) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    const error = new Error('Query is required to build RAG context');
    error.statusCode = 400;
    throw error;
  }

  if (!userId) {
    const error = new Error('Authenticated userId is required to build RAG context');
    error.statusCode = 401;
    throw error;
  }

  // 1. Retrieve chunks via semantic search
  // semanticSearchService automatically handles user isolation and hierarchical validation
  const rawChunks = await semanticSearchService.searchSemanticChunks({
    query,
    userId,
    subjectId,
    unitId,
    topicId,
    materialId,
    limit,
  });

  if (!Array.isArray(rawChunks) || rawChunks.length === 0) {
    return {
      contextText: '',
      sources: [],
      totalChunksIncluded: 0,
      isTruncated: false,
    };
  }

  // 2. Deduplicate chunks based on chunkId (in case of overlaps)
  const uniqueChunks = [];
  const seenChunkIds = new Set();

  for (const chunk of rawChunks) {
    if (chunk && chunk.chunkId && !seenChunkIds.has(chunk.chunkId)) {
      seenChunkIds.add(chunk.chunkId);
      uniqueChunks.push(chunk);
    }
  }

  // 3. Build context and enforce limits
  let contextText = '';
  const sources = [];
  let isTruncated = false;
  let totalChunksIncluded = 0;

  for (const chunk of uniqueChunks) {
    const chunkText = chunk.text || '';
    if (!chunkText.trim()) continue;

    const separator = contextText.length > 0 ? '\n\n---\n\n' : '';
    const projectedLength = contextText.length + separator.length + chunkText.length;

    // Check if adding this chunk exceeds max length constraints
    if (projectedLength > maxContextChars) {
      if (contextText.length === 0) {
        // Edge case: A single chunk is larger than the max limit
        contextText = chunkText.substring(0, maxContextChars) + '...';
        sources.push({
          chunkId: chunk.chunkId,
          materialId: chunk.materialId,
          subjectId: chunk.subjectId,
          unitId: chunk.unitId,
          topicId: chunk.topicId,
          similarityScore: chunk.similarityScore,
          citation: chunk.citation,
        });
        totalChunksIncluded++;
      }
      isTruncated = true;
      break;
    }

    // Append chunk text
    contextText += separator + chunkText;

    // Track metadata references for source grounding
    sources.push({
      chunkId: chunk.chunkId,
      materialId: chunk.materialId,
      subjectId: chunk.subjectId,
      unitId: chunk.unitId,
      topicId: chunk.topicId,
      similarityScore: chunk.similarityScore,
      citation: chunk.citation,
    });

    totalChunksIncluded++;
  }

  return {
    contextText,
    sources,
    totalChunksIncluded,
    isTruncated,
  };
};

export default {
  buildRagContext,
};
