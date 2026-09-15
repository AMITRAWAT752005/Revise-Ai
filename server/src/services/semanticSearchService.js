import mongoose from 'mongoose';
import { generateEmbedding } from './embeddingService.js';
import { searchVectors } from './qdrantService.js';
import { formatSourceCitation, mapVectorToSource } from './vectorMetadataService.js';
import DocumentChunk from '../models/DocumentChunk.js';
import StudyMaterial from '../models/StudyMaterial.js';
import Subject from '../models/Subject.js';
import Unit from '../models/Unit.js';
import Topic from '../models/Topic.js';

const isValidObjectId = (id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

/**
 * Validates ownership hierarchy for search filters.
 * Ensures subject, unit, topic, and material filters belong to the authenticated user.
 *
 * @param {string} userId - Authenticated user ID.
 * @param {Object} filters - Search filters { subjectId, unitId, topicId, materialId }.
 */
const validateFilterOwnership = async (userId, { subjectId, unitId, topicId, materialId }) => {
  if (subjectId) {
    if (!isValidObjectId(subjectId)) {
      const error = new Error('Invalid subjectId format');
      error.statusCode = 400;
      throw error;
    }
    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      const error = new Error('Access denied: Subject does not exist or does not belong to the user');
      error.statusCode = 403;
      throw error;
    }
  }

  if (unitId) {
    if (!isValidObjectId(unitId)) {
      const error = new Error('Invalid unitId format');
      error.statusCode = 400;
      throw error;
    }
    const unit = await Unit.findById(unitId);
    if (!unit) {
      const error = new Error('Access denied: Unit does not exist');
      error.statusCode = 403;
      throw error;
    }
    const subject = await Subject.findOne({ _id: unit.subjectId, userId });
    if (!subject) {
      const error = new Error('Access denied: Unit does not belong to the user');
      error.statusCode = 403;
      throw error;
    }
    if (subjectId && String(unit.subjectId) !== String(subjectId)) {
      const error = new Error('Access denied: Unit does not belong to the specified subject');
      error.statusCode = 400;
      throw error;
    }
  }

  if (topicId) {
    if (!isValidObjectId(topicId)) {
      const error = new Error('Invalid topicId format');
      error.statusCode = 400;
      throw error;
    }
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error('Access denied: Topic does not exist');
      error.statusCode = 403;
      throw error;
    }
    const unit = await Unit.findById(topic.unitId);
    if (!unit) {
      const error = new Error('Access denied: Topic parent unit does not exist');
      error.statusCode = 403;
      throw error;
    }
    const subject = await Subject.findOne({ _id: unit.subjectId, userId });
    if (!subject) {
      const error = new Error('Access denied: Topic does not belong to the user');
      error.statusCode = 403;
      throw error;
    }
    if (unitId && String(topic.unitId) !== String(unitId)) {
      const error = new Error('Access denied: Topic does not belong to the specified unit');
      error.statusCode = 400;
      throw error;
    }
  }

  if (materialId) {
    if (!isValidObjectId(materialId)) {
      const error = new Error('Invalid materialId format');
      error.statusCode = 400;
      throw error;
    }
    const material = await StudyMaterial.findOne({ _id: materialId, userId });
    if (!material) {
      const error = new Error('Access denied: Study material does not exist or does not belong to the user');
      error.statusCode = 403;
      throw error;
    }
  }
};

/**
 * Executes a semantic search over processed document chunks for an authenticated user.
 *
 * @param {Object} params
 * @param {string} params.query - Search query text.
 * @param {string} params.userId - Authenticated user ID (mandatory).
 * @param {string} [params.subjectId] - Optional subject filter.
 * @param {string} [params.unitId] - Optional unit filter.
 * @param {string} [params.topicId] - Optional topic filter.
 * @param {string} [params.materialId] - Optional material filter.
 * @param {number} [params.limit=5] - Number of top results to return (1-50).
 * @returns {Promise<Array<Object>>} Formatted relevant source chunks.
 */
