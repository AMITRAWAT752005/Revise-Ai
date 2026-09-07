import UserProgress from '../models/UserProgress.js';
import Subject from '../models/Subject.js';

export const ensureUserProgress = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to initialize progress.');
  }

  return UserProgress.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

export const syncSubjectCount = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required to synchronize progress.');
  }

  const subjectCount = await Subject.countDocuments({ userId });
  await ensureUserProgress(userId);

  return UserProgress.findOneAndUpdate(
    { userId },
    { $set: { subjectCount } },
    { new: true },
  );
};

export const updateActivityProgress = async (userId, updates = {}) => {
  if (!userId) {
    throw new Error('User ID is required to update progress.');
  }

  const allowedFields = [
    'xp',
    'level',
    'streak',
    'longestStreak',
    'totalQuestionsAnswered',
    'totalQuestionsCorrect',
    'totalStudyTime',
    'dailyRevisionGoal',
    'dailyRevisionCompleted',
    'lastActivityAt',
    'lastRevisionAt',
  ];

  const progressUpdates = Object.fromEntries(
    Object.entries(updates).filter(([field, value]) => allowedFields.includes(field) && value !== undefined),
  );

  await ensureUserProgress(userId);

  return UserProgress.findOneAndUpdate(
    { userId },
    { $set: progressUpdates },
    { new: true, runValidators: true },
  );
};
