import { z } from 'zod';

// Keep the complete request below Groq's 8,000-token TPM limit.
const MAX_AI_INPUT_CHARS = 20_000;

const getAiInput = (text) => {
  if (text.length <= MAX_AI_INPUT_CHARS) return text;
  const leadingChars = 16_000;
  const trailingChars = MAX_AI_INPUT_CHARS - leadingChars;
  return `${text.slice(0, leadingChars)}\n[Middle of syllabus omitted for provider size limits.]\n${text.slice(-trailingChars)}`;
};

const subjectResultSchema = z.object({
  subjects: z.array(z.object({
    name: z.string().trim().min(2).max(200),
    code: z.string().trim().max(50).optional(),
    category: z.string().trim().max(50).optional(),
  }).strip()).max(100),
}).strict();

const normalizeName = (name) => name.replace(/\s+/g, ' ').trim();

export const validateAndDeduplicateSubjects = (payload) => {
  const parsed = subjectResultSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.length ? issue.path.join('.') : 'response';
    throw new Error(`AI returned an invalid subject list: ${field} ${issue.message}`);
  }

  const seen = new Set();
  const subjects = parsed.data.subjects
    .map((subject) => ({
      ...subject,
      name: normalizeName(subject.name),
      ...(subject.code ? { code: normalizeName(subject.code) } : {}),
      ...(subject.category ? { category: normalizeName(subject.category) } : {}),
    }))
    .filter((subject) => {
      const key = subject.name.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return { subjects };
};

const parseJsonResponse = (content) => {
  const withoutFence = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(withoutFence);
  } catch (error) {
    const objectStart = withoutFence.indexOf('{');
    const objectEnd = withoutFence.lastIndexOf('}');
    if (objectStart < 0 || objectEnd <= objectStart) {
      throw new Error(`AI returned invalid JSON syntax: ${error.message}`);
    }
    try {
      return JSON.parse(withoutFence.slice(objectStart, objectEnd + 1));
    } catch (fallbackError) {
      throw new Error(`AI returned invalid JSON syntax: ${fallbackError.message}`);
    }
  }
};

export const extractSubjectsWithAI = async (text) => {
  const apiKey = process.env.AI_API_KEY;
  const apiUrl = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.AI_MODEL || 'gpt-4o-mini';
  if (!apiKey) throw new Error('AI subject extraction is not configured.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 30_000));
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 1_000,
        messages: [
          {
            role: 'system',
            content: 'Return valid JSON only, with no markdown or explanation. Return at most 30 subjects and omit code/category unless clearly known. Use exactly this compact shape: {"subjects":[{"name":"Subject Name"}]}. Identify actual academic subjects only. Exclude units, topics, concepts, technologies, and invented subjects.'
          },
          { role: 'user', content: getAiInput(text) },
        ],
      }),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const providerMessage = typeof errorBody.error?.message === 'string'
        ? ` ${errorBody.error.message}`
        : '';
      throw new Error(`AI provider returned HTTP ${response.status}.${providerMessage}`);
    }
    const body = await response.json();
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('AI provider returned no subject data.');
    return validateAndDeduplicateSubjects(parseJsonResponse(content));
  } finally {
    clearTimeout(timeout);
  }
};

export { subjectResultSchema };
