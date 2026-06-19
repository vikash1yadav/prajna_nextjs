import SubjectRepository from '../repositories/subjectRepository.js';

class SubjectService {
  constructor() {
    this.subjectRepository = new SubjectRepository();
  }

  async getSubjects(id = null, user = null) {
    if (id !== null) {
      return await this.subjectRepository.get(id);
    }

    // Role-based logic check: if user is a teacher (role_id == 2) and class_teacher is 'yes'
    if (user && user.role_id === 2 && user.class_teacher === 'yes') {
      const currentSession = user.currentSession || 21; // fallback
      const subjectIds = await this.subjectRepository.getTeacherExamSubjects(user.id, currentSession);
      if (subjectIds.length === 0) {
        return [];
      }
      return await this.subjectRepository.getByIds(subjectIds);
    }

    return await this.subjectRepository.get();
  }

  async saveSubject(subjectData) {
    if (!subjectData.name) {
      throw new Error('Subject name is required');
    }

    // Check duplicate name
    const existingByName = await this.subjectRepository.checkNameExists(subjectData.name);
    if (existingByName && (!subjectData.id || existingByName.id !== parseInt(subjectData.id))) {
      throw new Error('Subject name already exists');
    }

    // Check duplicate code (if code is provided)
    if (subjectData.code) {
      const existingByCode = await this.subjectRepository.checkCodeExists(subjectData.code);
      if (existingByCode && (!subjectData.id || existingByCode.id !== parseInt(subjectData.id))) {
        throw new Error('Subject code already exists');
      }
    }

    return await this.subjectRepository.add(subjectData);
  }

  async deleteSubject(id) {
    if (!id) {
      throw new Error('Subject ID is required');
    }
    return await this.subjectRepository.remove(id);
  }
}

export default SubjectService;
