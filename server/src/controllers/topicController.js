import { getTopic, listTopics } from '../services/unitTopicService.js';

export const listTopicsController = async (req, res, next) => {
  try {
    const topics = await listTopics(req.user.id, req.params.unitId);
    return res.status(200).json({ success: true, data: topics });
  } catch (error) {
    return next(error);
  }
};

export const getTopicController = async (req, res, next) => {
  try {
    const topic = await getTopic(req.user.id, req.params.topicId);
    return res.status(200).json({ success: true, data: topic });
  } catch (error) {
    return next(error);
  }
};
