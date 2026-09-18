import assert from 'node:assert/strict';
import { describe, it, mock, beforeEach } from 'node:test';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Subject from '../src/models/Subject.js';
import Unit from '../src/models/Unit.js';
import Topic from '../src/models/Topic.js';
import { generateAccessToken } from '../src/utils/tokenUtils.js';
import { AUTH_COOKIE_NAME } from '../src/utils/authCookie.js';
import aiGenerationService from '../src/services/aiGenerationService.js';

describe('Protected AI Content Generation API — POST /api/ai/generate', () => {
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  const subjectAId = new mongoose.Types.ObjectId();
  const subjectBId = new mongoose.Types.ObjectId();
  const unitAId = new mongoose.Types.ObjectId();
  const topicAId = new mongoose.Types.ObjectId();

  let userACookieToken;
  let userBCookieToken;

  beforeEach(() => {
    // Reset mocks
    mock.restoreAll();

    // Create fake tokens
    userACookieToken = generateAccessToken({ userId: userAId.toString(), email: 'usera@example.com' });
    userBCookieToken = generateAccessToken({ userId: userBId.toString(), email: 'userb@example.com' });

    // Mock User.findById
    mock.method(User, 'findById', (id) => {
      const strId = id ? id.toString() : '';
      if (strId === userAId.toString()) {
        return {
          select: () => Promise.resolve({ _id: userAId, email: 'usera@example.com' }),
        };
      }
      if (strId === userBId.toString()) {
        return {
          select: () => Promise.resolve({ _id: userBId, email: 'userb@example.com' }),
        };
      }
      return { select: () => Promise.resolve(null) };
    });

    // Mock Subject.findById
    mock.method(Subject, 'findById', (id) => {
      const strId = id ? id.toString() : '';
      if (strId === subjectAId.toString()) {
        return Promise.resolve({ _id: subjectAId, userId: userAId, name: 'Subject A' });
      }
      if (strId === subjectBId.toString()) {
        return Promise.resolve({ _id: subjectBId, userId: userBId, name: 'Subject B' });
      }
      return Promise.resolve(null);
    });

    // Mock Unit.findById
    mock.method(Unit, 'findById', (id) => {
      const strId = id ? id.toString() : '';
      if (strId === unitAId.toString()) {
        return Promise.resolve({ _id: unitAId, subjectId: subjectAId, name: 'Unit A' });
      }
      return Promise.resolve(null);
    });

    // Mock Topic.findById
    mock.method(Topic, 'findById', (id) => {
      const strId = id ? id.toString() : '';
      if (strId === topicAId.toString()) {
        return Promise.resolve({ _id: topicAId, unitId: unitAId, name: 'Topic A' });
      }
      return Promise.resolve(null);
    });
  });

  // Helper to execute supertest-like fetch against Express app listener
  const makeRequest = async (token, body) => {
    const server = app.listen(0);
    const port = server.address().port;
    const url = `http://localhost:${port}/api/ai/generate`;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Cookie'] = `${AUTH_COOKIE_NAME}=${token}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const json = await res.json();
      return { status: res.status, body: json };
    } finally {
      server.close();
    }
  };

  describe('1. Authentication Protection', () => {
    it('should reject unauthenticated requests with HTTP 401', async () => {
      const res = await makeRequest(null, { subjectId: subjectAId.toString() });
      assert.equal(res.status, 401);
      assert.equal(res.body.success, undefined); // Auth middleware format or error format
    });
  });

  describe('2. Input & Format Validation', () => {
    it('should reject missing subjectId with HTTP 400', async () => {
      const res = await makeRequest(userACookieToken, {});
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'subjectId is required.');
    });

    it('should reject invalid subjectId format with HTTP 400', async () => {
      const res = await makeRequest(userACookieToken, { subjectId: 'invalid-id-format' });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Invalid subjectId format.');
    });

    it('should reject invalid unitId format with HTTP 400', async () => {
      const res = await makeRequest(userACookieToken, {
        subjectId: subjectAId.toString(),
        unitId: 'not-an-object-id',
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Invalid unitId format.');
    });

    it('should reject topicId when unitId is missing with HTTP 400', async () => {
      const res = await makeRequest(userACookieToken, {
        subjectId: subjectAId.toString(),
        topicId: topicAId.toString(),
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'unitId is required when topicId is provided.');
    });

    it('should reject invalid totalItems bounds with HTTP 400', async () => {
      const res = await makeRequest(userACookieToken, {
        subjectId: subjectAId.toString(),
        parameters: { totalItems: 100 },
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'totalItems must be an integer between 1 and 50.');
    });

    it('should reject invalid difficulty with HTTP 400', async () => {
      const res = await makeRequest(userACookieToken, {
        subjectId: subjectAId.toString(),
        parameters: { difficulty: 'extreme' },
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /difficulty must be one of/);
    });

    it('should reject invalid content type in requestedTypes with HTTP 400', async () => {
      const res = await makeRequest(userACookieToken, {
        subjectId: subjectAId.toString(),
        parameters: { requestedTypes: ['INVALID_TYPE'] },
      });
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /Invalid content type/);
    });
  });

  describe('3. Resource Ownership & Hierarchy Validation', () => {
    it('should reject non-existent subjectId with HTTP 404', async () => {
      const nonExistentSubjectId = new mongoose.Types.ObjectId().toString();
      const res = await makeRequest(userACookieToken, { subjectId: nonExistentSubjectId });
      assert.equal(res.status, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Subject not found');
    });

    it('should reject access to subject belonging to User B when requested by User A with HTTP 403', async () => {
      const res = await makeRequest(userACookieToken, { subjectId: subjectBId.toString() });
      assert.equal(res.status, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Unauthorized to access this subject');
    });

    it('should prevent body spoofing of userId', async () => {
      // Mock generateContent to inspect context.userId passed to service
      let capturedContext = null;
      mock.method(aiGenerationService, 'generateContent', async (req) => {
        capturedContext = req.context;
        return {
          generatedContent: [
            { type: 'MCQ', question: 'Q1', options: ['A','B','C','D'], answer: 'A', sourceChunkIds: ['c1'] }
          ],
          meta: { totalItemsGenerated: 1 }
        };
      });

      // User A attempts to pass User B's userId in request body
      const res = await makeRequest(userACookieToken, {
        userId: userBId.toString(),
        subjectId: subjectAId.toString(),
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      // Verify the service received userAId (from token), NOT userBId (from body)
      assert.equal(capturedContext.userId, userAId.toString());
    });
  });

  describe('4. AI Service Integration & Response Standardization', () => {
    it('should return standardized success response when AI generation succeeds', async () => {
      const mockResult = {
        generatedContent: [
          {
            type: 'MCQ',
            question: 'What is TCP?',
            options: ['Protocol', 'Hardware', 'Language', 'Database'],
            answer: 'Protocol',
            sourceChunkIds: ['chunk_101'],
          },
        ],
        meta: {
          totalItemsGenerated: 1,
          difficulty: 'medium',
          contextChunksUsed: 3,
          isContextTruncated: false,
        },
      };

      mock.method(aiGenerationService, 'generateContent', async () => mockResult);

      const res = await makeRequest(userACookieToken, {
        subjectId: subjectAId.toString(),
        unitId: unitAId.toString(),
        topicId: topicAId.toString(),
        parameters: {
          totalItems: 1,
          difficulty: 'medium',
          requestedTypes: ['MCQ'],
        },
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.deepEqual(res.body.data, mockResult);
    });

    it('should handle AI service error gracefully without leaking secrets', async () => {
      const aiError = new Error('Insufficient study material to generate content. Please upload more materials.');
      aiError.statusCode = 400;
      mock.method(aiGenerationService, 'generateContent', async () => {
        throw aiError;
      });

      const res = await makeRequest(userACookieToken, {
        subjectId: subjectAId.toString(),
      });

      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, 'Insufficient study material to generate content. Please upload more materials.');
      
      // Ensure no credentials or API key in response
      const resString = JSON.stringify(res.body);
      assert.equal(resString.includes('GEMINI_API_KEY'), false);
      assert.equal(resString.includes('key='), false);
    });
  });
});
