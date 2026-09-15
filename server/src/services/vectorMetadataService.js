/**
 * ReviseAI - Vector Metadata & Source Mapping Service
 * Phase 4C — Task 4C-4 (Anshul Gusain)
 *
 * Provides standardized metadata extraction, payload validation, and source
 * mapping to trace vector points back to their source document chunks, materials,
 * subjects, units, topics, and authenticated users.
 */

/**
 * Standard vector payload structure required for Qdrant storage.
 * @typedef {Object} VectorPayload
 * @property {string} userId - ID of the authenticated user (owner).
 * @property {string} subjectId - ID of the associated Subject.
 * @property {string|null} unitId - Optional ID of the Unit.
 * @property {string|null} topicId - Optional ID of the Topic.
 * @property {string} materialId - ID of the parent StudyMaterial.
 * @property {string} chunkId - ID of the specific DocumentChunk.
 * @property {number} chunkIndex - 0-based sequential index of the chunk within the document.
 * @property {number|null} pageStart - Starting page number if available.
 * @property {number|null} pageEnd - Ending page number if available.
 */

/**
 * Extracts and sanitizes standard vector payload from a DocumentChunk document or plain object.
 *
 * @param {Object} chunk - The DocumentChunk document or chunk-like object.
 * @param {Object} [context={}] - Optional contextual fallbacks (e.g., from parent StudyMaterial).
 * @returns {VectorPayload}
 */
export const buildVectorPayload = (chunk = {}, context = {}) => {
  const userId = chunk.userId || context.userId;
  const subjectId = chunk.subjectId || context.subjectId;
  const materialId = chunk.materialId || context.materialId;
  const chunkId = chunk._id || chunk.chunkId || chunk.id;
  const chunkIndex = chunk.chunkIndex !== undefined ? chunk.chunkIndex : context.chunkIndex;

  const unitId = chunk.unitId || context.unitId || null;
  const topicId = chunk.topicId || context.topicId || null;
  const pageStart = chunk.pageStart !== undefined && chunk.pageStart !== null ? Number(chunk.pageStart) : (context.pageStart !== undefined && context.pageStart !== null ? Number(context.pageStart) : null);
  const pageEnd = chunk.pageEnd !== undefined && chunk.pageEnd !== null ? Number(chunk.pageEnd) : (context.pageEnd !== undefined && context.pageEnd !== null ? Number(context.pageEnd) : null);

  const payload = {
    userId: userId ? String(userId) : '',
    subjectId: subjectId ? String(subjectId) : '',
    unitId: unitId ? String(unitId) : null,
    topicId: topicId ? String(topicId) : null,
    materialId: materialId ? String(materialId) : '',
    chunkId: chunkId ? String(chunkId) : '',
    chunkIndex: typeof chunkIndex === 'number' ? chunkIndex : (chunkIndex !== undefined && chunkIndex !== null ? Number(chunkIndex) : 0),
    pageStart,
    pageEnd,
  };

  validateVectorPayload(payload);
  return payload;
};

/**
 * Validates that all required source identifiers are present in the payload.
 *
 * @param {VectorPayload} payload
 * @throws {Error} If any mandatory field is missing or invalid.
 */
export const validateVectorPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Vector payload must be a non-null object');
  }

  const requiredFields = ['userId', 'subjectId', 'materialId', 'chunkId'];
  for (const field of requiredFields) {
    if (!payload[field] || typeof payload[field] !== 'string' || payload[field].trim() === '') {
      throw new Error(`Vector payload missing required field: ${field}`);
    }
  }

  if (typeof payload.chunkIndex !== 'number' || !Number.isInteger(payload.chunkIndex) || payload.chunkIndex < 0) {
    throw new Error('Vector payload chunkIndex must be a non-negative integer');
  }

  if (payload.pageStart !== null && (!Number.isInteger(payload.pageStart) || payload.pageStart < 1)) {
    throw new Error('Vector payload pageStart must be a positive integer or null');
  }

  if (payload.pageEnd !== null && (!Number.isInteger(payload.pageEnd) || payload.pageEnd < 1)) {
    throw new Error('Vector payload pageEnd must be a positive integer or null');
  }

  if (payload.pageStart !== null && payload.pageEnd !== null && payload.pageEnd < payload.pageStart) {
    throw new Error('Vector payload pageEnd cannot be less than pageStart');
  }

  return true;
};

/**
 * Maps a vector search result payload back to its original source identity.
 *
 * @param {Object} pointPayload - Payload from Qdrant vector point.
 * @param {Object} [options={}] - Additional details (e.g. score, vectorId).
 * @returns {Object} Structured source reference.
 */
