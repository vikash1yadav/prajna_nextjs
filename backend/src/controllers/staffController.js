import StaffService from '../services/staffService.js';

class StaffController {
  constructor() {
    this.staffService = new StaffService();
  }

  // --- STAFF CONTROLLERS ---
  getStaff = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const search = req.query.search || null;
      const active = req.query.active !== undefined ? parseInt(req.query.active) : 1;

      let data;
      if (search) {
        data = await this.staffService.searchStaff(search, active);
      } else {
        data = await this.staffService.getStaff(id);
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getStaffProfile = async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await this.staffService.getStaffProfile(id);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Staff member not found' });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveStaff = async (req, res, next) => {
    try {
      const { roleId, ...staffData } = req.body;
      const id = await this.staffService.saveStaff(staffData, roleId);
      return res.status(200).json({ success: true, message: 'Staff profile saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteStaff = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.staffService.deleteStaff(id);
      return res.status(200).json({ success: true, message: 'Staff deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- ROLE CONTROLLERS ---
  getRoles = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const data = await this.staffService.getRoles(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveRole = async (req, res, next) => {
    try {
      const id = await this.staffService.saveRole(req.body);
      return res.status(200).json({ success: true, message: 'Role saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteRole = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.staffService.deleteRole(id);
      return res.status(200).json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default StaffController;
