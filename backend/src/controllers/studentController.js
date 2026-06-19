import StudentService from '../services/studentService.js';

class StudentController {
  constructor() {
    this.studentService = new StudentService();
  }

  getStudents = async (req, res, next) => {
    try {
      const search = req.query.search || null;
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;
      const isActive = req.query.is_active || 'yes';

      let data;
      if (search !== null) {
        data = await this.studentService.searchStudent(search, session_id, isActive);
      } else if (classId !== null || sectionId !== null) {
        data = await this.studentService.getStudentsByClassSection(classId, sectionId, session_id, isActive);
      } else {
        data = await this.studentService.getStudent(null, session_id, isActive);
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getStudentById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;
      const data = await this.studentService.getStudent(parseInt(id), session_id);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Student not found' });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveStudent = async (req, res, next) => {
    try {
      const { session, ...studentData } = req.body;
      const id = await this.studentService.saveStudent(studentData, session);
      return res.status(200).json({ success: true, message: 'Student saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  updateStudent = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { session, ...studentData } = req.body;
      studentData.id = parseInt(id);
      const updatedId = await this.studentService.updateStudent(parseInt(id), studentData, session);
      return res.status(200).json({ success: true, message: 'Student updated successfully', id: updatedId });
    } catch (error) {
      next(error);
    }
  };

  deleteStudent = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.studentService.deleteStudent(id);
      return res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  bulkDeleteStudents = async (req, res, next) => {
    try {
      const { student_ids } = req.body;
      if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
        return res.status(400).json({ success: false, error: 'student_ids must be a non-empty array' });
      }
      await this.studentService.bulkDeleteStudents(student_ids);
      return res.status(200).json({ success: true, message: 'Students deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
  getMultiClassStudents = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.studentService.getMultiClassStudents(classId, sectionId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  updateMultiClassStudent = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { sessions } = req.body; // array of {class_id, section_id}
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      await this.studentService.saveMultiClassStudent(parseInt(id), sessions, session_id);
      return res.status(200).json({ success: true, message: 'Multi-class sessions updated successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default StudentController;
