import { StudyMaterial } from '../models/StudyMaterial.js';
import { Subject } from '../models/Subject.js';
import { Unit } from '../models/Unit.js';
import { Topic } from '../models/Topic.js';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinaryService.js';
import { deleteLocalMaterial, saveMaterialLocally } from './localFileStorageService.js';
import { processStudyMaterial } from './documentProcessingService.js';

/**
 * Validates ownership of the hierarchy for a given subject, unit, or topic.
 * Throws appropriate errors if missing or unauthorized.
 */
export const validateHierarchyOwnership = async (userId, subjectId, unitId, topicId) => {
  // Validate Subject
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    const error = new Error('Subject not found');
    error.statusCode = 404;
    throw error;
  }
  if (subject.userId.toString() !== userId.toString()) {
    const error = new Error('Unauthorized to access this subject');
    error.statusCode = 403;
    throw error;
  }

  // Validate Unit if provided
  if (unitId) {
    const unit = await Unit.findById(unitId);
    if (!unit) {
      const error = new Error('Unit not found');
      error.statusCode = 404;
      throw error;
    }
    if (unit.subjectId.toString() !== subjectId.toString()) {
      const error = new Error('Unit does not belong to the specified subject');
      error.statusCode = 400;
      throw error;
    }
  }

  // Validate Topic if provided
  if (topicId) {
    if (!unitId) {
      const error = new Error('unitId is required when topicId is provided');
      error.statusCode = 400;
      throw error;
    }
    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error('Topic not found');
      error.statusCode = 404;
      throw error;
    }
    if (topic.unitId.toString() !== unitId.toString()) {
      const error = new Error('Topic does not belong to the specified unit');
      error.statusCode = 400;
      throw error;
    }
  }
};

const uploadMaterialFile = async (fileBuffer, fileName) => {
  try {
    return await uploadToCloudinary(fileBuffer, fileName);
  } catch (error) {
    if (!error.isCloudinaryUploadError) throw error;

    console.warn(`Cloudinary upload failed, saving material locally instead: ${error.message}`);
    return saveMaterialLocally(fileBuffer, fileName);
  }
};

/**
 * Uploads a file and saves the metadata in MongoDB.
 */
export const createStudyMaterial = async (userId, { title, subjectId, unitId, topicId, fileBuffer, fileName, fileType, fileSize }) => {
  await validateHierarchyOwnership(userId, subjectId, unitId, topicId);

  const uploadResult = await uploadMaterialFile(fileBuffer, fileName);

  const newMaterial = new StudyMaterial({
    userId,
    subjectId,
    unitId: unitId || undefined,
    topicId: topicId || undefined,
    title,
    fileName,
    fileType,
    fileSize,
    fileUrl: uploadResult.secure_url,
    processingStatus: 'uploaded'
  });

  await newMaterial.save();

  // Trigger the background processing pipeline
  processStudyMaterial(newMaterial._id, fileBuffer).catch(err => 
    console.error(`[BackgroundProcessing] Failed to kick off processing for material ${newMaterial._id}`, err)
  );

  return newMaterial;
};

/**
 * Retrieves materials for a given subject (with optional unit/topic filters) belonging to the user.
 */
export const getMaterials = async (userId, subjectId, queryOptions = {}) => {
  await validateHierarchyOwnership(userId, subjectId);

  const filter = { userId, subjectId };
  if (queryOptions.unitId) filter.unitId = queryOptions.unitId;
  if (queryOptions.topicId) filter.topicId = queryOptions.topicId;

  const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
  return materials;
};

/**
 * Retrieves a single material by ID belonging to the user.
 */
export const getMaterialById = async (userId, materialId) => {
  const material = await StudyMaterial.findOne({ _id: materialId, userId });
  if (!material) {
    const error = new Error('Study material not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }
  return material;
};

/**
 * Deletes a material from MongoDB and Cloudinary.
 */
export const deleteMaterial = async (userId, materialId) => {
  const material = await StudyMaterial.findOne({ _id: materialId, userId });
  if (!material) {
    const error = new Error('Study material not found or unauthorized');
    error.statusCode = 404;
    throw error;
  }

  if (material.fileUrl.startsWith('/uploads/materials/')) {
    try {
      await deleteLocalMaterial(material.fileUrl);
    } catch (err) {
      console.error(`Failed to delete local material (${material.fileUrl})`, err);
    }
  } else {
    // Extract public_id from fileUrl
    // E.g., https://res.cloudinary.com/.../upload/v.../reviseai_materials/file.pdf -> reviseai_materials/file.pdf
    const urlParts = material.fileUrl.split('/');
    const fileNameWithExt = urlParts.pop();
    const folder = urlParts.pop();
    const publicId = `${folder}/${fileNameWithExt}`;

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(publicId);
    } catch (err) {
      console.error(`Failed to delete file from Cloudinary (publicId: ${publicId})`, err);
      // Continue with deletion from DB even if Cloudinary fails, or we could abort.
      // Opting to continue to not leave orphaned DB records.
    }
  }

  await StudyMaterial.deleteOne({ _id: materialId });
  return true;
};
