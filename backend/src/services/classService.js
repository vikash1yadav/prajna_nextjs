import ClassRepository from '../repositories/classRepository.js';
import sequelize from '../config/database.js';

class ClassService {
  constructor() {
    this.classRepository = new ClassRepository();
  }

  async getClasses(id = null, user = null) {
    // Role-based logic check: if user is a teacher (role_id == 2) and class_teacher is 'yes'
    if (user && user.role_id === 2 && user.class_teacher === 'yes') {
      return await this.classRepository.getTeacherRestrictedMode(user.id);
    }

    return await this.classRepository.get(id);
  }

  async getClassSections(classId) {
    if (!classId) {
      throw new Error('Class ID is required');
    }
    return await this.classRepository.getSectionsByClassId(classId);
  }

  async saveClass(classData, sectionIds = []) {
    if (!classData.class) {
      throw new Error('Class name is required');
    }

    // Check duplicate class name
    const existingClass = await this.classRepository.checkDataExists(classData.class);
    if (existingClass && (!classData.id || existingClass.id !== parseInt(classData.id))) {
      throw new Error('Record already exists');
    }

    const transaction = await sequelize.transaction();
    try {
      // 1. Save Class
      const classId = await this.classRepository.add(classData);

      // 2. Manage Section Mappings if sectionIds is supplied
      if (Array.isArray(sectionIds)) {
        // Clear previous mappings
        await this.classRepository.removeClassSectionMappings(classId, transaction);

        // Add new mappings
        for (const sectionId of sectionIds) {
          await this.classRepository.addClassSectionMapping(classId, sectionId, transaction);
        }
      }

      await transaction.commit();
      return classId;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deleteClass(id) {
    if (!id) {
      throw new Error('Class ID is required');
    }
    return await this.classRepository.remove(id);
  }

  async getClassTeachers(currentSession) {
    if (!currentSession) {
      throw new Error('Session ID is required');
    }
    return await this.classRepository.getClassTeacher(currentSession);
  }
}

export default ClassService;
