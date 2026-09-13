import * as studyMaterialService from '../services/studyMaterialService.js';

export const uploadMaterial = async (req, res, next) => {
  try {
    const { title, subjectId, unitId, topicId } = req.body;
    const file = req.file;

    if (!file) {
      const error = new Error('File is required');
      error.statusCode = 400;
      throw error;
    }

    if (!title || !subjectId) {
      const error = new Error('Title and subjectId are required');
      error.statusCode = 400;
      throw error;
    }

    const material = await studyMaterialService.createStudyMaterial(req.user.id, {
      title,
      subjectId,
      unitId,
      topicId,
      fileBuffer: file.buffer,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    });

    res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully',
      material,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaterialsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { unitId, topicId } = req.query;

    const materials = await studyMaterialService.getMaterials(req.user.id, subjectId, { unitId, topicId });

    res.status(200).json({
      success: true,
      materials,
    });
  } catch (error) {
    next(error);
  }
};

export const getMaterialById = async (req, res, next) => {
  try {
    const { materialId } = req.params;

    const material = await studyMaterialService.getMaterialById(req.user.id, materialId);

    res.status(200).json({
      success: true,
      material,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;

    await studyMaterialService.deleteMaterial(req.user.id, materialId);

    res.status(200).json({
      success: true,
      message: 'Study material deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
