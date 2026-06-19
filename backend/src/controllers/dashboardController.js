import DashboardService from '../services/dashboardService.js';

class DashboardController {
  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboardStats = async (req, res, next) => {
    try {
      const sessionId = req.query.session_id ? parseInt(req.query.session_id) : 21;
      const data = await this.dashboardService.getStats(sessionId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export default DashboardController;
