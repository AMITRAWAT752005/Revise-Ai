import UserProgress from '../models/UserProgress.js';
import Subject from '../models/Subject.js';

export const ensureUserProgress = async (userId, session = null) => {
  if (!userId) {
    throw new Error('User ID is required to initialize progress.');
  }

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };
  if (session) {
    options.session = session;
  }

  return UserProgress.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId } },
    options,
  );
};

export const syncSubjectCount = async (userId, session = null) => {
  if (!userId) {
    throw new Error('User ID is required to synchronize progress.');
  }

  const query = Subject.countDocuments({ userId });
  if (session) {
    query.session(session);
  }
  const subjectCount = await query;

  await ensureUserProgress(userId, session);

  const options = { new: true };
  if (session) {
    options.session = session;
  }

  return UserProgress.findOneAndUpdate(
    { userId },
    { $set: { subjectCount } },
    options,
  );
};

export const incrementSubjectCount = async (userId, session = null) => {
  if (!userId) {
    throw new Error('User ID is required to increment subject count.');
  }

  await ensureUserProgress(userId, session);

  const options = { new: true };
  if (session) {
    options.session = session;
  }

  return UserProgress.findOneAndUpdate(
    { userId },
    { $inc: { subjectCount: 1 } },
    options,
  );
};

export const decrementSubjectCount = async (userId, session = null) => {
  if (!userId) {
    throw new Error('User ID is required to decrement subject count.');
  }

  await ensureUserProgress(userId, session);

  const options = { new: true };
  if (session) {
    options.session = session;
  }

  return UserProgress.findOneAndUpdate(
    { userId },
    { $inc: { subjectCount: -1 } },
    options,
  );
};

export const updateActivityProgress = async (userId, updates = {}, session = null) => {
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

  await ensureUserProgress(userId, session);

  const options = { new: true, runValidators: true };
  if (session) {
    options.session = session;
  }

  return UserProgress.findOneAndUpdate(
    { userId },
    { $set: progressUpdates },
    options,
  );
};

