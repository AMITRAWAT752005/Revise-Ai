import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSystemInstruction, BASE_SYSTEM_INSTRUCTION, TYPE_INSTRUCTIONS } from '../src/prompts/promptTemplates.js';

test('buildSystemInstruction constructs correct prompt', async (t) => {
  await t.test('Includes base instruction with replacements', () => {
    const params = {
      totalItems: 5,
      difficulty: 'hard',
      requestedTypes: ['MCQ', 'Flashcard']
    };
    
    const result = buildSystemInstruction(params);
    assert.match(result, /Generate exactly 5 items/);
    assert.match(result, /"hard" difficulty/);
    assert.match(result, /requested types: MCQ, Flashcard/);
  });
  
  await t.test('Appends specific instructions for requested types', () => {
    const params = {
      totalItems: 2,
      difficulty: 'medium',
      requestedTypes: ['ShortAnswer', 'OneWord']
    };
    
    const result = buildSystemInstruction(params);
    assert.ok(result.includes(TYPE_INSTRUCTIONS.ShortAnswer));
    assert.ok(result.includes(TYPE_INSTRUCTIONS.OneWord));
    assert.ok(!result.includes(TYPE_INSTRUCTIONS.MCQ));
  });
});
