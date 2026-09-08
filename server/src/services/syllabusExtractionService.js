import fs from 'node:fs/promises';
import path from 'node:path';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { pdf } from 'pdf-to-img';
import { createWorker } from 'tesseract.js';

const MIN_USABLE_TEXT_LENGTH = 80;
const MAX_TEXT_LENGTH = 2_000_000;

export const cleanExtractedText = (value) => String(value || '')
  .replace(/\u0000/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .join('\n')
  .slice(0, MAX_TEXT_LENGTH)
  .trim();

const extractPdfText = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text || '';
  } finally {
    await parser.destroy();
  }
};

const extractNativeText = async (filePath, fileType) => {
  if (fileType === 'txt') return fs.readFile(filePath, 'utf8');
  if (fileType === 'docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }
  return extractPdfText(filePath);
};

const extractPdfWithOcr = async (filePath) => {
  const worker = await createWorker('eng');
  const pages = [];
  try {
    const document = await pdf(filePath, { scale: 2 });
    for await (const page of document) {
      const result = await worker.recognize(page);
      pages.push(result.data.text || '');
    }
  } finally {
    await worker.terminate();
  }
  return pages.join('\n');
};

export const extractSyllabusText = async (filePath, fileType) => {
  const nativeText = cleanExtractedText(await extractNativeText(filePath, fileType));
  if (nativeText.length >= MIN_USABLE_TEXT_LENGTH || fileType !== 'pdf') {
    if (nativeText.length < MIN_USABLE_TEXT_LENGTH) {
      throw new Error('The document does not contain enough usable syllabus text.');
    }
    return { text: nativeText, usedOcr: false };
  }

  const ocrText = cleanExtractedText(await extractPdfWithOcr(filePath));
  if (ocrText.length < MIN_USABLE_TEXT_LENGTH) {
    throw new Error('The document does not contain usable text after OCR.');
  }
  return { text: ocrText, usedOcr: true };
};

export const getSafeFileName = (fileName) => path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 255);
