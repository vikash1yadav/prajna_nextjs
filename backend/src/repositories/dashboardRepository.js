import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

class DashboardRepository {
  async getTodayStudentAttendance(date, sessionId) {
    const sql = `
      SELECT 
        SUM(CASE WHEN attendence_type_id = 1 THEN 1 ELSE 0 END) AS present,
        COUNT(student_attendences.id) AS total
      FROM student_attendences
      INNER JOIN student_session ON student_attendences.student_session_id = student_session.id
      WHERE student_session.session_id = :sessionId AND student_attendences.date = :date
    `;
    const result = await sequelize.query(sql, {
      replacements: { sessionId, date },
      type: QueryTypes.SELECT
    });
    return result[0] || { present: 0, total: 0 };
  }

  async getTodayStaffAttendance(date) {
    const sql = `
      SELECT 
        SUM(CASE WHEN staff_attendance_type_id = 1 THEN 1 ELSE 0 END) AS present,
        COUNT(id) AS total
      FROM staff_attendance
      WHERE date = :date
    `;
    try {
      const result = await sequelize.query(sql, {
        replacements: { date },
        type: QueryTypes.SELECT
      });
      return result[0] || { present: 0, total: 0 };
    } catch (e) {
      return { present: 0, total: 0 };
    }
  }

  async getStudentLeaves(startDate, endDate) {
    const sql = `
      SELECT 
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS approved,
        COUNT(id) AS total
      FROM student_leaves
      WHERE apply_date BETWEEN :startDate AND :endDate
    `;
    try {
      const result = await sequelize.query(sql, {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT
      });
      return result[0] || { approved: 0, total: 0 };
    } catch (e) {
      return { approved: 0, total: 0 };
    }
  }

  async getStaffLeaves(startDate, endDate) {
    const sql = `
      SELECT 
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS approved,
        COUNT(id) AS total
      FROM staff_leaves
      WHERE apply_date BETWEEN :startDate AND :endDate
    `;
    try {
      const result = await sequelize.query(sql, {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT
      });
      return result[0] || { approved: 0, total: 0 };
    } catch (e) {
      return { approved: 0, total: 0 };
    }
  }

  async getConvertedLeads(startDate, endDate) {
    const sql = `
      SELECT 
        SUM(CASE WHEN status = 'complete' THEN 1 ELSE 0 END) AS won,
        COUNT(id) AS total
      FROM enquiry
      WHERE date BETWEEN :startDate AND :endDate
    `;
    try {
      const result = await sequelize.query(sql, {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT
      });
      return result[0] || { won: 0, total: 0 };
    } catch (e) {
      return { won: 0, total: 0 };
    }
  }

  async getFeesAwaiting(startDate, endDate) {
    const sql = `
      SELECT 
        SUM(CASE WHEN amount_detail IS NULL OR amount_detail = '0' THEN 1 ELSE 0 END) AS unpaid,
        COUNT(id) AS total
      FROM student_fees_master
      WHERE date BETWEEN :startDate AND :endDate
    `;
    try {
      const result = await sequelize.query(sql, {
        replacements: { startDate, endDate },
        type: QueryTypes.SELECT
      });
      return result[0] || { unpaid: 0, total: 0 };
    } catch (e) {
      return { unpaid: 0, total: 0 };
    }
  }
}

export default DashboardRepository;
