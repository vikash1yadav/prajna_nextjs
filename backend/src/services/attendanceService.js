import AttendanceRepository from '../repositories/attendanceRepository.js';

class AttendanceService {
  constructor() {
    this.attendanceRepository = new AttendanceRepository();
  }

  async getTypes() {
    return await this.attendanceRepository.getTypes();
  }

  async searchAttendance(classId, sectionId, date, currentSession = 21) {
    if (!classId) {
      throw new Error('Class ID is required');
    }
    if (!sectionId) {
      throw new Error('Section ID is required');
    }
    if (!date) {
      throw new Error('Date is required');
    }
    return await this.attendanceRepository.searchAttendance(classId, sectionId, date, currentSession);
  }

  async saveAttendance(attendances) {
    if (!Array.isArray(attendances) || attendances.length === 0) {
      throw new Error('Attendance records list cannot be empty');
    }

    for (const record of attendances) {
      if (!record.student_session_id) {
        throw new Error('Student Session ID is required for all records');
      }
      if (!record.date) {
        throw new Error('Date is required for all records');
      }
      if (record.attendence_type_id === undefined) {
        throw new Error('Attendance type ID is required for all records');
      }
    }

    return await this.attendanceRepository.addOrUpdate(attendances);
  }

  async getMonthlyAttendance(studentSessionId, month, year) {
    if (!studentSessionId) {
      throw new Error('Student Session ID is required');
    }
    if (!month || !year) {
      throw new Error('Month and Year are required');
    }
    // Calculate start and end date of the month
    const dateFrom = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const dateTo = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return await this.attendanceRepository.getStudentAttendanceReport(studentSessionId, dateFrom, dateTo);
  }

  async getTodayAttendanceSummary(currentSession = 21, date = null) {
    return await this.attendanceRepository.getTodayAttendanceSummary(currentSession, date);
  }

}

export default AttendanceService;
