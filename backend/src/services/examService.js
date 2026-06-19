import ExamRepository from '../repositories/examRepository.js';

class ExamService {
  constructor() {
    this.examRepository = new ExamRepository();
  }

  // --- Exams ---
  async getExams(id = null, currentSession = 21) {
    return await this.examRepository.get(id, currentSession);
  }

  async saveExam(examData) {
    if (!examData.name) {
      throw new Error('Exam name is required');
    }
    if (!examData.sesion_id) {
      throw new Error('Session ID is required');
    }
    return await this.examRepository.add(examData);
  }

  async deleteExam(id) {
    if (!id) {
      throw new Error('Exam ID is required');
    }
    return await this.examRepository.remove(id);
  }

  // --- Scheduling ---
  async saveExamSchedule(scheduleData) {
    if (!scheduleData.exam_id) {
      throw new Error('Exam ID is required');
    }
    if (!scheduleData.teacher_subject_id) {
      throw new Error('Teacher Subject ID is required');
    }
    if (!scheduleData.session_id) {
      throw new Error('Session ID is required');
    }
    return await this.examRepository.addSchedule(scheduleData);
  }

  async getExamSchedules(classId, sectionId, examId, currentSession = 21) {
    if (!classId) {
      throw new Error('Class ID is required');
    }
    if (!sectionId) {
      throw new Error('Section ID is required');
    }
    if (!examId) {
      throw new Error('Exam ID is required');
    }
    return await this.examRepository.getDetailByClsAndSection(classId, sectionId, examId, currentSession);
  }

  async getExamByClassAndSection(classId, sectionId, currentSession = 21) {
    if (!classId) {
      throw new Error('Class ID is required');
    }
    if (!sectionId) {
      throw new Error('Section ID is required');
    }
    return await this.examRepository.getExamByClassAndSection(classId, sectionId, currentSession);
  }

  // --- Exam Groups ---
  async getExamGroups(id = null) {
    return await this.examRepository.getExamGroups(id);
  }

  async saveExamGroup(groupData) {
    if (!groupData.name) {
      throw new Error('Exam Group name is required');
    }
    return await this.examRepository.addExamGroup(groupData);
  }

  async deleteExamGroup(id) {
    if (!id) {
      throw new Error('Exam Group ID is required');
    }
    return await this.examRepository.removeExamGroup(id);
  }

  // --- Grades ---
  async getGrades(id = null) {
    return await this.examRepository.getGrades(id);
  }

  async saveGrade(gradeData) {
    if (!gradeData.name) throw new Error('Grade name is required');
    if (gradeData.mark_from === undefined || gradeData.mark_from === null) throw new Error('Mark from is required');
    if (gradeData.mark_upto === undefined || gradeData.mark_upto === null) throw new Error('Mark upto is required');
    return await this.examRepository.saveGrade(gradeData);
  }

  async deleteGrade(id) {
    if (!id) throw new Error('Grade ID is required');
    return await this.examRepository.deleteGrade(id);
  }

  // --- Divisions ---
  async getDivisions(id = null) {
    return await this.examRepository.getDivisions(id);
  }

  async saveDivision(divisionData) {
    if (!divisionData.name) throw new Error('Division name is required');
    if (divisionData.percentage_from === undefined || divisionData.percentage_from === null) throw new Error('Percentage from is required');
    if (divisionData.percentage_to === undefined || divisionData.percentage_to === null) throw new Error('Percentage to is required');
    return await this.examRepository.saveDivision(divisionData);
  }

  async deleteDivision(id) {
    if (!id) throw new Error('Division ID is required');
    return await this.examRepository.deleteDivision(id);
  }

  // --- Template Admitcards ---
  async getTemplateAdmitcards(id = null) {
    return await this.examRepository.getTemplateAdmitcards(id);
  }

  async saveTemplateAdmitcard(templateData) {
    if (!templateData.template) throw new Error('Template name is required');
    return await this.examRepository.saveTemplateAdmitcard(templateData);
  }

  async deleteTemplateAdmitcard(id) {
    if (!id) throw new Error('Template ID is required');
    return await this.examRepository.deleteTemplateAdmitcard(id);
  }

  // --- Template Marksheets ---
  async getTemplateMarksheets(id = null) {
    return await this.examRepository.getTemplateMarksheets(id);
  }

  async saveTemplateMarksheet(templateData) {
    if (!templateData.template) throw new Error('Template name is required');
    return await this.examRepository.saveTemplateMarksheet(templateData);
  }