export const searchSemanticChunks = async ({
  query,
  userId,
  subjectId,
  unitId,
  topicId,
  materialId,
  limit = 5,
}) => {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    const error = new Error('Search query is required and must be a non-empty string');
    error.statusCode = 400;
    throw error;
  }

  if (query.length > 1000) {
    const error = new Error('Search query exceeds maximum length of 1000 characters');
    error.statusCode = 400;
    throw error;
  }

  if (!userId) {
    const error = new Error('Authenticated userId is required for semantic search');
    error.statusCode = 401;
    throw error;
  }

  const parsedLimit = Math.max(1, Math.min(50, Number.parseInt(limit, 10) || 5));

  // Validate user ownership of requested filter hierarchy
  await validateFilterOwnership(userId, { subjectId, unitId, topicId, materialId });

  // Generate query embedding (384-d vector)
  const queryVector = await generateEmbedding(query.trim());

  // Construct Qdrant filter object with mandatory userId and optional hierarchical filters
  const mustFilters = [
    { key: 'userId', match: { value: String(userId) } },
  ];

  if (subjectId) {
    mustFilters.push({ key: 'subjectId', match: { value: String(subjectId) } });
  }
  if (unitId) {
    mustFilters.push({ key: 'unitId', match: { value: String(unitId) } });
  }
  if (topicId) {
    mustFilters.push({ key: 'topicId', match: { value: String(topicId) } });
  }
  if (materialId) {
    mustFilters.push({ key: 'materialId', match: { value: String(materialId) } });
  }

  const qdrantFilter = { must: mustFilters };

  // Perform vector similarity search in Qdrant
  const searchHits = await searchVectors(queryVector, qdrantFilter, parsedLimit);

  if (!Array.isArray(searchHits) || searchHits.length === 0) {
    return [];
  }

  // Extract source IDs from search hits
  const chunkIds = [];
  const materialIds = [];
  const subjectIds = [];

  for (const hit of searchHits) {
    if (hit?.payload) {
      if (hit.payload.chunkId) chunkIds.push(hit.payload.chunkId);
      if (hit.payload.materialId) materialIds.push(hit.payload.materialId);
      if (hit.payload.subjectId) subjectIds.push(hit.payload.subjectId);
    }
  }

  // Hydrate chunks and materials from MongoDB (strictly enforcing userId ownership)
  const [chunks, materials, subjects] = await Promise.all([
    DocumentChunk.find({ _id: { $in: chunkIds }, userId }),
    StudyMaterial.find({ _id: { $in: materialIds }, userId }),
    Subject.find({ _id: { $in: subjectIds }, userId }),
  ]);

  const chunkMap = new Map(chunks.map((c) => [c._id.toString(), c]));
  const materialMap = new Map(materials.map((m) => [m._id.toString(), m]));
  const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s]));

  // Assemble formatted results
  const results = [];

  for (const hit of searchHits) {
    const payload = hit.payload || {};
    const chunkDoc = chunkMap.get(String(payload.chunkId));

    if (!chunkDoc) {
      continue;
    }

    const materialDoc = materialMap.get(String(payload.materialId));
    const subjectDoc = subjectMap.get(String(payload.subjectId));

    const sourceMapping = mapVectorToSource(payload, {
      score: hit.score,
      vectorId: hit.id,
    });

    results.push({
      chunkId: String(chunkDoc._id),
      materialId: String(chunkDoc.materialId),
      subjectId: String(chunkDoc.subjectId),
      unitId: chunkDoc.unitId ? String(chunkDoc.unitId) : null,
      topicId: chunkDoc.topicId ? String(chunkDoc.topicId) : null,
      similarityScore: typeof hit.score === 'number' ? Number(hit.score.toFixed(4)) : 0,
      text: chunkDoc.text,
      chunkIndex: chunkDoc.chunkIndex,
      pageStart: chunkDoc.pageStart ?? sourceMapping.pageStart ?? null,
      pageEnd: chunkDoc.pageEnd ?? sourceMapping.pageEnd ?? null,
      materialTitle: materialDoc?.title || 'Document',
      subjectName: subjectDoc?.name || null,
      citation: formatSourceCitation({
        materialTitle: materialDoc?.title,
        pageStart: chunkDoc.pageStart ?? sourceMapping.pageStart,
        pageEnd: chunkDoc.pageEnd ?? sourceMapping.pageEnd,
        chunkIndex: chunkDoc.chunkIndex,
      }),
    });
  }

  return results;
};

export default {
  searchSemanticChunks,
};
