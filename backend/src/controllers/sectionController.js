import SectionService from '../services/sectionService.js';

class SectionController {
  constructor() {
    this.sectionService = new SectionService();
  }

  getSections = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const data = await this.sectionService.getSection(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getSectionsByClass = async (req, res, next) => {
    try {
      const { classId } = req.params;
      // Extract optional user context from query params for testing/role-based requests
      const user = req.query.role_id ? {
        id: parseInt(req.query.user_id),
        role_id: parseInt(req.query.role_id),
        class_teacher: req.query.class_teacher,
        currentSession: req.query.currentSession ? parseInt(req.query.currentSession) : null
      } : null;

      const data = await this.sectionService.getSectionsByClass(classId, user);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveSection = async (req, res, next) => {
    try {
      const id = await this.sectionService.saveSection(req.body);
      return res.status(200).json({ success: true, message: 'Section saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteSection = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.sectionService.deleteSection(id);
      return res.status(200).json({ success: true, message: 'Section deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default SectionController;
