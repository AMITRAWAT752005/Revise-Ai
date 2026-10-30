import test from 'node:test';
import assert from 'node:assert/strict';

import { Subject } from '../src/models/Subject.js';
import { Unit } from '../src/models/Unit.js';
import { Topic } from '../src/models/Topic.js';
import { StudyMaterial } from '../src/models/StudyMaterial.js';
import {
  validateOwnership,
  validateUnitHierarchy,
  validateTopicHierarchy,
  validateMaterialHierarchy,
  validateFullHierarchy,
  UnauthorizedError,
  InvalidHierarchyError,
  NotFoundError,
} from '../src/services/validationService.js';

const userId = '507f1f77bcf86cd799439011';
const otherUserId = '507f1f77bcf86cd799439012';
const subjectId = '507f1f77bcf86cd799439013';
const unitId = '507f1f77bcf86cd799439014';
const topicId = '507f1f77bcf86cd799439015';
const materialId = '507f1f77bcf86cd799439016';

const originalSubjectFindById = Subject.findById;
const originalUnitFindById = Unit.findById;
const originalTopicFindById = Topic.findById;
const originalMaterialFindById = StudyMaterial.findById;

const restoreMocks = () => {
  Subject.findById = originalSubjectFindById;
  Unit.findById = originalUnitFindById;
  Topic.findById = originalTopicFindById;
  StudyMaterial.findById = originalMaterialFindById;
};

const installValidHierarchy = () => {
  Subject.findById = async (id) => ({ _id: id, userId });
  Unit.findById = async (id) => ({ _id: id, subjectId });
  Topic.findById = async (id) => ({ _id: id, unitId });
  StudyMaterial.findById = async (id) => ({ _id: id, topicId, userId, subjectId });
};

test('A4-1 — ownership validation accepts matching user and rejects mismatched ownership', async () => {
  installValidHierarchy();

  const ok = await validateOwnership(userId, subjectId);
  assert.equal(ok._id.toString(), subjectId);

  await assert.rejects(async () => {
    await validateOwnership(otherUserId, subjectId);
  }, (error) => error instanceof UnauthorizedError);

  restoreMocks();
});

test('A4-2 — hierarchy validation accepts valid subject/unit/topic/material chain', async () => {
  installValidHierarchy();

  await assert.doesNotReject(async () => {
    await validateUnitHierarchy(subjectId, unitId);
    await validateTopicHierarchy(unitId, topicId);
    await validateMaterialHierarchy(topicId, materialId);
  });

  restoreMocks();
});

test('A4-3 — broken hierarchy is rejected with InvalidHierarchyError', async () => {
  installValidHierarchy();
  Unit.findById = async () => ({ _id: unitId, subjectId: '507f1f77bcf86cd799439099' });

  await assert.rejects(async () => {
    await validateUnitHierarchy(subjectId, unitId);
  }, (error) => error instanceof InvalidHierarchyError);

  Topic.findById = async () => ({ _id: topicId, unitId: '507f1f77bcf86cd799439099' });
  await assert.rejects(async () => {
    await validateTopicHierarchy(unitId, topicId);
  }, (error) => error instanceof InvalidHierarchyError);

  StudyMaterial.findById = async () => ({ _id: materialId, topicId: '507f1f77bcf86cd799439099', userId, subjectId });
  await assert.rejects(async () => {
    await validateMaterialHierarchy(topicId, materialId);
  }, (error) => error instanceof InvalidHierarchyError);

  restoreMocks();
});

test('A4-4 — missing and invalid IDs fail cleanly', async () => {
  installValidHierarchy();

  await assert.rejects(async () => {
    await validateOwnership(userId, null);
  }, (error) => error instanceof NotFoundError || error instanceof InvalidHierarchyError);

  await assert.rejects(async () => {
    await validateUnitHierarchy(subjectId, 'not-a-valid-id');
  }, (error) => error instanceof NotFoundError || error instanceof InvalidHierarchyError);

  await assert.rejects(async () => {
    await validateTopicHierarchy('not-a-valid-id', topicId);
  }, (error) => error instanceof NotFoundError || error instanceof InvalidHierarchyError);

  await assert.rejects(async () => {
    await validateFullHierarchy(userId, subjectId, unitId, null, materialId);
  }, (error) => error instanceof InvalidHierarchyError || error instanceof NotFoundError);

  restoreMocks();
});

test('A4-5 — full hierarchy validation joins ownership and chain checks', async () => {
  installValidHierarchy();

  const full = await validateFullHierarchy(userId, subjectId, unitId, topicId, materialId);
  assert.equal(full.subjectId.toString(), subjectId);
  assert.equal(full.unitId.toString(), unitId);
  assert.equal(full.topicId.toString(), topicId);
  assert.equal(full.materialId.toString(), materialId);

  restoreMocks();
});
