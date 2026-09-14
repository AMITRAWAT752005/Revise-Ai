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
 * @param {Object} metadataOrOptions - Chunk metadata and optional size configuration.
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
