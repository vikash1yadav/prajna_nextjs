import SubjectService from '../services/subjectService.js';

class SubjectController {
  constructor() {
    this.subjectService = new SubjectService();
  }

  getSubjects = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      // Extract optional user context from query params for testing/role-based requests
      const user = req.query.role_id ? {
        id: parseInt(req.query.user_id),
        role_id: parseInt(req.query.role_id),
        class_teacher: req.query.class_teacher,
        currentSession: req.query.currentSession ? parseInt(req.query.currentSession) : null
      } : null;

      const data = await this.subjectService.getSubjects(id, user);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveSubject = async (req, res, next) => {
    try {
      const id = await this.subjectService.saveSubject(req.body);
      return res.status(200).json({ success: true, message: 'Subject saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteSubject = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.subjectService.deleteSubject(id);
      return res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default SubjectController;
