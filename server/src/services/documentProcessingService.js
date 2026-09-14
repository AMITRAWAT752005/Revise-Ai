import fs from 'node:fs/promises';
import path from 'node:path';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import {
  extractPdfText,
  extractDocxText,
  extractTxtText,
  performOcrFallback,
} from './documentExtractors.js';
import { cleanText } from '../utils/textCleaner.js';
import { chunkText } from './chunkingService.js';

/**
 * Resolves file buffer either from passed buffer or by downloading/reading from material.fileUrl.
 * @param {Object} material - The StudyMaterial document.
 * @param {Buffer} [passedBuffer] - Optional in-memory buffer.
 * @returns {Promise<Buffer>}
 */
const resolveFileBuffer = async (material, passedBuffer) => {
  if (passedBuffer && Buffer.isBuffer(passedBuffer) && passedBuffer.length > 0) {
    return passedBuffer;
  }

  if (!material.fileUrl) {
    throw new Error('No file URL or file buffer available for document processing');
  }

  if (material.fileUrl.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), material.fileUrl);
    return await fs.readFile(localPath);
  }

  const response = await fetch(material.fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to download material file from remote storage (${response.statusText})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * Main orchestrator for document processing pipeline.
 * Converts an uploaded StudyMaterial into clean, structured DocumentChunks.
 *
 * @param {string} materialId - The ID of the StudyMaterial to process.
 * @param {Buffer} [fileBuffer] - Optional file buffer.
 */
export const processDocument = async (materialId, fileBuffer) => {
  let material;
  let chunkReplacementStarted = false;
  try {
    material = await StudyMaterial.findById(materialId);
    if (!material) {
      const error = new Error(`StudyMaterial with ID ${materialId} not found`);
      error.statusCode = 404;
      throw error;
    }

    if (material.processingStatus === 'completed') {
      return true;
    }

    if (material.processingStatus === 'processing') {
      return false;
    }

    // 1. Update status to processing
    material.processingStatus = 'processing';
    material.processingProgress = 10;
    material.processingError = undefined;
    await material.save();

    // Resolve buffer
    const activeBuffer = await resolveFileBuffer(material, fileBuffer);

    let extractedText = '';
    const fileType = (material.fileType || '').toLowerCase();
    const fileName = (material.fileName || '').toLowerCase();

    // 2 & 3. Detect file type and extract text
    console.log(`[DocumentProcessing] Extracting text for ${material.fileName} (${fileType})`);
    
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      extractedText = await extractPdfText(activeBuffer);
      
      // 4. OCR Fallback if PDF text is insufficient (<50 chars)
      if (!extractedText || extractedText.trim().length < 50) {
        console.log(`[DocumentProcessing] PDF text insufficient, falling back to OCR...`);
        extractedText = await performOcrFallback(activeBuffer);
      }
    } else if (
      fileType.includes('wordprocessingml.document') ||
      fileType.includes('docx') ||
      fileName.endsWith('.docx')
    ) {
      extractedText = await extractDocxText(activeBuffer);
    } else if (fileType.includes('text/plain') || fileType.includes('txt') || fileName.endsWith('.txt')) {
      extractedText = await extractTxtText(activeBuffer);
    } else {
      throw new Error(`Unsupported file type: ${fileType || fileName}`);
    }

    material.processingProgress = 40;
    await material.save();

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No readable text could be extracted from the document.');
    }

    // 5. Clean Text
    const cleanedText = cleanText(extractedText);

    // 6. Chunk Text
    const chunks = chunkText(cleanedText);

    material.processingProgress = 70;
    await material.save();

    // 7. Save DocumentChunks
    const documentChunks = chunks.map((chunk) => ({
      materialId: material._id,
      userId: material.userId,
      subjectId: material.subjectId,
      unitId: material.unitId,
      topicId: material.topicId,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      tokenCount: chunk.tokenCount,
      pageStart: chunk.pageStart,
      pageEnd: chunk.pageEnd,
    }));

    if (documentChunks.length === 0) {
      throw new Error('No document chunks were created from the extracted text.');
    }

    // Replace all chunks only after cleaning and chunking have completed.
    chunkReplacementStarted = true;
    await DocumentChunk.deleteMany({ materialId: material._id });
    await DocumentChunk.insertMany(documentChunks, { ordered: true });

    // 8. Update status to completed
    material.processingStatus = 'completed';
    material.processingProgress = 100;
    await material.save();
    
    console.log(`[DocumentProcessing] Completed processing for ${material.fileName} (${documentChunks.length} chunks)`);
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Document processing failed';
    console.error(`[DocumentProcessing] Failed processing for ${materialId}:`, errorMessage);
    if (error?.statusCode === 404 && !material) {
      throw error;
    }

    if (material && chunkReplacementStarted) {
      try {
        await DocumentChunk.deleteMany({ materialId: material._id });
      } catch (cleanupError) {
        console.error(`[DocumentProcessing] Failed to clean partial chunks for ${materialId}:`, cleanupError.message);
      }
    }

    if (material) {
      material.processingStatus = 'failed';
      material.processingError = errorMessage;
      try {
        await material.save();
      } catch (statusError) {
        console.error(`[DocumentProcessing] Failed to persist failure status for ${materialId}:`, statusError.message);
      }
    }
    return false; // Swallow error for background processing safety
  }
};

// Backward-compatible name used by the existing upload and retry flows.
export const processStudyMaterial = processDocument;

