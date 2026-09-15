import crypto from 'node:crypto';
import { QdrantClient } from '@qdrant/js-client-rest';
import '../config/env.js';
import { buildVectorPayload } from './vectorMetadataService.js';

export const QDRANT_VECTOR_SIZE = 384;
export const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'reviseai_document_chunks';

let qdrantClient;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getClient = () => {
  if (!qdrantClient) {
    if (!process.env.QDRANT_URL) {
      throw new Error('QDRANT_URL is not configured');
    }
    if (!process.env.QDRANT_API_KEY) {
      throw new Error('QDRANT_API_KEY is not configured');
    }

    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });
  }

  return qdrantClient;
};

const validateVector = (vector) => {
  if (!Array.isArray(vector) || vector.length !== QDRANT_VECTOR_SIZE) {
    throw new Error(`Qdrant vectors must contain exactly ${QDRANT_VECTOR_SIZE} values`);
  }

  if (vector.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error('Qdrant vectors must contain only finite numbers');
  }
};

/**
 * Builds a stable, deterministic UUID-formatted point ID for a Qdrant vector.
 *
 * Qdrant requires point IDs to be either unsigned 64-bit integers or UUIDs.
 * We derive a UUID v4-shaped string from a SHA-256 hash of the chunk identity
 * so the same chunk always maps to the same Qdrant point (idempotent upsert).
 *
 * The UUID format is:  xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  (8-4-4-4-12 hex)
 * We take the first 32 hex chars of the SHA-256 digest and reformat them.
 *
 * @param {string|ObjectId} materialId
 * @param {string|ObjectId} chunkId
 * @param {number} chunkIndex
 * @returns {string} UUID-formatted stable vector ID
 */
export const buildStableVectorId = (materialId, chunkId, chunkIndex) => {
  const materialKey = String(materialId ?? '').trim();
  const chunkKey = String(chunkId ?? '').trim();
  const indexKey = String(chunkIndex ?? '').trim();

  if (!materialKey || !chunkKey || !indexKey) {
    throw new Error('materialId, chunkId, and chunkIndex are required to build a stable vector ID');
  }

  // Generate a 32-char hex string from the first 16 bytes of the SHA-256 digest.
  // SHA-256 produces 64 hex chars; we take the first 32 to fill UUID slots.
  const hash = crypto
    .createHash('sha256')
    .update(`${materialKey}:${chunkKey}:${indexKey}`)
    .digest('hex')
    .slice(0, 32);  // 32 hex chars = 16 bytes, enough for UUID 8-4-4-4-12

  // Reformat 32 hex chars into UUID layout: 8-4-4-4-12
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    hash.slice(12, 16),
    hash.slice(16, 20),
    hash.slice(20, 32),
  ].join('-');
};

export const checkCollectionExists = async (client = getClient()) => {
  try {
    const response = await client.getCollections();
    return Array.isArray(response?.collections)
      ? response.collections.some(({ name }) => name === QDRANT_COLLECTION_NAME)
      : false;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Qdrant collection existence check failed: ${message}`);
  }
};

export const createCollection = async (client = getClient()) => {
  try {
    if (await checkCollectionExists(client)) {
      return false;
    }

    await client.createCollection(QDRANT_COLLECTION_NAME, {
      vectors: {
        size: QDRANT_VECTOR_SIZE,
        distance: 'Cosine',
      },
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Qdrant collection creation failed: ${message}`);
  }
};

export const initQdrant = async (client = getClient()) => {
  try {
    await client.getCollections();
    await createCollection(client);
    return client;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Qdrant initialization failed: ${message}`);
  }
};

export const retryQdrantOperation = async (operation, { maxRetries = 2, baseDelayMs = 250, context = 'Qdrant operation' } = {}) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries) {
        break;
      }

      const delay = baseDelayMs * 2 ** attempt;
      await wait(delay);
    }
  }

  const finalError = lastError instanceof Error ? lastError : new Error(String(lastError));
  const wrappedError = new Error(`${context} failed after ${maxRetries + 1} attempts: ${finalError.message}`);
  wrappedError.cause = finalError;
  wrappedError.statusCode = 503;
  throw wrappedError;
};

export const upsertVector = async (vectorId, vector, payload, options = {}) => {
  if (vectorId === undefined || vectorId === null || vectorId === '') {
    throw new Error('A vectorId is required for Qdrant upsert');
  }

  validateVector(vector);

  const client = getClient();
  const normalizedPayload = buildVectorPayload(payload);
  const request = {
    wait: true,
    points: [{
      id: vectorId,
      vector,
      payload: normalizedPayload,
    }],
  };

  await retryQdrantOperation(async () => {
    await client.upsert(QDRANT_COLLECTION_NAME, request);
  }, { ...options, context: `Qdrant upsert ${vectorId}` });

  return vectorId;
};

export const upsertChunkVector = async (chunk, vector, options = {}) => {
  if (!chunk || !chunk.materialId || !chunk.chunkId || chunk.chunkIndex === undefined || chunk.chunkIndex === null) {
    throw new Error('Chunk payload must include materialId, chunkId, and chunkIndex');
  }

  const vectorId = buildStableVectorId(chunk.materialId, chunk.chunkId, chunk.chunkIndex);
  const payload = {
    userId: chunk.userId,
    subjectId: chunk.subjectId,
    unitId: chunk.unitId ?? null,
    topicId: chunk.topicId ?? null,
    materialId: chunk.materialId,
    chunkId: chunk.chunkId,
    chunkIndex: chunk.chunkIndex,
    pageStart: chunk.pageStart ?? null,
    pageEnd: chunk.pageEnd ?? null,
  };

  return upsertVector(vectorId, vector, payload, options);
};

export const indexChunks = async (chunks = []) => {
  if (!Array.isArray(chunks)) {
    throw new Error('indexChunks requires an array of chunks');
  }

  return Promise.all(chunks.map((chunk) => {
    if (!chunk || !chunk.vector) {
      throw new Error('Each indexed chunk must include a vector');
    }
    return upsertChunkVector(chunk, chunk.vector);
  }));
};

export const retryFailedIndexing = async (chunks = [], options = {}) => {
  if (!Array.isArray(chunks)) {
    throw new Error('retryFailedIndexing requires an array of failed chunk entries');
  }

  return indexChunks(chunks, options);
};

export const searchVectors = async (queryVector, filter = {}, limit = 5, options = {}) => {
  validateVector(queryVector);

  const client = getClient();
  const request = {
    vector: queryVector,
    filter,
    limit,
    with_payload: true,
  };

  return retryQdrantOperation(async () => {
    return await client.search(QDRANT_COLLECTION_NAME, request);
  }, { ...options, context: 'Qdrant vector search' });
};

export const setQdrantClientForTests = (client) => {
  qdrantClient = client;
};

export default {
  QDRANT_VECTOR_SIZE,
  QDRANT_COLLECTION_NAME,
  buildStableVectorId,
  checkCollectionExists,
  createCollection,
  initQdrant,
  upsertVector,
  upsertChunkVector,
  indexChunks,
  retryFailedIndexing,
  searchVectors,
  setQdrantClientForTests,
};

