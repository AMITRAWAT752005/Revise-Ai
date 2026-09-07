import { getDashboard } from '../services/dashboardService.js';

export const getDashboardController = async (req, res, next) => {
  try {
    const dashboard = await getDashboard(req.user.id);

    return res.status(200).json({
      success: true,
      ...dashboard,
    });
  } catch (error) {
    if (error.statusCode) {
      res.statusCode = error.statusCode;
    }
    return next(error);
  }
};
