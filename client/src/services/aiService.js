/**
 * ReviseAI — AI Generation API Service Client
 * 
 * Handles API request preparation, credential-authenticated HTTP requests,
 * and structured response parsing for AI revision content generation.
 */

/**
 * Sends a request to the backend API to generate AI revision content.
 *
 * @param {Object} options
 * @param {string} options.subjectId - Required MongoDB ObjectId of the subject
 * @param {string} [options.unitId] - Optional MongoDB ObjectId of the unit
 * @param {string} [options.topicId] - Optional MongoDB ObjectId of the topic
 * @param {Array<string>} [options.sourceMaterials] - Optional array of source material IDs
 * @param {Object} [options.parameters] - Generation parameter options
 * @param {number} [options.parameters.totalItems=10] - Number of items to generate (1-50)
 * @param {string} [options.parameters.difficulty='mixed'] - Difficulty level ('easy' | 'medium' | 'hard' | 'mixed')
 * @param {Array<string>} [options.parameters.requestedTypes=['MCQ', 'Flashcard']] - Array of content types
 * @returns {Promise<{ generatedContent: Array<Object>, meta: Object }>} Parsed generated content and metadata
 */
export const generateRevisionContent = async ({
  subjectId,
  unitId,
  topicId,
  sourceMaterials,
  parameters = {},
}) => {
  if (!subjectId || typeof subjectId !== 'string' || !subjectId.trim()) {
    throw new Error('subjectId is required to generate revision content.');
  }

  const payload = {
    subjectId: subjectId.trim(),
    ...(unitId && typeof unitId === 'string' && { unitId: unitId.trim() }),
    ...(topicId && typeof topicId === 'string' && { topicId: topicId.trim() }),
    ...(Array.isArray(sourceMaterials) && sourceMaterials.length > 0 && { sourceMaterials }),
    parameters: {
      totalItems: typeof parameters.totalItems === 'number' ? parameters.totalItems : 10,
      difficulty: typeof parameters.difficulty === 'string' ? parameters.difficulty.toLowerCase() : 'mixed',
      requestedTypes: Array.isArray(parameters.requestedTypes) && parameters.requestedTypes.length > 0
        ? parameters.requestedTypes
        : ['MCQ', 'Flashcard'],
    },
  };

  let response;
  try {
    response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  } catch (netError) {
    throw new Error('Network error: Unable to connect to the backend server. Please check your network connection.');
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    throw new Error(`Server response parsing error (HTTP ${response.status}).`);
  }

  if (!response.ok || !data || data.success === false) {
    const errorMsg = data?.message || `API request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return {
    generatedContent: data.data?.generatedContent || [],
    meta: data.data?.meta || {},
  };
};

export default {
  generateRevisionContent,
};
