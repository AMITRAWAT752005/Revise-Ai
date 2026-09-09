import { getUnit, listUnits } from '../services/unitTopicService.js';

export const listUnitsController = async (req, res, next) => {
  try {
    const units = await listUnits(req.user.id, req.params.subjectId);
    return res.status(200).json({ success: true, data: units });
  } catch (error) {
    return next(error);
  }
};

export const getUnitController = async (req, res, next) => {
  try {
    const unit = await getUnit(req.user.id, req.params.unitId);
    return res.status(200).json({ success: true, data: unit });
  } catch (error) {
    return next(error);
  }
};
