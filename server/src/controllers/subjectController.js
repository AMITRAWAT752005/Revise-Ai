import Subject from '../models/Subject.js';
import { syncSubjectCount } from '../services/userProgressService.js';

export const createSubjectController = async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      return res.status(400).json({ error: 'Subject name is required.' });
    }

    const subject = await Subject.create({
      name,
      userId: req.userId,
      ...(typeof req.body?.colour === 'string' ? { colour: req.body.colour } : {}),
    });

    const progress = await syncSubjectCount(req.userId);

    return res.status(201).json({ subject, progress });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error creating subject.' });
  }
};

export const listSubjectsController = async (req, res) => {
  try {
    const subjects = await Subject.find({ userId: req.userId }).sort({ createdAt: -1 });
    const progress = await syncSubjectCount(req.userId);

    return res.status(200).json({ subjects, progress });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error retrieving subjects.' });
  }
};

export const deleteSubjectController = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.subjectId,
      userId: req.userId,
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const progress = await syncSubjectCount(req.userId);

    return res.status(200).json({ message: 'Subject deleted successfully.', progress });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error deleting subject.' });
  }
};
