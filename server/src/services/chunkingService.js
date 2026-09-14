const DEFAULT_TARGET_WORDS = 500;
const DEFAULT_MIN_WORDS = 300;
const DEFAULT_MAX_WORDS = 700;
const DEFAULT_OVERLAP_WORDS = 60;

const wordCount = (text) => text.trim() ? text.trim().split(/\s+/).length : 0;

const splitOversizedParagraph = (paragraph, maxWords) => {
  if (wordCount(paragraph) <= maxWords) return [paragraph];

  const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph];
  const segments = [];
  let current = [];

  for (const sentence of sentences.map((value) => value.trim()).filter(Boolean)) {
    const sentenceWords = sentence.split(/\s+/);
    if (sentenceWords.length > maxWords) {
      if (current.length) segments.push(current.join(' '));
      current = [];
      for (const word of sentenceWords) {
        if (current.length >= maxWords) {
          segments.push(current.join(' '));
          current = [];
        }
        current.push(word);
      }
      continue;
    }

    if (current.length && current.length + sentenceWords.length > maxWords) {
      segments.push(current.join(' '));
      current = [];
    }
    current.push(...sentenceWords);
  }

  if (current.length) segments.push(current.join(' '));
  return segments;
};

const takeLastWords = (text, count) => text.trim().split(/\s+/).slice(-count).join(' ');

/**
 * Approximates token count for a string (roughly 1 token per 0.75 words).
 * @param {string} text
 * @returns {number}
 */
export const estimateTokenCount = (text) => Math.ceil(wordCount(text) * 1.3);

/**
 * Chunks cleaned text by paragraphs and sentence boundaries with word overlap.
 * @param {string} text - Cleaned text.
 * @param {Object} metadataOrOptions - Chunk metadata and optional word configuration.
 * @returns {Array<{ chunkIndex: number, text: string, tokenCount: number, pageStart?: number, pageEnd?: number }>}
 */
export const chunkText = (text, metadataOrOptions = {}) => {
  if (!text || typeof text !== 'string') return [];

  const optionKeys = new Set([
    'targetWords',
    'minWords',
    'maxWords',
    'overlapWords',
    'maxChunkSize',
    'overlapSize',
  ]);
  const options = Object.fromEntries(
    Object.entries(metadataOrOptions).filter(([key]) => optionKeys.has(key))
  );
  const metadata = Object.fromEntries(
    Object.entries(metadataOrOptions).filter(([key]) => !optionKeys.has(key))
  );
  const targetWords = options.targetWords || DEFAULT_TARGET_WORDS;
  const minWords = options.minWords || DEFAULT_MIN_WORDS;
  const maxWords = options.maxWords || DEFAULT_MAX_WORDS;
  const overlapWords = options.overlapWords || DEFAULT_OVERLAP_WORDS;

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .flatMap((paragraph) => splitOversizedParagraph(paragraph, maxWords));

  const baseChunks = [];
  let currentParagraphs = [];
  let currentWords = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = wordCount(paragraph);
    if (currentParagraphs.length
      && currentWords + paragraphWords > targetWords
      && currentWords >= minWords) {
      baseChunks.push(currentParagraphs.join('\n\n'));
      currentParagraphs = [];
      currentWords = 0;
    }
    currentParagraphs.push(paragraph);
    currentWords += paragraphWords;
  }
  if (currentParagraphs.length) baseChunks.push(currentParagraphs.join('\n\n'));

  // Merge undersized chunks where possible before adding overlap.
  for (let index = 0; index < baseChunks.length - 1; index += 1) {
    if (wordCount(baseChunks[index]) < minWords
      && wordCount(baseChunks[index]) + wordCount(baseChunks[index + 1]) <= maxWords) {
      baseChunks[index] = `${baseChunks[index]}\n\n${baseChunks[index + 1]}`;
      baseChunks.splice(index + 1, 1);
      index -= 1;
    }
  }

  return baseChunks.map((baseChunk, index) => {
    const overlap = index > 0 ? takeLastWords(baseChunks[index - 1], overlapWords) : '';
    const chunkTextValue = overlap ? `${overlap}\n\n${baseChunk}` : baseChunk;

    return {
      ...metadata,
      chunkIndex: index,
      text: chunkTextValue,
      tokenCount: estimateTokenCount(chunkTextValue),
    };
  });
};
