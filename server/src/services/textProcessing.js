/**
 * Phase 4B: Text Processing Services
 * Functions for cleaning, normalizing, and chunking extracted text.
 */

const isLikelyHeading = (line) => {
  if (line.length > 100 || /[.!?]$/.test(line)) return false;
  return /^(chapter|unit|module|section|lesson|part)\b/i.test(line) || /^[A-Z][A-Za-z\d\s:-]{2,}$/.test(line);
};

const isLikelyOcrNoise = (line) => {
  if (line.length < 4) return false;
  const symbols = (line.match(/[^\p{L}\p{N}\s.,;:'!?()\-/%&]/gu) || []).length;
  return symbols / line.length > 0.45;
};

const splitOversizedParagraph = (paragraph, maxSize) => {
  if (paragraph.length <= maxSize) return [paragraph];

  const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph];
  const segments = [];
  let current = '';

  for (const sentence of sentences.map((value) => value.trim()).filter(Boolean)) {
    if (sentence.length > maxSize) {
      if (current) segments.push(current);
      current = '';
      const words = sentence.split(/\s+/);
      for (const word of words) {
        if (current && current.length + 1 + word.length > maxSize) {
          segments.push(current);
          current = '';
        }
        current = current ? `${current} ${word}` : word;
      }
      continue;
    }

    if (current && current.length + 1 + sentence.length > maxSize) {
      segments.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }

  if (current) segments.push(current);
  return segments;
};

/**
 * Cleans and normalizes raw extracted text.
 * Removes non-printable control characters, fixes broken hyphenations,
 * and normalizes whitespace and line breaks.
 *
 * @param {string} rawText - The raw extracted text.
 * @returns {string} The cleaned text.
 */
export const cleanText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  let text = rawText;

  // Remove null characters and control characters except line and tab spacing.
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Rejoin words split at a line ending: "comput-\ner" -> "computer".
  text = text.replace(/([a-zA-Z])-\s*[\r\n]+\s*([a-zA-Z])/g, '$1$2');

  text = text.replace(/\r\n/g, '\n');

  const lines = text.split('\n').map((line) => line.trim());
  const counts = new Map();
  for (const line of lines) {
    if (line.length >= 4 && line.length <= 120) {
      const key = line.toLowerCase().replace(/\s+/g, ' ');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }

  const filteredLines = lines.filter((line) => {
    if (!line) return true;
    if (isLikelyOcrNoise(line)) return false;
    const key = line.toLowerCase().replace(/\s+/g, ' ');
    return counts.get(key) < 2 || !isLikelyHeading(line);
  });

  const normalizedLines = [];
  for (const line of filteredLines) {
    if (!line) {
      if (normalizedLines.at(-1) !== '') normalizedLines.push('');
      continue;
    }

    const previous = normalizedLines.at(-1);
    if (previous && !isLikelyHeading(previous) && !isLikelyHeading(line)) {
      normalizedLines[normalizedLines.length - 1] = `${previous} ${line}`;
    } else {
      normalizedLines.push(line.replace(/[ \t]{2,}/g, ' '));
    }
  }

  return normalizedLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

/**
 * Approximates token count for a string (roughly 1 token per 4 chars or 0.75 words).
 * @param {string} text
 * @returns {number}
 */
export const estimateTokenCount = (text) => {
  if (!text) return 0;
  // Word count based approximation: average ~1.3 tokens per word
  const words = text.trim().split(/\s+/).filter(Boolean);
  return Math.ceil(words.length * 1.3);
};

/**
 * Chunks cleaned text into overlapping segments preserving paragraph and sentence boundaries.
 * Target chunk size: ~500 tokens (~1800-2000 chars), with ~100 token overlap (~350-400 chars).
 *
 * @param {string} text - The cleaned text.
 * @param {Object} options - Chunking configuration options.
 * @param {number} options.maxChunkSize - Maximum character length per chunk (default: 2000).
 * @param {number} options.overlapSize - Overlap character length between chunks (default: 350).
 * @returns {Array<{ chunkIndex: number, text: string, tokenCount: number, pageStart?: number, pageEnd?: number }>}
 */
export const chunkText = (text, metadataOrOptions = {}) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const optionKeys = new Set(['maxChunkSize', 'overlapSize']);
  const options = Object.fromEntries(
    Object.entries(metadataOrOptions).filter(([key]) => optionKeys.has(key))
  );
  const metadata = Object.fromEntries(
    Object.entries(metadataOrOptions).filter(([key]) => !optionKeys.has(key))
  );
  const maxChunkSize = options.maxChunkSize || 2000;
  const overlapSize = options.overlapSize || 350;

  // Track page markers if present (e.g., "--- Page 3 ---")
  const pageRegex = /--- Page (\d+) ---/g;
  let match;
  const pageMarkers = [];
  while ((match = pageRegex.exec(text)) !== null) {
    pageMarkers.push({
      page: parseInt(match[1], 10),
      index: match.index,
    });
  }

  // Helper to determine page number for a given character position index
  const getPageForIndex = (charIndex) => {
    if (pageMarkers.length === 0) return undefined;
    let current = pageMarkers[0].page;
    for (const marker of pageMarkers) {
      if (charIndex >= marker.index) {
        current = marker.page;
      } else {
        break;
      }
    }
    return current;
  };

  // Split text into structural paragraphs first
  const rawParagraphs = text
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim().length > 0)
    .flatMap((paragraph) => splitOversizedParagraph(paragraph.trim(), maxChunkSize));

  const chunks = [];
  let currentChunk = '';
  let currentStartIndex = 0;
  let textCursor = 0;

  for (const paragraph of rawParagraphs) {
    const trimmedParagraph = paragraph.trim();
    const paraIndex = text.indexOf(trimmedParagraph, textCursor);
    if (paraIndex !== -1) {
      textCursor = paraIndex + trimmedParagraph.length;
    }

    if (!currentChunk) {
      currentChunk = trimmedParagraph;
      currentStartIndex = paraIndex !== -1 ? paraIndex : textCursor;
    } else if (currentChunk.length + 2 + trimmedParagraph.length <= maxChunkSize) {
      currentChunk += '\n\n' + trimmedParagraph;
    } else {
      // Current chunk has reached maximum capacity
      const chunkEndIndex = currentStartIndex + currentChunk.length;
      const pageStart = getPageForIndex(currentStartIndex);
      const pageEnd = getPageForIndex(chunkEndIndex);

      chunks.push({
        ...metadata,
        chunkIndex: chunks.length,
        text: currentChunk,
        tokenCount: estimateTokenCount(currentChunk),
        pageStart,
        pageEnd,
      });

      // Prepare overlap: take the last `overlapSize` chars from currentChunk
      let overlapText = '';
      if (currentChunk.length > overlapSize) {
        const rawOverlap = currentChunk.slice(-overlapSize);
        // Try to break at sentence or space
        const spaceIndex = rawOverlap.search(/[\s.\n]/);
        overlapText = spaceIndex !== -1 ? rawOverlap.slice(spaceIndex).trim() : rawOverlap.trim();
      } else {
        overlapText = currentChunk;
      }

      const availableOverlap = Math.max(0, maxChunkSize - trimmedParagraph.length - 2);
      if (overlapText.length > availableOverlap) {
        overlapText = availableOverlap > 0 ? overlapText.slice(-availableOverlap).trim() : '';
      }

      currentChunk = overlapText ? overlapText + '\n\n' + trimmedParagraph : trimmedParagraph;
      currentStartIndex = Math.max(0, chunkEndIndex - overlapText.length);
    }
  }

  // Push the final remaining chunk if non-empty
  if (currentChunk.trim().length > 0) {
    const chunkEndIndex = currentStartIndex + currentChunk.length;
    const pageStart = getPageForIndex(currentStartIndex);
    const pageEnd = getPageForIndex(chunkEndIndex);

    chunks.push({
      ...metadata,
      chunkIndex: chunks.length,
      text: currentChunk.trim(),
      tokenCount: estimateTokenCount(currentChunk),
      pageStart,
      pageEnd,
    });
  }

  return chunks;
};

