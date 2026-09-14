/**
 * Phase 4B: Document Extractors (Skeleton)
 * These functions establish the contracts for text extraction from various file types.
 * Actual implementation will be done in subsequent tasks.
 */

/**
 * Extracts text from a digital PDF buffer.
 * @param {Buffer} fileBuffer - The PDF file buffer.
 * @returns {Promise<string>} The extracted text.
 */
export const extractPdfText = async (fileBuffer) => {
  console.log('[Extractor] Extracting text from PDF (Placeholder)');
  // TODO: Implement pdf-parse logic here
  return 'This is dummy extracted text from the PDF placeholder.';
};

/**
 * Extracts text from a DOCX buffer.
 * @param {Buffer} fileBuffer - The DOCX file buffer.
 * @returns {Promise<string>} The extracted text.
 */
export const extractDocxText = async (fileBuffer) => {
  console.log('[Extractor] Extracting text from DOCX (Placeholder)');
  // TODO: Implement mammoth logic here
  return 'This is dummy extracted text from the DOCX placeholder.';
};

/**
 * Extracts text from a TXT buffer.
 * @param {Buffer} fileBuffer - The TXT file buffer.
 * @returns {Promise<string>} The extracted text.
 */
export const extractTxtText = async (fileBuffer) => {
  console.log('[Extractor] Extracting text from TXT (Placeholder)');
  // TODO: Implement txt parsing logic here
  return fileBuffer.toString('utf-8');
};

/**
 * Performs OCR on a file buffer (fallback for scanned PDFs).
 * @param {Buffer} fileBuffer - The file buffer (e.g., scanned PDF or image).
 * @returns {Promise<string>} The OCR extracted text.
 */
export const performOcrFallback = async (fileBuffer) => {
  console.log('[Extractor] Performing OCR Fallback (Placeholder)');
  // TODO: Implement Google Vision or similar OCR logic here
  return 'This is dummy text extracted via the OCR fallback placeholder.';
};
