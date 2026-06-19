import SchoolHouseService from '../services/schoolHouseService.js';

class SchoolHouseController {
  constructor() {
    this.schoolHouseService = new SchoolHouseService();
  }

  getHouses = async (req, res, next) => {
    try {
      const id = req.params.id || req.query.id || null;
      const data = await this.schoolHouseService.getHouses(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveHouse = async (req, res, next) => {
    try {
      const id = req.params.id || req.body.id || null;
      const houseData = {
        ...req.body,
        id: id ? parseInt(id) : undefined
      };
      const savedId = await this.schoolHouseService.saveHouse(houseData);
      return res.status(200).json({
        success: true,
        message: id ? 'House updated successfully' : 'House created successfully',
        id: savedId
      });
    } catch (error) {
      next(error);
    }
  };

  deleteHouse = async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await this.schoolHouseService.deleteHouse(id);
      return res.status(200).json({ success: true, message: 'House deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default SchoolHouseController;
