import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import SyllabusImport from '../src/models/SyllabusImport.js';
import { extractSyllabusText } from '../src/services/syllabusExtractionService.js';
import { extractSubjectsWithAI, validateAndDeduplicateSubjects } from '../src/services/aiSubjectService.js';

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

const originalFetch = globalThis.fetch;
globalThis.fetch = async () => ({
  ok: true,
  json: async () => ({
    choices: [{ message: { content: '{"subjects":[{"name":"Operating Systems"},{"name":"operating systems"}]}' } }],
  }),
});
process.env.AI_API_KEY = 'test-key';
const aiResult = await extractSubjectsWithAI('Operating Systems syllabus content.');
assert.deepEqual(aiResult.subjects, [{ name: 'Operating Systems' }]);
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
