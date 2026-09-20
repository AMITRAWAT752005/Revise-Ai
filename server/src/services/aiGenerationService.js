import { z } from 'zod';
import { AIGenerationResponseSchema, GenerationRequestSchema } from '../contracts/aiGenerationContract.js';
import ragContextService from './ragContextService.js';
import { buildSystemInstruction } from '../prompts/promptTemplates.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseJsonResponse = (content) => {
  const withoutFence = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf('{');
    const end = withoutFence.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('AI returned invalid JSON.');
    return JSON.parse(withoutFence.slice(start, end + 1));
  }
};

/**
 * Validates the raw response from the LLM, hydraiting sources from the provided context.
 *
 * @param {Object} rawData - Parsed JSON from the LLM
 * @param {Array} contextSources - Sources provided by the RAG context builder
 * @returns {Object} Validated and hydrated generated content
 */
const validateAndHydrateResponse = (rawData, contextSources) => {
  const parsed = AIGenerationResponseSchema.safeParse(rawData);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue.path.length ? issue.path.join('.') : 'root';
    throw new Error(`AI response validation failed at ${path}: ${issue.message}`);
  }

  // Optional: We can map the chunk IDs back to ensure they exist in contextSources.
  // For now, we trust the Zod schema validation to ensure structure is correct.
  
  return parsed.data;
};

/**
 * Formats the chunks into a readable string with chunk IDs for the LLM.
 */
const formatContextForPrompt = (sources, contextText) => {
  // contextText already has text separated. We will present it with source references.
  // Since ragContextService provides `contextText` which is just concatenated,
  // we might want to just pass the chunks directly to prompt to give chunk IDs.
  // We'll reconstruct a prompt-friendly context using sources and their text if available,
  // or we just pass contextText. For this implementation, we assume contextText is provided.
  // But wait, the LLM needs to know the chunk IDs to cite them.
  // So we pass the sources mapping.
  
  let formatted = '';
  for (const source of sources) {
    // Assuming contextText was built in order of sources.
    formatted += `[Chunk ID: ${source.chunkId}]\nCitation: ${source.citation}\nSubject/Unit/Topic: ${source.subjectId}/${source.unitId}/${source.topicId}\n\n`;
  }
  return formatted + "\n\nSource Content:\n" + contextText;
};

const callGeminiApi = async (promptText, systemInstruction, apiKey, apiUrl, model, signal, attempt = 0) => {
  const endpoint = `${apiUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  
  // Create a flexible schema that supports all required properties across our 9 types.
  // The Zod schema (AIGenerationResponseSchema) will perform strict discriminated union validation.
  const responseSchema = {
    type: "OBJECT",
    properties: {
      generatedContent: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            type: { type: "STRING" },
            question: { type: "STRING" },
            options: { type: "ARRAY", items: { type: "STRING" } },
            answer: { type: "STRING" }, // Can be boolean or string for Gemini schema, but we'll use STRING/BOOL in JSON
            explanation: { type: "STRING" },
            front: { type: "STRING" },
            back: { type: "STRING" },
            statement: { type: "STRING" },
            statementWithMistake: { type: "STRING" },
            correction: { type: "STRING" },
            mistake: { type: "STRING" },
            scenario: { type: "STRING" },
            correctOutcome: { type: "STRING" },
            incorrectOutcomes: { type: "ARRAY", items: { type: "STRING" } },
            orderedItems: { type: "ARRAY", items: { type: "STRING" } },
            idealAnswer: { type: "STRING" },
            pairs: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  left: { type: "STRING" },
                  right: { type: "STRING" }
                }
              }
            },
            sourceChunkIds: { type: "ARRAY", items: { type: "STRING" } }
          },
          required: ["type", "sourceChunkIds"]
        }
      }
    },
    required: ["generatedContent"]
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
    const delay = RETRY_DELAY_MS * (attempt + 1);
    console.warn(`[aiGenerationService] HTTP ${response.status}, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})…`);
    await sleep(delay);
    return callGeminiApi(promptText, systemInstruction, apiKey, apiUrl, model, signal, attempt + 1);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const providerMessage = typeof errorBody.error?.message === 'string' ? ` ${errorBody.error.message}` : '';
    throw new Error(`AI provider returned HTTP ${response.status}.${providerMessage}`);
  }

  const body = await response.json();
  const content = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
  if (typeof content !== 'string') throw new Error('AI provider returned no content.');

  try {
    return parseJsonResponse(content);
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * (attempt + 1);
      console.warn(`[aiGenerationService] Invalid JSON, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})…`);
      await sleep(delay);
      return callGeminiApi(promptText, systemInstruction, apiKey, apiUrl, model, signal, attempt + 1);
    }
    throw error;
  }
};

/**
 * Main orchestrator for AI Content Generation.
 *
 * @param {Object} request - Generation request payload
 * @returns {Promise<Object>} The standardized generated content
 */
export const generateContent = async (request) => {
  // 1. Validate the Generation Request
  const parsedRequest = GenerationRequestSchema.safeParse(request);
  if (!parsedRequest.success) {
    const error = new Error(`Invalid generation request: ${parsedRequest.error.issues.map(i => i.message).join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
  
  const { context, parameters } = parsedRequest.data;
  
  // 2. Retrieve RAG Context
  const ragResult = await ragContextService.buildRagContext({
    userId: context.userId,
    query: `Generate ${parameters.difficulty} difficulty content of types: ${parameters.requestedTypes.join(', ')}`,
    subjectId: context.subjectId,
    unitId: context.unitId,
    topicId: context.topicId,
    limit: 15,
  });

  if (!ragResult || ragResult.sources.length === 0) {
    const error = new Error('Insufficient study material to generate content. Please upload more materials.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Prepare Prompts
  const systemInstruction = buildSystemInstruction(parameters);

  const promptText = formatContextForPrompt(ragResult.sources, ragResult.contextText);

  // 4. API Configuration
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = (process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('AI Generation service is not configured (missing API key).');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 300_000));

  try {
    // 5. Call LLM
    const rawData = await callGeminiApi(promptText, systemInstruction, apiKey, apiUrl, model, controller.signal);
    
    // 6. Validate Output
    const validatedOutput = validateAndHydrateResponse(rawData, ragResult.sources);
    
    return {
      generatedContent: validatedOutput.generatedContent,
      meta: {
        totalItemsGenerated: validatedOutput.generatedContent.length,
        difficulty: parameters.difficulty,
        contextChunksUsed: ragResult.totalChunksIncluded,
        isContextTruncated: ragResult.isTruncated,
      }
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      const err = new Error('AI generation timed out.');
      err.statusCode = 504;
      throw err;
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export default {
  generateContent,
};
