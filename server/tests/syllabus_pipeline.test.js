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
  { name: 'Database Management Systems' },
  { name: 'Computer Networks', code: 'CS602', category: 'core' },
]);

assert.throws(
  () => validateAndDeduplicateSubjects({ subjects: [{ name: 'Normalization' }, { code: 'CS601' }] }),
  /invalid subject list/i,
);

assert.deepEqual(
  extractSubjectsFromText('Subject: Database Management Systems\nCS602: Computer Networks\nModule - Operating Systems'),
  {
    subjects: [
      { name: 'Database Management Systems' },
      { name: 'Computer Networks' },
      { name: 'Operating Systems' },
    ],
  },
);

const originalFetch = globalThis.fetch;
let aiRequest;
globalThis.fetch = async (_url, options) => {
  aiRequest = JSON.parse(options.body);
  return {
    ok: true,
    json: async () => ({
      choices: [{ message: { content: '{"subjects":[{"name":"Operating Systems"},{"name":"operating systems"}]}' } }],
    }),
  };
};
process.env.AI_API_KEY = 'test-key';
const aiResult = await extractSubjectsWithAI('Operating Systems syllabus content.');
assert.deepEqual(aiResult.subjects, [{ name: 'Operating Systems' }]);
assert.deepEqual(aiRequest.response_format, { type: 'json_object' });
assert.equal(aiRequest.max_tokens, 2_000);

const longSyllabus = `${'Opening course list. '.repeat(700)}Middle course list: Computer Networks. ${'Detailed unit content. '.repeat(700)}End of syllabus.`;
await extractSubjectsWithAI(longSyllabus);
assert.match(aiRequest.messages[1].content, /Middle course list: Computer Networks/);

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
