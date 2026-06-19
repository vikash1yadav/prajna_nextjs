import AcademicsService from '../services/academicsService.js';

class AcademicsController {
  constructor() {
    this.service = new AcademicsService();
  }

  getSubjectGroups = async (req, res) => {
    try {
      const sessionId = req.query.session_id ? parseInt(req.query.session_id) : 1;
      const data = await this.service.getSubjectGroups(sessionId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  saveSubjectGroup = async (req, res) => {
    try {
      const { id, name, description, subject_ids, class_section_ids, session_id } = req.body;
      const sessionId = session_id ? parseInt(session_id) : 1;
      const data = await this.service.saveSubjectGroup(id, name, description, subject_ids, class_section_ids, sessionId);
      res.json({ success: true, message: 'Subject Group saved successfully', data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  deleteSubjectGroup = async (req, res) => {
    try {
      const { id } = req.params;
      await this.service.deleteSubjectGroup(parseInt(id));
      res.json({ success: true, message: 'Subject Group deleted successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  getClassTeachers = async (req, res) => {
    try {
      const sessionId = req.query.session_id ? parseInt(req.query.session_id) : 1;
      const data = await this.service.getClassTeachers(sessionId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  assignClassTeachers = async (req, res) => {
    try {
      const { class_id, section_id, staff_ids, session_id } = req.body;
      const sessionId = session_id ? parseInt(session_id) : 1;
      await this.service.assignClassTeachers(parseInt(class_id), parseInt(section_id), staff_ids, sessionId);
      res.json({ success: true, message: 'Class teachers assigned successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  getTimetable = async (req, res) => {
    try {
      const { class_id, section_id, subject_group_id, session_id } = req.query;
      const sessionId = session_id ? parseInt(session_id) : 1;
      const data = await this.service.getTimetable(
        parseInt(class_id),
        parseInt(section_id),
        parseInt(subject_group_id),
        sessionId
      );
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  saveTimetable = async (req, res) => {
    try {
      const { class_id, section_id, subject_group_id, entries, session_id } = req.body;
      const sessionId = session_id ? parseInt(session_id) : 1;
      await this.service.saveTimetable(
        parseInt(class_id),
        parseInt(section_id),
        parseInt(subject_group_id),
        entries,
        sessionId
      );
      res.json({ success: true, message: 'Subject Timetable saved successfully' });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  getTeacherTimetable = async (req, res) => {
    try {
      const { staff_id } = req.params;
      const sessionId = req.query.session_id ? parseInt(req.query.session_id) : 1;
      const data = await this.service.getTeacherTimetable(parseInt(staff_id), sessionId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  promoteStudents = async (req, res) => {
    try {
      const { student_session_ids, from_class_id, from_section_id, to_class_id, to_section_id, from_session_id, to_session_id } = req.body;
      const data = await this.service.promoteStudents(
        student_session_ids,
        parseInt(from_class_id),
        parseInt(from_section_id),
        parseInt(to_class_id),
        parseInt(to_section_id),
        parseInt(from_session_id),
        parseInt(to_session_id)
      );
      res.json({ success: true, message: `${data.length} students promoted successfully`, data });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
}

export default AcademicsController;
