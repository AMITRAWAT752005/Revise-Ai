import assert from 'node:assert';
import { extractTxtText } from '../src/services/documentExtractors.js';
import { cleanText, chunkText, estimateTokenCount } from '../src/services/textProcessing.js';

async function runTests() {
  console.log('--- Phase 4B Document Processing Test Suite ---');

  // Test 1: TXT extraction
  console.log('\n[Test 1] Plain text extraction');
  const txtContent = 'Unit 1: Fundamentals of Artificial Intelligence\n\nArtificial Intelligence (AI) is the intelligence of machines.';
  const txtBuffer = Buffer.from(txtContent, 'utf-8');
  const extractedTxt = await extractTxtText(txtBuffer);
  assert.strictEqual(extractedTxt, txtContent.trim());
  console.log('✓ TXT extraction passed');

  // Test 2: Text cleaning
  console.log('\n[Test 2] Text cleaning & normalization');
  const dirtyText = 'Comput-\ner science\x00 is   the study of\r\n\r\n\r\ncomputation.  ';
  const cleaned = cleanText(dirtyText);
  assert.strictEqual(cleaned, 'Computer science is the study of\n\ncomputation.');
  console.log('✓ Text cleaning passed');

  // Test 3: Text chunking
  console.log('\n[Test 3] Text chunking & token estimation');
  const samplePara1 = 'Paragraph 1: ' + 'Word '.repeat(300);
  const samplePara2 = 'Paragraph 2: ' + 'Concept '.repeat(300);
  const fullSample = samplePara1 + '\n\n' + samplePara2;

  const chunks = chunkText(fullSample, { maxChunkSize: 1500, overlapSize: 200 });
  assert.ok(chunks.length >= 2, `Expected at least 2 chunks, got ${chunks.length}`);
  assert.strictEqual(chunks[0].chunkIndex, 0);
  assert.strictEqual(chunks[1].chunkIndex, 1);
  assert.ok(chunks[0].tokenCount > 0);
  assert.ok(chunks[0].text.length > 0);
  console.log(`✓ Text chunking passed (${chunks.length} chunks generated)`);

  // Test 4: Estimate token count helper
  console.log('\n[Test 4] Token count estimation');
  const tokens = estimateTokenCount('Hello world from ReviseAI system');
  assert.ok(tokens >= 5, `Expected tokens >= 5, got ${tokens}`);
  console.log('✓ Token count estimation passed');

  console.log('\n✅ All Phase 4B unit tests passed successfully!');
}

runTests().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
