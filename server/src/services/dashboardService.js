import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Subject from '../models/Subject.js';

export const getDashboard = async (userId) => {
  const [user, progress, subjects] = await Promise.all([
    User.findById(userId).select('name avatar'),
    UserProgress.findOne({ userId }),
    Subject.find({ userId })
      .select('_id name colour mastery totalUnits totalTopics totalQuestions status createdAt updatedAt')
      .sort({ createdAt: -1 }),
  ]);

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const avgMastery =
    subjects.length > 0
      ? Math.round(subjects.reduce((sum, s) => sum + (s.mastery || 0), 0) / subjects.length)
      : 0;

  return {
    dashboardType: subjects.length === 0 ? 'new_user' : 'active_user',
    user: {
      name: user.name,
      avatar: user.avatar ?? null,
    },
    progress: {
      subjectCount: progress?.subjectCount ?? subjects.length,
      xp: progress?.xp ?? 0,
      level: progress?.level ?? 1,
      streak: progress?.streak ?? 0,
      longestStreak: progress?.longestStreak ?? 0,
      dailyCompleted: progress?.dailyRevisionCompleted ?? 0,
      dailyTarget: progress?.dailyRevisionGoal ?? (subjects.length > 0 ? 20 : 0),
      readiness: avgMastery,
      smartFocus: subjects[0]?.name || 'Active Focus',
    },
    subjects: subjects.map(
      ({ _id, name, colour, mastery, totalUnits, totalTopics, totalQuestions, status, createdAt, updatedAt }) => ({
        _id,
        name,
        colour,
        mastery: mastery ?? 0,
        totalUnits: totalUnits ?? 0,
        totalTopics: totalTopics ?? 0,
        totalQuestions: totalQuestions ?? 0,
        status: status ?? 'not_started',
        createdAt,
        updatedAt,
      }),
    ),
  };
};
