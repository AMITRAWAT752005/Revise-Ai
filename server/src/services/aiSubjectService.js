import { z } from 'zod';

// ─── Chunking / rate-limit constants ─────────────────────────────────────────
// Keep requests bounded so syllabus extraction remains within Gemini quotas.
const CHUNK_SIZE    = 5_000;   // characters per chunk
const CHUNK_OVERLAP = 800;     // overlap so cross-boundary subjects are captured
const CHUNK_DELAY_MS = 12_000; // wait 12 s between chunks (≤ 5 calls / minute)
const MAX_RETRIES   = 3;       // retry transient provider failures before skipping
const RETRY_DELAY_MS = 8_000;  // base delay before a transient retry
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

// ─── Zod validation schemas ───────────────────────────────────────────────────
const detectedUnitSchema = z.object({
  // unit names can be long ("Unit 1: Introduction to DBMS and its components")
  name:        z.string().trim().min(1).max(400),
  description: z.string().trim().max(500).optional(),
  order:       z.number().int().min(1).optional(),
});

const subjectResultSchema = z.object({
  subjects: z.array(
    z.object({
      name:     z.string().trim().min(2).max(200),
      code:     z.string().trim().max(50).optional(),
      category: z.string().trim().max(50).optional(),
      units:    z.array(detectedUnitSchema).optional().default([]),
    }).strip(),
  ).max(100),
}).strict();

const normalizeName = (name) => name.replace(/\s+/g, ' ').trim();

// Truncate a string to maxLen characters, appending "…" if cut.
const truncate = (str, maxLen) =>
  str.length <= maxLen ? str : str.slice(0, maxLen - 1) + '…';

// ─── Parse JSON safely ────────────────────────────────────────────────────────
const parseJsonResponse = (content) => {
  const withoutFence = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    return JSON.parse(withoutFence);
  } catch {
    const start = withoutFence.indexOf('{');
    const end   = withoutFence.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error('AI returned invalid JSON.');
    return JSON.parse(withoutFence.slice(start, end + 1));
  }
};

// ─── Validate + deduplicate a raw subjects payload ───────────────────────────
export const validateAndDeduplicateSubjects = (payload) => {
  const parsed = subjectResultSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.length ? issue.path.join('.') : 'response';
    throw new Error(`AI returned an invalid subject list: ${field} ${issue.message}`);
  }

  const seen     = new Set();
  const subjects = parsed.data.subjects
    .map((subject) => ({
      ...subject,
      name:     normalizeName(subject.name),
      ...(subject.code     ? { code:     normalizeName(subject.code)     } : {}),
      ...(subject.category ? { category: normalizeName(subject.category) } : {}),
      units: (subject.units || [])
        .filter((u) => u.name && u.name.trim().length > 0)
        .map((u, i) => ({
          // Clamp unit name to 200 chars in case the AI returned a long description
          name:  truncate(normalizeName(u.name), 200),
          ...(u.description ? { description: truncate(u.description.trim(), 500) } : {}),
          order: u.order ?? i + 1,
        })),
    }))
    .filter((subject) => {
      const key = subject.name.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return { subjects };
};

// ─── Deterministic fallback ───────────────────────────────────────────────────
const cleanCandidateName = (value) => normalizeName(
  value
    .replace(/^[\s\d.)-]+/, '')
    .replace(/[|;,.]+$/, '')
    .replace(/\s*\([^)]*credits?\)\s*$/i, ''),
);

