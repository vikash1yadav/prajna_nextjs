import ClassService from '../services/classService.js';

class ClassController {
  constructor() {
    this.classService = new ClassService();
  }

  getClasses = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      // Extract optional user context from query params for testing/role-based requests
      const user = req.query.role_id ? {
        id: parseInt(req.query.user_id),
        role_id: parseInt(req.query.role_id),
        class_teacher: req.query.class_teacher
      } : null;

      const data = await this.classService.getClasses(id, user);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getClassSections = async (req, res, next) => {
    try {
      const { classId } = req.params;
      const data = await this.classService.getClassSections(classId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getClassTeachers = async (req, res, next) => {
    try {
      const session = req.query.session;
      if (!session) {
        return res.status(400).json({ success: false, error: 'Session query parameter is required' });
      }
      const data = await this.classService.getClassTeachers(session);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveClass = async (req, res, next) => {
    try {
      const { sections, ...classData } = req.body;
      const id = await this.classService.saveClass(classData, sections);
      return res.status(200).json({ success: true, message: 'Class saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteClass = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.classService.deleteClass(id);
      return res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default ClassController;
