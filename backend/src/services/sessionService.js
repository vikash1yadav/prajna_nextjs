import SessionRepository from '../repositories/sessionRepository.js';

class SessionService {
  constructor() {
    this.sessionRepository = new SessionRepository();
  }

  async getSession(id = null) {
    return await this.sessionRepository.get(id);
  }

  async getAllSessionsWithActiveStatus() {
    return await this.sessionRepository.getAllSession();
  }

  async getPreviousSession(sessionId) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    return await this.sessionRepository.getPreSession(sessionId);
  }

  async getStudentAcademicSessions(studentId) {
    if (!studentId) {
      throw new Error('Student ID is required');
    }
    return await this.sessionRepository.getStudentAcademicSession(studentId);
  }

  async saveSession(sessionData) {
    // Perform any business validation here (e.g. check duplicate formats)
    if (!sessionData.session) {
      throw new Error('Session name/year is required');
    }
    return await this.sessionRepository.add(sessionData);
  }

  async deleteSession(id) {
    if (!id) {
      throw new Error('Session ID is required');
    }
    return await this.sessionRepository.remove(id);
  }
}

export default SessionService;
