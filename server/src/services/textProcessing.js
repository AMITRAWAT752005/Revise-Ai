/**
 * Phase 4B: Text Processing Services
 * Functions for cleaning, normalizing, and chunking extracted text.
 */

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

  // 1. Remove null characters and control characters except \n, \r, \t
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. Fix broken hyphenated words at line endings: e.g. "comput-\ner" -> "computer"
  text = text.replace(/([a-zA-Z])-\s*[\r\n]+\s*([a-zA-Z])/g, '$1$2');

  // 3. Convert \r\n to \n
  text = text.replace(/\r\n/g, '\n');

  // 4. Remove trailing whitespace from each line
  text = text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  // 5. Replace multiple consecutive blank lines (3 or more) with double newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  // 6. Replace multiple spaces/tabs within lines with a single space
  text = text.replace(/[ \t]{2,}/g, ' ');

  return text.trim();
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
export const chunkText = (text, options = {}) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

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
  const rawParagraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

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
      chunkIndex: chunks.length,
      text: currentChunk.trim(),
      tokenCount: estimateTokenCount(currentChunk),
      pageStart,
      pageEnd,
    });
  }

  return chunks;
};

