import GeneralCallService from '../services/generalCallService.js';

class GeneralCallController {
  constructor() {
    this.service = new GeneralCallService();
  }

  get = async (req, res, next) => {
    try {
      const id = req.params.id || req.query.id || null;
      const data = await this.service.get(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  save = async (req, res, next) => {
    try {
      const id = req.params.id || req.body.id || null;
      const payload = {
        ...req.body,
        id: id ? parseInt(id) : undefined
      };
      const savedId = await this.service.add(payload);
      return res.status(200).json({
        success: true,
        message: id ? 'Call record updated successfully' : 'Call record created successfully',
        id: savedId
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await this.service.remove(id);
      return res.status(200).json({ success: true, message: 'Call record deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default GeneralCallController;
