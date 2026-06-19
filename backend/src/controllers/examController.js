import ExamService from '../services/examService.js';

class ExamController {
  constructor() {
    this.examService = new ExamService();
  }

  // --- Exams ---
  getExams = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;
      const data = await this.examService.getExams(id, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveExam = async (req, res, next) => {
    try {
      const id = await this.examService.saveExam(req.body);
      return res.status(200).json({ success: true, message: 'Exam saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteExam = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.examService.deleteExam(id);
      return res.status(200).json({ success: true, message: 'Exam deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Exam Schedules ---
  saveExamSchedule = async (req, res, next) => {
    try {
      const id = await this.examService.saveExamSchedule(req.body);
      return res.status(200).json({ success: true, message: 'Exam schedule saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  getExamSchedules = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const examId = req.query.exam_id ? parseInt(req.query.exam_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.examService.getExamSchedules(classId, sectionId, examId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getExamByClassAndSection = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.examService.getExamByClassAndSection(classId, sectionId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  // --- Exam Groups ---
  getExamGroups = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const data = await this.examService.getExamGroups(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveExamGroup = async (req, res, next) => {
    try {
      const id = await this.examService.saveExamGroup(req.body);
      return res.status(200).json({ success: true, message: 'Exam group saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteExamGroup = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.examService.deleteExamGroup(id);
      return res.status(200).json({ success: true, message: 'Exam group deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Grades ---
  getGrades = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const data = await this.examService.getGrades(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveGrade = async (req, res, next) => {
    try {
      const id = await this.examService.saveGrade(req.body);
      return res.status(200).json({ success: true, message: 'Grade saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteGrade = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.examService.deleteGrade(id);
      return res.status(200).json({ success: true, message: 'Grade deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Divisions ---
  getDivisions = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const data = await this.examService.getDivisions(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveDivision = async (req, res, next) => {
    try {
      const id = await this.examService.saveDivision(req.body);
      return res.status(200).json({ success: true, message: 'Division saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteDivision = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.examService.deleteDivision(id);
      return res.status(200).json({ success: true, message: 'Division deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Template Admitcards ---
  getTemplateAdmitcards = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const data = await this.examService.getTemplateAdmitcards(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveTemplateAdmitcard = async (req, res, next) => {
    try {
      const id = await this.examService.saveTemplateAdmitcard(req.body);
      return res.status(200).json({ success: true, message: 'Template saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteTemplateAdmitcard = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.examService.deleteTemplateAdmitcard(id);
      return res.status(200).json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Template Marksheets ---
  getTemplateMarksheets = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      const data = await this.examService.getTemplateMarksheets(id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveTemplateMarksheet = async (req, res, next) => {
    try {
      const id = await this.examService.saveTemplateMarksheet(req.body);
      return res.status(200).json({ success: true, message: 'Template saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteTemplateMarksheet = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.examService.deleteTemplateMarksheet(id);
      return res.status(200).json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Connected Exams ---
  getExamsByGroupId = async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const data = await this.examService.getExamsByGroupId(groupId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveExamGroupExam = async (req, res, next) => {
    try {
      const id = await this.examService.saveExamGroupExam(req.body);
      return res.status(200).json({ success: true, message: 'Exam saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteExamGroupExam = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.examService.deleteExamGroupExam(id);
      return res.status(200).json({ success: true, message: 'Exam removed successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Subject Mappings ---
  getExamSubjects = async (req, res, next) => {
    try {
      const { examGroupExamId } = req.params;
      const data = await this.examService.getExamSubjects(examGroupExamId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveExamSubjects = async (req, res, next) => {
    try {
      const { examGroupExamId } = req.params;
      const { subjects } = req.body;
      await this.examService.saveExamSubjects(examGroupExamId, subjects);
      return res.status(200).json({ success: true, message: 'Exam subjects connected successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Student Enrollment ---
  getExamGroupStudents = async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.examService.getExamGroupStudents(groupId, classId, sectionId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveExamGroupStudents = async (req, res, next) => {
    try {
      const { groupId } = req.params;
      const { student_ids, session_id } = req.body;
      const currentSession = session_id ? parseInt(session_id) : 21;

      await this.examService.saveExamGroupStudents(groupId, student_ids, currentSession);
      return res.status(200).json({ success: true, message: 'Exam group students updated successfully' });
    } catch (error) {
      next(error);
    }
  };

  getEligibleStudentsForExam = async (req, res, next) => {
    try {
      const { examGroupExamId } = req.params;
      const examGroupId = req.query.exam_group_id ? parseInt(req.query.exam_group_id) : null;
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.examService.getEligibleStudentsForExam(examGroupExamId, examGroupId, classId, sectionId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  assignStudentsToExam = async (req, res, next) => {
    try {
      const { examGroupExamId } = req.params;
      const { assignments } = req.body; // array of { student_id, student_session_id, roll_no }

      await this.examService.assignStudentsToExam(examGroupExamId, assignments);
      return res.status(200).json({ success: true, message: 'Students assigned to exam successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Marks/Results ---
  getExamSubjectResult = async (req, res, next) => {
    try {
      const { examSubjectId } = req.params;
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.examService.getExamSubjectResult(examSubjectId, classId, sectionId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveExamResults = async (req, res, next) => {
    try {
      const { results } = req.body; // array of results
      await this.examService.saveExamResults(results);
      return res.status(200).json({ success: true, message: 'Marks saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  updateRanks = async (req, res, next) => {
    try {
      const { ranks, examGroupExamId } = req.body;
      await this.examService.updateRanks(ranks, examGroupExamId);
      return res.status(200).json({ success: true, message: 'Ranks generated successfully' });
    } catch (error) {
      next(error);
    }
  };

  // --- Printing Admit Cards / Marksheets ---
  getExamStudents = async (req, res, next) => {
    try {
      const { examGroupExamId } = req.params;
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.examService.getExamStudents(examGroupExamId, classId, sectionId, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getStudentExamResults = async (req, res, next) => {
    try {
      const { examGroupExamId, studentId } = req.params;
      const data = await this.examService.getStudentExamResults(examGroupExamId, studentId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export default ExamController;
