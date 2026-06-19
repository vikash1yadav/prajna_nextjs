import LessonPlanRepository from '../repositories/lessonPlanRepository.js';

class LessonPlanService {
  constructor() {
    this.repository = new LessonPlanRepository();
  }

  async getLessons(classSectionId, subjectGroupSubjectId, sessionId) {
    if (!classSectionId || !subjectGroupSubjectId || !sessionId) {
      throw new Error('Class Section, Subject Group Subject, and Session are required parameters');
    }
    return await this.repository.getLessons(classSectionId, subjectGroupSubjectId, sessionId);
  }

  async saveLesson(id, name, subjectGroupSubjectId, subjectGroupClassSectionsId, sessionId) {
    if (!name || name.trim() === '') {
      throw new Error('Lesson Name is required');
    }
    if (!subjectGroupSubjectId || !subjectGroupClassSectionsId || !sessionId) {
      throw new Error('Subject Group Subject, Subject Group Class Section, and Session are required');
    }
    return await this.repository.saveLesson(id, name.trim(), subjectGroupSubjectId, subjectGroupClassSectionsId, sessionId);
  }

  async deleteLesson(id) {
    if (!id) {
      throw new Error('Lesson ID is required');
    }
    return await this.repository.deleteLesson(id);
  }

  async getTopics(lessonId, sessionId) {
    if (!lessonId || !sessionId) {
      throw new Error('Lesson ID and Session ID are required');
    }
    return await this.repository.getTopics(lessonId, sessionId);
  }

  async saveTopic(id, name, lessonId, status, completeDate, sessionId) {
    if (!name || name.trim() === '') {
      throw new Error('Topic Name is required');
    }
    if (!lessonId || !sessionId) {
      throw new Error('Lesson ID and Session ID are required');
    }
    return await this.repository.saveTopic(id, name.trim(), lessonId, status, completeDate, sessionId);
  }

  async deleteTopic(id) {
    if (!id) {
      throw new Error('Topic ID is required');
    }
    return await this.repository.deleteTopic(id);
  }

  async getSyllabusStatus(classSectionId, subjectGroupSubjectId, sessionId) {
    if (!classSectionId || !subjectGroupSubjectId || !sessionId) {
      throw new Error('Class Section, Subject Group Subject, and Session are required');
    }
    return await this.repository.getSyllabusStatus(classSectionId, subjectGroupSubjectId, sessionId);
  }

  async getSyllabusLogs(topicId, sessionId) {
    if (!topicId || !sessionId) {
      throw new Error('Topic ID and Session ID are required');
    }
    return await this.repository.getSyllabusLogs(topicId, sessionId);
  }

  async saveSyllabusLog(logData) {
    if (!logData.topic_id || !logData.session_id || !logData.created_by || !logData.created_for) {
      throw new Error('Topic, Session, and Staff assignments are required for syllabus logging');
    }
    if (!logData.date) {
      throw new Error('Log Date is required');
    }
    if (!logData.time_from || !logData.time_to) {
      throw new Error('Lecture start and end times are required');
    }
    if (!logData.presentation) {
      throw new Error('Lecture presentation details are required');
    }
    return await this.repository.saveSyllabusLog(logData);
  }

  async deleteSyllabusLog(id) {
    if (!id) {
      throw new Error('Syllabus Log ID is required');
    }
    return await this.repository.deleteSyllabusLog(id);
  }

  async copyOldLessons(fromClassSectionId, fromSubjectGroupSubjectId, toClassSectionId, toSubjectGroupSubjectId, fromSessionId, toSessionId) {
    if (!fromClassSectionId || !fromSubjectGroupSubjectId || !toClassSectionId || !toSubjectGroupSubjectId || !fromSessionId || !toSessionId) {
      throw new Error('Missing parameters to copy lessons: ensure all Class, Subject, and Session selections are valid.');
    }
    return await this.repository.copyOldLessons(
      fromClassSectionId,
      fromSubjectGroupSubjectId,
      toClassSectionId,
      toSubjectGroupSubjectId,
      fromSessionId,
      toSessionId
    );
  }
}

export default LessonPlanService;
