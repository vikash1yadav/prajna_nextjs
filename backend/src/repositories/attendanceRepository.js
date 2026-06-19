import AttendanceType from '../models/attendanceType.js';
import StudentAttendance from '../models/studentAttendance.js';
import sequelize from '../config/database.js';
import { Op, QueryTypes } from 'sequelize';

class AttendanceRepository {
  async getTypes() {
    return await AttendanceType.findAll({
      where: { is_active: 'yes' },
      order: [['id', 'ASC']]
    });
  }

  async searchAttendance(classId, sectionId, date, currentSession = 21) {
    const sql = `
      SELECT 
        student_sessions.attendence_id,
        student_sessions.attendence_dt,
        student_sessions.date,
        student_sessions.remark,
        student_sessions.biometric_attendence,
        student_sessions.qrcode_attendance,
        student_sessions.biometric_device_data,
        student_sessions.user_agent,
        student_sessions.in_time,
        student_sessions.out_time,
        student_sessions.attendence_type_id,
        student_sessions.id AS student_session_id,
        students.id AS std_id,
        students.firstname,
        students.middlename,
        students.lastname,
        students.roll_no,
        students.admission_no,
        attendence_type.type AS att_type,
        attendence_type.key_value AS \`key\`,
        attendence_type.long_lang_name,
        attendence_type.long_name_style
      FROM students
      INNER JOIN (
        SELECT 
          student_session.id,
          student_session.student_id,
          IFNULL(student_attendences.date, 'xxx') AS date,
          IFNULL(student_attendences.created_at, 'xxx') AS attendence_dt,
          IFNULL(student_attendences.remark, '') AS remark,
          IFNULL(student_attendences.biometric_attendence, 0) AS biometric_attendence,
          IFNULL(student_attendences.qrcode_attendance, 0) AS qrcode_attendance,
          student_attendences.biometric_device_data,
          student_attendences.user_agent,
          student_attendences.in_time,
          student_attendences.out_time,
          IFNULL(student_attendences.id, 0) AS attendence_id,
          student_attendences.attendence_type_id
        FROM student_session
        LEFT JOIN student_attendences ON student_attendences.student_session_id = student_session.id 
          AND student_attendences.date = :date
        WHERE student_session.session_id = :currentSession
          AND student_session.class_id = :classId
          AND student_session.section_id = :sectionId
      ) AS student_sessions ON student_sessions.student_id = students.id
      LEFT JOIN attendence_type ON attendence_type.id = student_sessions.attendence_type_id
      WHERE students.is_active = 'yes'
      ORDER BY students.admission_no ASC
    `;

    return await sequelize.query(sql, {
      replacements: { classId, sectionId, date, currentSession },
      type: QueryTypes.SELECT
    });
  }

  async addOrUpdate(attendances) {
    const transaction = await sequelize.transaction();
    try {
      for (const item of attendances) {
        const existing = await StudentAttendance.findOne({
          where: {
            student_session_id: item.student_session_id,
            date: item.date
          },
          transaction
        });

        if (existing) {
          await StudentAttendance.update(item, {
            where: { id: existing.id },
            transaction
          });
        } else {
          await StudentAttendance.create(item, { transaction });
        }
      }
      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getStudentAttendanceReport(studentSessionId, dateFrom, dateTo) {
    return await StudentAttendance.findAll({
      include: [
        {
          model: AttendanceType,
          attributes: ['type', 'key_value', 'long_lang_name', 'long_name_style']
        }
      ],
      where: {
        student_session_id: studentSessionId,
        date: {
          [Op.between]: [dateFrom, dateTo]
        }
      },
      order: [['date', 'ASC']]
    });
  }

  async getTodayAttendanceSummary(currentSession = 21, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const sql = `
      SELECT 
        SUM(CASE WHEN attendence_type_id = 1 THEN 1 ELSE 0 END) AS total_present,
        SUM(CASE WHEN attendence_type_id = 3 THEN 1 ELSE 0 END) AS total_late,
        SUM(CASE WHEN attendence_type_id = 4 THEN 1 ELSE 0 END) AS total_absent,
        SUM(CASE WHEN attendence_type_id = 6 THEN 1 ELSE 0 END) AS total_half_day,
        COUNT(*) AS total_records
      FROM student_attendences
      INNER JOIN student_session ON student_attendences.student_session_id = student_session.id
      WHERE student_session.session_id = :currentSession
        AND student_attendences.date = :targetDate
    `;

    const result = await sequelize.query(sql, {
      replacements: { currentSession, targetDate },
      type: QueryTypes.SELECT
    });
    return result.length > 0 ? result[0] : null;
  }
}

export default AttendanceRepository;
