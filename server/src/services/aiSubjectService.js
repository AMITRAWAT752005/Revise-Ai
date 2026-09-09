import { z } from 'zod';

// Keep the complete request below Groq's 8,000-token TPM limit.
const MAX_AI_INPUT_CHARS = 20_000;

const getAiInput = (text) => {
  if (text.length <= MAX_AI_INPUT_CHARS) return text;
  const leadingChars = 8_000;
  const middleChars = 8_000;
  const trailingChars = MAX_AI_INPUT_CHARS - leadingChars - middleChars;
  const middleStart = Math.floor((text.length - middleChars) / 2);

  return [
    text.slice(0, leadingChars),
    '[Middle section sample]',
    text.slice(middleStart, middleStart + middleChars),
    '[End section sample]',
    text.slice(-trailingChars),
  ].join('\n');
};

const subjectResultSchema = z.object({
  subjects: z.array(z.object({
    name: z.string().trim().min(2).max(200),
    code: z.string().trim().max(50).optional(),
    category: z.string().trim().max(50).optional(),
  }).strip()).max(100),
}).strict();

const normalizeName = (name) => name.replace(/\s+/g, ' ').trim();

const cleanCandidateName = (value) => normalizeName(
  value
    .replace(/^[\s\d.)-]+/, '')
    .replace(/[|;,.]+$/, '')
    .replace(/\s*\([^)]*credits?\)\s*$/i, ''),
);

export const extractSubjectsFromText = (text) => {
  const candidates = [];
  const seen = new Set();
  const addCandidate = (value) => {
    const name = cleanCandidateName(value);
    const key = name.toLocaleLowerCase();
    if (name.length < 2 || name.length > 200 || seen.has(key)) return;
    seen.add(key);
    candidates.push({ name });
  };

  for (const rawLine of String(text || '').split('\n')) {
    const line = rawLine.trim().replace(/\s+/g, ' ');
    if (!line || line.length > 220) continue;

    const labelledMatch = line.match(/^(?:subject|course|module|paper)\s*(?:name)?\s*[:\-]\s*(.+)$/i);
    if (labelledMatch) addCandidate(labelledMatch[1]);

    const codedMatch = line.match(/^(?:[\d.)-]+\s*)?([A-Z]{2,}[\s-]?\d{2,4})\s*[:\-]\s*(.+)$/i);
    if (codedMatch) addCandidate(codedMatch[2]);
  }

  return { subjects: candidates.slice(0, 20) };
};

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
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 120_000));
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
        response_format: { type: 'json_object' },
        max_tokens: 2_000,
        messages: [
          {
            role: 'system',
            content: 'Output only one compact valid JSON object, with no markdown, explanation, or reasoning. Use exactly {"subjects":[{"name":"Subject Name"}]} and return at most 20 subjects. Identify academic courses explicitly listed in the syllabus, including computer science and technology courses. Ignore units, topics, concepts, learning outcomes, and tools mentioned only as examples. Prefer official names from the title page, contents, course list, and repeated headings. Do not invent subjects.'
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
  } catch (error) {
    const fallback = extractSubjectsFromText(text);
    if (fallback.subjects.length > 0) return fallback;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export { subjectResultSchema };
