import StudentRepository from '../repositories/studentRepository.js';

class StudentService {
  constructor() {
    this.studentRepository = new StudentRepository();
  }

  async getStudent(id = null, currentSession = null, isActive = 'yes') {
    return await this.studentRepository.get(id, currentSession, isActive);
  }

  async getStudentsByClassSection(classId = null, sectionId = null, currentSession = 21, isActive = 'yes') {
    return await this.studentRepository.searchByClassSection(classId, sectionId, currentSession, isActive);
  }

  async searchStudent(searchterm, currentSession = 21, isActive = 'yes') {
    if (!searchterm) {
      return await this.studentRepository.get(null, currentSession, isActive);
    }
    return await this.studentRepository.searchFullText(searchterm, currentSession, isActive);
  }

  async saveStudent(studentData, sessionData) {
    if (!studentData.firstname) {
      throw new Error('First name is required');
    }
    if (!studentData.admission_no) {
      throw new Error('Admission number is required');
    }
    if (!sessionData || !sessionData.class_id || !sessionData.section_id || !sessionData.session_id) {
      throw new Error('Academic session, class, and section parameters are required');
    }
    const existing = await this.studentRepository.checkAdmissionNoExists(studentData.admission_no, 0);
    if (existing) {
      throw new Error('Admission number already exists');
    }
    return await this.studentRepository.add(studentData, sessionData);
  }

  async updateStudent(id, studentData, sessionData) {
    if (!id) throw new Error('Student ID is required');
    if (!studentData.firstname) throw new Error('First name is required');
    // If admission_no provided, check it's not taken by another student
    if (studentData.admission_no) {
      const existing = await this.studentRepository.checkAdmissionNoExists(studentData.admission_no, id);
      if (existing) throw new Error('Admission number already taken by another student');
    }
    studentData.id = id;
    return await this.studentRepository.add(studentData, sessionData || {});
  }

  async deleteStudent(id) {
    if (!id) {
      throw new Error('Student ID is required');
    }
    return await this.studentRepository.remove(id);
  }

  async bulkDeleteStudents(studentIds) {
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      throw new Error('Student IDs array is required and must not be empty');
    }
    const parsedIds = studentIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    if (parsedIds.length === 0) {
      throw new Error('Invalid student IDs provided');
    }
    return await this.studentRepository.bulkDelete(parsedIds);
  }

  async getMultiClassStudents(classId = null, sectionId = null, currentSession = 21) {
    return await this.studentRepository.searchMultiClassStudents(classId, sectionId, currentSession);
  }

  async saveMultiClassStudent(studentId, sessionsData, currentSession = 21) {
    if (!studentId) throw new Error('Student ID is required');
    if (!Array.isArray(sessionsData)) throw new Error('Sessions data must be an array');
    return await this.studentRepository.updateMultiClassSessions(studentId, sessionsData, currentSession);
  }
}

export default StudentService;
