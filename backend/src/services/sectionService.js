import SectionRepository from '../repositories/sectionRepository.js';

class SectionService {
  constructor() {
    this.sectionRepository = new SectionRepository();
  }

  async getSection(id = null) {
    return await this.sectionRepository.get(id);
  }

  async saveSection(sectionData) {
    if (!sectionData.section) {
      throw new Error('Section name is required');
    }
    return await this.sectionRepository.add(sectionData);
  }

  async deleteSection(id) {
    if (!id) {
      throw new Error('Section ID is required');
    }
    return await this.sectionRepository.remove(id);
  }

  async getSectionsByClass(classId, user = null) {
    if (!classId) {
      throw new Error('Class ID is required');
    }

    // Role-based logic check: if user is a teacher (role_id == 2) and class_teacher is 'yes'
    if (user && user.role_id === 2 && user.class_teacher === 'yes') {
      // In a fully migrated system, we would query the teacher_model/class_teacher mappings
      // For now, we will fetch their specific sections if they are restricted
      // We will delegate to the repository method that joins class_teacher sections
      // If we don't have currentSession, we look it up or fallback to standard sessions
      const currentSession = user.currentSession || 21; // fallback
      return await this.sectionRepository.getClassTeacherSection(classId, user.id, currentSession);
    }

    return await this.sectionRepository.getClassBySectionAll(classId);
  }

  async getClassTeacherSections(classId, staffId, currentSession) {
    return await this.sectionRepository.getClassTeacherSection(classId, staffId, currentSession);
  }

  async getSubjectTeacherSections(classId, teacherId) {
    return await this.sectionRepository.getSubjectTeacherSection(classId, teacherId);
  }

  async getClassAndSectionNames(classId, sectionId) {
    return await this.sectionRepository.getClassAndSectionNameByClassIDSectionID(classId, sectionId);
  }
}

export default SectionService;
