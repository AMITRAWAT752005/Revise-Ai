import mongoose from 'mongoose';
import Subject from '../models/Subject.js';
import { syncSubjectCount } from '../services/userProgressService.js';

/**
 * Escapes special regex characters in a string
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createSubjectController = async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';

    if (!name) {
      return res.status(400).json({ success: false, error: 'Subject name is required.' });
    }

    const userId = req.userId;

    // Check duplicate subject name for this user (case-insensitive)
    const existingSubject = await Subject.findOne({
      userId,
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    });

    if (existingSubject) {
      return res.status(400).json({
        success: false,
        error: 'A subject with this name already exists.',
      });
    }

    const subjectData = {
      name,
      userId,
      ...(typeof req.body?.colour === 'string' ? { colour: req.body.colour } : {}),
      ...(typeof req.body?.mastery === 'number' ? { mastery: req.body.mastery } : {}),
    };

    let subject;
    let progress;
    let session = null;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const created = await Subject.create([subjectData], { session });
      subject = created[0];
      progress = await syncSubjectCount(userId, session);

      await session.commitTransaction();
    } catch (txError) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }

      // If transactions are not supported on standalone MongoDB instance, fallback safely
      const isTxUnsupported =
        txError.message &&
        (txError.message.includes('Transaction numbers are only allowed') ||
          txError.message.includes('replica set') ||
          txError.code === 20);

      if (isTxUnsupported) {
        subject = await Subject.create(subjectData);
        progress = await syncSubjectCount(userId);
      } else {
        throw txError;
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject,
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error creating subject.',
    });
  }
};

export const listSubjectsController = async (req, res) => {
  try {
    const userId = req.userId;
    const subjects = await Subject.find({ userId }).sort({ createdAt: -1 });
    const progress = await syncSubjectCount(userId);

    return res.status(200).json({
      success: true,
      message: 'Subjects fetched successfully',
      subjects: subjects || [],
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error retrieving subjects.',
    });
  }
};

export const deleteSubjectController = async (req, res) => {
  try {
    const userId = req.userId;
    const { subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ success: false, error: 'Invalid subject ID format.' });
    }

    let subject = null;
    let progress = null;
    let session = null;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      subject = await Subject.findOneAndDelete({ _id: subjectId, userId }, { session });

      if (!subject) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, error: 'Subject not found.' });
      }

      progress = await syncSubjectCount(userId, session);
      await session.commitTransaction();
    } catch (txError) {
      if (session && session.inTransaction()) {
        await session.abortTransaction();
      }

      const isTxUnsupported =
        txError.message &&
        (txError.message.includes('Transaction numbers are only allowed') ||
          txError.message.includes('replica set') ||
          txError.code === 20);

      if (isTxUnsupported) {
        subject = await Subject.findOneAndDelete({ _id: subjectId, userId });
        if (!subject) {
          return res.status(404).json({ success: false, error: 'Subject not found.' });
        }
        progress = await syncSubjectCount(userId);
      } else {
        throw txError;
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.',
      progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error deleting subject.',
    });
  }
};

