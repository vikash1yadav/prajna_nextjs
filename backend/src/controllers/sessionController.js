import SessionService from '../services/sessionService.js';

class SessionController {
  constructor() {
    this.sessionService = new SessionService();
  }

  getSessions = async (req, res, next) => {
    try {
      const id = req.query.id || null;
      let data;
      if (req.query.withActiveStatus === 'true') {
        data = await this.sessionService.getAllSessionsWithActiveStatus();
      } else {
        data = await this.sessionService.getSession(id);
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getPreviousSession = async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      const data = await this.sessionService.getPreviousSession(sessionId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getStudentSessions = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const data = await this.sessionService.getStudentAcademicSessions(studentId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveSession = async (req, res, next) => {
    try {
      const id = await this.sessionService.saveSession(req.body);
      return res.status(200).json({ success: true, message: 'Session saved successfully', id });
    } catch (error) {
      next(error);
    }
  };

  deleteSession = async (req, res, next) => {
    try {
      const { id } = req.params;
      await this.sessionService.deleteSession(id);
      return res.status(200).json({ success: true, message: 'Session deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default SessionController;
