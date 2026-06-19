import AttendanceService from '../services/attendanceService.js';

class AttendanceController {
  constructor() {
    this.attendanceService = new AttendanceService();
  }

  getTypes = async (req, res, next) => {
    try {
      const data = await this.attendanceService.getTypes();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  searchAttendance = async (req, res, next) => {
    try {
      const classId = req.query.class_id ? parseInt(req.query.class_id) : null;
      const sectionId = req.query.section_id ? parseInt(req.query.section_id) : null;
      const date = req.query.date || null;
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;

      const data = await this.attendanceService.searchAttendance(classId, sectionId, date, session_id);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  saveAttendance = async (req, res, next) => {
    try {
      const { attendances } = req.body;
      await this.attendanceService.saveAttendance(attendances);
      return res.status(200).json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
      next(error);
    }
  };

  getMonthlyAttendance = async (req, res, next) => {
    try {
      const studentSessionId = req.query.student_session_id ? parseInt(req.query.student_session_id) : null;
      const month = req.query.month ? parseInt(req.query.month) : null;
      const year = req.query.year ? parseInt(req.query.year) : null;

      const data = await this.attendanceService.getMonthlyAttendance(studentSessionId, month, year);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  getTodayAttendanceSummary = async (req, res, next) => {
    try {
      const session_id = req.query.session_id ? parseInt(req.query.session_id) : 21;
      const date = req.query.date || null;
      const data = await this.attendanceService.getTodayAttendanceSummary(session_id, date);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

}

export default AttendanceController;
