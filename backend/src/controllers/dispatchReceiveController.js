import DispatchReceiveService from '../services/dispatchReceiveService.js';

class DispatchReceiveController {
  constructor() {
    this.service = new DispatchReceiveService();
  }

  get = async (req, res, next) => {
    try {
      const id = req.params.id || null;
      const type = req.query.type || null;
      const data = await this.service.get(id, type);
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
        message: id ? 'Postal record updated successfully' : 'Postal record created successfully',
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
      return res.status(200).json({ success: true, message: 'Postal record deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default DispatchReceiveController;
