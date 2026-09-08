import {
  confirmSyllabusSubjects,
  createSyllabusImport,
  getSyllabusImport,
  processSyllabusImport,
} from '../services/syllabusService.js';

const getUserId = (req) => req.user.id;

export const uploadSyllabusController = async (req, res, next) => {
  try {
    const syllabusImport = await createSyllabusImport(getUserId(req), req.file);
    setImmediate(() => processSyllabusImport(syllabusImport._id).catch(() => {}));
    return res.status(202).json({
      success: true,
      message: 'Syllabus uploaded successfully',
      importId: syllabusImport._id,
      status: syllabusImport.status,
    });
  } catch (error) {
    return next(error);
  }
};

export const getSyllabusImportController = async (req, res, next) => {
  try {
    const syllabusImport = await getSyllabusImport(getUserId(req), req.params.importId);
    return res.status(200).json({ success: true, syllabusImport });
  } catch (error) {
    return next(error);
  }
};

export const confirmSyllabusController = async (req, res, next) => {
  try {
    const result = await confirmSyllabusSubjects(
      getUserId(req),
      req.params.importId,
      req.body.subjects,
    );
    return res.status(201).json({
      success: true,
      message: 'Confirmed subjects created successfully',
      subjects: result.subjects,
    });
  } catch (error) {
    return next(error);
  }
};
