import {
  createSubject,
  deleteSubject,
  getSubject,
  listSubjects,
  updateSubject,
} from '../services/subjectService.js';

const getUserId = (req) => req.user.id;

const handleControllerError = (res, next, error) => {
  if (next) return next(error);
  return res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Subject operation failed.',
  });
};

export const createSubjectController = async (req, res, next) => {
  try {
    const result = await createSubject(getUserId(req), req.body);
    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject: result.subject,
      progress: result.progress,
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
};

export const listSubjectsController = async (req, res, next) => {
  try {
    const result = await listSubjects(getUserId(req));
    return res.status(200).json({
      success: true,
      message: 'Subjects fetched successfully',
      subjects: result.subjects,
      progress: result.progress,
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
};

export const getSubjectByIdController = async (req, res, next) => {
  try {
    const subject = await getSubject(getUserId(req), req.params.subjectId);
    return res.status(200).json({ success: true, subject });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
};

export const updateSubjectController = async (req, res, next) => {
  try {
    const subject = await updateSubject(getUserId(req), req.params.subjectId, req.body);
    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully',
      subject,
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
};

export const deleteSubjectController = async (req, res, next) => {
  try {
    const result = await deleteSubject(getUserId(req), req.params.subjectId);
    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.',
      progress: result.progress,
    });
  } catch (error) {
    return handleControllerError(res, next, error);
  }
};

