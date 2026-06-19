import DisableReasonService from '../services/disableReasonService.js';

class DisableReasonController {
  constructor() {
    this.disableReasonService = new DisableReasonService();
  }

  getReasons = async (req, res, next) => {
    try {
      const id = req.params.id || req.query.id || null;
      const data = await this.disableReasonService.getReasons(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveReason = async (req, res, next) => {
    try {
      const id = req.params.id || req.body.id || null;
      const reasonData = {
        ...req.body,
        id: id ? parseInt(id) : undefined
      };
      const savedId = await this.disableReasonService.saveReason(reasonData);
      return res.status(200).json({
        success: true,
        message: id ? 'Reason updated successfully' : 'Reason created successfully',
        id: savedId
      });
    } catch (error) {
      next(error);
    }
  };

  deleteReason = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await this.disableReasonService.deleteReason(id);
      return res.status(200).json({ success: true, message: 'Reason deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default DisableReasonController;
