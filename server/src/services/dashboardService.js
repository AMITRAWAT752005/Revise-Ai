import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import Subject from '../models/Subject.js';

export const getDashboard = async (userId) => {
  const [user, progress, subjects] = await Promise.all([
    User.findById(userId).select('name avatar'),
    UserProgress.findOne({ userId }),
    Subject.find({ userId }).select('_id name'),
  ]);

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

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
    },
    subjects: subjects.map(({ _id, name }) => ({ _id, name })),
  };
};
