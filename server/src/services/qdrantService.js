import { QdrantClient } from '@qdrant/js-client-rest';
import '../config/env.js';

export const QDRANT_VECTOR_SIZE = 384;
export const QDRANT_COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'reviseai_document_chunks';

let qdrantClient;

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

const buildPayload = (payload = {}) => ({
  userId: payload.userId,
  subjectId: payload.subjectId,
  unitId: payload.unitId ?? null,
  topicId: payload.topicId ?? null,
  materialId: payload.materialId,
  chunkId: payload.chunkId,
  chunkIndex: payload.chunkIndex,
  pageStart: payload.pageStart ?? null,
  pageEnd: payload.pageEnd ?? null,
});

export const checkCollectionExists = async (client = getClient()) => {
  const response = await client.getCollections();
  return response.collections.some(({ name }) => name === QDRANT_COLLECTION_NAME);
};

export const createCollection = async (client = getClient()) => {
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
};

export const initQdrant = async (client = getClient()) => {
  await client.getCollections();
  await createCollection(client);
  return client;
};

export const upsertVector = async (vectorId, vector, payload) => {
  if (vectorId === undefined || vectorId === null || vectorId === '') {
    throw new Error('A vectorId is required for Qdrant upsert');
  }
  validateVector(vector);

  const client = getClient();
  await client.upsert(QDRANT_COLLECTION_NAME, {
    wait: true,
    points: [{
      id: vectorId,
      vector,
      payload: buildPayload(payload),
    }],
  });
};

export const setQdrantClientForTests = (client) => {
  qdrantClient = client;
};
