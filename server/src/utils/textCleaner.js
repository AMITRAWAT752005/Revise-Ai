const isLikelyHeading = (line) => {
  if (line.length > 100 || /[.!?]$/.test(line)) return false;
  return /^(chapter|unit|module|section|lesson|part)\b/i.test(line) || /^[A-Z][A-Za-z\d\s:-]{2,}$/.test(line);
};

const isLikelyOcrNoise = (line) => {
  if (line.length < 4) return false;
  const symbols = (line.match(/[^\p{L}\p{N}\s.,;:'!?()\-/%&]/gu) || []).length;
  return symbols / line.length > 0.45;
};

/**
 * Cleans and normalizes raw extracted text while preserving meaning and structure.
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
