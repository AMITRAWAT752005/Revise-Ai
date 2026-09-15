import { pipeline, env } from '@xenova/transformers';

// Disable local models to force downloading from the Hugging Face Hub if not cached
env.allowLocalModels = false;
// Optionally disable tracking/telemetry
env.useBrowserCache = false;

let embeddingPipeline = null;
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';

/**
 * Initializes the singleton embedding pipeline.
 */
const initPipeline = async () => {
  if (!embeddingPipeline) {
    console.log(`[EmbeddingService] Initializing pipeline for model: ${MODEL_NAME}`);
    try {
      embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME);
      console.log(`[EmbeddingService] Pipeline initialized successfully`);
    } catch (error) {
      console.error(`[EmbeddingService] Failed to initialize pipeline:`, error.message);
      throw error;
    }
  }
  return embeddingPipeline;
};

/**
 * Generates an embedding vector for a given text.
 * Uses the sentence-transformers/all-MiniLM-L6-v2 model (384 dimensions).
 *
 * @param {string} text - The input text to embed.
 * @returns {Promise<number[]>} - A 384-dimensional vector array.
 */
export const generateEmbedding = async (text) => {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Invalid input text for embedding generation');
  }

  const extractor = await initPipeline();

  try {
    // Generate embeddings. We use mean pooling and normalize to get cosine similarity ready vectors.
    const output = await extractor(text, { pooling: 'mean', normalize: true });

    // The output is a Tensor. We convert the Float32Array data to a standard JavaScript array.
    return Array.from(output.data);
  } catch (error) {
    console.error(`[EmbeddingService] Failed to generate embedding:`, error.message);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
};
