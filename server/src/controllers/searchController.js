import * as semanticSearchService from '../services/semanticSearchService.js';

/**
 * Controller handler for protected semantic search endpoint.
 * POST /api/search
 */
export const semanticSearch = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;

    if (!userId) {
      const error = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }

    const {
      query,
      subjectId,
      unitId,
      topicId,
      materialId,
      limit,
      topK,
    } = req.body || {};

    const searchLimit = limit !== undefined ? limit : topK;

    const results = await semanticSearchService.searchSemanticChunks({
      query,
      userId,
      subjectId,
      unitId,
      topicId,
      materialId,
      limit: searchLimit,
    });

    res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  semanticSearch,
};
