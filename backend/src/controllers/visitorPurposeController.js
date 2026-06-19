import VisitorPurposeService from '../services/visitorPurposeService.js';

class VisitorPurposeController {
  constructor() {
    this.service = new VisitorPurposeService();
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
        message: id ? 'Visitor purpose updated successfully' : 'Visitor purpose created successfully',
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
      return res.status(200).json({ success: true, message: 'Visitor purpose deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default VisitorPurposeController;
