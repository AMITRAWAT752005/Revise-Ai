import { StudyMaterial } from '../models/StudyMaterial.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import {
  extractPdfText,
  extractDocxText,
  extractTxtText,
  performOcrFallback,
} from './documentExtractors.js';
import { cleanText, chunkText } from './textProcessing.js';

/**
 * Main orchestrator for document processing pipeline.
 * Converts an uploaded StudyMaterial into clean, structured DocumentChunks.
 *
 * @param {string} materialId - The ID of the StudyMaterial to process.
 * @param {Buffer} fileBuffer - The file buffer (passed directly to avoid re-downloading).
 */
export const processStudyMaterial = async (materialId, fileBuffer) => {
  let material;
  try {
    material = await StudyMaterial.findById(materialId);
    if (!material) {
      throw new Error(`StudyMaterial with ID ${materialId} not found`);
    }

    // 1. Update status to processing
    material.processingStatus = 'processing';
    material.processingProgress = 10;
    material.processingError = undefined;
    await material.save();

    if (!fileBuffer) {
      throw new Error('File buffer is required for processing');
      // TODO: Implement file download from material.fileUrl if buffer is not provided
    }

    let extractedText = '';
    const fileType = material.fileType.toLowerCase();

    // 2 & 3. Detect file type and extract text
    console.log(`[DocumentProcessing] Extracting text for ${material.fileName} (${fileType})`);
    
    if (fileType.includes('pdf')) {
      extractedText = await extractPdfText(fileBuffer);
      
      // 4. OCR Fallback (if PDF text is insufficient)
      if (!extractedText || extractedText.trim().length < 50) {
        console.log(`[DocumentProcessing] PDF text insufficient, falling back to OCR...`);
        extractedText = await performOcrFallback(fileBuffer);
      }
    } else if (fileType.includes('wordprocessingml.document') || fileType.includes('docx')) {
      extractedText = await extractDocxText(fileBuffer);
    } else if (fileType.includes('text/plain') || fileType.includes('txt')) {
      extractedText = await extractTxtText(fileBuffer);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    material.processingProgress = 50;
    await material.save();

    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text could be extracted from the document');
    }

    // 5. Clean Text
    const cleanedText = cleanText(extractedText);

    // 6. Chunk Text
    const chunks = chunkText(cleanedText);

    material.processingProgress = 80;
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
      // pageStart: chunk.pageStart, // if available from extractor
      // pageEnd: chunk.pageEnd, // if available from extractor
    }));

    if (documentChunks.length > 0) {
      // Clear any existing chunks for this material (idempotency)
      await DocumentChunk.deleteMany({ materialId: material._id });
      await DocumentChunk.insertMany(documentChunks);
    }

    // 8. Update status to completed
    material.processingStatus = 'completed';
    material.processingProgress = 100;
    await material.save();
    
    console.log(`[DocumentProcessing] Completed processing for ${material.fileName}`);
    return true;

  } catch (error) {
    console.error(`[DocumentProcessing] Failed processing for ${materialId}:`, error);
    if (material) {
      material.processingStatus = 'failed';
      material.processingError = error.message || 'Unknown processing error';
      await material.save();
    }
    return false; // Swallow error to avoid crashing the server if run in background
  }
};