export const mapVectorToSource = (pointPayload = {}, options = {}) => {
  return {
    chunkId: pointPayload.chunkId ? String(pointPayload.chunkId) : null,
    materialId: pointPayload.materialId ? String(pointPayload.materialId) : null,
    userId: pointPayload.userId ? String(pointPayload.userId) : null,
    subjectId: pointPayload.subjectId ? String(pointPayload.subjectId) : null,
    unitId: pointPayload.unitId ? String(pointPayload.unitId) : null,
    topicId: pointPayload.topicId ? String(pointPayload.topicId) : null,
    chunkIndex: typeof pointPayload.chunkIndex === 'number' ? pointPayload.chunkIndex : 0,
    pageStart: pointPayload.pageStart ?? null,
    pageEnd: pointPayload.pageEnd ?? null,
    vectorId: options.vectorId || options.id || null,
    score: typeof options.score === 'number' ? options.score : null,
  };
};

/**
 * Formats a clean, human-readable source citation string for RAG attribution.
 *
 * @param {Object} source - The source mapping or hydrated source object.
 * @returns {string} Formatted citation, e.g. "[Material: Unit 1 Notes, p. 4-5, Chunk #2]"
 */
export const formatSourceCitation = (source = {}) => {
  const title = source.materialTitle || source.title || (source.materialId ? `Material ${source.materialId}` : 'Document');
  
  let pageInfo = '';
  if (source.pageStart !== null && source.pageStart !== undefined) {
    if (source.pageEnd !== null && source.pageEnd !== undefined && source.pageEnd !== source.pageStart) {
      pageInfo = `, pp. ${source.pageStart}-${source.pageEnd}`;
    } else {
      pageInfo = `, p. ${source.pageStart}`;
    }
  }

  const chunkInfo = source.chunkIndex !== undefined && source.chunkIndex !== null ? `, Chunk #${source.chunkIndex}` : '';

  return `[${title}${pageInfo}${chunkInfo}]`;
};

/**
 * Hydrates a vector source mapping with full document, material, and hierarchy models.
 *
 * @param {Object} sourceMapping - Source mapping from mapVectorToSource.
 * @param {Object} models - Hydration sources: { chunkDoc, materialDoc, subjectDoc, unitDoc, topicDoc }.
 * @returns {Object} Full source traceability record.
 */
export const hydrateSourceMapping = (sourceMapping = {}, models = {}) => {
  const { chunkDoc, materialDoc, subjectDoc, unitDoc, topicDoc } = models;

  return {
    ...sourceMapping,
    text: chunkDoc?.text || null,
    tokenCount: chunkDoc?.tokenCount ?? null,
    materialTitle: materialDoc?.title || null,
    materialFileName: materialDoc?.fileName || null,
    materialFileType: materialDoc?.fileType || null,
    materialFileUrl: materialDoc?.fileUrl || null,
    subjectName: subjectDoc?.name || null,
    unitTitle: unitDoc?.title || null,
    topicTitle: topicDoc?.title || null,
    citation: formatSourceCitation({
      ...sourceMapping,
      materialTitle: materialDoc?.title,
    }),
  };
};

/**
 * Resolves the source chain from MongoDB for a vector payload, with strict user ownership validation.
 *
 * @param {Object} payload - Vector point payload.
 * @param {string} authenticatedUserId - Authenticated user ID to enforce data isolation.
 * @param {Object} models - Mongoose models: { DocumentChunk, StudyMaterial, Subject }.
 * @returns {Promise<Object|null>} Hydrated source chain or null if unauthorized/not found.
 */
export const resolveSourceChain = async (payload, authenticatedUserId, models = {}) => {
  if (!payload || !authenticatedUserId) {
    return null;
  }

  // Strict user isolation check
  if (String(payload.userId) !== String(authenticatedUserId)) {
    throw new Error('Access denied: Vector metadata belongs to a different user');
  }

  const { DocumentChunk, StudyMaterial, Subject } = models;
  if (!DocumentChunk || !StudyMaterial) {
    return mapVectorToSource(payload);
  }

  const [chunkDoc, materialDoc] = await Promise.all([
    DocumentChunk.findOne({ _id: payload.chunkId, userId: authenticatedUserId }),
    StudyMaterial.findOne({ _id: payload.materialId, userId: authenticatedUserId }),
  ]);

  let subjectDoc = null;
  if (Subject && payload.subjectId) {
    subjectDoc = await Subject.findOne({ _id: payload.subjectId, userId: authenticatedUserId });
  }

  const sourceMapping = mapVectorToSource(payload);
  return hydrateSourceMapping(sourceMapping, {
    chunkDoc,
    materialDoc,
    subjectDoc,
  });
};