export const extractSubjectsFromText = (text) => {
  const candidates = [];
  const seen       = new Set();
  const addCandidate = (value) => {
    const name = cleanCandidateName(value);
    const key  = name.toLocaleLowerCase();
    if (name.length < 2 || name.length > 200 || seen.has(key)) return;
    seen.add(key);
    candidates.push({ name, units: [] });
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

// ─── Split text into overlapping chunks ──────────────────────────────────────
const splitIntoChunks = (text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) => {
  if (text.length <= size) return [text];
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + size, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += size - overlap;
  }
  return chunks;
};

// ─── Merge subject lists from multiple chunks ─────────────────────────────────
const mergeSubjectLists = (lists) => {
  const map = new Map();
  for (const list of lists) {
    for (const subject of list) {
      const key = subject.name.toLocaleLowerCase();
      if (!map.has(key)) {
        map.set(key, { ...subject });
      } else {
        const existing = map.get(key);
        if ((subject.units || []).length > (existing.units || []).length) {
          existing.units = subject.units;
        }
        if (!existing.code     && subject.code)     existing.code     = subject.code;
        if (!existing.category && subject.category) existing.category = subject.category;
      }
    }
  }
  return Array.from(map.values());
};

// ─── Helper: sleep ────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Single LLM call for one chunk (with transient-failure retry) ────────────
const extractFromChunk = async (chunkText, apiKey, apiUrl, model, signal, attempt = 0) => {
  const endpoint = `${apiUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: `You are an academic syllabus parser. Output ONLY a single valid JSON object — no markdown, no explanation.
Schema: {"subjects":[{"name":"...","code":"...","category":"...","units":[{"name":"...","description":"...","order":1}]}]}

Rules:
- Identify every distinct academic course/subject listed in this text.
- For each subject, extract ALL its units (Unit 1, Unit 2, Unit I, Unit II, etc.).
- Keep units associated with the CORRECT parent subject — never mix units across subjects.
- "name" for a unit MUST be short (max 60 chars) — use just the unit label like "Unit 1: Introduction" not the full topic list.
- "description" may contain the brief topic list for that unit (max 120 chars).
- "order" is the unit number (convert Roman numerals to integers).
- If no units are visible for a subject in this section, return an empty units array.
- "code" is the course code if present (e.g. TCS756). Omit if not shown.
- Do NOT invent subjects or units. Extract only what is literally present.
- Do NOT return duplicate subjects.` }],
      },
      contents: [{ role: 'user', parts: [{ text: chunkText }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: "OBJECT",
          properties: {
            subjects: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  code: { type: "STRING" },
                  category: { type: "STRING" },
                  units: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        name: { type: "STRING" },
                        description: { type: "STRING" },
                        order: { type: "INTEGER" }
                      },
                      required: ["name"]
                    }
                  }
                },
                required: ["name"]
              }
            }
          },
          required: ["subjects"]
        },
        maxOutputTokens: 3_000,
      },
    }),
  });

  // Gemini can briefly reject requests during rate-limit or capacity spikes.
  if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
    const retryAfter = Number(response.headers?.get?.('retry-after'));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1_000
      : RETRY_DELAY_MS * (attempt + 1);
    console.warn(`[aiSubjectService] HTTP ${response.status} on chunk, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})…`);
    await sleep(delay);
    return extractFromChunk(chunkText, apiKey, apiUrl, model, signal, attempt + 1);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const providerMessage = typeof errorBody.error?.message === 'string'
      ? ` ${errorBody.error.message}` : '';
    throw new Error(`AI provider returned HTTP ${response.status}.${providerMessage}`);
  }

  const body    = await response.json();
  const content = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');
  if (typeof content !== 'string') throw new Error('AI provider returned no content.');

  try {
    return validateAndDeduplicateSubjects(parseJsonResponse(content));
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * (attempt + 1);
      console.warn(`[aiSubjectService] Invalid JSON on chunk, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})…`);
      await sleep(delay);
      return extractFromChunk(chunkText, apiKey, apiUrl, model, signal, attempt + 1);
    }
    throw error;
  }
};

// ─── Main exported function ───────────────────────────────────────────────────
export const extractSubjectsWithAI = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const apiUrl = (process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
  const model  = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!apiKey) throw new Error('AI subject extraction is not configured.');

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 300_000));

  try {
    const chunks       = splitIntoChunks(text);
    const chunkResults = [];

    for (let i = 0; i < chunks.length; i++) {
      // Delay between calls (except before the very first one) to respect TPM limits
      if (i > 0) await sleep(CHUNK_DELAY_MS);

      try {
        const result = await extractFromChunk(chunks[i], apiKey, apiUrl, model, controller.signal);
        chunkResults.push(result.subjects);
        console.log(`[aiSubjectService] chunk ${i + 1}/${chunks.length}: extracted ${result.subjects.length} subject(s)`);
      } catch (err) {
        console.warn(`[aiSubjectService] chunk ${i + 1}/${chunks.length} failed, skipping:`, err.message);
      }
    }

    if (chunkResults.length === 0) {
      const fallback = extractSubjectsFromText(text);
      if (fallback.subjects.length > 0) {
        console.warn('[aiSubjectService] All AI chunks failed — using deterministic fallback.');
        return fallback;
      }
      throw new Error('Could not extract any subjects from the provided document.');
    }

    const merged = mergeSubjectLists(chunkResults);
    console.log(`[aiSubjectService] Final merged result: ${merged.length} subject(s) with units`);
    return { subjects: merged };
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('AI extraction timed out.');
    const fallback = extractSubjectsFromText(text);
    if (fallback.subjects.length > 0) return fallback;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export { subjectResultSchema };