  async deleteTemplateMarksheet(id) {
    if (!id) throw new Error('Template ID is required');
    return await this.examRepository.deleteTemplateMarksheet(id);
  }

  // --- Group Connected Exams ---
  async getExamsByGroupId(groupId) {
    if (!groupId) throw new Error('Group ID is required');
    return await this.examRepository.getExamsByGroupId(groupId);
  }

  async saveExamGroupExam(examData) {
    if (!examData.exam) throw new Error('Exam title is required');
    if (!examData.exam_group_id) throw new Error('Exam group ID is required');
    if (!examData.session_id) throw new Error('Session ID is required');
    return await this.examRepository.saveExamGroupExam(examData);
  }

  async deleteExamGroupExam(id) {
    if (!id) throw new Error('ID is required');
    return await this.examRepository.deleteExamGroupExam(id);
  }

  // --- Subject Mappings ---
  async getExamSubjects(examGroupExamId) {
    if (!examGroupExamId) throw new Error('Exam ID is required');
    return await this.examRepository.getExamSubjects(examGroupExamId);
  }

  async saveExamSubjects(examGroupExamId, subjects) {
    if (!examGroupExamId) throw new Error('Exam ID is required');
    return await this.examRepository.saveExamSubjects(examGroupExamId, subjects);
  }

  // --- Student Enrollment ---
  async getExamGroupStudents(examGroupId, classId, sectionId, sessionId) {
    if (!examGroupId) throw new Error('Exam Group ID is required');
    if (!classId) throw new Error('Class ID is required');
    if (!sectionId) throw new Error('Section ID is required');
    if (!sessionId) throw new Error('Session ID is required');
    return await this.examRepository.getExamGroupStudents(examGroupId, classId, sectionId, sessionId);
  }

  async saveExamGroupStudents(examGroupId, studentIds, sessionId) {
    if (!examGroupId) throw new Error('Exam Group ID is required');
    if (!studentIds) throw new Error('Student IDs array is required');
    if (!sessionId) throw new Error('Session ID is required');
    return await this.examRepository.saveExamGroupStudents(examGroupId, studentIds, sessionId);
  }

  async getEligibleStudentsForExam(examGroupExamId, examGroupId, classId, sectionId, sessionId) {
    if (!examGroupExamId) throw new Error('Exam ID is required');
    if (!examGroupId) throw new Error('Exam Group ID is required');
    if (!classId) throw new Error('Class ID is required');
    if (!sectionId) throw new Error('Section ID is required');
    if (!sessionId) throw new Error('Session ID is required');
    return await this.examRepository.getEligibleStudentsForExam(examGroupExamId, examGroupId, classId, sectionId, sessionId);
  }

  async assignStudentsToExam(examGroupExamId, assignments) {
    if (!examGroupExamId) throw new Error('Exam ID is required');
    if (!assignments) throw new Error('Assignments array is required');
    return await this.examRepository.assignStudentsToExam(examGroupExamId, assignments);
  }

  // --- Results & Marks ---
  async getExamSubjectResult(examSubjectId, classId, sectionId, sessionId) {
    if (!examSubjectId) throw new Error('Exam Subject ID is required');
    if (!classId) throw new Error('Class ID is required');
    if (!sectionId) throw new Error('Section ID is required');
    if (!sessionId) throw new Error('Session ID is required');
    return await this.examRepository.getExamSubjectResult(examSubjectId, classId, sectionId, sessionId);
  }

  async saveExamResults(results) {
    if (!results || !Array.isArray(results)) throw new Error('Results array is required');
    return await this.examRepository.saveExamResults(results);
  }

  async updateRanks(ranks, examGroupExamId) {
    if (!ranks || !Array.isArray(ranks)) throw new Error('Ranks array is required');
    if (!examGroupExamId) throw new Error('Exam ID is required');
    return await this.examRepository.updateRanks(ranks, examGroupExamId);
  }

  // --- Printing ---
  async getExamStudents(examGroupExamId, classId, sectionId, sessionId) {
    if (!examGroupExamId) throw new Error('Exam ID is required');
    if (!classId) throw new Error('Class ID is required');
    if (!sectionId) throw new Error('Section ID is required');
    if (!sessionId) throw new Error('Session ID is required');
    return await this.examRepository.getExamStudents(examGroupExamId, classId, sectionId, sessionId);
  }

  async getStudentExamResults(examGroupExamId, studentId) {
    if (!examGroupExamId) throw new Error('Exam ID is required');
    if (!studentId) throw new Error('Student ID is required');
    return await this.examRepository.getStudentExamResults(examGroupExamId, studentId);
  }
}

export default ExamService;
