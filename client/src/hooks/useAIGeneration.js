import { useState, useCallback } from 'react';
import { generateRevisionContent } from '../services/aiService';

/**
 * Custom React Hook to handle AI Content Generation API requests, loading states,
 * and error responses.
 */
export const useAIGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState([]);
  const [meta, setMeta] = useState(null);

  const requestGeneration = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateRevisionContent(options);
      setGeneratedContent(result.generatedContent);
      setMeta(result.meta);
      return result;
    } catch (err) {
      const message = err.message || 'Failed to generate AI revision content.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setGeneratedContent([]);
    setMeta(null);
  }, []);

  return {
    loading,
    error,
    generatedContent,
    meta,
    requestGeneration,
    resetState,
  };
};

export default useAIGeneration;
