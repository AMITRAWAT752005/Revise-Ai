import test from 'node:test';
import assert from 'node:assert/strict';

// Import the ESM module from client/src/services/aiService.js
import { generateRevisionContent } from '../../client/src/services/aiService.js';

test('Frontend API Request & Response Integration Service — generateRevisionContent', async (t) => {
  const originalFetch = global.fetch;

  t.afterEach(() => {
    global.fetch = originalFetch;
  });

  await t.test('1. Client-side Validation', async () => {
    await assert.rejects(
      async () => {
        await generateRevisionContent({ subjectId: '' });
      },
      {
        name: 'Error',
        message: 'subjectId is required to generate revision content.',
      }
    );

    await assert.rejects(
      async () => {
        await generateRevisionContent({});
      },
      {
        name: 'Error',
        message: 'subjectId is required to generate revision content.',
      }
    );
  });

  await t.test('2. Correct Request Formatting & Credentials', async () => {
    let capturedUrl = '';
    let capturedOptions = {};

    global.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            generatedContent: [{ type: 'MCQ', question: 'Test question?' }],
            meta: { totalItemsGenerated: 1 },
          },
        }),
      };
    };

    const result = await generateRevisionContent({
      subjectId: '507f1f77bcf86cd799439011',
      unitId: '507f1f77bcf86cd799439012',
      topicId: '507f1f77bcf86cd799439013',
      parameters: {
        totalItems: 5,
        difficulty: 'hard',
        requestedTypes: ['MCQ', 'TrueFalse'],
      },
    });

    assert.equal(capturedUrl, '/api/ai/generate');
    assert.equal(capturedOptions.method, 'POST');
    assert.equal(capturedOptions.credentials, 'include');
    assert.equal(capturedOptions.headers['Content-Type'], 'application/json');

    const parsedBody = JSON.parse(capturedOptions.body);
    assert.equal(parsedBody.subjectId, '507f1f77bcf86cd799439011');
    assert.equal(parsedBody.unitId, '507f1f77bcf86cd799439012');
    assert.equal(parsedBody.topicId, '507f1f77bcf86cd799439013');
    assert.equal(parsedBody.parameters.totalItems, 5);
    assert.equal(parsedBody.parameters.difficulty, 'hard');
    assert.deepEqual(parsedBody.parameters.requestedTypes, ['MCQ', 'TrueFalse']);

    assert.equal(result.generatedContent.length, 1);
    assert.equal(result.meta.totalItemsGenerated, 1);
  });

  await t.test('3. Successful Response Parsing', async () => {
    global.fetch = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          generatedContent: [
            { type: 'MCQ', question: 'Sample Q1' },
            { type: 'Flashcard', front: 'Concept', back: 'Definition' },
          ],
          meta: { totalItemsGenerated: 2, difficulty: 'medium' },
        },
      }),
    });

    const response = await generateRevisionContent({
      subjectId: '507f1f77bcf86cd799439011',
    });

    assert.equal(response.generatedContent.length, 2);
    assert.equal(response.meta.difficulty, 'medium');
  });

  await t.test('4. Error Handling for Backend Error Responses (400, 401, 403, 404, 500)', async () => {
    global.fetch = async () => ({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        message: 'You do not own this subject.',
      }),
    });

    await assert.rejects(
      async () => {
        await generateRevisionContent({ subjectId: '507f1f77bcf86cd799439011' });
      },
      (err) => {
        assert.equal(err.message, 'You do not own this subject.');
        assert.equal(err.status, 403);
        return true;
      }
    );
  });

  await t.test('5. Error Handling for Network Failure', async () => {
    global.fetch = async () => {
      throw new Error('Failed to fetch');
    };

    await assert.rejects(
      async () => {
        await generateRevisionContent({ subjectId: '507f1f77bcf86cd799439011' });
      },
      {
        name: 'Error',
        message: 'Network error: Unable to connect to the backend server. Please check your network connection.',
      }
    );
  });
});
