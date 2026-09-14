import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import SyllabusImport from '../src/models/SyllabusImport.js';
import { extractSyllabusText } from '../src/services/syllabusExtractionService.js';
import {
  extractSubjectsFromText,
  extractSubjectsWithAI,
  validateAndDeduplicateSubjects,
} from '../src/services/aiSubjectService.js';

const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'reviseai-syllabus-'));
const textPath = path.join(temporaryDirectory, 'syllabus.txt');
await fs.writeFile(
  textPath,
  'Database Management Systems covers relational models, SQL, transactions, and database design. Computer Networks covers routing, transport protocols, and network security.',
);

const { text, usedOcr } = await extractSyllabusText(textPath, 'txt');
assert.match(text, /Database Management Systems/);
assert.equal(usedOcr, false);

const deduplicated = validateAndDeduplicateSubjects({
  subjects: [
    { name: ' Database Management Systems ' },
    { name: 'database   management systems' },
    { name: 'Computer Networks', code: 'CS602', category: 'core' },
  ],
});
assert.deepEqual(deduplicated.subjects, [
  { name: 'Database Management Systems', units: [] },
  { name: 'Computer Networks', code: 'CS602', category: 'core', units: [] },
]);

assert.throws(
  () => validateAndDeduplicateSubjects({ subjects: [{ name: 'Normalization' }, { code: 'CS601' }] }),
  /invalid subject list/i,
);

assert.deepEqual(
  extractSubjectsFromText('Subject: Database Management Systems\nCS602: Computer Networks\nModule - Operating Systems'),
  {
    subjects: [
      { name: 'Database Management Systems', units: [] },
      { name: 'Computer Networks', units: [] },
      { name: 'Operating Systems', units: [] },
    ],
  },
);

const originalFetch = globalThis.fetch;
const aiRequests = [];
let aiRequest;
globalThis.fetch = async (_url, options) => {
  aiRequest = JSON.parse(options.body);
  aiRequests.push(aiRequest);
  return {
    ok: true,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: '{"subjects":[{"name":"Operating Systems"}]}' }] } }],
    }),
  };
};
process.env.GEMINI_API_KEY = 'test-key';
const aiResult = await extractSubjectsWithAI('Operating Systems syllabus content.');
assert.deepEqual(aiResult.subjects, [{ name: 'Operating Systems', units: [] }]);
assert.equal(aiRequest.generationConfig.responseMimeType, 'application/json');
assert.equal(aiRequest.generationConfig.maxOutputTokens, 3_000);

const longSyllabus = `${'Opening course list. '.repeat(700)}Middle course list: Computer Networks. ${'Detailed unit content. '.repeat(700)}End of syllabus.`;
await extractSubjectsWithAI(longSyllabus);
assert.ok(aiRequests.some((req) => /Middle course list: Computer Networks/.test(req.contents[0].parts[0].text)));

globalThis.fetch = async () => ({
  ok: false,
  status: 400,
  json: async () => ({ error: { message: 'Failed to validate JSON.' } }),
});
const fallbackResult = await extractSubjectsWithAI('Course: Data Structures\nSubject: Discrete Mathematics');
assert.deepEqual(fallbackResult.subjects, [
  { name: 'Data Structures' },
  { name: 'Discrete Mathematics' },
]);
globalThis.fetch = originalFetch;

const invalidImport = new SyllabusImport({
  fileName: 'syllabus.txt',
  fileType: 'txt',
  fileReference: '/tmp/syllabus.txt',
  status: 'uploaded',
});
assert.equal(invalidImport.validateSync().errors.userId.kind, 'required');

await fs.rm(temporaryDirectory, { recursive: true, force: true });
console.log('Syllabus pipeline tests passed.');
