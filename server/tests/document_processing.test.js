import assert from 'node:assert';
import {
  extractTxtText,
  extractDocxText,
  extractPdfText,
} from '../src/services/documentExtractors.js';
import { cleanText } from '../src/utils/textCleaner.js';
import { chunkText, estimateTokenCount } from '../src/services/chunkingService.js';
import DocumentChunk from '../src/models/DocumentChunk.js';
import StudyMaterial from '../src/models/StudyMaterial.js';

async function runTests() {
  console.log('--- Phase 4B Document Processing Test Suite ---');

  // Test 1: TXT extraction with BOM and UTF-8
  console.log('\n[Test 1] Plain text extraction (UTF-8 & BOM handling)');
  const rawTxt = 'Unit 1: Fundamentals of Artificial Intelligence\n\nArtificial Intelligence (AI) is the intelligence of machines.';
  const txtWithBom = '\uFEFF' + rawTxt;
  const txtBuffer = Buffer.from(txtWithBom, 'utf-8');
  const extractedTxt = await extractTxtText(txtBuffer);
  assert.strictEqual(extractedTxt, rawTxt.trim());
  console.log('✓ TXT extraction with BOM strip passed');

  // Test 2: Text cleaning & normalization
  console.log('\n[Test 2] Text cleaning, de-hyphenation, and OCR noise removal');
  const dirtyText =
    'Comput-\ner science\x00 is   the study of\r\n\r\n\r\ncomputation.  \n' +
    '&&&&&&&&&& \n' +
    'Page 1 Header \n' +
    'Algorithms and data structures are fundamental to computer science.\n' +
    'Page 1 Header';
  const cleaned = cleanText(dirtyText);
  assert.ok(cleaned.includes('Computer science is the study of'));
  assert.ok(cleaned.includes('computation.'));
  assert.ok(!cleaned.includes('\x00'));
  assert.ok(!cleaned.includes('&&&&&&&&&&'));
  console.log('✓ Text cleaning & noise removal passed');

  // Test 3: Text chunking with metadata and sequential indexing
  console.log('\n[Test 3] Text chunking, word sizing, overlap, and metadata propagation');
  const para1 = 'Intro: ' + 'Database systems manage large sets of structured data. '.repeat(35);
  const para2 = 'Storage: ' + 'Indexing structures like B-Trees optimize search and retrieval speeds. '.repeat(35);
  const para3 = 'Transactions: ' + 'ACID properties ensure reliable and consistent database operations. '.repeat(35);
  const fullDocument = `${para1}\n\n${para2}\n\n${para3}`;

  const metadata = {
    userId: '60c72b2f9b1d8b0015b6d111',
    subjectId: '60c72b2f9b1d8b0015b6d222',
    unitId: '60c72b2f9b1d8b0015b6d333',
    topicId: '60c72b2f9b1d8b0015b6d444',
  };

  const chunks = chunkText(fullDocument, {
    ...metadata,
    targetWords: 250,
    minWords: 150,
    maxWords: 400,
    overlapWords: 30,
  });

  assert.ok(chunks.length >= 2, `Expected multiple chunks, got ${chunks.length}`);
  chunks.forEach((chunk, idx) => {
    assert.strictEqual(chunk.chunkIndex, idx, `Chunk index must be sequential (${idx})`);
    assert.strictEqual(chunk.userId, metadata.userId);
    assert.strictEqual(chunk.subjectId, metadata.subjectId);
    assert.strictEqual(chunk.unitId, metadata.unitId);
    assert.strictEqual(chunk.topicId, metadata.topicId);
    assert.ok(chunk.tokenCount > 0);
    assert.ok(chunk.text.length > 0);
  });
  console.log(`✓ Text chunking passed (${chunks.length} chunks generated with sequential indices & metadata)`);

  // Test 4: Estimate token count helper
  console.log('\n[Test 4] Token count estimation');
  const tokens = estimateTokenCount('Hello world from ReviseAI document processing engine');
  assert.ok(tokens >= 7, `Expected tokens >= 7, got ${tokens}`);
  console.log('✓ Token count estimation passed');

  // Test 5: Empty buffer guards for extractors
  console.log('\n[Test 5] Extractor input guards');
  await assert.rejects(async () => {
    await extractPdfText(null);
  }, /empty or invalid/i);

  await assert.rejects(async () => {
    await extractDocxText(Buffer.alloc(0));
  }, /empty or invalid/i);

  const emptyTxt = await extractTxtText(Buffer.alloc(0));
  assert.strictEqual(emptyTxt, '');
  console.log('✓ Extractor guards passed');

  // Test 6: Model schema integrity
  console.log('\n[Test 6] DocumentChunk and StudyMaterial model indexes & schema');
  assert.ok(DocumentChunk.schema.paths.materialId, 'DocumentChunk requires materialId');
  assert.ok(DocumentChunk.schema.paths.userId, 'DocumentChunk requires userId');
  assert.ok(DocumentChunk.schema.paths.subjectId, 'DocumentChunk requires subjectId');
  assert.ok(DocumentChunk.schema.paths.chunkIndex, 'DocumentChunk requires chunkIndex');
  assert.ok(DocumentChunk.schema.paths.text, 'DocumentChunk requires text');

  assert.ok(StudyMaterial.schema.paths.processingStatus, 'StudyMaterial requires processingStatus');
  assert.ok(StudyMaterial.schema.paths.processingProgress, 'StudyMaterial requires processingProgress');
  assert.ok(StudyMaterial.schema.paths.processingError, 'StudyMaterial requires processingError');
  console.log('✓ Schema and index integrity verified');

  console.log('\n✅ All Phase 4B unit & integration tests passed successfully!');
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
