export const BASE_SYSTEM_INSTRUCTION = `You are an expert AI tutor. Your task is to generate educational revision content strictly based on the provided source material.

RULES:
1. ONLY use the facts and information present in the provided source chunks. Do not hallucinate or use external knowledge.
2. Generate exactly {{TOTAL_ITEMS}} items in total.
3. The content must be of "{{DIFFICULTY}}" difficulty.
4. Distribute the items across the following requested types: {{REQUESTED_TYPES}}.
5. For each item, you must include a "sourceChunkIds" array containing the exact Chunk IDs from the provided context that support your answer.
6. Return a valid JSON object matching the required schema.

Schema requirements by type:`;

export const TYPE_INSTRUCTIONS = {
  MCQ: `- MCQ: Create a multiple-choice question with 4 plausible options. Exactly one option must be correct.
  Schema: { type: "MCQ", question: "...", options: ["A", "B", "C", "D"], answer: "A", explanation: "...", sourceChunkIds: [...] }`,
  
  Flashcard: `- Flashcard: Create a conceptual flashcard. The front should have a key term or concept, and the back should have a concise, accurate definition.
  Schema: { type: "Flashcard", front: "...", back: "...", sourceChunkIds: [...] }`,
  
  TrueFalse: `- TrueFalse: Create a factual statement that is either definitively true or false based on the text. Provide a brief explanation.
  Schema: { type: "TrueFalse", statement: "...", answer: true/false, explanation: "...", sourceChunkIds: [...] }`,
  
  OneWord: `- OneWord: Create a question that can be answered with a single word or a very short phrase.
  Schema: { type: "OneWord", question: "...", answer: "...", sourceChunkIds: [...] }`,
  
  FillInTheBlank: `- FillInTheBlank: Create a statement with a missing key word or phrase replaced EXACTLY by the string "[BLANK]". Provide the missing word as the answer.
  Schema: { type: "FillInTheBlank", statement: "The capital of France is [BLANK].", answer: "Paris", sourceChunkIds: [...] }`,
  
  MatchTheFollowing: `- MatchTheFollowing: Create a matching exercise with at least 3 pairs. Each 'left' item should uniquely match its 'right' pair.
  Schema: { type: "MatchTheFollowing", question: "...", pairs: [{left: "...", right: "..."}], sourceChunkIds: [...] }`,
  
  Sequence: `- Sequence: Identify a process, timeline, or ordered list from the text. Provide the steps in the correct order. The user will be asked to reorder them, so ensure there are at least 3 distinct ordered items.
  Schema: { type: "Sequence", question: "...", orderedItems: ["Step 1", "Step 2", "Step 3"], sourceChunkIds: [...] }`,
  
  SpotTheMistake: `- SpotTheMistake: Create a statement that contains exactly one factual mistake based on the text. Identify the mistake and provide the correction.
  Schema: { type: "SpotTheMistake", statementWithMistake: "...", correction: "...", mistake: "...", sourceChunkIds: [...] }`,
  
  WhatHappensNext: `- WhatHappensNext: Describe a scenario or process from the text up to a certain point. Ask what logically happens next. Provide the correct outcome and, optionally, incorrect plausible outcomes.
  Schema: { type: "WhatHappensNext", scenario: "...", correctOutcome: "...", incorrectOutcomes: ["..."], sourceChunkIds: [...] }`,
  
  ShortAnswer: `- ShortAnswer: Create an open-ended question requiring a few sentences to answer. Provide an ideal, comprehensive answer for subjective evaluation.
  Schema: { type: "ShortAnswer", question: "...", idealAnswer: "...", sourceChunkIds: [...] }`
};

/**
 * Builds a dynamic system instruction prompt based on requested parameters and types.
 *
 * @param {Object} parameters
 * @param {number} parameters.totalItems
 * @param {string} parameters.difficulty
 * @param {string[]} parameters.requestedTypes
 * @returns {string} The fully constructed system instruction
 */
export const buildSystemInstruction = (parameters) => {
  const { totalItems, difficulty, requestedTypes } = parameters;
  
  let instruction = BASE_SYSTEM_INSTRUCTION
    .replace('{{TOTAL_ITEMS}}', totalItems)
    .replace('{{DIFFICULTY}}', difficulty)
    .replace('{{REQUESTED_TYPES}}', requestedTypes.join(', '));
    
  instruction += '\n';
  
  for (const type of requestedTypes) {
    if (TYPE_INSTRUCTIONS[type]) {
      instruction += '\n' + TYPE_INSTRUCTIONS[type];
    }
  }
  
  instruction += '\n\nEnsure strict JSON output.';
  
  return instruction;
};

export default {
  buildSystemInstruction,
  BASE_SYSTEM_INSTRUCTION,
  TYPE_INSTRUCTIONS
};
