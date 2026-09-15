import { generateEmbedding } from '../src/services/embeddingService.js';

const runTests = async () => {
  console.log('--- Running Embedding Service Tests ---');

  try {
    const text = 'What is normalization in DBMS?';
    console.log(`Generating embedding for: "${text}"`);
    
    const startTime = Date.now();
    const vector = await generateEmbedding(text);
    const timeTaken = Date.now() - startTime;

    console.log(`Embedding generated in ${timeTaken}ms.`);
    
    if (!Array.isArray(vector)) {
      throw new Error(`Expected vector to be an array, got ${typeof vector}`);
    }

    if (vector.length !== 384) {
      throw new Error(`Expected vector dimension to be 384, got ${vector.length}`);
    }

    console.log(`✅ Test passed! Vector dimension: ${vector.length}, first 3 values: [${vector.slice(0, 3).join(', ')}]`);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

runTests();
