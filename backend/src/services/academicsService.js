import AcademicsRepository from '../repositories/academicsRepository.js';

class AcademicsService {
  constructor() {
    this.repository = new AcademicsRepository();
  }

  async getSubjectGroups(sessionId) {
    return await this.repository.getSubjectGroups(sessionId);
  }

  async saveSubjectGroup(id, name, description, subjectIds, classSectionIds, sessionId) {
    if (!name || name.trim() === '') {
      throw new Error('Subject Group Name is required');
    }
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    return await this.repository.saveSubjectGroup(id, name.trim(), description, subjectIds, classSectionIds, sessionId);
  }

  async deleteSubjectGroup(id) {
    if (!id) {
      throw new Error('Subject Group ID is required for deletion');
    }
    return await this.repository.deleteSubjectGroup(id);
  }

  async getClassTeachers(sessionId) {
    return await this.repository.getClassTeachers(sessionId);
  }

  async assignClassTeachers(classId, sectionId, staffIds, sessionId) {
    if (!classId || !sectionId) {
      throw new Error('Class and Section are required');
    }
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    return await this.repository.assignClassTeachers(classId, sectionId, staffIds, sessionId);
  }

  async getTimetable(classId, sectionId, subjectGroupId, sessionId) {
    if (!classId || !sectionId || !subjectGroupId || !sessionId) {
      throw new Error('Class, Section, Subject Group and Session are required parameters');
    }
    return await this.repository.getTimetable(classId, sectionId, subjectGroupId, sessionId);
  }

  async saveTimetable(classId, sectionId, subjectGroupId, entries, sessionId) {
    if (!classId || !sectionId || !subjectGroupId || !sessionId) {
      throw new Error('Missing class, section, subject group, or session context');
    }
    return await this.repository.saveTimetable(classId, sectionId, subjectGroupId, entries, sessionId);
  }

  async getTeacherTimetable(staffId, sessionId) {
    if (!staffId || !sessionId) {
      throw new Error('Teacher Staff ID and Session ID are required');
    }
    return await this.repository.getTeacherTimetable(staffId, sessionId);
  }

  async promoteStudents(studentSessionIds, fromClassId, fromSectionId, toClassId, toSectionId, fromSessionId, toSessionId) {
    if (!studentSessionIds || !Array.isArray(studentSessionIds) || studentSessionIds.length === 0) {
      throw new Error('No students selected for promotion');
    }
    if (!toClassId || !toSectionId || !toSessionId) {
      throw new Error('Target Class, Section, and Session are required for promotion');
    }
    if (parseInt(fromSessionId) === parseInt(toSessionId)) {
      throw new Error('Destination session must be different from source session');
    }
    return await this.repository.promoteStudents(
      studentSessionIds,
      fromClassId,
      fromSectionId,
      toClassId,
      toSectionId,
      fromSessionId,
      toSessionId
    );
  }
}

export default AcademicsService;
