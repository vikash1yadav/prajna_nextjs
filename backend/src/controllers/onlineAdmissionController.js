import OnlineAdmissionService from '../services/onlineAdmissionService.js';

class OnlineAdmissionController {
  constructor() {
    this.onlineAdmissionService = new OnlineAdmissionService();
  }

  getAdmissions = async (req, res, next) => {
    try {
      const search = req.query.search || null;
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;

      const data = await this.onlineAdmissionService.getAdmissions(classId, sectionId, search);

      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  enrollAdmission = async (req, res, next) => {
    try {
      const { id } = req.params;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const newStudentId = await this.onlineAdmissionService.enrollAdmission(id, session_id);
      
      return res.status(200).json({ success: true, message: 'Student enrolled successfully', student_id: newStudentId });
    } catch (error) {
      next(error);
    }
  };

  deleteAdmission = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.onlineAdmissionService.deleteAdmission(id);
      return res.status(200).json({ success: true, message: 'Online admission deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default OnlineAdmissionController;
