import LeaveService from '../services/leaveService.js';

class LeaveController {
  constructor() {
    this.leaveService = new LeaveService();
  }

  getLeaves = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.leaveService.getAll(classId, sectionId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveLeave = async (req, res, next) => {
    try {
      const { id, student_session_id, from_date, to_date, apply_date, reason, docs, status } = req.body;
      let data;
      if (id) {
        // Just general update if id is provided
        const existing = await this.leaveService.getById(parseInt(id));
        if (!existing) {
          return res.status(404).json({ success: false, message: 'Leave record not found' });
        }
        await existing.update({ student_session_id, from_date, to_date, apply_date, reason, docs, status });
        data = { id: parseInt(id) };
      } else {
        data = await this.leaveService.create({ student_session_id, from_date, to_date, apply_date, reason, docs, status });
      }
      return res.status(200).json({ success: true, message: 'Leave request saved successfully', data });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, staff_id } = req.body;
      await this.leaveService.updateStatus(parseInt(id), status, staff_id);
      return res.status(200).json({ success: true, message: 'Leave request status updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  deleteLeave = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.leaveService.delete(parseInt(id));
      return res.status(200).json({ success: true, message: 'Leave request deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default LeaveController;
