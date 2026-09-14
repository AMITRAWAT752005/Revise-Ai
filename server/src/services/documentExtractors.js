import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Extracts text from a digital PDF buffer using pdf-parse.
 * @param {Buffer} fileBuffer - The PDF file buffer.
 * @returns {Promise<string>} The extracted text.
 */
export const extractPdfText = async (fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('PDF file buffer is empty or invalid.');
  }

  try {
    const pdfModule = require('pdf-parse');
    let fullText = '';
    
    // Explicitly cast to Uint8Array to prevent pdf.js strict type check errors
    const uint8Array = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);

    if (typeof pdfModule === 'function') {
      const data = await pdfModule(uint8Array);
      fullText = data.text || '';
    } else if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse(uint8Array);
      const result = await parser.getText();
      if (typeof result === 'string') {
        fullText = result;
      } else if (result && typeof result.text === 'string') {
        fullText = result.text;
      } else if (result && Array.isArray(result.pages)) {
        fullText = result.pages.map((p) => p.text || '').join('\n\n');
      }
    }

    return fullText ? fullText.trim() : '';
  } catch (error) {
    console.error('[Extractor] PDF text extraction failed:', error.message);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

/**
 * Extracts text from a DOCX buffer using mammoth.
 * @param {Buffer} fileBuffer - The DOCX file buffer.
 * @returns {Promise<string>} The extracted text.
 */
export const extractDocxText = async (fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('DOCX file buffer is empty or invalid.');
  }

  try {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const text = result.value ? result.value.trim() : '';
    return text;
  } catch (error) {
    console.error('[Extractor] DOCX text extraction failed:', error.message);
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
};

/**
 * Extracts text from a TXT buffer using Node.js TextDecoder.
 * @param {Buffer} fileBuffer - The TXT file buffer.
 * @returns {Promise<string>} The extracted text.
 */
export const extractTxtText = async (fileBuffer) => {
  if (!fileBuffer || fileBuffer.length === 0) {
    return '';
  }

  try {
    const decoder = new TextDecoder('utf-8');
    const rawText = decoder.decode(fileBuffer);
    // Remove Byte Order Mark (\uFEFF) if present
    const cleanContent = rawText.replace(/^\uFEFF/, '');
    return cleanContent.trim();
  } catch (error) {
    console.error('[Extractor] TXT text extraction failed:', error.message);
    throw new Error(`TXT extraction failed: ${error.message}`);
  }
};

/**
 * Performs OCR on a scanned PDF file buffer using tesseract.js and pdf-to-img.
 * @param {Buffer} fileBuffer - The scanned PDF or image file buffer.
 * @returns {Promise<string>} The OCR extracted text.
 */
export const performOcrFallback = async (fileBuffer) => {
  console.log('[Extractor] Performing OCR Fallback via Tesseract.js / pdf-to-img...');

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('File buffer is empty for OCR processing.');
  }

  try {
    const tesseract = require('tesseract.js');
    const pdfToImg = require('pdf-to-img');

    const worker = await tesseract.createWorker('eng');
    let ocrText = '';

    try {
      const documentPages = await pdfToImg.pdf(fileBuffer, { scale: 2.0 });
      let pageNum = 1;

      for await (const pageImgBuffer of documentPages) {
        console.log(`[OCR Fallback] Processing page ${pageNum}...`);
        const { data } = await worker.recognize(pageImgBuffer);
        if (data && data.text) {
          ocrText += `--- Page ${pageNum} ---\n` + data.text + '\n\n';
        }
        pageNum++;
        // Limit OCR to max 25 pages to prevent unbounded background execution
        if (pageNum > 25) {
          console.warn('[OCR Fallback] Page limit reached (25 pages max for OCR).');
          break;
        }
      }
    } catch (pdfImgErr) {
      console.warn('[OCR Fallback] pdf-to-img conversion failed, trying direct tesseract on buffer:', pdfImgErr.message);
      const { data } = await worker.recognize(fileBuffer);
      ocrText = data ? data.text : '';
    } finally {
      await worker.terminate();
    }

    return ocrText.trim();
  } catch (error) {
    console.error('[Extractor] OCR fallback failed:', error.message);
    throw new Error(`OCR fallback processing failed: ${error.message}`);
  }
};

